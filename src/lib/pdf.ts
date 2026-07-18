import fs from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

export const MAX_PDF_UPLOAD_SIZE = 10 * 1024 * 1024
export const DEFAULT_PDF_STORAGE_DIR = path.join(process.cwd(), "public", "uploads")
export const DEFAULT_PDF_PUBLIC_PREFIX = "/uploads"
export const DEFAULT_PDF_CHUNK_SIZE = 3500
export const DEFAULT_PDF_CHUNK_OVERLAP = 300

export type PdfKnowledgeChunk = {
    fileName: string
    text: string
    score: number
}

export type PdfKnowledgeSource = {
    filename: string
    path: string
    extractedText: string
    chunks?: string[]
    numPages?: number
}

export function isPdfFile(file: File) {
    const lowerName = file.name.toLowerCase()
    return file.type === "application/pdf" || lowerName.endsWith(".pdf")
}

export function formatFileSize(bytes: number) {
    if (!Number.isFinite(bytes) || bytes < 0) {
        return "0 B"
    }

    if (bytes < 1024) {
        return `${bytes} B`
    }

    const kilobytes = bytes / 1024
    if (kilobytes < 1024) {
        return `${kilobytes.toFixed(1)} KB`
    }

    return `${(kilobytes / 1024).toFixed(1)} MB`
}

export function sanitizeFileName(value: string) {
    const baseName = path
        .basename(value)
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^[-.]+|[-.]+$/g, "")

    return baseName || `pdf-${randomUUID()}.pdf`
}

export function createStoredPdfName(originalName: string) {
    const parsed = path.parse(originalName)
    const safeStem = sanitizeFileName(parsed.name || "document").replace(/\.[^.]+$/, "")

    return `${safeStem}-${randomUUID()}.pdf`
}

export async function ensurePdfStorageDir(storageDir = DEFAULT_PDF_STORAGE_DIR) {
    await fs.mkdir(storageDir, { recursive: true })
}

export async function savePdfBuffer(
    originalName: string,
    buffer: Buffer,
    storageDir = DEFAULT_PDF_STORAGE_DIR,
    publicPrefix = DEFAULT_PDF_PUBLIC_PREFIX
) {
    await ensurePdfStorageDir(storageDir)

    const storedFileName = createStoredPdfName(originalName)
    const absolutePath = path.join(storageDir, storedFileName)
    const publicPath = `${publicPrefix}/${storedFileName}`

    await fs.writeFile(absolutePath, buffer)

    return {
        storedFileName,
        absolutePath,
        publicPath,
    }
}

export async function deletePdfFile(fileReference: string, storageDir = DEFAULT_PDF_STORAGE_DIR) {
    const candidatePath = fileReference.startsWith("/")
        ? path.join(process.cwd(), "public", fileReference.replace(/^\/+/, ""))
        : path.join(storageDir, fileReference)

    try {
        await fs.unlink(candidatePath)
        return { deleted: true, path: candidatePath }
    } catch (error: any) {
        if (error?.code === "ENOENT") {
            return { deleted: false, path: candidatePath }
        }

        throw error
    }
}

export function cleanPdfText(rawText: string) {
    const normalized = rawText.replace(/\r/g, "\n")

    return normalized
        .split(/\n\s*\n+/)
        .map((paragraph) => paragraph.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, " ").trim())
        .filter(Boolean)
        .join("\n\n")
}

export function chunkPdfText(text: string, chunkSize = DEFAULT_PDF_CHUNK_SIZE, overlap = DEFAULT_PDF_CHUNK_OVERLAP) {
    const normalized = text.replace(/\s+/g, " ").trim()

    if (!normalized) {
        return []
    }

    const chunks: string[] = []
    let start = 0

    while (start < normalized.length) {
        const end = Math.min(start + chunkSize, normalized.length)
        const chunk = normalized.slice(start, end).trim()

        if (chunk) {
            chunks.push(chunk)
        }

        if (end >= normalized.length) {
            break
        }

        start = Math.max(end - overlap, start + 1)
    }

    return chunks
}

function tokenizeQuery(value: string) {
    return value
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .map((part) => part.trim())
        .filter((part) => part.length >= 3)
}

function scoreChunkAgainstQuery(chunk: string, query: string) {
    const terms = tokenizeQuery(query)
    if (terms.length === 0) {
        return 0
    }

    const loweredChunk = chunk.toLowerCase()
    let score = 0

    for (const term of terms) {
        if (loweredChunk.includes(term)) {
            score += 1
        }
    }

    return score
}

export function selectRelevantPdfChunks(sources: PdfKnowledgeSource[], query: string, limit = 8) {
    const rankedChunks: PdfKnowledgeChunk[] = []

    for (const source of sources) {
        const sourceChunks = Array.isArray(source.chunks) && source.chunks.length > 0
            ? source.chunks
            : chunkPdfText(source.extractedText)

        sourceChunks.forEach((chunkText) => {
            const trimmed = chunkText.trim()
            if (!trimmed) {
                return
            }

            rankedChunks.push({
                fileName: source.filename,
                text: trimmed,
                score: scoreChunkAgainstQuery(trimmed, query),
            })
        })
    }

    const sortedChunks = rankedChunks.sort((left, right) => {
        if (right.score !== left.score) {
            return right.score - left.score
        }

        return right.text.length - left.text.length
    })

    const matchingChunks = sortedChunks.filter((chunk) => chunk.score > 0).slice(0, limit)
    const fallbackChunks = sortedChunks.slice(0, limit)

    return matchingChunks.length > 0 ? matchingChunks : fallbackChunks
}

export function buildPdfContextBlock(sources: PdfKnowledgeSource[], query: string, limit = 8) {
    const chunks = selectRelevantPdfChunks(sources, query, limit)

    if (chunks.length === 0) {
        return ""
    }

    const groupedByFile = new Map<string, string[]>()

    for (const chunk of chunks) {
        const items = groupedByFile.get(chunk.fileName) || []
        items.push(chunk.text)
        groupedByFile.set(chunk.fileName, items)
    }

    const sections = Array.from(groupedByFile.entries()).map(([fileName, fileChunks]) => {
        return `File: ${fileName}\n${fileChunks.map((text, index) => `${index + 1}. ${text}`).join("\n")}`
    })

    return sections.join("\n\n")
}
