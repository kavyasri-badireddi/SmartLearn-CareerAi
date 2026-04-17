import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPasswordQuantum, generateQuantumKeyPair } from "@/lib/quantum-crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "quantum-secret-key-123";

/**
 * Creates a new professional account and initiates automatic session authorization.
 */
export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "This email is already registered in our system." }, { status: 400 });
        }

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 600000); // 10 minutes

        try {
            await (prisma as any).otp.upsert({
                where: { email },
                update: { code: otpCode, expires },
                create: { email, code: otpCode, expires },
            });

            const { sendOtpEmail } = await import("@/lib/mail");
            await sendOtpEmail(email, otpCode);
        } catch (otpError) {
            console.error("OTP generation error:", otpError);
            return NextResponse.json({ error: "Failed to initiate verification protocol." }, { status: 500 });
        }

        return NextResponse.json({
            otpRequired: true,
            message: "Verification code sent. Please check your email."
        }, { status: 200 });

    } catch (error: any) {
        console.error("Critical Registration Error:", error);
        return NextResponse.json({ error: "Internal System Error during initialization: " + error.message }, { status: 500 });
    }
}