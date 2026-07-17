import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { NextRequest,NextResponse } from "next/server";



export async function POST(req:NextRequest){
    try{

        const {ownerId} = await req.json();

        if(!ownerId){
            return NextResponse.json(
                {message:'ownerId is required'},
                {status:400}
            )
        }

        await connectDb();
        console.log("DB connected");

        const setting = await Settings.findOne({ownerId});

        return NextResponse.json(setting);

    }catch(err){
        console.error("GET SETTINGS ERROR:", err);

        return NextResponse.json(
            {message:`Settings error ${err}`},
            {status:500}
        )
    }
}