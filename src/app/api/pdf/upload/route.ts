import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"

import connectDb from "@/lib/db"
import { MAX_PDF_UPLOAD_SIZE, cleanPdfText, chunkPdfText, isPdfFile, savePdfBuffer } from "@/lib/pdf"
import PDFKnowledge from "@/model/pdfKnowledge.model"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const ownerId = String(formData.get("ownerId") || "").trim()
        const rawFiles = formData.getAll("files")

        if (!ownerId) {
            return NextResponse.json({ success: false, message: "ownerId is required" }, { status: 400 })
        }

        const files = rawFiles.filter((entry): entry is File => entry instanceof File)

        if (files.length === 0) {
            return NextResponse.json({ success: false, message: "At least one PDF file is required" }, { status: 400 })
        }

        await connectDb()

        const pdfParseModule = await import("pdf-parse")
        const pdfParse = (pdfParseModule as any).default || pdfParseModule

        const uploadedFiles: Array<{
            id: string
            filename: string
            path: string
            uploadTime: string
            fileSize: number
            numPages: number
        }> = []
        const fileErrors: Array<{ filename: string; message: string }> = []

        for (const file of files) {
            const filename = file.name || `document-${randomUUID()}.pdf`

            if (!isPdfFile(file)) {
                fileErrors.push({ filename, message: "Only PDF files are allowed" })
                continue
            }

            if (file.size > MAX_PDF_UPLOAD_SIZE) {
                fileErrors.push({ filename, message: "Each file must be 10 MB or smaller" })
                continue
            }

            try {
                const arrayBuffer = await file.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)
                const parsed = await pdfParse(buffer)
                const cleanedText = cleanPdfText(String(parsed.text || ""))

                if (!cleanedText) {
                    fileErrors.push({ filename, message: "Unable to extract text from this PDF" })
                    continue
                }

                const savedFile = await savePdfBuffer(filename, buffer)
                const chunks = chunkPdfText(cleanedText)

                const document = await PDFKnowledge.create({
                    ownerId,
                    filename,
                    path: savedFile.publicPath,
                    uploadTime: new Date(),
                    fileSize: file.size,
                    numPages: Number(parsed.numpages || parsed.numPages || 0),
                    extractedText: cleanedText,
                    chunks,
                })

                uploadedFiles.push({
                    id: String(document._id),
                    filename: document.filename,
                    path: document.path,
                    uploadTime: document.uploadTime.toISOString(),
                    fileSize: document.fileSize,
                    numPages: document.numPages,
                })
            } catch (error) {
                console.error("PDF upload error:", error)
                fileErrors.push({ filename, message: "Failed to process PDF" })
            }
        }

        if (uploadedFiles.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No PDFs were uploaded",
                    errors: fileErrors,
                },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: fileErrors.length > 0 ? "Some PDFs were uploaded" : "PDFs uploaded successfully",
            files: uploadedFiles,
            errors: fileErrors,
        })
    } catch (error) {
        console.error("PDF UPLOAD ERROR:", error)

        return NextResponse.json(
            { success: false, message: "Unable to upload PDFs" },
            { status: 500 }
        )
    }
}
