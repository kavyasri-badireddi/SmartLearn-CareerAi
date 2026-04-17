import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { extractTextFromBuffer } from "@/lib/extractor";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Missing file" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const text = await extractTextFromBuffer(buffer, file.type);

        return NextResponse.json({ text });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
