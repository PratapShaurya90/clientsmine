const UsersMessage = require('../models/usersMessage');
const ScrapedLead = require('../models/scrapedLead');

const getScrapingStatus = async (req, res) => {
    try {
        const { messageId } = req.params;

        if (!messageId) {
            return res.status(400).json({ message: "Message ID is required" });
        }

        const messageRecord = await UsersMessage.findById(messageId);

        if (!messageRecord) {
            return res.status(404).json({ message: "Task not found" });
        }

        let leads = [];
        if (messageRecord.status === 'COMPLETED') {
            leads = await ScrapedLead.find({ userMessageId: messageId }).sort({ tier: 1 });
        }

        res.status(200).json({ 
            status: messageRecord.status,
            message: messageRecord.message,
            title: messageRecord.title,
            error_details: messageRecord.error_details || null,
            leadsFound: leads.length,
            data: leads
        });

    } catch (err) {
        console.error("Error in getScrapingStatus:", err);
        res.status(500).json({ message: "Problem fetching status" });
    }
}

module.exports = getScrapingStatus;
