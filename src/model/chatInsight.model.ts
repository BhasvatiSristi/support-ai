import mongoose, { Schema, model } from "mongoose"

interface IChatInsight {
    ownerId: string
    conversationId: string
    customerMessages: string[]
    botResponses: string[]
    title: string
    summary: string
    issueCategory: string
    sentiment: string
    priority: string
    resolved: boolean
}

const chatInsightSchema = new Schema<IChatInsight>(
    {
        ownerId: {
            type: String,
            required: true,
            index: true,
        },
        conversationId: {
            type: String,
            required: true,
        },
        customerMessages: {
            type: [String],
            default: [],
        },
        botResponses: {
            type: [String],
            default: [],
        },
        title: {
            type: String,
            required: true,
        },
        summary: {
            type: String,
            required: true,
        },
        issueCategory: {
            type: String,
            required: true,
        },
        sentiment: {
            type: String,
            required: true,
        },
        priority: {
            type: String,
            required: true,
        },
        resolved: {
            type: Boolean,
            required: true,
        },
    },
    { timestamps: true }
)

chatInsightSchema.index({ ownerId: 1, conversationId: 1 }, { unique: true })

const ChatInsight = mongoose.models.ChatInsight || model("ChatInsight", chatInsightSchema)

export default ChatInsight