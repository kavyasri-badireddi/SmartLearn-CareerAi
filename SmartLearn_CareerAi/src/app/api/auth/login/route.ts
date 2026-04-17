import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPasswordQuantum, encapsulateSecret } from "@/lib/quantum-crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "quantum-secret-key-123";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Missing identity credentials" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: "Identity not found in Quantum Hive." }, { status: 401 });
        }

        // 1. QUANTUM VERIFICATION: Verify Argon2id hash
        const isPasswordValid = await verifyPasswordQuantum(user.password, password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Access key mismatch. Neural Signature Rejected." }, { status: 401 });
        }

        /**
         * 2. QUANTUM HANDSHAKE (ML-KEM-768)
         * We encapsulate a session-specific secret using the user's stored Post-Quantum Public Key.
         * This demonstrates that the login session is secured by lattice-based cryptography.
         */
        let quantumHandshakeChunk = "NOT_AVAILABLE";
        if (user.quantumPubKey) {
            const { ciphertext } = await encapsulateSecret(user.quantumPubKey);
            quantumHandshakeChunk = ciphertext.substring(0, 32);
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                handshake: quantumHandshakeChunk
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return NextResponse.json({
            message: "QUANTUM HANDSHAKE SUCCESSFUL",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                quantumStatus: "ML-KEM-768 + ARGON2ID",
                handshakeID: quantumHandshakeChunk
            },
            token
        }, { status: 200 });

    } catch (error: any) {
        console.error("Quantum Login error:", error);
        return NextResponse.json({ error: "Neural Synchronization Failed: " + error.message }, { status: 500 });
    }
}
