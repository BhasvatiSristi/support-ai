import React from "react"
import { redirect } from "next/navigation"

import connectDb from "@/lib/db"
import { getSession } from "@/lib/getSession"
import ChatInsight from "@/model/chatInsight.model"
import InsightsClient from "@/components/InsightsClient"

type InsightsPageRecord = {
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

export default async function Page() {
    const session = await getSession()

    if (!session?.user?.id) {
        redirect("/")
    }

    await connectDb()

    const insights = await ChatInsight.find({ ownerId: session.user.id })
        .sort({ createdAt: -1 })
        .lean()

    const records: InsightsPageRecord[] = insights.map((insight) => ({
        _id: String(insight._id),
        ownerId: String(insight.ownerId),
        conversationId: String(insight.conversationId),
        customerMessages: Array.isArray(insight.customerMessages) ? insight.customerMessages.map(String) : [],
        botResponses: Array.isArray(insight.botResponses) ? insight.botResponses.map(String) : [],
        title: String(insight.title),
        summary: String(insight.summary),
        issueCategory: String(insight.issueCategory),
        sentiment: String(insight.sentiment),
        priority: String(insight.priority),
        resolved: Boolean(insight.resolved),
        createdAt: new Date(insight.createdAt).toISOString(),
    }))

    return <InsightsClient initialInsights={records} />
}