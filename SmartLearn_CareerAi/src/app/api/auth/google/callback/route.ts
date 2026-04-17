import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
);

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "quantum-secret-key-123";

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_authorization_code`);
    }

    try {
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        // Verify ID Token to get user info
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token!,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new Error("No payload or email received from Google");
        }

        // Find or create the user in the database
        let user = await prisma.user.findUnique({
            where: { email: payload.email },
        });

        if (!user) {
            // Create a new user if they don't exist
            // Since 'password' is required in our schema, we set a placeholder
            user = await prisma.user.create({
                data: {
                    email: payload.email,
                    name: payload.name || payload.email.split("@")[0],
                    password: "SOCIAL_AUTH_PROVIDER_" + Math.random().toString(36).substring(7),
                    emailVerified: new Date(),
                },
            });
        }

        // Generate our application JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                authType: "google"
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Prepare profile info to pass to the frontend
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
        };

        // Redirect to a specialized callback page on the frontend to handle token storage
        const redirectUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`);
        redirectUrl.searchParams.set("token", token);
        redirectUrl.searchParams.set("user", JSON.stringify(userData));

        return NextResponse.redirect(redirectUrl.toString());
    } catch (error: any) {
        console.error("Google Auth Callback error:", error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=auth_failed`);
    }
}
