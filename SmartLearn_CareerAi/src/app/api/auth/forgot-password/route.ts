import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendResetPasswordEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // For security, don't confirm if user exists
        if (!user) {
            return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 3600000); // 1 hour

        // Clear any existing tokens for this email to prevent clutter
        try {
            await (prisma as any).passwordResetToken.deleteMany({
                where: { email }
            });
        } catch (e) {
            console.log("No previous tokens to clear or model missing");
        }

        // Save fresh token
        await (prisma as any).passwordResetToken.create({
            data: { email, token, expires },
        });

        // Send email
        try {
            await sendResetPasswordEmail(email, token);
        } catch (mailError) {
            console.error("Failed to send email. Reset link for testing:", `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`);
            // Still return success so the user can test the UI if they check their console
            return NextResponse.json({
                message: "If an account exists, a reset link has been sent. (Check server console if SMTP is not configured)",
                devLink: process.env.NODE_ENV === "development" ? `/reset-password?token=${token}` : undefined
            });
        }

        return NextResponse.json({ message: "Reset link sent successfully." });
    } catch (error: any) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
