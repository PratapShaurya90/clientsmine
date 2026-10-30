const { optimizeAndSaveLeads } = require('../../Optimization/dataOptimizer');

const optimizeNode = async (state) => {
    console.log("[Node] Optimize");
    const optimized = await optimizeAndSaveLeads(state.userId, state.userMessageId, state.extractedLeads, state.intentData);
    return { ...state, optimizedLeads: optimized };
};

module.exports = optimizeNode;
