// src/lib/resume-analyzer.ts
import { pipeline } from '@xenova/transformers';

// ─── Singleton ───────────────────────────────────────────────
let embeddingPipeline: any = null;

async function getEmbedder() {
    if (!embeddingPipeline) {
        console.log('[ResumeAnalyzer] Loading all-MiniLM-L6-v2...');
        embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('[ResumeAnalyzer] Model ready.');
    }
    return embeddingPipeline;
}

// ─── Math ─────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
    if (!a.length || !b.length || a.length !== b.length) return 0;
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    return na === 0 || nb === 0 ? 0 : dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Calibrated mapping for Xenova/MiniLM cosine similarity.
 *
 * Raw MiniLM cosine values for tech text:
 *   Unrelated   → 0.00 – 0.15  (maps to   0 – 15)
 *   Loosely rel → 0.15 – 0.30  (maps to  15 – 40)
 *   Related     → 0.30 – 0.50  (maps to  40 – 68)
 *   Highly rel  → 0.50 – 0.70  (maps to  68 – 90)
 *   Near-ident  → 0.70 – 1.00  (maps to  90 – 100)
 *
 * Formula: clamp((sim - 0.05) / 0.65 * 100, 0, 100)
 */
function calibrate(sim: number): number {
    return Math.max(0, Math.min(100, ((sim - 0.05) / 0.65) * 100));
}

async function embed(text: string): Promise<number[]> {
    const pipe = await getEmbedder();
    const out = await pipe(text.slice(0, 512), { pooling: 'mean', normalize: true });
    return Array.from(out.data as Float32Array);
}

async function embedList(texts: string[]): Promise<number[]> {
    if (!texts.length) return [];
    const vecs = await Promise.all(texts.map(t => embed(t)));
    const dim = vecs[0].length;
    const avg = new Array(dim).fill(0);
    for (const v of vecs) for (let i = 0; i < dim; i++) avg[i] += v[i];
    for (let i = 0; i < dim; i++) avg[i] /= vecs.length;
    return avg;
}

// ─── Normalizer ───────────────────────────────────────────────

function clean(text: string): string {
    return text.replace(/\r\n/g, '\n').replace(/\0/g, '')
        .replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim();
}

// ─── EXPANDED TECH VOCABULARY ────────────────────────────────
/**
 * Each entry: [canonical term, ...aliases]
 * Aliases make the extractor catch "node" as "node.js", etc.
 */
const TECH_MAP: [string, ...string[]][] = [
    // Languages
    ['python'], ['javascript', 'js'], ['typescript', 'ts'], ['java'],
    ['c++', 'cpp'], ['c#', 'csharp'], ['go', 'golang'], ['rust'],
    ['kotlin'], ['swift'], ['ruby'], ['php'], ['scala'], ['r'],
    ['matlab'], ['bash'], ['shell'], ['sql'], ['html', 'html5'],
    ['css', 'css3'], ['dart'],
    // Frontend
    ['react', 'reactjs', 'react.js'], ['vue', 'vuejs', 'vue.js'],
    ['angular'], ['svelte'], ['nextjs', 'next.js'], ['gatsby'],
    ['tailwind', 'tailwindcss'], ['bootstrap'], ['jquery'],
    ['redux'], ['graphql'], ['websocket'], ['sass', 'scss'],
    ['remix'], ['astro'],
    // Backend
    ['nodejs', 'node.js', 'node js', 'node'],
    ['express', 'expressjs', 'express.js'],
    ['django'], ['flask'], ['fastapi'], ['spring', 'spring boot'],
    ['laravel'], ['rails'], ['fastify'], ['hapi'], ['koa'],
    ['nestjs', 'nest.js'], ['ruby on rails'],
    // APIs
    ['rest api', 'restful api', 'rest apis', 'rest'],
    ['graphql api'], ['grpc'], ['websockets'],
    ['jwt', 'json web token'], ['oauth'], ['api integration'],
    // Databases
    ['mongodb', 'mongo'], ['mysql'], ['postgresql', 'postgres'],
    ['sqlite'], ['redis'], ['elasticsearch'], ['cassandra'],
    ['dynamodb'], ['firebase'], ['supabase'], ['neo4j'],
    ['prisma'], ['mongoose'], ['sequelize'], ['typeorm'],
    ['pinecone'], ['chromadb', 'chroma'], ['qdrant'], ['weaviate'],
    ['faiss'],
    // AI / ML / NLP
    ['machine learning', 'ml'], ['deep learning', 'dl'],
    ['nlp', 'natural language processing'],
    ['computer vision', 'cv'], ['neural networks', 'neural network'],
    ['transformers'], ['bert'], ['gpt'], ['llm', 'llms', 'large language model'],
    ['langchain', 'lang chain'],
    ['rag', 'retrieval augmented generation', 'retrieval-augmented generation'],
    ['ollama'], ['llama', 'llama3', 'llama2', 'llama-3', 'llama-2'],
    ['openai', 'open ai'], ['huggingface', 'hugging face'],
    ['llamaindex', 'llama index'],
    ['tensorflow', 'tf'], ['pytorch', 'torch'], ['keras'],
    ['scikit-learn', 'sklearn'], ['pandas'], ['numpy'],
    ['scipy'], ['xgboost'], ['lightgbm'], ['catboost'],
    ['vector embeddings', 'embeddings', 'vector store'],
    ['prompt engineering'], ['fine-tuning', 'finetuning'],
    ['yolo'], ['mobilenet', 'mobilenetv2', 'mobilenet v2'],
    ['cnn', 'convolutional neural network'], ['rnn'],
    ['lstm'], ['attention mechanism'], ['encoder decoder'],
    ['sentence transformers'], ['data science'],
    // Cloud / DevOps
    ['aws', 'amazon web services'], ['gcp', 'google cloud'],
    ['azure', 'microsoft azure'],
    ['docker'], ['kubernetes', 'k8s'], ['terraform'],
    ['ansible'], ['ci/cd', 'cicd'], ['github actions'],
    ['jenkins'], ['nginx'], ['linux', 'unix'],
    ['vercel'], ['render'], ['heroku'], ['netlify'],
    ['ec2'], ['s3', 'aws s3'], ['lambda', 'aws lambda'],
    // Tools
    ['git'], ['github'], ['gitlab'], ['bitbucket'],
    ['postman'], ['swagger'], ['jira'], ['docker compose'],
    ['vscode', 'vs code'], ['vim'], ['linux terminal'],
    // Concepts
    ['microservices', 'microservice'], ['api design'],
    ['system design'], ['data structures'], ['algorithms'],
    ['agile'], ['scrum'], ['oop', 'object oriented'],
    ['mvc', 'mvc architecture'], ['solid principles'],
    ['unit testing', 'testing'], ['tdd'],
    ['authentication', 'auth'], ['authorization'],
    ['responsive design', 'responsive web design'],
    ['web scraping', 'scraping'], ['web socket'],
    ['cloud computing'], ['serverless'],
    ['database design', 'db design'], ['indexing'],
    ['query optimization'], ['devops'], ['cloud native'],
];

/** Flat set of all canonical terms (first element of each entry) */
const CANONICAL_SKILLS = new Set(TECH_MAP.map(e => e[0]));

/** Look up canonical term from any alias or the canonical itself */
function lookupCanonical(raw: string): string | null {
    const lower = raw.toLowerCase().trim();
    for (const entry of TECH_MAP) {
        for (const alias of entry) {
            if (alias === lower) return entry[0];
        }
    }
    return null;
}

/**
 * Extract skills from text.
 * Strategy: for each canonical entry try all aliases as substrings
 * with a lenient separator boundary check.
 */
function extractSkillsList(text: string): string[] {
    const lower = text.toLowerCase();
    const found = new Set<string>();

    for (const entry of TECH_MAP) {
        const canonical = entry[0];
        for (const alias of entry) {
            const idx = lower.indexOf(alias);
            if (idx === -1) continue;

            // Check character before alias (must be non-alpha or start)
            const before = idx === 0 ? ' ' : lower[idx - 1];
            // Check character after alias (must be non-alpha or end, allow digits like v2)
            const after = idx + alias.length >= lower.length ? ' ' : lower[idx + alias.length];

            const beforeOk = /[^a-z]/.test(before);
            const afterOk = /[^a-z]/.test(after) || /[\d\.]$/.test(alias);

            if (beforeOk && afterOk) {
                found.add(canonical);
                break; // Only add canonical once
            }
        }
    }
    return Array.from(found);
}

// ─── VALIDATORS ───────────────────────────────────────────────

/**
 * Checks if the text likely represents a Resume.
 * Scores based on section headers and typical resume keywords.
 */
export function isResume(text: string): { valid: boolean; score: number; reason?: string } {
    const lower = text.toLowerCase();
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let score = 0;
    const reasons: string[] = [];

    // 1. Check for standard section headers
    for (const [sec, pats] of SECTION_PATTERNS) {
        if (pats.some(p => p.test(text))) {
            score += 15;
            reasons.push(`Found section: ${sec}`);
        }
    }

    // 2. Check for contact/personal indicators
    if (/\b(phone|email|gmail|linkedin|github|address|location|mobile)\b/i.test(lower)) score += 10;
    if (/\b(objective|summary|profile)\b/i.test(lower)) score += 5;
    
    // 3. Check for structural indicators (dates, universities)
    if (/\b(20\d{2}|19\d{2})\b/.test(text)) score += 10; // Years
    if (/\b(Bachelor|Master|Degree|University|College|Institute|BSc|MSc|BTech|MTech|PhD)\b/i.test(text)) score += 10;

    // 4. Look for "Resume" or "CV" in top lines
    const topText = lines.slice(0, 10).join(' ').toLowerCase();
    if (/\b(resume|cv|curriculum\s+vitae)\b/i.test(topText)) score += 20;

    // 5. Word count check (Resumes are usually 300-1500 words)
    const wc = text.split(/\s+/).length;
    if (wc > 150 && wc < 3000) score += 10;

    const isValid = score >= 40;
    return {
        valid: isValid,
        score,
        reason: isValid ? undefined : "Document does not look like a professional Resume. Please check headers like 'Experience', 'Education', or 'Skills'."
    };
}

/**
 * Checks if the text likely represents a Job Description (JD).
 * Scores based on employer language and requirement structures.
 */
export function isJobDescription(text: string): { valid: boolean; score: number; reason?: string } {
    const lower = text.toLowerCase();
    
    let score = 0;
    
    // 1. Employer language indicators
    const jdKeywords = [
        /\b(responsibilities|requirements|qualifications|about\s+the\s+role|reporting\s+to|minimum\s+qualifications|preferred\s+skills)\b/i,
        /\b(we\s+are\s+looking\s+for|join\s+our\s+team|company\s+overview|job\s+description|position\s+summary)\b/i,
        /\b(apply\s+now|competitive\s+salary|benefits|equal\s+opportunity|work\s+authorization)\b/i,
    ];
    
    jdKeywords.forEach(p => {
        if (p.test(lower)) score += 20;
    });

    // 2. Structural indicators (bullets + specific verbs)
    const bulletCount = (text.match(/^[-•*▸→✓]\s/gm) || []).length;
    if (bulletCount >= 3) score += 15;

    // 3. Role/Title indicators
    if (/\b(engineer|developer|manager|lead|intern|scientist|analyst|designer)\b/i.test(lower)) score += 10;

    // 4. Character count (JDs are usually substantial)
    if (text.length > 300) score += 10;

    const isValid = score >= 35;
    return {
        valid: isValid,
        score,
        reason: isValid ? undefined : "The description does not look like a valid Job Description. It should include sections like 'Responsibilities' or 'Requirements'."
    };
}

// ─── SECTION DETECTOR ─────────────────────────────────────────

const SECTION_PATTERNS: [keyof ResumeSections, RegExp[]][] = [
    ['skills', [
        /\b(technical\s+)?skills?\b/i, /\bcore\s+competenc/i,
        /\btechnologies\b/i, /\bproficienc/i, /\btools?\s*(&|and)\s*tech/i,
        /\btech\s+stack\b/i,
    ]],
    ['experience', [
        /\b(work\s+)?experience\b/i, /\bprofessional\s+background\b/i,
        /\bemployment\s+history\b/i, /\binternship(s)?\b/i,
        /\bwork\s+history\b/i, /\bcareer\s+history\b/i,
    ]],
    ['education', [
        /\beducation\b/i, /\bacademic\b/i, /\bqualification/i,
        /\bdegree(s)?\b/i, /\buniversity\b/i, /\bcollege\b/i,
    ]],
    ['projects', [
        /\bprojects?\b/i, /\bportfolio\b/i, /\bside\s+project/i,
        /\bpersonal\s+project/i, /\bkey\s+project/i, /\bnotable\s+project/i,
    ]],
    ['certifications', [
        /\bcertification(s)?\b/i, /\bcertified\b/i, /\blicenses?\b/i,
        /\baward(s)?\b/i, /\bachievement(s)?\b/i, /\bcourse(s)?\b/i,
    ]],
    ['summary', [
        /\b(professional\s+)?summary\b/i, /\bobjective\b/i,
        /\babout\s+(me|myself)\b/i, /\bprofile\b/i, /\bintroduction\b/i,
    ]],
];

interface ResumeSections {
    skills: string;
    experience: string;
    education: string;
    projects: string;
    certifications: string;
    summary: string;
    raw: string;
}

function extractSections(text: string): ResumeSections {
    const lines = text.split('\n');
    const sections: Record<string, string[]> = {
        skills: [], experience: [], education: [],
        projects: [], certifications: [], summary: [],
    };
    let current = 'summary';

    for (const line of lines) {
        const t = line.trim();
        if (!t) continue;
        let found = false;
        if (t.length < 70) {
            for (const [sec, pats] of SECTION_PATTERNS) {
                if (pats.some(p => p.test(t))) {
                    current = sec; found = true; break;
                }
            }
        }
        if (!found) sections[current]?.push(t);
    }

    return {
        skills: sections.skills.join(' '),
        experience: sections.experience.join(' '),
        education: sections.education.join(' '),
        projects: sections.projects.join(' '),
        certifications: sections.certifications.join(' '),
        summary: sections.summary.join(' '),
        raw: text,
    };
}

// ─── JD PARSER ───────────────────────────────────────────────

interface JDAnalysis {
    role: string;
    requiredSkills: string[];
    preferredSkills: string[];
    responsibilities: string[];
    tools: string[];
    yearsExp: number;
    domain: string;
    rawText: string;
}

function parseJobDescription(jd: string): JDAnalysis {
    const lines = jd.split('\n').map(l => l.trim()).filter(Boolean);
    const lower = jd.toLowerCase();

    // Role title — first short line that looks like a job title
    let role = 'Software Engineer';
    for (const line of lines.slice(0, 10)) {
        if (line.length > 3 && line.length < 100 &&
            /\b(engineer|developer|intern|scientist|analyst|manager|lead|architect|specialist|consultant|designer|devops)\b/i.test(line)) {
            role = line.replace(/[^a-zA-Z0-9\s\-\/|()]/g, '').trim().slice(0, 100);
            break;
        }
    }

    // Years required
    const yearMatch = lower.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)?/);
    const yearsExp = yearMatch ? parseInt(yearMatch[1]) : 0;

    // Domain — allow multiple domain signals
    const domains: string[] = [];
    if (/\b(machine learning|ai|deep learning|nlp|llm|rag|langchain|llama|data science)\b/i.test(jd)) domains.push('AI/ML');
    if (/\b(react|vue|angular|frontend|ui|ux|html|css)\b/i.test(jd)) domains.push('Frontend');
    if (/\b(backend|server|api|express|node|flask|django|fastapi|microservice)\b/i.test(jd)) domains.push('Backend');
    if (/\b(fullstack|full.?stack|full stack)\b/i.test(jd) || (domains.includes('Frontend') && domains.includes('Backend'))) domains.push('Full-Stack');
    if (/\b(devops|cloud|kubernetes|docker|aws|gcp|azure|infrastructure)\b/i.test(jd)) domains.push('DevOps/Cloud');
    if (/\b(data engineer|etl|pipeline|spark|kafka)\b/i.test(jd)) domains.push('Data Engineering');
    if (/\b(mobile|ios|android|flutter|react native)\b/i.test(jd)) domains.push('Mobile');
    const domain = domains.length ? domains.join(' + ') : 'General Software';

    // Split required vs preferred sections
    const reqMatch = jd.match(/required?\s*skills?[^\n]*(\n[\s\S]*?)(?=\n\s*(?:preferred|nice|bonus|optional|about|we\s|benefits?|responsib)|$)/i);
    const prefMatch = jd.match(/preferred?\s*skills?[^\n]*(\n[\s\S]*?)(?=\n\s*(?:required|about|we\s|benefits?|responsib)|$)/i);

    const requiredSection = reqMatch?.[1] || jd;
    const preferredSection = prefMatch?.[1] || '';

    const requiredSkills = extractSkillsList(requiredSection);
    const preferredSkills = extractSkillsList(preferredSection).filter(s => !requiredSkills.includes(s));
    const tools = extractSkillsList(jd);

    const responsibilities = lines
        .filter(l => /^[-•*▸→✓]\s/.test(l) && l.length > 15)
        .map(l => l.replace(/^[-•*▸→✓]\s+/, '').trim())
        .slice(0, 15);

    // If no bullet points, use lines that look like responsibilities
    const finalResps = responsibilities.length > 0 ? responsibilities :
        lines.filter(l => l.length > 30 && l.length < 200 && /\b(develop|build|implement|create|design|manage|work|write|collaborate|integrate)\b/i.test(l)).slice(0, 10);

    return { role, requiredSkills, preferredSkills, responsibilities: finalResps, tools, yearsExp, domain, rawText: jd };
}

// ─── FIT CATEGORY ────────────────────────────────────────────

function getFitCategory(score: number): string {
    if (score >= 70) return 'Strong Fit';
    if (score >= 45) return 'Moderate Fit';
    return 'Weak Fit';
}

// ─── SKILL GAP CLASSIFIER ────────────────────────────────────

interface SkillGapItem {
    skill: string;
    priority: 'critical' | 'recommended' | 'nice-to-have';
    reason: string;
}

function classifySkillGap(
    missingSkills: string[],
    requiredSkills: string[],
    preferredSkills: string[],
): SkillGapItem[] {
    return missingSkills.map(skill => {
        if (requiredSkills.includes(skill)) {
            return { skill, priority: 'critical', reason: 'Explicitly listed as a mandatory requirement in the job description.' };
        }
        if (preferredSkills.includes(skill)) {
            return { skill, priority: 'recommended', reason: 'Listed as a preferred or nice-to-have skill by the employer.' };
        }
        return { skill, priority: 'nice-to-have', reason: 'Mentioned in the JD as a supplementary or contextual skill.' };
    });
}

// ─── IMPROVEMENT SUGGESTIONS ─────────────────────────────────

function generateImprovementSuggestions(
    resumeSections: ResumeSections,
    jdAnalysis: JDAnalysis,
    sectionScores: Record<string, number>,
    missingSkills: string[],
    strongMatches: string[],
    partialMatches: string[],
): string[] {
    const suggestions: string[] = [];
    const jd = jdAnalysis.rawText.toLowerCase();

    // Skills section
    if (missingSkills.length > 0) {
        const crit = missingSkills.filter(s => jdAnalysis.requiredSkills.includes(s));
        if (crit.length > 0) {
            suggestions.push(
                `Add these critical missing skills to your Technical Skills section: **${crit.slice(0, 5).join(', ')}**. These are explicitly required by the employer.`
            );
        }
        const pref = missingSkills.filter(s => jdAnalysis.preferredSkills.includes(s));
        if (pref.length > 0) {
            suggestions.push(
                `Strengthen preferred skills to stand out: ${pref.slice(0, 4).join(', ')}. Even listing them as "familiar with" in your skills section helps ATS scoring.`
            );
        }
    }

    // Quantified metrics
    const hasMetrics = /\d+%|\d+x|\$\d+|\d+k|\d+\s*(million|users|requests|ms|hours|sec)/i.test(resumeSections.experience + resumeSections.projects);
    if (!hasMetrics) {
        suggestions.push(
            `Add quantified impact to your experience and projects. Example: Instead of "Built AI chatbot", write "Developed AI chatbot supporting 3 document formats with RAG pipeline, reducing query response time by 40%."`
        );
    }

    // Experience score
    if (sectionScores.experience < 55) {
        suggestions.push(
            `Rewrite work/internship bullet points using the STAR format (Situation → Task → Action → Result). Each bullet should convey what you did AND its measurable outcome.`
        );
    }

    // Project descriptions
    if (sectionScores.projects < 55 && resumeSections.projects.length > 0) {
        suggestions.push(
            `Enhance project descriptions with the full tech stack + scale + outcome. Example: "Developed a full-stack AI chatbot using React + Node.js + LangChain + LLaMA3 with RAG pipeline, supporting PDF/DOCX/TXT ingestion. Achieved 85%+ answer accuracy on domain documents."`
        );
    }

    // RAG/LangChain detection in resume with full-stack JD
    const resumeLower = resumeSections.raw.toLowerCase();
    if (/\b(rag|langchain|llama|ollama|vector)\b/i.test(resumeSections.raw) &&
        /\b(react|node|express|fullstack|full.stack)\b/i.test(jdAnalysis.rawText)) {
        suggestions.push(
            `You have AI/ML project experience that aligns with the JD's LLM/AI preferred skills section. Explicitly call out: "Built RAG pipeline", "LangChain framework", "LLaMA3 local inference" as keywords in your skills and project sections to get AI bonus points.`
        );
    }

    // Missing professional summary
    if (resumeSections.summary.length < 80) {
        suggestions.push(
            `Add a 3-4 sentence professional summary at the top of your resume aligned to this role: "${jdAnalysis.role}". Lead with your strongest attribute (e.g., full-stack skills + AI project experience).`
        );
    }

    // Cloud/deployment
    if (/\b(docker|aws|cloud|deploy|ci\/cd|kubernetes)\b/i.test(jd) &&
        !/\b(docker|aws|cloud|deploy|vercel|render|heroku)\b/i.test(resumeLower)) {
        suggestions.push(
            `The JD mentions cloud/deployment technologies. Add deployment experience: "Deployed using Docker + Render/Vercel" or "Hosted on AWS EC2/S3" even for personal projects.`
        );
    }

    // GitHub links
    if (!/github\.com\/\w+\/\w+/i.test(resumeSections.raw)) {
        suggestions.push(
            `Add GitHub project links directly in your Projects section. ATS systems recognize and reward repository links — they validate your claimed skills.`
        );
    }

    // Skills section structure
    if (strongMatches.length > 0 && sectionScores.skills < 65) {
        suggestions.push(
            `Restructure your Technical Skills section for ATS readability:\n` +
            `Languages: JavaScript, Python, Java\nFrontend: React.js, HTML5, CSS3\nBackend: Node.js, Express.js\n` +
            `Databases: MongoDB, MySQL, PostgreSQL\nAI/ML: LangChain, RAG, LLaMA3, NLP\nTools: Git, Docker, Postman`
        );
    }

    return suggestions.slice(0, 8);
}

// ─── ATS TIPS ────────────────────────────────────────────────

function generateATSTips(
    resumeText: string,
    jdAnalysis: JDAnalysis,
    missingSkills: string[],
    resumeSkills: string[],
): string[] {
    const tips: string[] = [];
    const lower = resumeText.toLowerCase();

    // Keyword density
    if (missingSkills.length > 0) {
        tips.push(
            `Incorporate JD keywords naturally: "${missingSkills.slice(0, 4).join('", "')}". ATS systems rank by keyword frequency and placement — skills section + project descriptions are highest-weighted.`
        );
    }

    // Job title mirror
    if (jdAnalysis.role) {
        tips.push(
            `Mirror the exact job title "${jdAnalysis.role}" in your resume headline or summary. ATS rank improves up to 30% when the resume title matches the applied role.`
        );
    }

    // File format
    tips.push('Submit as a clean single-column PDF. Avoid tables, multi-column layouts, text boxes, headers/footers — these sections are skipped by 60%+ of ATS parsers.');

    // Section headers
    tips.push('Use exact standard section headers: "Work Experience", "Technical Skills", "Education", "Projects". Creative headers like "What I\'ve Built" are often ignored by ATS.');

    // Skills near top
    tips.push('Place your "Technical Skills" section immediately after your summary/objective — ATS systems parse the first third of the document with 3× higher weight.');

    // Word count
    const wc = resumeText.split(/\s+/).length;
    if (wc < 350) {
        tips.push('Your resume is brief for ATS purposes. Expand project descriptions to at least 3 bullet points each — more keywords = higher match probability.');
    } else if (wc > 1100) {
        tips.push('The resume may be too long. Trim to the most recent/relevant 10 years. ATS often truncates parsing after ~2 pages.');
    }

    // Action verbs
    if (!/\b(developed|built|designed|implemented|architected|deployed|optimized|led|created)\b/i.test(resumeText)) {
        tips.push('Start every experience/project bullet with a strong action verb: Developed, Built, Architected, Deployed, Optimized. ATS scores are boosted by past-tense technical verbs.');
    }

    return tips.slice(0, 6);
}



export interface AnalysisReport {
    job_role: string;
    overall_match_score: number;
    fit_category: string;
    section_scores: {
        skills: number;
        experience: number;
        projects: number;
        tools: number;
        domain_knowledge: number;
    };
    skills_analysis: {
        strong_matches: string[];
        partial_matches: string[];
        missing_skills: string[];
    };
    project_relevance: Array<{ description: string; relevance_score: number; note: string }>;
    skill_gap_analysis: Array<{ skill: string; priority: 'critical' | 'recommended' | 'nice-to-have'; reason: string }>;
    resume_improvement_suggestions: string[];
    ats_optimization_tips: string[];
    metadata: {
        model: string;
        processingTime: number;
        resumeWordCount: number;
        jdWordCount: number;
        domain: string;
        yearsRequired: number;
    };
}

export async function analyzeResumeVsJD(resumeText: string, jobDescription: string): Promise<AnalysisReport> {
    const start = Date.now();
    console.log('[ResumeAnalyzer v4] Starting pipeline...');

    const cleanedResume = clean(resumeText);
    const cleanedJD = clean(jobDescription);

    // 1. Extract resume sections
    const sections = extractSections(cleanedResume);

    // 2. Parse JD
    const jdAnalysis = parseJobDescription(cleanedJD);
    console.log(`[ResumeAnalyzer] Role: "${jdAnalysis.role}" | Domain: ${jdAnalysis.domain}`);
    console.log(`[ResumeAnalyzer] Required: [${jdAnalysis.requiredSkills.join(', ')}]`);
    console.log(`[ResumeAnalyzer] Preferred: [${jdAnalysis.preferredSkills.join(', ')}]`);

    // 3. Skill extraction
    const resumeSkills = extractSkillsList(cleanedResume);
    const jdAllSkills = Array.from(new Set([...jdAnalysis.requiredSkills, ...jdAnalysis.preferredSkills, ...jdAnalysis.tools]));
    console.log(`[ResumeAnalyzer] Resume skills: [${resumeSkills.join(', ')}]`);
    console.log(`[ResumeAnalyzer] JD skills: [${jdAllSkills.join(', ')}]`);

    // 4. Skill matching
    const strongMatches: string[] = [];
    const partialMatches: string[] = [];
    const missingSkills: string[] = [];

    for (const skill of jdAllSkills) {
        if (resumeSkills.includes(skill)) {
            strongMatches.push(skill);
        } else {
            // Check aliases — if resume has a synonym
            const entry = TECH_MAP.find(e => e[0] === skill);
            const aliases = entry ? entry.slice(1) : [];
            const hasAlias = aliases.some(a => cleanedResume.toLowerCase().includes(a.toLowerCase()));
            if (hasAlias) {
                partialMatches.push(skill);
            } else {
                missingSkills.push(skill);
            }
        }
    }

    console.log(`[ResumeAnalyzer] Matches: strong=${strongMatches.length}, partial=${partialMatches.length}, missing=${missingSkills.length}`);

    // 5. Keyword match ratio for scoring boost
    const totalJdSkills = jdAllSkills.length || 1;
    const keywordRatio = (strongMatches.length + partialMatches.length * 0.5) / totalJdSkills;

    // 6. Semantic embeddings
    console.log('[ResumeAnalyzer] Computing embeddings...');

    // Prepare representative text for each section
    const resumeSkillsText = sections.skills || resumeSkills.join(', ') || cleanedResume.slice(0, 500);
    const jdSkillsText = [...jdAnalysis.requiredSkills, ...jdAnalysis.preferredSkills].join(', ') || cleanedJD.slice(0, 400);
    const resumeExpText = sections.experience || cleanedResume.slice(0, 800);
    const jdRespText = jdAnalysis.responsibilities.join('. ') || cleanedJD.slice(0, 600);
    const resumeProjText = sections.projects || cleanedResume.slice(0, 600);
    const jdDomainText = `${jdAnalysis.role} ${jdAnalysis.domain} ${jdAllSkills.join(' ')}`;
    const resumeFullText = cleanedResume.slice(0, 1000);
    const jdFullText = cleanedJD.slice(0, 800);

    const [
        emResSkills, emJdSkills,
        emResExp, emJdResp,
        emResProj, emJdDomain,
        emResFull, emJdFull,
    ] = await Promise.all([
        embed(resumeSkillsText), embed(jdSkillsText),
        embed(resumeExpText), embed(jdRespText),
        embed(resumeProjText), embed(jdDomainText),
        embed(resumeFullText), embed(jdFullText),
    ]);

    // 7. Calibrated section scores
    const rawSkillSim = cosineSimilarity(emResSkills, emJdSkills);
    const rawExpSim = cosineSimilarity(emResExp, emJdResp);
    const rawProjSim = cosineSimilarity(emResProj, emJdDomain);
    const rawToolsSim = cosineSimilarity(emResFull, emJdFull);
    const rawDomainSim = cosineSimilarity(emResProj, emJdFull);

    console.log(`[ResumeAnalyzer] Raw cosines: skills=${rawSkillSim.toFixed(3)}, exp=${rawExpSim.toFixed(3)}, proj=${rawProjSim.toFixed(3)}, tools=${rawToolsSim.toFixed(3)}`);
    const skillScore = Math.round(calibrate(rawSkillSim) * 0.6 + keywordRatio * 100 * 0.4);
    const expScore = Math.round(calibrate(rawExpSim) * 0.75 + keywordRatio * 100 * 0.25);
    const projScore = Math.round(calibrate(rawProjSim) * 0.75 + keywordRatio * 100 * 0.25);
    const toolScore = Math.round(calibrate(rawToolsSim) * 0.65 + keywordRatio * 100 * 0.35);
    const domainScore = Math.round(calibrate(rawDomainSim) * 0.70 + keywordRatio * 100 * 0.30);

    const sectionScores = {
        skills: Math.min(100, Math.max(0, skillScore)),
        experience: Math.min(100, Math.max(0, expScore)),
        projects: Math.min(100, Math.max(0, projScore)),
        tools: Math.min(100, Math.max(0, toolScore)),
        domain_knowledge: Math.min(100, Math.max(0, domainScore)),
    };
    const overall = Math.round(
        sectionScores.skills * 0.35 +
        sectionScores.experience * 0.30 +
        sectionScores.projects * 0.15 +
        sectionScores.tools * 0.10 +
        sectionScores.domain_knowledge * 0.10
    );

    console.log(`[ResumeAnalyzer] Section scores:`, sectionScores, '→ Overall:', overall);
    const projectLines = (sections.projects + ' ' + cleanedResume)
        .split(/\n/)
        .map(l => l.trim())
        .filter(l => l.length > 40 && /\b(built|developed|created|implemented|designed|deployed|integrated|trained|built)\b/i.test(l))
        .slice(0, 6);

    const projectRelevance = await Promise.all(
        projectLines.map(async (proj, i) => {
            const pEmb = await embed(proj.slice(0, 300));
            const sim = cosineSimilarity(pEmb, emJdFull);
            const score = Math.round(calibrate(sim) * 0.7 + keywordRatio * 100 * 0.3);
            const clamped = Math.min(100, Math.max(0, score));
            return {
                description: proj.slice(0, 130) + (proj.length > 130 ? '…' : ''),
                relevance_score: clamped,
                note: clamped >= 65 ? 'Highly relevant to the job requirements.'
                    : clamped >= 40 ? 'Moderately aligned — consider adding more JD-specific keywords.'
                        : 'Low alignment — highlight tech stack and outcomes more explicitly.',
            };
        })
    );
    const skillGap = classifySkillGap(missingSkills, jdAnalysis.requiredSkills, jdAnalysis.preferredSkills);
    const suggestions = generateImprovementSuggestions(sections, jdAnalysis, sectionScores, missingSkills, strongMatches, partialMatches);
    const atsTips = generateATSTips(cleanedResume, jdAnalysis, missingSkills, resumeSkills);

    const elapsed = Date.now() - start;
    console.log(`[ResumeAnalyzer v4] Done in ${elapsed}ms — Score: ${overall}`);

    return {
        job_role: jdAnalysis.role,
        overall_match_score: overall,
        fit_category: getFitCategory(overall),
        section_scores: sectionScores,
        skills_analysis: {
            strong_matches: strongMatches,
            partial_matches: partialMatches,
            missing_skills: missingSkills,
        },
        project_relevance: projectRelevance,
        skill_gap_analysis: skillGap,
        resume_improvement_suggestions: suggestions,
        ats_optimization_tips: atsTips,
        metadata: {
            model: 'Xenova/all-MiniLM-L6-v2',
            processingTime: elapsed,
            resumeWordCount: cleanedResume.split(/\s+/).length,
            jdWordCount: cleanedJD.split(/\s+/).length,
            domain: jdAnalysis.domain,
            yearsRequired: jdAnalysis.yearsExp,
        },
    };
}
export async function analyzeSkillGap(resumeText: string, jobDescription: string) {
    const report = await analyzeResumeVsJD(resumeText, jobDescription);
    return {
        matchPercentage: report.overall_match_score,
        matches: report.skills_analysis.strong_matches,
        gaps: report.skills_analysis.missing_skills,
        recommendations: report.resume_improvement_suggestions.join(' '),
        fullReport: report,
    };
}
