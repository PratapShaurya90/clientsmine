const { StateGraph, END } = require('@langchain/langgraph');
const graphState = require('./state/graphState');

const intentRouterNode = require('./nodes/intentRouter');
const siteSelectorNode = require('./nodes/siteSelector');
const scraperAgentNode = require('./nodes/scraperAgent');
const dataCollectorNode = require('./nodes/dataCollector');
const optimizeNode = require('./nodes/optimize');

// Conditional routing functions
const checkIntentError = (state) => {
    if (state.error) return "errorEnd";
    return "siteSelector";
};

// Compile Graph
const workflow = new StateGraph({ channels: graphState })
.addNode("intentRouter", intentRouterNode)
.addNode("siteSelector", siteSelectorNode)
.addNode("scraperAgent", scraperAgentNode)
.addNode("dataCollector", dataCollectorNode)
.addNode("optimize", optimizeNode)
.addNode("errorEnd", async (state) => state);

workflow.addConditionalEdges("intentRouter", checkIntentError, {
    "errorEnd": "errorEnd",
    "siteSelector": "siteSelector"
});

workflow.addEdge("siteSelector", "scraperAgent");
workflow.addEdge("scraperAgent", "dataCollector");
workflow.addEdge("dataCollector", "optimize");

workflow.addEdge("optimize", END);
workflow.addEdge("errorEnd", END);

workflow.setEntryPoint("intentRouter");

const app = workflow.compile();

const mainOrchestrator = async (usermessage, userId, userMessageId) => {
    const initialState = {
        userId: userId,
        userMessageId: userMessageId,
        userMessage: usermessage,
        intentData: null,
        targetSites: [],
        rawHtmlResults: [],
        extractedLeads: [],
        optimizedLeads: [],
        retryCount: 0,
        error: null
    };

    const finalState = await app.invoke(initialState);

    if (finalState.error) {
        return finalState.error;
    }

    return {
        status: "SUCCESS",
        count: finalState.optimizedLeads.length,
        leads: finalState.optimizedLeads
    };
};

module.exports = mainOrchestrator;
