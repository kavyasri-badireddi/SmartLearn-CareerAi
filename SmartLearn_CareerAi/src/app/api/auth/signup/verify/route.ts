import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPasswordQuantum, generateQuantumKeyPair } from "@/lib/quantum-crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "quantum-secret-key-123";

/**
 * Verifies the OTP and finalizes account creation.
 */
export async function POST(req: NextRequest) {
    try {
        const { name, email, password, otp } = await req.json();

        if (!name || !email || !password || !otp) {
            return NextResponse.json({ error: "Missing required verification data." }, { status: 400 });
        }

        // 1. VERIFY OTP
        const otpRecord = await (prisma as any).otp.findUnique({
            where: { email },
        });

        if (!otpRecord || otpRecord.code !== otp || otpRecord.expires < new Date()) {
            return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 401 });
        }

        // 2. CHECK IF USER ALREADY EXISTS
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Identity already registered." }, { status: 400 });
        }

        // 3. CREATE ACCOUNT
        const hashedPassword = await hashPasswordQuantum(password);
        const keys = await generateQuantumKeyPair();

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                quantumPubKey: keys.publicKey,
                emailVerified: new Date()
            }
        });

        // 4. CLEANUP OTP
        try {
            await (prisma as any).otp.delete({ where: { email } });
        } catch (e) { }

        // 5. GENERATE SESSION
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                authorized: true
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return NextResponse.json({
            message: "IDENTITY VERIFIED & ACCOUNT CREATED",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token
        }, { status: 201 });

    } catch (error: any) {
        console.error("Verification finalized error:", error);
        return NextResponse.json({ error: "Failed to finalize account: " + error.message }, { status: 500 });
    }
}
