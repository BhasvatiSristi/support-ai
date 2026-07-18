import { cookies } from "next/headers";
import { scalekit } from "./scalekit";

export async function getSession() {
    const session = await cookies();
    const token = session.get("access_token")?.value;

    if (!token) {
        return null;
    }

    const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
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