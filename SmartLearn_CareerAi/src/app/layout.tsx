import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

export const metadata: Metadata = {
    title: "SmartLearn AI | Academic Assistant & Research Guide",
    description: "Accelerate your learning and bridge the gap between education and research with AI-powered notes, quizzes, and summaries.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${outfit.variable} font-outfit antialiased`}>
                {children}
            </body>
        </html>
    );
}
