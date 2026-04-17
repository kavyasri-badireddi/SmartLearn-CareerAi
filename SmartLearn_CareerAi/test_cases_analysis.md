# Comprehensive Test Cases for Document Processing and AI Generation

This document outlines the test cases for the application's document processing and AI generation features. It focuses on the handling of large files, invalid file types, and the generation of flashcards and study kits.

---

## 1. File Upload and Size Handling (Performance & Stability)

The application handles file uploads in `src/app/api/notes/process/route.ts` and extracts text in `src/lib/extractor.ts`.

| Test Case ID | Scenario | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **SIZE-01** | Large File Upload | Upload a file slightly below the server limit (e.g., 29MB). | File uploads successfully, text is extracted, and AI generation proceeds. |
| **SIZE-02** | Over-limit File Upload | Upload a file exceeding the server limit (e.g., 31MB). | Server rejects the request with a `413 Payload Too Large` error and shows a white-background alert. |
| **SIZE-03** | Under-limit File Upload | Upload a file smaller than 1KB. | Server rejects the request with a `400 Bad Request` error: "File is too small". |
| **SIZE-04** | Memory Exhaustion | Upload a 30MB PDF document with many pages. | The extractor should process the document without crashing the server (memory management check). |
| **SIZE-05** | Empty File | Upload a 0-byte file. | Server returns a `400 Bad Request` with an error message: "File is empty". |

## 2. Career Intelligence (Resume vs JD Analysis)

The logic for career analysis is handled in `src/lib/resume-analyzer.ts` and the API route `src/app/api/career/analyze/route.ts`.

| Test Case ID | Scenario | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **CAREER-01** | Non-Resume Upload | Upload a textbook chapter or a food recipe as a "Resume". | Validator returns `400` error: "Document does not look like a professional Resume". |
| **CAREER-02** | Non-JD Description | Provide a simple sentence like "I love ice cream" as a Job Description. | Validator returns `400` error: "The description does not look like a valid Job Description". |
| **CAREER-03** | Short Resume/JD | Provide a Resume or JD with very few characters (e.g., under 50). | Server returns `400` error: "Resume/Job description is too short". |
| **CAREER-04** | Perfectly Matched | Upload a Resume that perfectly matches all JD requirements (e.g., copy JD skills into Resume). | Semantic score should be high (90%+), and Strong Matches should list the overlapping skills. |
| **CAREER-05** | Role Mismatch | Upload a Software Engineer Resume for a Nursing/Medical JD. | Semantic score should be low (below 30%) and Fit Category should be "Weak Fit". |
| **CAREER-06** | Complex Formatting | Resume with multiple columns and sidebars. | Text extraction should still capture enough content for the validator to pass it as a resume. |
| **CAREER-07** | Skill Gap Detection | JD requires "React" and "Node", Resume only has "React". | "Node" should correctly appear in the `Missing Skills` and `Skill Gap Analysis` sections. |
| **CAREER-08** | Multi-page Resume | Upload a 5+ page PDF resume. | The system should process the full length and identify core sections (Exp, Edu, Skills) across all pages. |

## 3. File Type and Content Validation (Security & Integrity)
... (rest of the file)

The application uses `mimeType` from the file object in `src/lib/extractor.ts`.

| Test Case ID | Scenario | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **TYPE-01** | Supported File Types | Upload valid `.pdf`, `.docx`, and `.txt` files. | AI generates high-quality summaries, quizzes, and flashcards. |
| **TYPE-02** | Unsupported File Types | Upload an image (`.png`, `.jpg`), a video, or an executable (`.exe`). | The system should handle this gracefully (currently handles as UTF-8), potentially returning an error if no text is extracted. |
| **TYPE-03** | Mismatched MIME Type | Upload a renamed file (e.g., a `.png` file renamed to `.txt`). | The extractor should attempt to process it, but most likely will return insufficient text or fail. |
| **TYPE-04** | Malicious Files | Upload a "Zip Bomb" or a malformed PDF designed to crash parsers. | The server should handle parsing errors without crashing (`try-catch` in `extractor.ts`). |
| **TYPE-05** | Files with No Text | Upload a PDF that only contains images (no OCR layer). | The system returns a `400 Bad Request` indicating insufficient text content (Line 44 in `extractor.ts`). |
| **TYPE-06** | Symbolic Link Upload | Upload a symbolic link to a sensitive system file (if the OS/environment allows). | The server should only process the uploaded byte stream, not follow local links. |

## 3. Flashcard and AI Generation (Functional & Logic)

The AI generation logic is handled in `src/lib/ai.ts` (called from the process route).

| Test Case ID | Scenario | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **AI-01** | Minimal Content | Upload a file with exactly 20 characters of text. | The system should proceed with AI generation (as per the check in `route.ts:26`). |
| **AI-02** | Very Little Content | Upload a file with 19 characters or fewer. | The system returns `400 Bad Request` with "Insufficient text content". |
| **AI-03** | Non-English Content | Upload a document in Spanish, French, or another supported language. | AI should ideally generate content in the same language (depending on the AI model configuration). |
| **AI-04** | Technical/Jargon-Heavy Content | Upload a scientific paper or technical manual. | AI should accurately extract key terms for flashcards. |
| **AI-05** | Formatting Preservation | Upload a document with heavy formatting (bullets, tables). | `mammoth` and `pdf-parse` should extract raw text effectively without losing readability. |
| **AI-06** | AI Generation Failure | Simulate a failure in the AI provider (e.g., OpenAI/Gemini API down). | The system should return a `500 Internal Server Error` with a clear message to the user. |

## 4. User Interaction and Concurrency (UX & Scalability)

| Test Case ID | Scenario | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **UX-01** | Abort Processing | User clicks "Close" or "Stop" while the AI is generating content. | The request is aborted; the server logs "Note processing aborted by user" and returns `499` (Line 63 in `route.ts`). |
| **UX-02** | Multiple Parallel Uploads | A single user uploads 5 documents simultaneously in different tabs. | The server handles each request independently without interfering with other requests. |
| **UX-03** | Missing User Identity | Send a POST request without a `userId`. | Returns `400 Bad Request` "Missing file or userId". |
| **UX-04** | Title Overwrite | Submit a file without a title. | The system defaults to "Untitled Note" (Line 12 in `route.ts`). |

---

## Technical Recommendations for Resilience

1. **File Size Limit Config**: Define a explicit file size limit in `next.config.js` or through a custom body parser configuration.
2. **Explicit MIME Validation**: Add a whitelist of allowed MIME types at the beginning of the `POST` route to block "unnecessary files" early.
3. **OCR Integration**: For PDF/Images without text, consider adding a server-side OCR step (e.g., Tesseract).
4. **AI Rate Limiting**: Ensure that the system handles AI API rate limits (e.g., retry logic or queueing).
