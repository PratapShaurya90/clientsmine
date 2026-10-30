const mongoose = require('mongoose')

const UserMessageSchema = new mongoose.Schema(
    {
        userId:{
            type:String,
            required:true,
            ref:"User"
        },
        title:{
            type:String,
            required:true

        },
        message:{
            type:String,
            required:true
        },
        status: {
            type: String,
            enum: ['PROCESSING', 'COMPLETED', 'ERROR', 'CLARIFICATION_REQUIRED'],
            default: 'PROCESSING'
        },
        error_details: {
            type: String
        }
    }, { timestamps: true }
)

module.exports = mongoose.model("UsersMessage",UserMessageSchema)