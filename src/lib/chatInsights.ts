import { GoogleGenAI } from "@google/genai"
import { randomUUID } from "crypto"

import connectDb from "@/lib/db"
import ChatInsight from "@/model/chatInsight.model"

const allowedCategories = [
    "Order",
    "Shipping",
    "Refund",
    "Payment",
    "Warranty",
    "Technical",
    "Account",
    "General Inquiry",
    "Other",
] as const

const allowedSentiments = ["Positive", "Neutral", "Negative"] as const
const allowedPriorities = ["Low", "Medium", "High"] as const

export type ChatInsightPayload = {
    ownerId: string
    conversationId?: string
    customerMessages?: string[]
    botResponses?: string[]
    conversationHistory?: Array<
        | {
              role?: string
              content?: string
              message?: string
              text?: string
          }
        | string
    >
    latestCustomerMessage?: string
    latestBotResponse?: string
}

type ParsedInsight = {
    title: string
    summary: string
    issueCategory: string
    sentiment: string
    priority: string
    resolved: boolean
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

function extractText(value: unknown) {
    if (typeof value === "string") {
        return value.trim()
    }

    return ""
}

function normalizeTextList(values?: string[]) {
    return (values || []).map((value) => value.trim()).filter(Boolean)
}

function buildConversationMessages(payload: ChatInsightPayload) {
    const historyMessages = Array.isArray(payload.conversationHistory)
        ? payload.conversationHistory
              .map((entry) => {
                  if (typeof entry === "string") {
                      return entry.trim()
                  }

                  const role = (entry.role || "").toLowerCase()
                  const content = extractText(entry.content || entry.message || entry.text)

                  if (!content) {
                      return ""
                  }

                  if (role.includes("bot") || role.includes("assistant")) {
                      return `Bot: ${content}`
                  }

                  if (role.includes("customer") || role.includes("user")) {
                      return `Customer: ${content}`
                  }

                  return content
              })
              .filter(Boolean)
        : []

    if (historyMessages.length > 0) {
        return historyMessages
    }

    const customerMessages = normalizeTextList(payload.customerMessages)
    const botResponses = normalizeTextList(payload.botResponses)

    if (customerMessages.length > 0 || botResponses.length > 0) {
        const transcript: string[] = []
        const maxLength = Math.max(customerMessages.length, botResponses.length)

        for (let index = 0; index < maxLength; index += 1) {
            const customerMessage = customerMessages[index]
            const botResponse = botResponses[index]

            if (customerMessage) {
                transcript.push(`Customer: ${customerMessage}`)
            }

            if (botResponse) {
                transcript.push(`Bot: ${botResponse}`)
            }
        }

        return transcript
    }

    const fallbackMessages: string[] = []

    if (payload.latestCustomerMessage) {
        fallbackMessages.push(`Customer: ${payload.latestCustomerMessage.trim()}`)
    }

    if (payload.latestBotResponse) {
        fallbackMessages.push(`Bot: ${payload.latestBotResponse.trim()}`)
    }

    return fallbackMessages
}

function extractConversationPairs(payload: ChatInsightPayload) {
    const customerMessages: string[] = []
    const botResponses: string[] = []

    if (Array.isArray(payload.conversationHistory)) {
        for (const entry of payload.conversationHistory) {
            if (typeof entry === "string") {
                continue
            }

            const role = (entry.role || "").toLowerCase()
            const content = extractText(entry.content || entry.message || entry.text)

            if (!content) {
                continue
            }

            if (role.includes("bot") || role.includes("assistant")) {
                botResponses.push(content)
            }

            if (role.includes("customer") || role.includes("user")) {
                customerMessages.push(content)
            }
        }
    }

    return {
        customerMessages,
        botResponses,
    }
}

function extractJsonBlock(text: string) {
    const trimmed = text.trim()

    if (trimmed.startsWith("```")) {
        return trimmed.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim()
    }

    const firstBrace = trimmed.indexOf("{")
    const lastBrace = trimmed.lastIndexOf("}")

    if (firstBrace >= 0 && lastBrace > firstBrace) {
        return trimmed.slice(firstBrace, lastBrace + 1)
    }

    return trimmed
}

function parseInsightResponse(text: string): ParsedInsight | null {
    try {
        const parsed = JSON.parse(extractJsonBlock(text)) as Partial<ParsedInsight>

        const title = extractText(parsed.title) || "Customer Support Insight"
        const summary = extractText(parsed.summary)
        const issueCategory = allowedCategories.includes(parsed.issueCategory as (typeof allowedCategories)[number])
            ? String(parsed.issueCategory)
            : "Other"
        const sentiment = allowedSentiments.includes(parsed.sentiment as (typeof allowedSentiments)[number])
            ? String(parsed.sentiment)
            : "Neutral"
        const priority = allowedPriorities.includes(parsed.priority as (typeof allowedPriorities)[number])
            ? String(parsed.priority)
            : "Medium"
        const resolved = typeof parsed.resolved === "boolean" ? parsed.resolved : false

        if (!summary) {
            return null
        }

        return {
            title,
            summary,
            issueCategory,
            sentiment,
            priority,
            resolved,
        }
    } catch (error) {
        console.error("Failed to parse AI insight JSON:", error)
        return null
    }
}

export async function generateAndSaveChatInsight(payload: ChatInsightPayload) {
    if (!process.env.GEMINI_API_KEY) {
        return null
    }

    const ownerId = payload.ownerId?.trim()
    if (!ownerId) {
        return null
    }

    const conversationMessages = buildConversationMessages(payload)
    if (conversationMessages.length === 0) {
        return null
    }

    try {
        const prompt = `
You are an AI customer support analyst.

Analyze the following conversation.

Return ONLY valid JSON.

Generate:

- title (short issue title)
- summary (2-4 sentences)
- issueCategory
- sentiment
- priority
- resolved

Rules:

Issue Category must be one of:

Order
Shipping
Refund
Payment
Warranty
Technical
Account
General Inquiry
Other

Sentiment must be:

Positive
Neutral
Negative

Priority must be:

Low
Medium
High

resolved should be true if the chatbot successfully answered the customer's question.

Otherwise false.

Return ONLY JSON.

Conversation:
${conversationMessages.join("\n")}
        `.trim()

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        })

        const parsed = parseInsightResponse(response.text || "")
        if (!parsed) {
            return null
        }

        await connectDb()

        const conversationId = payload.conversationId?.trim() || randomUUID()
        const extractedPairs = extractConversationPairs(payload)
        const customerMessages = normalizeTextList(payload.customerMessages).length > 0
            ? normalizeTextList(payload.customerMessages)
            : extractedPairs.customerMessages
        const botResponses = normalizeTextList(payload.botResponses).length > 0
            ? normalizeTextList(payload.botResponses)
            : extractedPairs.botResponses

        const insightDocument = {
            ownerId,
            conversationId,
            customerMessages,
            botResponses,
            ...parsed,
        }

        if (payload.conversationId?.trim()) {
            return await ChatInsight.findOneAndUpdate(
                { ownerId, conversationId },
                insightDocument,
                { new: true, upsert: true }
            )
        }

        return await ChatInsight.create(insightDocument)
    } catch (error) {
        console.error("AI insight generation failed:", error)
        return null
    }
}