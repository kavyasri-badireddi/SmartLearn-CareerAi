import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(
    req: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;

        // Manually delete associated clusters to handle foreign key constraints safely
        await prisma.quiz.deleteMany({ where: { noteId: id } });
        await prisma.flashcard.deleteMany({ where: { noteId: id } });

        await prisma.note.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Note deleted successfully" });
    } catch (error: any) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;
        const { title, summary } = await req.json();

        const updatedNote = await prisma.note.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(summary && { summary })
            }
        });

        return NextResponse.json(updatedNote);
    } catch (error: any) {
        console.error("Update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
