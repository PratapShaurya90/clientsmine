const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mainOrchestrator = require('./Implementations/mainOrchestrator');
const UsersMessage = require('./models/usersMessage');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clientsmine')
    .then(async () => {
        console.log("Connected to DB, running test...");
        try {
            // Mock IDs
            const mockUserId = new mongoose.Types.ObjectId();
            const mockMessageId = new mongoose.Types.ObjectId();

            const response = await mainOrchestrator("Hey find the clients who posted want content writer in last 24hr", mockUserId, mockMessageId);
            console.log("Graph Output:", JSON.stringify(response, null, 2));
        } catch (e) {
            console.error("FATAL ERROR IN GRAPH:", e);
        }
        process.exit(0);
    })
    .catch(console.error);
