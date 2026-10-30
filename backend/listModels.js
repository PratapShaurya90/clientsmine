const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        console.log("Fetching models...");
        const axios = require('axios');
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = response.data;
        console.log("Models:", data.models.map(m => m.name));
    } catch (e) {
        console.error(e);
    }
}
listModels();
