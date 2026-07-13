import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try{
        const { message, ownerId } = await req.json()
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

        const KNOWLEDGE = `
        business name - ${setting.businessName || "not provided" }
        support email - ${setting.supportEmail || "not provided" }
        knowledge - ${setting.knowledge || "not provided" }
        `

        const prompt = `
            You are an intelligent multilingual customer support assistant.

            Your job is to answer customer questions using ONLY the BUSINESS INFORMATION provided below.

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

            4. Never change the meaning of the business information.

            5. You may summarize or rephrase the information naturally.

            6. DO NOT invent policies, prices, discounts, shipping rules or promises.

            7. If the answer cannot be found from the business information, politely reply in the SAME language as the customer saying:

            "Sorry, I couldn't find that information. Please contact support at ${setting.supportEmail}."

            8. Keep responses concise, professional and friendly.

            ------------------------
            BUSINESS INFORMATION
            ------------------------

            Business Name:
            ${setting.businessName}

            Support Email:
            ${setting.supportEmail}

            Knowledge:
            ${setting.knowledge}

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