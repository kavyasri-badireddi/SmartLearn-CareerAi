//src/app/api/career/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { analyzeResumeVsJD, isResume, isJobDescription } from '@/lib/resume-analyzer';
import { extractTextFromBuffer } from '@/lib/extractor';

export const maxDuration = 360; // 6 minutes for semantic analysis

export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        let resumeText = '';
        let jobDescription = '';
        let userId = '';

        const contentType = req.headers.get('content-type') || '';

        // ── Multipart (file upload) ──────────────────────────────
        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();

            userId = (formData.get('userId') as string) || '';
            jobDescription = (formData.get('jobDescription') as string) || '';
            const file = formData.get('resumeFile') as File | null;

            if (file) {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                resumeText = await extractTextFromBuffer(buffer, file.type);
            } else {
                resumeText = (formData.get('resumeText') as string) || '';
            }
        }
        // ── JSON ─────────────────────────────────────────────────
        else {
            const body = await req.json();
            resumeText = body.resumeText || '';
            jobDescription = body.jobDescription || '';
            userId = body.userId || '';
        }

        // ── Validation ───────────────────────────────────────────
        if (!resumeText || resumeText.trim().length < 50) {
            return NextResponse.json(
                { error: 'Resume text is missing or too short. Please provide a valid resume.' },
                { status: 400 },
            );
        }

        const resumeValid = isResume(resumeText);
        if (!resumeValid.valid) {
            return NextResponse.json({ error: resumeValid.reason }, { status: 400 });
        }

        if (!jobDescription || jobDescription.trim().length < 50) {
            return NextResponse.json(
                { error: 'Job description is too short. Please provide a complete job description.' },
                { status: 400 },
            );
        }

        const jdValid = isJobDescription(jobDescription);
        if (!jdValid.valid) {
            return NextResponse.json({ error: jdValid.reason }, { status: 400 });
        }

        // ── Core Analysis ────────────────────────────────────────
        console.log(`[API /career/analyze] userId=${userId}, resume=${resumeText.length} chars, JD=${jobDescription.length} chars`);
        const report = await analyzeResumeVsJD(resumeText, jobDescription);

        const elapsed = Date.now() - startTime;
        console.log(`[API /career/analyze] Done in ${elapsed}ms — Score: ${report.overall_match_score}`);

        return NextResponse.json(report);

    } catch (error: any) {
        console.error('[API /career/analyze] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Analysis failed. Please try again.' },
            { status: 500 },
        );
    }
}
