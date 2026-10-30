const intentRouterNode = require('./nodes/intentRouter');
const siteSelectorNode = require('./nodes/siteSelector');
const scraperAgentNode = require('./nodes/scraperAgent');
const dataCollectorNode = require('./nodes/dataCollector');
const { optimizeAndSaveLeads } = require('../Optimization/dataOptimizer');

/**
 * Process a single site through the full pipeline and fire onLeads when done.
 * Each site runs independently and in parallel with others.
 */
const processSite = async (site, state, onLeads, onProgress) => {
    const siteName = site.name;

    console.log(`[StreamingOrchestrator] → Starting ${siteName} in parallel`);
    if (onProgress) onProgress(`Scanning ${siteName} for live listings...`);

    // 1. Scrape just this site
    const singleSiteState = { ...state, targetSites: [site], rawHtmlResults: [] };
    const scrapedState = await scraperAgentNode(singleSiteState);

    if (!scrapedState.rawHtmlResults || scrapedState.rawHtmlResults.length === 0) {
        console.log(`[StreamingOrchestrator] ${siteName}: no HTML returned, skipping`);
        return 0;
    }

    if (onProgress) onProgress(`Extracting and parsing leads from ${siteName}...`);

    // 2. Extract leads from this site's HTML
    const collectedState = await dataCollectorNode({
        ...scrapedState,
        extractedLeads: []
    });

    if (!collectedState.extractedLeads || collectedState.extractedLeads.length === 0) {
        console.log(`[StreamingOrchestrator] ${siteName}: no leads extracted`);
        return 0;
    }

    // 3. Optimize + deduplicate + save
    const optimizedBatch = await optimizeAndSaveLeads(
        state.userId,
        state.userMessageId,
        collectedState.extractedLeads,
        state.intentData
    );

    if (optimizedBatch.length > 0) {
        console.log(`[StreamingOrchestrator] ✓ ${siteName}: ${optimizedBatch.length} leads ready — pushing to client`);
        if (onProgress) onProgress(`Streaming ${optimizedBatch.length} verified leads from ${siteName}...`);
        onLeads(optimizedBatch, siteName); // push to SSE immediately
    } else {
        console.log(`[StreamingOrchestrator] ${siteName}: 0 leads after dedup`);
    }

    return optimizedBatch.length;
};

/**
 * Streaming orchestrator — scrapes ALL sites in PARALLEL.
 * Each site fires onLeads(batch, sourceName) the moment it finishes,
 * regardless of how long the other sites are taking.
 *
 * @param {string} usermessage
 * @param {string} userId
 * @param {string} userMessageId
 * @param {function} onLeads    - (leads[], sourceName) => void
 * @param {function} onError    - (errorObj) => void
 * @param {function} onProgress - (statusText) => void
 */
const streamingOrchestrator = async (usermessage, userId, userMessageId, onLeads, onError, onProgress) => {

    if (onProgress) onProgress('Understanding requirements with Gemini AI...');

    // --- Step 1: Intent Routing ---
    let state = {
        userId,
        userMessageId,
        userMessage: usermessage,
        intentData: null,
        targetSites: [],
        rawHtmlResults: [],
        extractedLeads: [],
        optimizedLeads: [],
        retryCount: 0,
        error: null
    };

    state = await intentRouterNode(state);

    if (state.error) {
        onError(state.error);
        return;
    }

    // --- Step 2: Site Selection ---
    state = await siteSelectorNode(state);
    const sites = state.targetSites;
    const targetRole = state.intentData?.job_role || 'Target Role';

    if (onProgress) {
        onProgress(`Targeting: "${targetRole}". Searching ${sites.map(s => s.name).join(', ')} simultaneously...`);
    }

    console.log(`[StreamingOrchestrator] Launching ${sites.length} sites in PARALLEL: ${sites.map(s => s.name).join(', ')}`);

    // --- Step 3: All sites run in parallel — each pushes results as soon as done ---
    const sitePromises = sites.map(site =>
        processSite(site, state, onLeads, onProgress).catch(err => {
            console.error(`[StreamingOrchestrator] Site ${site.name} failed:`, err.message);
            return 0; // don't let one failure kill the others
        })
    );

    const results = await Promise.allSettled(sitePromises);

    const totalLeads = results.reduce((sum, r) => {
        return sum + (r.status === 'fulfilled' ? (r.value || 0) : 0);
    }, 0);

    console.log(`[StreamingOrchestrator] All sites done. Total leads: ${totalLeads}`);
    return { total: totalLeads };
};

module.exports = streamingOrchestrator;
