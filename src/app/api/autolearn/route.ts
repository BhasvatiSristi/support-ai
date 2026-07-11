import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const MAX_SOURCE_CHARS = 20000;

const normalizeWebsiteUrl = (value: string) => {
    const parsedUrl = new URL(value);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error("Website URL must use http or https");
    }

    return parsedUrl.toString();
};

const extractReadableText = (html: string) => {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
        .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/\s+/g, " ")
        .trim();
};

export async function POST(req: NextRequest) {
    try {
        const { websiteUrl } = await req.json();

        if (typeof websiteUrl !== "string" || !websiteUrl.trim()) {
            return NextResponse.json(
                { success: false, message: "websiteUrl is required" },
                { status: 400 }
            );
        }

        const normalizedUrl = normalizeWebsiteUrl(websiteUrl.trim());
        const response = await fetch(normalizedUrl, {
            headers: {
                "User-Agent": "SupportAI Auto Learn Bot",
                Accept: "text/html,application/xhtml+xml",
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: "Unable to learn website." },
                { status: 400 }
            );
        }

        const html = await response.text();
        const readableText = extractReadableText(html).slice(0, MAX_SOURCE_CHARS);

        if (!readableText) {
            return NextResponse.json(
                { success: false, message: "Unable to learn website." },
                { status: 400 }
            );
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const prompt = `
You are building a customer support knowledge base from website content.
Use only the website information below.
Create a concise but useful knowledge base in plain text that includes:
- business overview
- products or services
- FAQs or support policies if visible
- contact or support details if visible
- important operational details like shipping, refunds, pricing, or hours if visible

Do not invent details that are not present.
Write the output in a format that is easy to paste into a support knowledge base.

WEBSITE URL:
${normalizedUrl}

WEBSITE CONTENT:
${readableText}
`;

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const knowledge = result.text?.trim() || readableText;

        return NextResponse.json({
            success: true,
            knowledge,
        });
    } catch (err) {
        console.error("AUTOLEARN ERROR:", err);

        return NextResponse.json(
            { success: false, message: "Unable to learn website." },
            { status: 500 }
        );
    }
}