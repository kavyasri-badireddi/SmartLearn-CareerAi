import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
);

export async function GET() {
    try {
        const url = client.generateAuthUrl({
            access_type: "offline",
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
            ],
            prompt: "select_account",
        });
        return NextResponse.redirect(url);
    } catch (error) {
        console.error("Google Auth URL generation failed:", error);
        return NextResponse.json({ error: "Failed to initialize Google Auth" }, { status: 500 });
    }
}
