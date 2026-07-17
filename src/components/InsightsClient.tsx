"use client"

import React, { useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

type ChatInsightRecord = {
    _id: string
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
    createdAt: string
}

type Filters = {
    issueCategory: string
    priority: string
    sentiment: string
    resolved: string
    sortBy: string
}

const badgeStyles: Record<string, string> = {
    High: "bg-blue-100 text-blue-700 border-blue-200",
    Medium: "bg-blue-50 text-blue-700 border-blue-200",
    Low: "bg-sky-100 text-sky-700 border-sky-200",
    Positive: "bg-blue-100 text-blue-700 border-blue-200",
    Neutral: "bg-blue-50 text-blue-700 border-blue-200",
    Negative: "bg-sky-100 text-sky-700 border-sky-200",
    Resolved: "bg-blue-100 text-blue-700 border-blue-200",
    "Needs Attention": "bg-sky-100 text-sky-700 border-sky-200",
}

const categoryOptions = [
    "Order",
    "Shipping",
    "Refund",
    "Payment",
    "Warranty",
    "Technical",
    "Account",
    "General Inquiry",
    "Other",
]

const priorityOptions = ["Low", "Medium", "High"]
const sentimentOptions = ["Positive", "Neutral", "Negative"]

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value))
}

function getConversationTurns(insight: ChatInsightRecord) {
    const turns: Array<{ role: "Customer" | "Bot"; text: string }> = []
    const maxLength = Math.max(insight.customerMessages.length, insight.botResponses.length)

    for (let index = 0; index < maxLength; index += 1) {
        const customerMessage = insight.customerMessages[index]
        const botResponse = insight.botResponses[index]

        if (customerMessage) {
            turns.push({ role: "Customer", text: customerMessage })
        }

        if (botResponse) {
            turns.push({ role: "Bot", text: botResponse })
        }
    }

    return turns
}

function Badge({ children, tone }: { children: React.ReactNode; tone: string }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${badgeStyles[tone] || "bg-blue-50 text-blue-700 border-blue-200"}`}>
            {children}
        </span>
    )
}

export default function InsightsClient({ initialInsights }: { initialInsights: ChatInsightRecord[] }) {
    const [filters, setFilters] = useState<Filters>({
        issueCategory: "All",
        priority: "All",
        sentiment: "All",
        resolved: "All",
        sortBy: "Newest",
    })
    const [query, setQuery] = useState("")
    const [selectedInsight, setSelectedInsight] = useState<ChatInsightRecord | null>(null)

    const categories = useMemo(() => {
        const existingCategories = new Set(initialInsights.map((insight) => insight.issueCategory))
        return categoryOptions.filter((option) => existingCategories.has(option))
    }, [initialInsights])

    const visibleInsights = useMemo(() => {
        const loweredQuery = query.trim().toLowerCase()

        const filtered = initialInsights.filter((insight) => {
            const matchesQuery =
                !loweredQuery ||
                [insight.title, insight.summary, insight.issueCategory]
                    .join(" ")
                    .toLowerCase()
                    .includes(loweredQuery)

            const matchesCategory = filters.issueCategory === "All" || insight.issueCategory === filters.issueCategory
            const matchesPriority = filters.priority === "All" || insight.priority === filters.priority
            const matchesSentiment = filters.sentiment === "All" || insight.sentiment === filters.sentiment
            const matchesResolved =
                filters.resolved === "All" ||
                (filters.resolved === "Resolved" && insight.resolved) ||
                (filters.resolved === "Needs Attention" && !insight.resolved)

            return matchesQuery && matchesCategory && matchesPriority && matchesSentiment && matchesResolved
        })

        return filtered.sort((left, right) => {
            const leftDate = new Date(left.createdAt).getTime()
            const rightDate = new Date(right.createdAt).getTime()
            return filters.sortBy === "Newest" ? rightDate - leftDate : leftDate - rightDate
        })
    }, [filters, initialInsights, query])

    return (
        <div className="min-h-screen bg-linear-to-br from-white via-blue-50 to-blue-100 text-slate-900">
            <div className="sticky top-0 z-40 border-b border-blue-100 bg-white/85 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-500">Admin Dashboard</p>
                        <h1 className="text-lg font-semibold tracking-tight">AI Insights</h1>
                    </div>
                    <a
                        href="/dashboard"
                        className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                    >
                        Back to Dashboard
                    </a>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 rounded-3xl border border-blue-100 bg-white p-6 shadow-lg shadow-blue-100/60"
                >
                    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                        <div>
                            <p className="text-sm font-medium text-blue-500">Private analytics for the business owner only</p>
                            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Conversation summaries generated by Gemini</h2>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                Search support issues, inspect sentiment, and open the underlying conversation without exposing anything to customers.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                            <input
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search title, summary, category"
                                className="col-span-full rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            />
                            <select
                                value={filters.issueCategory}
                                onChange={(event) => setFilters((current) => ({ ...current, issueCategory: event.target.value }))}
                                className="rounded-2xl border border-blue-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            >
                                <option value="All">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filters.priority}
                                onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
                                className="rounded-2xl border border-blue-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            >
                                <option value="All">All Priorities</option>
                                {priorityOptions.map((priority) => (
                                    <option key={priority} value={priority}>
                                        {priority}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filters.sentiment}
                                onChange={(event) => setFilters((current) => ({ ...current, sentiment: event.target.value }))}
                                className="rounded-2xl border border-blue-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            >
                                <option value="All">All Sentiments</option>
                                {sentimentOptions.map((sentiment) => (
                                    <option key={sentiment} value={sentiment}>
                                        {sentiment}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filters.resolved}
                                onChange={(event) => setFilters((current) => ({ ...current, resolved: event.target.value }))}
                                className="rounded-2xl border border-blue-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Needs Attention">Needs Attention</option>
                            </select>
                            <select
                                value={filters.sortBy}
                                onChange={(event) => setFilters((current) => ({ ...current, sortBy: event.target.value }))}
                                className="rounded-2xl border border-blue-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            >
                                <option value="Newest">Newest First</option>
                                <option value="Oldest">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </motion.section>

                {visibleInsights.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-blue-200 bg-white px-6 py-16 text-center text-sm text-blue-500 shadow-sm">
                        No insights match the current filters.
                    </div>
                ) : (
                    <div className="grid gap-5 xl:grid-cols-2">
                        {visibleInsights.map((insight, index) => (
                            <motion.article
                                key={insight._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className="group rounded-3xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/40 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100/70"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-[0.24em] text-blue-400">Issue Title</p>
                                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{insight.title}</h3>
                                    </div>
                                    <Badge tone={insight.priority}>{insight.priority}</Badge>
                                </div>

                                <p className="mt-4 text-sm leading-6 text-slate-600">{insight.summary}</p>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Badge tone={insight.issueCategory}>{insight.issueCategory}</Badge>
                                    <Badge tone={insight.sentiment}>{insight.sentiment}</Badge>
                                    <Badge tone={insight.resolved ? "Resolved" : "Needs Attention"}>
                                        {insight.resolved ? "Resolved" : "Needs Attention"}
                                    </Badge>
                                </div>

                                <div className="mt-6 flex flex-col gap-4 border-t border-blue-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-slate-500">Created {formatDate(insight.createdAt)}</p>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedInsight(insight)}
                                        className="inline-flex items-center justify-center rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-700 hover:bg-blue-600 hover:text-white"
                                    >
                                        View Conversation
                                    </button>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </main>

            <AnimatePresence>
                {selectedInsight && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 px-4 py-8 backdrop-blur-sm"
                        onClick={() => setSelectedInsight(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.98, y: 16 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.98, y: 16 }}
                            className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-4 border-b border-blue-100 px-6 py-5">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-blue-400">Conversation</p>
                                    <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{selectedInsight.title}</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedInsight(null)}
                                    className="rounded-full border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="max-h-[calc(90vh-80px)] overflow-y-auto px-6 py-6">
                                <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                                    <div className="space-y-4">
                                        {getConversationTurns(selectedInsight).length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-blue-200 px-4 py-8 text-sm text-blue-500">
                                                No conversation transcript was captured for this insight.
                                            </div>
                                        ) : (
                                            getConversationTurns(selectedInsight).map((turn, index) => (
                                                <div key={`${turn.role}-${index}`} className={`flex ${turn.role === "Customer" ? "justify-start" : "justify-end"}`}>
                                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${turn.role === "Customer" ? "bg-blue-50 text-slate-800" : "bg-blue-700 text-white"}`}>
                                                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.24em] opacity-70">{turn.role}</p>
                                                        <p>{turn.text}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="space-y-4 rounded-3xl border border-blue-100 bg-blue-50 p-5">
                                        <div className="grid gap-3 text-sm text-slate-700">
                                            <div>
                                                <span className="block text-xs font-medium uppercase tracking-[0.24em] text-blue-400">Category</span>
                                                <span className="mt-1 inline-flex">
                                                    <Badge tone={selectedInsight.issueCategory}>{selectedInsight.issueCategory}</Badge>
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-medium uppercase tracking-[0.24em] text-blue-400">Sentiment</span>
                                                <span className="mt-1 inline-flex">
                                                    <Badge tone={selectedInsight.sentiment}>{selectedInsight.sentiment}</Badge>
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-medium uppercase tracking-[0.24em] text-blue-400">Priority</span>
                                                <span className="mt-1 inline-flex">
                                                    <Badge tone={selectedInsight.priority}>{selectedInsight.priority}</Badge>
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-medium uppercase tracking-[0.24em] text-blue-400">Resolved</span>
                                                <span className="mt-1 inline-flex">
                                                    <Badge tone={selectedInsight.resolved ? "Resolved" : "Needs Attention"}>
                                                        {selectedInsight.resolved ? "Resolved" : "Needs Attention"}
                                                    </Badge>
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-medium uppercase tracking-[0.24em] text-blue-400">Created</span>
                                                <p className="mt-1 text-sm text-slate-700">{formatDate(selectedInsight.createdAt)}</p>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-medium uppercase tracking-[0.24em] text-blue-400">Summary</span>
                                                <p className="mt-1 text-sm leading-6 text-slate-600">{selectedInsight.summary}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}