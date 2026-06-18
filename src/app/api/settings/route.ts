import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    console.log("here in /api/settings")
    try{
        const {ownerId, businessName, supportEmail, knowledge} = await req.json()
        if(!ownerId){
            return NextResponse.json(
                {message:'ownerId is required'},
                {status:400}
            )
        }
        console.log("MONGODB_URL:", process.env.MONGODB_URL);
        await connectDb();
        console.log("Connected to MongoDB");

        console.log("running findoneandupdate")
        const settings = await Settings.findOneAndUpdate(
            {ownerId},
            {ownerId, businessName, supportEmail, knowledge},
            {new:true,upsert:true}

        )
        console.log("completed")
        return NextResponse.json(settings)
    } catch(err){
        console.error("SETTINGS API ERROR:", err);

        return NextResponse.json(
            {
                message: "Settings error",
                error: String(err)
            },
            {status:500}
        )
    }
}