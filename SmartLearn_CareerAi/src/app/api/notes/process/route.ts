import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const maxDuration = 360; // 6 minutes for large document processing
import { generateStudyKit, isStudyMaterial } from "@/lib/ai";
import { isResume } from "@/lib/resume-analyzer";
import { prisma } from "@/lib/prisma";
import { extractTextFromBuffer } from "@/lib/extractor";
// Force rebuild: 2026-02-16T12:15:00

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const title = (formData.get("title") as string) || "Untitled Note";
        const userId = formData.get("userId") as string;

        if (!file || !userId) {
            return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
        }

        // --- SIZE-01 & SIZE-02 Implementation ---
        const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
        const MIN_FILE_SIZE = 1 * 1024;         // 1KB

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                error: `File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum allowed size is 30MB. Please use a smaller document.`
            }, { status: 413 });
        }

        if (file.size < MIN_FILE_SIZE) {
            return NextResponse.json({
                error: `File is too small (${(file.size / 1024).toFixed(2)}KB). Minimum allowed size is 1KB for intelligence analysis.`
            }, { status: 400 });
        }

        // Extract text from file
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Pass the file's type to the extractor
        const content = await extractTextFromBuffer(buffer, file.type);

        // --- STUDY-01 VALIDATION ---
        const studyValid = isStudyMaterial(content);

        // --- RESUME BLOCKER ---
        const resumeCheck = isResume(content);
        if (resumeCheck.valid) {
            return NextResponse.json({
                error: "This document is not a study Material"
            }, { status: 400 });
        }

        if (!studyValid.valid) {
            return NextResponse.json({ error: studyValid.reason }, { status: 400 });
        }

        if (!content || content.length < 20) {
            return NextResponse.json({ error: "Insufficient text content extracted. Neural network requires more data." }, { status: 400 });
        }

        // Generate AI content (Summary, Quiz, Flashcards)
        // Passing req.signal effectively stops processing if user hits "Close" or "Stop"
        const studyKit = await generateStudyKit(content, req.signal);

        // Final safety check before DB write
        if (req.signal.aborted) throw new Error("AbortError");

        // Save to database
        const note = await prisma.note.create({
            data: {
                title,
                content: content.substring(0, 10000), // Store more if needed
                summary: studyKit.summary,
                userId,
                quizzes: {
                    create: {
                        questions: studyKit.quiz,
                    },
                },
                flashcards: {
                    createMany: {
                        data: studyKit.flashcards,
                    },
                },
            },
            include: {
                quizzes: true,
                flashcards: true,
            }
        });

        return NextResponse.json(note);
    } catch (error: any) {
        if (error.message === "AbortError" || error.name === "AbortError") {
            console.log("[API] Note processing aborted by user");
            return new Response(null, { status: 499 }); // Client Closed Request
        }
        console.error("Note processing error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
