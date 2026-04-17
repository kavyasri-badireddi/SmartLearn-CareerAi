import { NextResponse } from "next/server";

export async function GET() {
    const rootUrl = "https://github.com/login/oauth/authorize";
    const options = {
        client_id: process.env.GITHUB_CLIENT_ID as string,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`,
        scope: "user:email", // We need this to identify the user
        state: "github_auth_state", // Security best practice
    };

    const qs = new URLSearchParams(options);
    return NextResponse.redirect(`${rootUrl}?${qs.toString()}`);
}
