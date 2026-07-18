import connectDb from "@/lib/db";
import { generateAndSaveChatInsight } from "@/lib/chatInsights";
import { buildPdfContextBlock } from "@/lib/pdf";
import Settings from "@/model/settings.model";
import PDFKnowledge from "@/model/pdfKnowledge.model";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try{
        const { message, ownerId, conversationId, customerMessages, botResponses, conversationHistory } = await req.json()
        if(!message || !ownerId){
            return NextResponse.json(
                {message:"Message and OwnerId are required"},
                {status:400}
            )
        }

        await connectDb()

        const setting = await Settings.findOne({ownerId})
        if(!setting){
            return NextResponse.json(
                {message:"Chatbot is not configured yet"},
                {status:400}
            )
        }

        const pdfDocuments = await PDFKnowledge.find({ ownerId }).sort({ uploadTime: -1 }).lean()
        const pdfContext = buildPdfContextBlock(
            pdfDocuments.map((document) => ({
                filename: document.filename,
                path: document.path,
                extractedText: document.extractedText,
                chunks: document.chunks,
                numPages: document.numPages,
            })),
            message,
            8
        )

        const websiteKnowledge = setting.websiteKnowledge?.trim() || "No website knowledge has been stored yet."
        const manualKnowledge = setting.knowledge?.trim() || "No manual knowledge has been stored yet."
        const combinedPdfContext = pdfContext || "No PDFs have been uploaded yet."

        const prompt = `
            You are an intelligent multilingual customer support assistant.

            Your job is to answer customer questions using the BUSINESS INFORMATION and PDF SOURCES provided below.

            Rules:

            1. Detect the language of the customer's latest message automatically.

            2. ALWAYS reply in the SAME language as the customer's latest message.

            Examples:
            - English -> English
            - Hindi -> Hindi
            - Telugu -> Telugu
            - Tamil -> Tamil
            - Spanish -> Spanish
            - French -> French
            - German -> German

            3. Never mention that you translated the response.

            4. Never change the meaning of the source information.

            5. You may summarize or rephrase the information naturally.

            6. DO NOT invent policies, prices, discounts, shipping rules or promises.

            7. Use all available sources: Manual Knowledge Base, Website Learning, and PDF Knowledge Base.

            8. If the answer cannot be found from the sources, politely reply in the SAME language as the customer saying:

            "Sorry, I couldn't find that information. Please contact support at ${setting.supportEmail}."

            9. Keep responses concise, professional and friendly.

            ------------------------
            BUSINESS INFORMATION
            ------------------------

            Business Name:
            ${setting.businessName}

            Support Email:
            ${setting.supportEmail}

            Website URL:
            ${setting.websiteUrl || "Not configured"}

            Manual Knowledge:
            ${manualKnowledge}

            Website Learning:
            ${websiteKnowledge}

            PDF Knowledge Base:
            ${combinedPdfContext}

            ------------------------
            CUSTOMER QUESTION
            ------------------------

            ${message}

            ------------------------
            ANSWER
            ------------------------
            `;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    console.log(res.text);

    await generateAndSaveChatInsight({
        ownerId,
        conversationId,
        customerMessages: Array.isArray(customerMessages) ? customerMessages : [message],
        botResponses: Array.isArray(botResponses) ? botResponses : [res.text || ""],
        conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : undefined,
        latestCustomerMessage: message,
        latestBotResponse: res.text || "",
    })

    const response =  NextResponse.json(res.text)
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return response


    
    } catch(err){
        const response =  NextResponse.json(
                {message:`chat error ${err}`},
                {status:500}
            )
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");
            return response
    }
}

export const OPTIONS = async () => {
    return NextResponse.json(null,{
        status:201,
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    })
}