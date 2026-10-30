const mongoose = require('mongoose');

const scrapedLeadSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UsersMessage',
        required: false
    },
    domain_category: {
        type: String,
        required: true,
        index: true
    },
    company_name: {
        type: String,
        default: 'NA'
    },
    city: {
        type: String,
        default: 'NA'
    },
    country: {
        type: String,
        default: 'NA'
    },
    domain: {
        type: String,
        default: 'NA'
    },
    paying_amount: {
        type: String,
        default: 'NA'
    },
    job_title: {
        type: String,
        required: true
    },
    posted_date: {
        type: String,
        default: 'NA',
        index: true
    },
    email: {
        type: String,
        default: 'NA'
    },
    phone: {
        type: String,
        default: 'NA'
    },
    website: {
        type: String,
        default: 'NA'
    },
    linkedin: {
        type: String,
        default: 'NA'
    },
    source_url: {
        type: String,
        required: true
    },
    scraped_at_utc: {
        type: Date,
        default: Date.now
    },
    tier: {
        type: Number, // 1, 2, or 3
        required: true,
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ScrapedLead', scrapedLeadSchema);
