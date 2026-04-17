import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPasswordQuantum, hashPasswordQuantum } from "@/lib/quantum-crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "quantum-secret-key-123";

/**
 * Handles password changes for authenticated users.
 */
export async function POST(req: NextRequest) {
    try {
        const { currentPassword, newPassword, userId } = await req.json();

        // Basic validation
        if (!currentPassword || !newPassword || !userId) {
            return NextResponse.json({ error: "Missing required security credentials." }, { status: 400 });
        }

        // 1. Verify Authentication (optional but good if token is present)
        const authHeader = req.headers.get("authorization");
        if (authHeader) {
            const token = authHeader.split(" ")[1];
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as any;
                if (decoded.userId !== userId) {
                    return NextResponse.json({ error: "Unauthorized identity mismatch." }, { status: 403 });
                }
            } catch (err) {
                return NextResponse.json({ error: "Invalid session signature." }, { status: 401 });
            }
        }

        // 2. Fetch User
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: "Identity not found." }, { status: 404 });
        }

        // 3. Verify Current Password
        const isPasswordValid = await verifyPasswordQuantum(user.password, currentPassword);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Current password verification failed." }, { status: 401 });
        }

        // 4. Hash New Password
        const hashedNewPassword = await hashPasswordQuantum(newPassword);

        // 5. Update User Record
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });

        return NextResponse.json({
            message: "PASSWORD SUCCESSFULLY RECONFIGURED",
            success: true
        }, { status: 200 });

    } catch (error: any) {
        console.error("Change Password Error:", error);
        return NextResponse.json({ error: "Security protocol failure: " + error.message }, { status: 500 });
    }
}
