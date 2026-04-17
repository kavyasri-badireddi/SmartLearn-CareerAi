import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import axios from "axios";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "quantum-secret-key-123";

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_github_code`);
    }

    try {
        // 1. Exchange the code for an access token
        const tokenResponse = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: code,
            },
            {
                headers: { Accept: "application/json" },
            }
        );

        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            throw new Error("Failed to obtain GitHub access token");
        }

        // 2. Fetch user profile
        const userResponse = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        // 3. GitHub users might have hidden emails, so we fetch emails specifically
        const emailsResponse = await axios.get("https://api.github.com/user/emails", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const primaryEmail = emailsResponse.data.find((e: any) => e.primary && e.verified)?.email
            || emailsResponse.data[0]?.email;

        if (!primaryEmail) {
            throw new Error("No verified email found for GitHub user");
        }

        // 4. Find or Create user in our DB
        let user = await prisma.user.findUnique({
            where: { email: primaryEmail },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: primaryEmail,
                    name: userResponse.data.name || userResponse.data.login || primaryEmail.split("@")[0],
                    password: "GITHUB_PROVIDER_" + Math.random().toString(36).substring(7),
                    emailVerified: new Date(),
                },
            });
        }

        // 5. Generate our app JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                authType: "github"
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
        };

        // 6. Redirect to frontend callback handler
        const redirectUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`);
        redirectUrl.searchParams.set("token", token);
        redirectUrl.searchParams.set("user", JSON.stringify(userData));

        return NextResponse.redirect(redirectUrl.toString());

    } catch (error: any) {
        console.error("GitHub Auth Error:", error.message);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=github_auth_failed`);
    }
}
