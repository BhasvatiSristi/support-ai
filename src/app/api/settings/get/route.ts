import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { NextRequest,NextResponse } from "next/server";



export async function POST(req:NextRequest){
    try{
        console.log("GET SETTINGS HIT");

        const {ownerId} = await req.json();
        console.log("ownerId:", ownerId);

        if(!ownerId){
            return NextResponse.json(
                {message:'ownerId is required'},
                {status:400}
            )
        }

        await connectDb();
        console.log("DB connected");

        const setting = await Settings.findOne({ownerId});

        console.log("Setting found:", setting);

        return NextResponse.json(setting);

    }catch(err){
        console.error("GET SETTINGS ERROR:", err);

        return NextResponse.json(
            {message:`Settings error ${err}`},
            {status:500}
        )
    }
}