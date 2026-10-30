const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fast in-memory intent cache to eliminate redundant LLM calls on repeated queries
const intentCache = new Map();
const MAX_CACHE_SIZE = 100;

const parseIntent = async (usermessage) => {
    try {
        const cacheKey = (usermessage || '').trim().toLowerCase();
        if (intentCache.has(cacheKey)) {
            console.log("[Phase One: intentParser] Serving parsed intent from memory cache (0ms)");
            return intentCache.get(cacheKey);
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `
        You are an expert intent parser for a senior-grade agentic web scraping system.
        Analyze the following user request and extract the exact parameters needed to run the scraper.

        User request: "${usermessage}"
        
        Return exactly this JSON schema:
        {
            "job_role": "string (e.g. 'software engineer', 'UI designer')",
            "posted_within": "string (one of '24h', '7d', '30d'. Default to '7d' if not explicitly stated)",
            "location": "string or null",
            "employment_type": "string or null (e.g., full-time, freelance, contract)",
            "required_contact": "array of strings (must be subset of ['email', 'phone', 'website', 'linkedin'])",
            "domain_category": "string (MUST BE exactly one of: 'software_engineering', 'web_design', 'ui_design', 'graphic_design', 'ai_ml', 'content_writing', 'freelance')",
            "confidence": "number (0.0 to 1.0 representing how confident you are in this parsing based on user's vagueness)",
            "clarification_question": "string or null (if confidence < 0.7, ask ONE specific question to get the missing critical info, else null)"
        }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        console.log("[Phase One: intentParser] Parsed Intent:", parsed);

        // Enforce the rule: If intent confidence < 0.7, stop and return the clarification
        if (parsed.confidence < 0.7) {
            return {
                status: "CLARIFICATION_REQUIRED",
                question: parsed.clarification_question || "Could you provide more specific details about the role or industry?"
            };
        }

        const successResponse = {
            status: "SUCCESS",
            data: parsed
        };

        if (intentCache.size >= MAX_CACHE_SIZE) {
            const firstKey = intentCache.keys().next().value;
            intentCache.delete(firstKey);
        }
        intentCache.set(cacheKey, successResponse);

        return successResponse;

    } catch (error) {
        console.error("[Phase One: intentParser] Error parsing intent with Gemini:", error.message);

        // Return a safe fallback error state as per hard rules "If scraping fails, return an explicit error state."
        return {
            status: "ERROR",
            message: "Failed to parse intent from user message."
        };
    }
};

module.exports = parseIntent;
