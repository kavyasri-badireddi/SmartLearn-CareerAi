/**
 * Fast Document Text Extractor V4.0
 * 
 * Uses pdf-parse for PDF extraction — much faster than manual pdfjs-dist
 * because it skips worker setup and handles text assembly internally.
 * 
 * Typical speed: < 1 second for most PDFs (vs 5-15s with pdfjs-dist)
 */
export async function extractTextFromBuffer(buffer: Buffer, mimeType?: string): Promise<string> {
    try {
        const startTime = Date.now();
        console.log(`[Extractor] Processing document: ${mimeType}`);

        let text: string;

        if (mimeType === 'application/pdf') {
            // Fix: Import the internal parser directly to bypass pdf-parse's broken debug code
            // and modern pdfjs-dist worker issues.
            // @ts-ignore
            const pdf = (await import('pdf-parse/lib/pdf-parse.js')).default;
            const result = await pdf(buffer);
            text = result.text;
            console.log(`[Extractor] PDF processed successfully via stable internal parser`);
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword'
        ) {
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else {
            // --- TYPE-02 & TYPE-03 Implementation ---
            // If the file is renamed or unsupported, check if it's likely binary data
            // before trying to convert it to a string.
            const binaryCheck = buffer.slice(0, 1024);
            let nullBytes = 0;
            for (let i = 0; i < binaryCheck.length; i++) {
                if (binaryCheck[i] === 0) nullBytes++;
            }
            if (nullBytes > 10) { // Binary threshold
                throw new Error("Uploaded file appears to be a binary image/video/executable, not a document.");
            }

            // Plain text / other
            text = buffer.toString('utf-8');
        }

        // Clean up
        const sanitized = text
            .replace(/\0/g, '')              // null bytes
            .replace(/\r\n/g, '\n')          // line endings
            .replace(/\n{4,}/g, '\n\n\n')    // excessive blanks
            .replace(/\t/g, '  ')            // tabs
            .trim();

        // Extra check for binary content (non-printable chars ratio)
        const nonPrintableCount = (sanitized.match(/[^\x20-\x7E\s]/g) || []).length;
        if (nonPrintableCount / (sanitized.length || 1) > 0.3) {
            throw new Error("Document content appears to be encrypted or binary junk.");
        }

        if (sanitized.length < 20) {
            throw new Error("Document returned insufficient text content.");
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[Extractor] Extracted ${sanitized.length} chars in ${elapsed}s`);
        return sanitized;

    } catch (error: any) {
        console.error("EXTRACTOR ERROR:", error);

        let msg = error.message || "Internal processing error";
        
        // --- UX IMPROVEMENTS FOR PDF ERRORS ---
        if (msg.includes('bad XRef')) {
            msg = "The PDF file is corrupted or was saved incorrectly (Bad XRef). Try opening the file in your browser and using 'Print to PDF' to create a clean copy, then upload that.";
        } else if (msg.includes('Password')) {
            msg = "This PDF is password-protected and cannot be read. Please remove the password and try again.";
        } else if (msg.includes('Invalid PDF structure')) {
            msg = "The document has an invalid structure. Please try a different PDF or convert it to a Word document first.";
        }

        throw new Error(`Extraction Failed: ${msg}`);
    }
}
