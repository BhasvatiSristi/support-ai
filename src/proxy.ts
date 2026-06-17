import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/getSession";

export async function proxy(req: NextRequest) {
    const session = await getSession();

    if (!session) {
        console.log("No session found");
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}`
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher : '/dashboard/:path*'
}