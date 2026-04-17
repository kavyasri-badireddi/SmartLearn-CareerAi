import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const notes = await prisma.note.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                quizzes: true,
                flashcards: true
            }
        });

        return NextResponse.json(notes);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
