import { NextRequest, NextResponse } from "next/server"

import connectDb from "@/lib/db"
import { deletePdfFile } from "@/lib/pdf"
import PDFKnowledge from "@/model/pdfKnowledge.model"

export const runtime = "nodejs"

export async function DELETE(request: NextRequest) {
    try {
        const payload = await request.json()
        const ownerId = String(payload?.ownerId || "").trim()
        const pdfId = String(payload?.pdfId || "").trim()

        if (!ownerId || !pdfId) {
            return NextResponse.json(
                { success: false, message: "ownerId and pdfId are required" },
                { status: 400 }
            )
        }

        await connectDb()

        const pdfRecord = await PDFKnowledge.findOne({ _id: pdfId, ownerId })

        if (!pdfRecord) {
            return NextResponse.json(
                { success: false, message: "PDF file not found" },
                { status: 404 }
            )
        }

        await deletePdfFile(pdfRecord.path)
        await PDFKnowledge.deleteOne({ _id: pdfId, ownerId })

        return NextResponse.json({
            success: true,
            message: "PDF deleted successfully",
        })
    } catch (error) {
        console.error("PDF DELETE ERROR:", error)

        return NextResponse.json(
            { success: false, message: "Unable to delete PDF" },
            { status: 500 }
        )
    }
}
