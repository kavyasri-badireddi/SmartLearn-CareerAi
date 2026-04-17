import nodemailer from "nodemailer";

export async function sendResetPasswordEmail(email: string, token: string) {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: `"SmartLearn AI" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: "Reset your password",
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                <h2 style="color: #4f46e5;">Reset your Password</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password for your SmartLearn AI account.</p>
                <p>Click the button below to set a new password:</p>
                <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">Reset Password</a>
                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">If you didn't request this, you can safely ignore this email.</p>
                <p>The link will expire in 1 hour.</p>
            </div>
        `,
    });
}

export async function sendOtpEmail(email: string, otp: string) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: `"SmartLearn AI" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: "Verification Code",
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #4f46e5; text-align: center;">Identity Verification</h2>
                <p>Hello,</p>
                <p>Thank you for choosing SmartLearn AI. Use the following code to verify your email address and complete your setup. This code will expire in 10 minutes.</p>
                <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #6b7280;">If you didn't request this, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 SmartLearn AI Security</p>
            </div>
        `,
    });
}
