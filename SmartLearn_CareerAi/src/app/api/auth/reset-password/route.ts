import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPasswordQuantum } from "@/lib/quantum-crypto";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
        }

        // Find the token
        const resetToken = await (prisma as any).passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken || resetToken.expires < new Date()) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await hashPasswordQuantum(password);

        // Update user password
        await prisma.user.update({
            where: { email: resetToken.email },
            data: { password: hashedPassword },
        });

        // Delete the token
        await (prisma as any).passwordResetToken.delete({
            where: { token },
        });

        return NextResponse.json({ message: "Password reset successful." });
    } catch (error: any) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
