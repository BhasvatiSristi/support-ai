import { cookies } from "next/headers";
import { scalekit } from "./scalekit";

export async function getSession() {
    const session = await cookies();
    const token = session.get("access_token")?.value;

    console.log("TOKEN EXISTS:", !!token);

    if (!token) {
        return null;
    }

    const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
    );

    console.log("TOKEN PAYLOAD:", payload);

    console.log("NOW:", Math.floor(Date.now() / 1000));
    console.log("NBF:", payload.nbf);
    console.log("IAT:", payload.iat);
    console.log("EXP:", payload.exp);
    console.log(
        "Difference:",
        payload.nbf - Math.floor(Date.now() / 1000)
    );

    try {
        // TEMPORARY TEST
        await new Promise(resolve => setTimeout(resolve, 3000));

        const result: any = await scalekit.validateToken(token);

        const user = await scalekit.user.getUser(result.sub);

        return user;
    } catch (error) {
        console.error("VALIDATE TOKEN ERROR:", error);
        return null; // don't throw for now
    }
}