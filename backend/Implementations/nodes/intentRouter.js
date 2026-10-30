const parseIntent = require('../../PhaseOne/intentParser');

const intentRouterNode = async (state) => {
    console.log("[Node] IntentRouter");
    const intentResponse = await parseIntent(state.userMessage);
    
    if (intentResponse.status === "CLARIFICATION_REQUIRED" || intentResponse.status === "ERROR") {
        return { ...state, error: intentResponse };
    }

    return { ...state, intentData: intentResponse.data };
};

module.exports = intentRouterNode;
