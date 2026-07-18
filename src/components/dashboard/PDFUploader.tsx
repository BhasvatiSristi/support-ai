"use client"

import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

const MAX_PDF_UPLOAD_SIZE = 10 * 1024 * 1024

function formatFileSize(bytes: number) {
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

type PdfFileRecord = {
    id: string
    filename: string
    path: string
    uploadTime: string
    fileSize: number
    numPages: number
}

type UploadPhase = "idle" | "uploading" | "extracting" | "saving"

const uploadPhaseLabels: Record<UploadPhase, string> = {
    idle: "Upload PDFs",
    uploading: "Uploading...",
    extracting: "Extracting text...",
    saving: "Saving...",
}

export default function PDFUploader({ ownerId }: { ownerId: string }) {
    const [files, setFiles] = useState<PdfFileRecord[]>([])
    const [loadingFiles, setLoadingFiles] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [phase, setPhase] = useState<UploadPhase>("idle")
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const phaseTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([])

    const showToast = (message: string, type: "success" | "error") => {
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current)
        }

        setToast({ message, type })
        toastTimerRef.current = setTimeout(() => setToast(null), 3000)
    }

    const clearPhaseTimers = () => {
        phaseTimersRef.current.forEach((timer) => clearTimeout(timer))
        phaseTimersRef.current = []
    }

    const fetchFiles = async () => {
        if (!ownerId) {
            return
        }

        setLoadingFiles(true)
        try {
            const response = await axios.get("/api/pdf/list", {
                params: { ownerId },
            })

            setFiles(Array.isArray(response.data?.files) ? response.data.files : [])
        } catch (error) {
            console.error(error)
            showToast("Unable to load PDF files.", "error")
        } finally {
            setLoadingFiles(false)
        }
    }

    useEffect(() => {
        fetchFiles()

        return () => {
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current)
            }

            clearPhaseTimers()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ownerId])

    const startLoadingPhases = () => {
        clearPhaseTimers()
        setPhase("uploading")

        phaseTimersRef.current.push(
            setTimeout(() => setPhase("extracting"), 500),
            setTimeout(() => setPhase("saving"), 1100)
        )
    }

    const resetLoadingState = () => {
        clearPhaseTimers()
        setUploading(false)
        setPhase("idle")
    }

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || [])
        event.target.value = ""

        if (!selectedFiles.length) {
            return
        }

        const invalidFiles = selectedFiles.filter(
            (file) =>
                file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")
        )

        if (invalidFiles.length > 0) {
            showToast("Only PDF files are allowed.", "error")
            return
        }

        const oversizedFiles = selectedFiles.filter((file) => file.size > MAX_PDF_UPLOAD_SIZE)
        if (oversizedFiles.length > 0) {
            showToast("Each PDF must be 10 MB or smaller.", "error")
            return
        }

        const formData = new FormData()
        formData.append("ownerId", ownerId)
        selectedFiles.forEach((file) => formData.append("files", file))

        setUploading(true)
        startLoadingPhases()

        try {
            const response = await axios.post("/api/pdf/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })

            await fetchFiles()

            if (Array.isArray(response.data?.errors) && response.data.errors.length > 0) {
                showToast(response.data.message || "Some PDFs were uploaded.", "success")
            } else {
                showToast("PDFs uploaded successfully.", "success")
            }
        } catch (error) {
            console.error(error)
            showToast("Unable to upload PDFs.", "error")
        } finally {
            resetLoadingState()
        }
    }

    const handleDelete = async (pdfId: string) => {
        setDeletingId(pdfId)
        try {
            await axios.delete("/api/pdf/delete", {
                data: { ownerId, pdfId },
            })

            setFiles((current) => current.filter((file) => file.id !== pdfId))
            showToast("PDF deleted successfully.", "success")
        } catch (error) {
            console.error(error)
            showToast("Unable to delete PDF.", "error")
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
        >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-lg font-semibold tracking-tight">PDF Knowledge Base</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Upload one or more PDFs. The text is extracted, cleaned, stored, and used by Gemini.
                    </p>
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                    <span>{uploadPhaseLabels[phase]}</span>
                    <input
                        type="file"
                        accept="application/pdf,.pdf"
                        multiple
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-600">
                Maximum file size: 10 MB. Only PDF files are accepted.
            </div>

            <div className="mt-6 space-y-4">
                {loadingFiles ? (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-8 text-center text-sm text-blue-700">
                        Loading uploaded PDFs...
                    </div>
                ) : files.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-blue-200 px-4 py-8 text-center text-sm text-slate-500">
                        No PDFs uploaded yet.
                    </div>
                ) : (
                    files.map((file) => {
                        const uploadDate = new Intl.DateTimeFormat("en", {
                            dateStyle: "medium",
                            timeStyle: "short",
                        }).format(new Date(file.uploadTime))

                        return (
                            <div
                                key={file.id}
                                className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between"
                            >
                                <div>
                                    <p className="font-medium text-slate-900">{file.filename}</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Uploaded {uploadDate} • {formatFileSize(file.fileSize)} • {file.numPages} pages
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a
                                        href={file.path}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                                    >
                                        View file
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(file.id)}
                                        disabled={deletingId === file.id}
                                        className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {deletingId === file.id ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${toast.type === "success" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
                >
                    {toast.message}
                </motion.div>
            )}
        </motion.div>
    )
}
