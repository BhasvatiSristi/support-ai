import { NextRequest, NextResponse } from "next/server"

import connectDb from "@/lib/db"
import PDFKnowledge from "@/model/pdfKnowledge.model"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const ownerId = searchParams.get("ownerId")?.trim()

        if (!ownerId) {
            return NextResponse.json({ success: false, message: "ownerId is required" }, { status: 400 })
        }

        await connectDb()

        const documents = await PDFKnowledge.find({ ownerId })
            .sort({ uploadTime: -1 })
            .lean()

        return NextResponse.json({
            success: true,
            files: documents.map((document) => ({
                id: String(document._id),
                filename: document.filename,
                path: document.path,
                uploadTime: document.uploadTime,
                fileSize: document.fileSize,
                numPages: document.numPages,
            })),
        })
    } catch (error) {
        console.error("PDF LIST ERROR:", error)

        return NextResponse.json(
            { success: false, message: "Unable to load PDF files" },
            { status: 500 }
        )
    }
}
