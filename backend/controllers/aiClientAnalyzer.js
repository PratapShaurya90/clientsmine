const streamingOrchestrator = require('../Implementations/streamingOrchestrator');
const UsersMessage = require('../models/usersMessage');

/**
 * SSE endpoint — streams leads to the frontend site-by-site.
 *
 * Event types sent:
 *   event: status → { message: "..." }
 *   event: leads  → { leads: [...], source: "RemoteOK", count: N }
 *   event: done   → { total: N }
 *   event: error  → { message: "..." }
 *   event: clarification → { question: "..." }
 */
const aiClientAnalyze = async (req, res) => {
    try {
        const { usermessage } = req.body;

        if (!usermessage) {
            return res.status(400).json({ message: "Requirements is required" });
        }

        // --- Create history record ---
        const titleString = usermessage.split(" ").slice(0, 6).join(" ") + "...";
        const hist = await UsersMessage.create({
            userId: req.user._id,
            message: usermessage,
            title: titleString,
            status: 'PROCESSING'
        });

        // --- Open SSE stream ---
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering if present
        res.flushHeaders();

        const sendEvent = (eventName, data) => {
            res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
        };

        sendEvent('status', { message: 'Connected. Analyzing query with Gemini AI...' });

        const isPro = req.user.isPro;
        let totalSent = 0;
        let freeCapReached = false;

        // --- Run streaming orchestrator ---
        try {
            await streamingOrchestrator(
                usermessage,
                req.user._id,
                hist._id,

                // onLeads — called after each site finishes
                (batch, sourceName) => {
                    if (freeCapReached) return;

                    let leadsToSend = batch;

                    // Free users: cap at 5 total
                    if (!isPro) {
                        const remaining = 5 - totalSent;
                        if (remaining <= 0) {
                            freeCapReached = true;
                            return;
                        }
                        leadsToSend = batch.slice(0, remaining);
                        if (leadsToSend.length < batch.length) {
                            freeCapReached = true;
                        }
                    }

                    totalSent += leadsToSend.length;
                    sendEvent('leads', {
                        leads: leadsToSend,
                        source: sourceName,
                        count: leadsToSend.length
                    });
                },

                // onError — called on fatal errors (e.g. intent parse failure)
                async (errorObj) => {
                    if (errorObj.status === 'CLARIFICATION_REQUIRED') {
                        await UsersMessage.findByIdAndUpdate(hist._id, {
                            status: 'CLARIFICATION_REQUIRED',
                            error_details: errorObj.question
                        });
                        sendEvent('clarification', { question: errorObj.question });
                    } else {
                        await UsersMessage.findByIdAndUpdate(hist._id, {
                            status: 'ERROR',
                            error_details: errorObj.message || 'Unknown error'
                        });
                        sendEvent('error', { message: errorObj.message || 'Scraping failed' });
                    }
                    res.end();
                },

                // onProgress — real-time progress update sent to frontend
                (statusText) => {
                    sendEvent('status', { message: statusText });
                }
            );

            // --- All sites done ---
            await UsersMessage.findByIdAndUpdate(hist._id, { status: 'COMPLETED' });
            sendEvent('done', { total: totalSent });
            res.end();

        } catch (err) {
            console.error("[aiClientAnalyzer] Streaming task failed:", err);
            await UsersMessage.findByIdAndUpdate(hist._id, {
                status: 'ERROR',
                error_details: 'System crashed during execution'
            });
            sendEvent('error', { message: 'System crashed during execution' });
            res.end();
        }

    } catch (err) {
        console.error("Error in aiClientAnalyze:", err);
        if (!res.headersSent) {
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.end();
        }
    }
};

module.exports = aiClientAnalyze;
