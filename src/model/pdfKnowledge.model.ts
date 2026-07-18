import mongoose, { Schema, model } from "mongoose"

interface IPdfKnowledge {
    ownerId: string
    filename: string
    path: string
    uploadTime: Date
    fileSize: number
    numPages: number
    extractedText: string
    chunks: string[]
}

const pdfKnowledgeSchema = new Schema<IPdfKnowledge>(
    {
        ownerId: {
            type: String,
            required: true,
            index: true,
        },
        filename: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        uploadTime: {
            type: Date,
            default: Date.now,
        },
        fileSize: {
            type: Number,
            required: true,
        },
        numPages: {
            type: Number,
            required: true,
            default: 0,
        },
        extractedText: {
            type: String,
            required: true,
        },
        chunks: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
)

pdfKnowledgeSchema.index({ ownerId: 1, uploadTime: -1 })

const PDFKnowledge = mongoose.models.PDFKnowledge || model("PDFKnowledge", pdfKnowledgeSchema)

export default PDFKnowledge
