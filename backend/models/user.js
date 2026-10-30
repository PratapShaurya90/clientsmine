const mongoose = require('mongoose')

const userDetails = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true,
            unique: true
        },
        occupation: {
            type: String,
            required: true
        },
        isPro: {
            type: Boolean,
            default: false
        },
    }, {
        timestamps: true
    }
)

module.exports = mongoose.model("User", userDetails)
