const ScrapedLead = require('../models/scrapedLead');
const UsersMessage = require('../models/usersMessage');

// Paginated API for fetching leads
const getLeads = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const leads = await ScrapedLead.find({ userId })
            .sort({ tier: 1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await ScrapedLead.countDocuments({ userId });

        res.status(200).json({
            success: true,
            count: leads.length,
            totalLeads: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: leads
        });
    } catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).json({ success: false, message: "Server error while fetching leads." });
    }
};

// GET /api/leads/history — fetch all messages with their grouped leads
const getHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const messages = await UsersMessage.find({ userId, status: "COMPLETED" })
            .sort({ createdAt: -1 })
            .lean();

        if (!messages || messages.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        // Single batch query replaces N+1 queries running in Promise.all
        const messageIds = messages.map(msg => msg._id);
        const leads = await ScrapedLead.find({ userMessageId: { $in: messageIds } })
            .sort({ tier: 1 })
            .lean();

        // Group leads by userMessageId in O(1) Map lookup
        const leadsByMsgId = new Map();
        for (const lead of leads) {
            const mId = lead.userMessageId.toString();
            if (!leadsByMsgId.has(mId)) {
                leadsByMsgId.set(mId, []);
            }
            leadsByMsgId.get(mId).push(lead);
        }

        const history = messages.map(msg => ({
            ...msg,
            leads: leadsByMsgId.get(msg._id.toString()) || []
        }));

        res.status(200).json({ success: true, data: history });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ success: false, message: "Server error while fetching history." });
    }
};

module.exports = { getLeads, getHistory };

