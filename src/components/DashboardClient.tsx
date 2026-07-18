"use client"

import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"

import PDFUploader from "@/components/dashboard/PDFUploader"

function DashboardClient({ ownerId }: { ownerId: string }) {
    const navigate = useRouter()
    const [businessName, setBusinessName] = useState("")
    const [supportEmail, setSupportEmail] = useState("")
    const [knowledge, setKnowledge] = useState("")
    const [websiteUrl, setWebsiteUrl] = useState("")
    const [websiteKnowledge, setWebsiteKnowledge] = useState("")
    const [loadingWebsite, setLoadingWebsite] = useState(false)
    const [activeKnowledgeSource, setActiveKnowledgeSource] = useState<"website" | "pdf" | "manual" | null>(null)
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const showToast = (message: string, type: "success" | "error") => {
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current)
        }

        setToast({ message, type })
        toastTimerRef.current = setTimeout(() => {
            setToast(null)
        }, 3000)
    }

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current)
            }
        }
    }, [])

    useEffect(() => {
        if (!ownerId) {
            return
        }

        const handleGetDetails = async () => {
            try {
                const result = await axios.post("/api/settings/get", { ownerId })

                setBusinessName(result.data?.businessName || "")
                setSupportEmail(result.data?.supportEmail || "")
                setKnowledge(result.data?.knowledge || "")
                setWebsiteUrl(result.data?.websiteUrl || "")
                setWebsiteKnowledge(result.data?.websiteKnowledge || "")
            } catch (error) {
                console.error(error)
            }
        }

        handleGetDetails()
    }, [ownerId])

    const isValidWebsiteUrl = (value: string) => {
        try {
            const parsedUrl = new URL(value)
            return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
        } catch {
            return false
        }
    }

    const persistSettings = async (nextWebsiteUrl = websiteUrl, nextWebsiteKnowledge = websiteKnowledge) => {
        return axios.post("/api/settings", {
            ownerId,
            businessName,
            supportEmail,
            knowledge,
            websiteUrl: nextWebsiteUrl,
            websiteKnowledge: nextWebsiteKnowledge,
        })
    }

    const handleAutoLearn = async () => {
        const trimmedUrl = websiteUrl.trim()

        if (!isValidWebsiteUrl(trimmedUrl)) {
            showToast("Enter a valid website URL.", "error")
            return
        }

        setLoadingWebsite(true)

        try {
            const result = await axios.post("/api/autolearn", {
                websiteUrl: trimmedUrl,
            })

            if (result.data?.success && typeof result.data?.knowledge === "string") {
                const learnedKnowledge = result.data.knowledge
                setWebsiteUrl(trimmedUrl)
                setWebsiteKnowledge(learnedKnowledge)
                await persistSettings(trimmedUrl, learnedKnowledge)
                showToast("Website learned successfully.", "success")
                return
            }

            showToast("Unable to learn website.", "error")
        } catch (error) {
            console.error(error)
            showToast("Unable to learn website.", "error")
        } finally {
            setLoadingWebsite(false)
        }
    }

    const handleSettings = async () => {
        setLoading(true)

        try {
            await persistSettings()
            setSaved(true)
            showToast("Settings saved.", "success")
            setTimeout(() => {
                setSaved(false)
            }, 3000)
        } catch (error) {
            console.error(error)
            showToast("Unable to save settings.", "error")
        } finally {
            setLoading(false)
        }
    }

    const toggleKnowledgeSource = (source: "website" | "pdf" | "manual") => {
        setActiveKnowledgeSource((current) => (current === source ? null : source))
    }

    const knowledgeSourceHeaderClass = (source: "website" | "pdf" | "manual") => {
        const isActive = activeKnowledgeSource === source

        return `flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${isActive ? "border-blue-300 bg-blue-50" : "border-blue-100 bg-white hover:bg-blue-50/60"}`
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-white via-blue-50 to-blue-100 text-slate-900">
            <motion.div
                initial={{ y: -40 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4 }}
                className="fixed left-0 top-0 z-50 w-full border-b border-blue-100 bg-white/80 backdrop-blur-xl"
            >
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="cursor-pointer text-lg font-semibold tracking-tight" onClick={() => navigate.push("/")}>
                        IntelliSupport
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            className="rounded-lg border border-blue-200 px-4 py-2 text-sm text-blue-700 transition hover:bg-blue-50"
                            onClick={() => navigate.push("/dashboard/insights")}
                        >
                            AI Insights
                        </button>
                        <button
                            className="rounded-lg border border-blue-200 px-4 py-2 text-sm text-blue-700 transition hover:bg-blue-50"
                            onClick={() => navigate.push("/embed")}
                        >
                            Embed Chatbot
                        </button>
                    </div>
                </div>
            </motion.div>

            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 pt-24">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl border border-blue-100 bg-white p-8 shadow-xl"
                >
                    <h1 className="text-2xl font-semibold tracking-tight">Chatbot Settings</h1>
                    <p className="mt-1 text-slate-500">Manage your business profile and knowledge sources in one place.</p>

                    <div className="mt-8 grid gap-8 lg:grid-cols-2">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-medium">Business Details</h2>
                                <p className="mt-1 text-sm text-slate-500">Basic account and support information.</p>
                            </div>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                placeholder="Business Name"
                                value={businessName}
                                onChange={(event) => setBusinessName(event.target.value)}
                            />
                            <input
                                type="text"
                                className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                placeholder="Support Email"
                                value={supportEmail}
                                onChange={(event) => setSupportEmail(event.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-medium">Knowledge Sources</h2>
                                <p className="mt-1 text-sm text-slate-500">Open one source at a time. Website learning, PDFs, and manual knowledge are all used together.</p>
                            </div>

                            <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                                <button
                                    type="button"
                                    className={knowledgeSourceHeaderClass("website")}
                                    onClick={() => toggleKnowledgeSource("website")}
                                >
                                    <div>
                                        <p className="text-sm font-medium text-blue-700">Website URL</p>
                                        <p className="text-xs text-slate-500">Auto learn from your business website.</p>
                                    </div>
                                    <span className="text-blue-500">{activeKnowledgeSource === "website" ? "−" : "+"}</span>
                                </button>

                                {activeKnowledgeSource === "website" && (
                                    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                                        <div className="flex flex-col gap-3 md:flex-row">
                                            <input
                                                type="url"
                                                className="min-w-0 flex-1 rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                                placeholder="https://yourbusiness.com"
                                                value={websiteUrl}
                                                onChange={(event) => setWebsiteUrl(event.target.value)}
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="button"
                                                disabled={loadingWebsite}
                                                onClick={handleAutoLearn}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 md:min-w-40"
                                            >
                                                {loadingWebsite && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                                                {loadingWebsite ? "Learning..." : "Auto Learn"}
                                            </motion.button>
                                        </div>

                                        <textarea
                                            className="mt-3 h-44 w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                            placeholder="Website knowledge will appear here after auto learning."
                                            value={websiteKnowledge}
                                            onChange={(event) => setWebsiteKnowledge(event.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                                <button
                                    type="button"
                                    className={knowledgeSourceHeaderClass("pdf")}
                                    onClick={() => toggleKnowledgeSource("pdf")}
                                >
                                    <div>
                                        <p className="text-sm font-medium text-blue-700">Upload PDF</p>
                                        <p className="text-xs text-slate-500">Upload one or multiple PDFs and store the extracted text.</p>
                                    </div>
                                    <span className="text-blue-500">{activeKnowledgeSource === "pdf" ? "−" : "+"}</span>
                                </button>

                                {activeKnowledgeSource === "pdf" && (
                                    <div className="mt-4">
                                        <PDFUploader ownerId={ownerId} />
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                                <button
                                    type="button"
                                    className={knowledgeSourceHeaderClass("manual")}
                                    onClick={() => toggleKnowledgeSource("manual")}
                                >
                                    <div>
                                        <p className="text-sm font-medium text-blue-700">Manual Knowledge Base</p>
                                        <p className="text-xs text-slate-500">Add policies, FAQs, delivery info, and support notes.</p>
                                    </div>
                                    <span className="text-blue-500">{activeKnowledgeSource === "manual" ? "−" : "+"}</span>
                                </button>

                                {activeKnowledgeSource === "manual" && (
                                    <textarea
                                        className="mt-4 h-56 w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                        placeholder={`Example:\n• Refund policy: 7 days return available\n• Delivery time: 3-5 days\n• Cash on delivery available\n• Support hours`}
                                        value={knowledge}
                                        onChange={(event) => setKnowledge(event.target.value)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-5">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            disabled={loading}
                            onClick={handleSettings}
                            className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                            {loading ? "Saving..." : "Save"}
                        </motion.button>

                        {saved && (
                            <motion.span
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm font-medium text-blue-600"
                            >
                                Settings saved.
                            </motion.span>
                        )}
                    </div>
                </motion.div>
            </div>

            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`fixed right-4 top-20 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${toast.type === "success" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
                >
                    {toast.message}
                </motion.div>
            )}
        </div>
    )
}

export default DashboardClient
