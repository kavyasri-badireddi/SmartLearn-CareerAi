//src/lib/ai.ts
// @ts-ignore
import { pipeline } from '@xenova/transformers';
// @ts-ignore
import nlp from 'compromise';

let summarizer: any = null;

/**
 * SmartLearn NLP Engine V70.0
 *
 * Summary:  Xenova/distilbart-cnn-12-6
 * Quiz:     6 diverse question types with full document coverage
 *
 * Question Types:
 *   - mcq:          Standard multiple choice (What is X?)
 *   - fill_blank:   Complete the statement with blanked key term
 *   - true_false:   Is this statement True or False?
 *   - multi_select: Select ALL correct answers (checkboxes)
 *   - reverse_mcq:  Given a definition, identify the term
 *   - not_mcq:      Which of the following is NOT...
 */

// ────────────────────────────────────────────────
// UTILITIES
// ────────────────────────────────────────────────

function cleanRawText(text: string): string {
  return text.replace(/\0/g, '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function smartChunk(text: string, maxSize: number): string[] {
  if (text.length <= maxSize) return [text];
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\s*\n/);
  let current = '';
  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length > maxSize && current.length > 200) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = current ? current + '\n\n' + para : para;
    }
  }
  if (current.trim().length > 50) chunks.push(current.trim());
  return chunks;
}

function isCodeSnippet(text: string): boolean {
  const indicators = [
    /[{}();=]/,
    /\b(public|private|protected|static|void|int\s|String\s|class\s+\w+\s*\{)/,
    /\b(System\.out|println|import\s+java|return\s+\w)/,
    /\w+\.\w+\(.*\)/,
    /\/\//,
    /\b\w+\s*=\s*new\s+\w+/,
    /^\s*[@#\/\*]/,
    /\b(def |function |const |let |var )\w/,
  ];
  return indicators.some(p => p.test(text));
}

function isCleanSentence(text: string): boolean {
  if (text.length < 25 || text.length > 400) return false;
  if (isCodeSnippet(text)) return false;
  const words = text.split(/\s+/).filter(w => w.length > 1);
  if (words.length < 4) return false;
  const alphaRatio = (text.match(/[a-zA-Z]/g) || []).length / text.length;
  return alphaRatio >= 0.6;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if the text likely represents Study Material.
 */
export function isStudyMaterial(text: string): { valid: boolean; score: number; reason?: string } {
  const lower = text.toLowerCase();
  let score = 0;

  // 1. Academic/Systematic Keywords
  const academicTerms = [
    /\b(introduction|overview|summary|conclusion|objectives?|review)\b/i,
    /\b(chapter|module|lecture|lesson|unit|section|topic)\b/i,
    /\b(definition|concept|principle|theory|law|method|process|system|architecture)\b/i,
    /\b(example|exercise|practice|problem|solution|experiment|analysis|observation)\b/i,
    /\b(function|variable|parameter|algorithm|code|implementation|design|structure)\b/i,
    /\b(biology|physics|chemistry|mathematics|history|geography|sociology|psychology|science)\b/i,
    /\b(note|study|syllabus|course|academic|intellectual|educational)\b/i,
  ];

  academicTerms.forEach(p => {
    const matches = (lower.match(p) || []).length;
    score += Math.min(matches * 6, 25); // Each category max 25
  });

  // 1.5 Academic Action Verbs (Deep understanding)
  const academicVerbs = [
    /\b(hypothesize|analyze|demonstrate|illustrate|explain|verify|calculate|derive|synthesize|classify|differentiate|evaluate|examine|formulate|integrate|organize|summarize)\b/i
  ];
  
  academicVerbs.forEach(v => {
    const matches = (lower.match(v) || []).length;
    score += Math.min(matches * 4, 15);
  });

  // 2. Structural Indicators
  // Bullet points or numbered lists
  const listMatches = (text.match(/^[ \t]*([-•*▸→✓]|\d+\.)\s/gm) || []).length;
  if (listMatches >= 3) score += 20;

  // Question formats
  if (/\?(\s+|$)/.test(text)) score += 10;

  // Definitions (is/are a/an)
  const defMatches = (lower.match(/\s[a-z\s]{2,30}\s(is|are|refers to|defined as|consists of|characterized by)\s/g) || []).length;
  score += Math.min(defMatches * 4, 20);

  // 3. Negative Indicators (Irrelevant Content)
  const chatTerms = [
    /\b(hi|hello|hey|how are you|love|ice cream|movie|song|lyrics|recipe|ingredients)\b/i,
    /\b(pizzas?|burgers?|shopping|discount|deal|offer|sale)\b/i,
    /\b(funny|joke|story|social media|post|tweet|dm)\b/i,
    /\b(dating|app|chat|whatsapp|instagram|facebook|tiktok)\b/i,
  ];

  chatTerms.forEach(p => {
    if (p.test(lower)) score -= 20;
  });

  // 4. NLP Topic Awareness (Deep Extraction)
  const doc = nlp(text);
  const topics = doc.topics().out('array') as string[];
  const nouns = doc.nouns().out('array') as string[];

  // Study material usually has specific technical or conceptual nouns
  const academicConcepts = Array.from(new Set(nouns.filter(n => n.length > 5 && !isCodeSnippet(n))));
  if (academicConcepts.length > 15) score += 20; // Diverse concepts found
  if (topics.length > 8) score += 15; // Structured topics found

  const isValid = score >= 50;
  return {
    valid: isValid,
    score,
    reason: isValid ? undefined : "This content is not recognized as educational material. Please upload structured study notes, textbook chapters, or technical concepts."
  };
}

// ────────────────────────────────────────────────
// MAIN ENTRY
// ────────────────────────────────────────────────

export async function generateStudyKit(content: string, signal?: AbortSignal) {
  try {
    console.log("[NLP Engine V70] Starting pipeline...");
    const startTime = Date.now();
    let rawContent = cleanRawText(content);

    // ── SPEED FIX: Cap input to ~15000 chars ──
    // This prevents 10+ chunk documents from causing 10+ slow BART calls.
    // 15000 chars covers all key content for any study document.
    if (rawContent.length > 15000) {
      console.log(`[NLP Engine] Input too long (${rawContent.length} chars), capping to 15000`);
      rawContent = rawContent.slice(0, 15000);
    }

    // --- AI-03 Implementation ---
    // Basic language detection (checking for common English words)
    const englishWords = ['the', 'and', 'is', 'a', 'in', 'it', 'for', 'to', 'that', 'with'];
    const lower = rawContent.toLowerCase();
    const isEnglish = englishWords.some(word => lower.includes(` ${word} `));
    if (!isEnglish && rawContent.length > 100) {
      console.warn("[NLP Engine] WARNING: Non-English content detected. Study kit generation may be inaccurate.");
    }

    if (!summarizer) {
      console.log("[NLP Engine] Loading Summarizer: DistilBART-CNN...");
      summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-12-6');
    }

    // ── SPEED FIX: Run summary & quiz/flashcards in parallel ──
    // Quiz and flashcards use NLP (instant) and don't depend on the summary,
    // so we run them while the slow BART summarization is happening.
    const [summary, quiz, flashcards] = await Promise.all([
      generateSummary(rawContent, signal),
      Promise.resolve(generateQuiz(rawContent)),
      Promise.resolve(generateFlashcards(rawContent)),
    ]);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[NLP Engine V70] Done in ${elapsed}s — Summary: ${summary.length} chars, Quiz: ${quiz.length} Qs, Flashcards: ${flashcards.length}`);

    return { summary, quiz, flashcards };
  } catch (error: any) {
    console.error("[NLP Engine] Pipeline Failure:", error);
    return { summary: "Summary generation failed. Please try re-uploading.", quiz: [], flashcards: [] };
  }
}

// ────────────────────────────────────────────────
// SUMMARIZATION
// ────────────────────────────────────────────────

async function generateSummary(text: string, signal?: AbortSignal): Promise<string> {
  // ── SPEED FIX: Larger chunks = fewer BART inference calls ──
  // 3500 chars ≈ 800 tokens, well within BART's 1024-token limit.
  // A 15000-char doc → ~4 chunks instead of ~8 (halves processing time).
  const chunks = smartChunk(text, 3500);
  console.log(`[Summarizer] Processing ${chunks.length} chunks...`);
  const parts: string[] = [];
  for (let ci = 0; ci < chunks.length; ci++) {
    // Check for cancellation before each BART call
    if (signal?.aborted) {
      console.log(`[Summarizer] Aborted at chunk ${ci + 1}`);
      throw new Error("AbortError");
    }

    const chunk = chunks[ci];
    if (chunk.length < 100) continue;
    try {
      console.log(`[Summarizer] Chunk ${ci + 1}/${chunks.length} (${chunk.length} chars)...`);
      // ── SPEED FIX: 130 tokens instead of 200 ──
      // Still produces a quality summary paragraph, but generates ~35% fewer tokens = faster.
      const res = await summarizer(chunk, { max_new_tokens: 130, min_new_tokens: 30, do_sample: false });
      if (res[0]?.summary_text) parts.push(res[0].summary_text.trim());
    } catch {
      const sents = nlp(chunk).sentences().out('array') as string[];
      const good = sents.filter((s: string) => isCleanSentence(s)).slice(0, 2);
      if (good.length) parts.push(good.join(' '));
    }
  }
  let final = parts.join('\n\n');
  if (final.length < 50) {
    const all = nlp(text).sentences().out('array') as string[];
    final = all.filter((s: string) => isCleanSentence(s)).slice(0, 10).join('\n\n');
  }
  return final;
}

// ────────────────────────────────────────────────
// DEFINITION & FACT EXTRACTION
// ────────────────────────────────────────────────

interface DefEntry { term: string; definition: string; sentence: string; }

function extractDefinitions(text: string): DefEntry[] {
  const sentences = nlp(text).sentences().out('array') as string[];
  const defs: DefEntry[] = [];
  const seen = new Set<string>();

  // Only patterns that indicate REAL definitions (not opinions/adjectives)
  // REMOVED: the catch-all "X is/are Y" pattern that matched garbage like
  //   "OOP Concepts are very important" → def = "very important" ❌
  const patterns = [
    /^(?:An?\s+|The\s+)?([A-Z][a-zA-Z\s]{1,35}?)\s+is\s+(?:a|an|the)\s+(.{15,})/i,
    /^(?:The\s+)?([A-Z][a-zA-Z\s]{1,35}?)\s+is\s+used\s+(?:to|for)\s+(.{15,})/i,
    /^(?:An?\s+|The\s+)?([A-Z][a-zA-Z\s]{1,35}?)\s+refers?\s+to\s+(.{15,})/i,
    /^(?:An?\s+|The\s+)?([A-Z][a-zA-Z\s]{1,35}?)\s+means\s+(.{15,})/i,
    /^(?:An?\s+|The\s+)?([A-Z][a-zA-Z\s]{1,35}?)\s+can\s+be\s+defined\s+as\s+(.{15,})/i,
    /^(?:An?\s+|The\s+)?([A-Z][a-zA-Z\s]{1,35}?)\s+represents?\s+(.{15,})/i,
    /^(?:An?\s+|The\s+)?([A-Z][a-zA-Z\s]{1,35}?)\s+provides?\s+(.{15,})/i,
    /^(?:An?\s+|The\s+)?([A-Z][a-zA-Z\s]{1,35}?)\s+allows?\s+(.{15,})/i,
    /^(?:The\s+)?([A-Z][a-zA-Z\s]{1,35}?)\s+is\s+followed\s+by\s+(.{15,})/i,
    /^(?:The\s+)?([a-zA-Z]+\s+keyword)\s+is\s+(.{15,})/i,
    /^(?:An?\s+|The\s+)?([A-Z][a-zA-Z\s]{1,35}?)\s+enables?\s+(.{15,})/i,
    /^(?:The\s+)?([A-Z][a-zA-Z\s]{1,35}?)\s+supports?\s+(.{10,})/i,
  ];

  const skip = new Set([
    'it', 'this', 'that', 'they', 'we', 'he', 'she', 'there', 'here',
    'also', 'however', 'therefore', 'moreover', 'furthermore', 'example',
    'above', 'below', 'following', 'note', 'output', 'also there',
  ]);

  // Reject definitions that are just adjectives/opinions/fragments, NOT real explanations
  // e.g. "very important", "some state and behavior", "completely different"
  const vagueDefPatterns = [
    /^(very|quite|extremely|really|also|not|most|more|less|so)\s/i,
    /^(important|necessary|useful|good|bad|common|popular|different|similar|same)\b/i,
    /^(completely|totally|entirely|basically|essentially|generally|usually|often)\s/i,
    /^(known|called|named|termed|considered|regarded)\b/i,
    /^(one of|some of|many|several|various|few|some|any)\b/i,
    /^(used|required|needed|available|present|given|defined|described)\b/i,
  ];

  for (const sent of sentences) {
    const t = sent.trim();
    if (!isCleanSentence(t)) continue;
    for (const pat of patterns) {
      const m = t.match(pat);
      if (m) {
        const term = m[1].trim();
        const rawDef = m[2].trim();
        if (term.length < 2 || term.length > 40) continue;
        if (skip.has(term.toLowerCase())) continue;
        if (isCodeSnippet(term)) continue;
        if (seen.has(term.toLowerCase())) continue;
        if (rawDef.length < 10 || isCodeSnippet(rawDef)) continue;

        // ─── QUALITY FILTER ───
        // Reject vague/opinion definitions like "very important"
        if (vagueDefPatterns.some(vp => vp.test(rawDef))) continue;

        // Definition must have at least 4 real words (not just "very important")
        const defWords = rawDef.split(/\s+/).filter(w => w.length > 2);
        if (defWords.length < 4) continue;

        let def = rawDef.replace(/\s*[{(;].*$/, '').replace(/\s*\/\/.*$/, '').trim();
        if (def.length > 150) {
          const c = def.lastIndexOf('.', 150);
          def = c > 50 ? def.slice(0, c + 1) : def.slice(0, 150).trim();
        }
        if (def.length < 10) continue;

        seen.add(term.toLowerCase());
        defs.push({ term, definition: def, sentence: t });
        break;
      }
    }
  }
  return defs;
}

function extractFacts(text: string): string[] {
  const sentences = nlp(text).sentences().out('array') as string[];
  const indicators = [
    'does not', 'cannot', 'is not', 'are not', 'supports', 'does not support',
    'is called', 'is known as', 'is used for', 'is used to', 'must', 'should',
    'always', 'never', 'can be', 'can only', 'requires', 'depends on',
    'allows', 'enables', 'prevents', 'different from', 'similar to',
    'types of', 'kinds of', 'features of', 'advantage', 'disadvantage',
    'implements', 'extends', 'overriding', 'overloading',
  ];
  return sentences.filter(s => {
    const t = s.trim();
    if (!isCleanSentence(t)) return false;
    const lower = t.toLowerCase();
    return indicators.some(ind => lower.includes(ind));
  });
}

/**
 * Extract items that belong to categories/lists in the document.
 * e.g. "Types of inheritance: single, multilevel, hierarchical"
 * Returns { category, items[] }
 */
function extractLists(text: string): { category: string; items: string[] }[] {
  const results: { category: string; items: string[] }[] = [];
  const sentences = nlp(text).sentences().out('array') as string[];

  // Pattern: "types/kinds/features of X: a, b, c"
  // or "types of X are a, b, c"
  // or "X has following types: a, b, c"
  for (const sent of sentences) {
    const t = sent.trim();
    if (isCodeSnippet(t)) continue;

    // "types of X: a, b, c" or "types of X are a, b, c"
    const listMatch = t.match(
      /(?:types?|kinds?|forms?|features?|advantages?|properties?|characteristics?|methods?|pillars?|concepts?)\s+of\s+([A-Za-z\s]{2,30}?)(?:\s+are|\s*[:—\-])\s*(.{10,})/i
    );
    if (listMatch) {
      const category = listMatch[1].trim();
      const itemsStr = listMatch[2];
      // Split by comma, "and", numbering
      const items = itemsStr
        .split(/[,;]|\band\b|\d+\.\s*/)
        .map(i => i.trim().replace(/\.$/, ''))
        .filter(i => i.length > 2 && i.length < 60 && !isCodeSnippet(i));
      if (items.length >= 2 && category.length > 2) {
        results.push({ category, items });
      }
    }
  }
  return results;
}

// ────────────────────────────────────────────────
// QUIZ GENERATOR — 6 QUESTION TYPES
// ────────────────────────────────────────────────

function generateQuiz(text: string): any[] {
  const definitions = extractDefinitions(text);
  const facts = extractFacts(text);
  const lists = extractLists(text);
  const quiz: any[] = [];
  const askedAbout = new Set<string>(); // Track topics to avoid duplicates

  console.log(`[Quiz V70] Definitions: ${definitions.length}, Facts: ${facts.length}, Lists: ${lists.length}`);

  // ═══════════════════════════════════════════════
  // TYPE 1: MCQ — "What is X?" (cross-definition distractors)
  // ═══════════════════════════════════════════════
  if (definitions.length >= 2) {
    const limit = Math.min(definitions.length, 5);
    for (let i = 0; i < limit; i++) {
      const entry = definitions[i];
      const wrong = shuffle(definitions.filter((_, j) => j !== i).map(d => d.definition)).slice(0, 3);
      while (wrong.length < 3) wrong.push("None of the above");

      quiz.push({
        type: 'mcq',
        question: `What is ${entry.term}?`,
        options: shuffle([entry.definition, ...wrong]),
        answer: entry.definition,
        explanation: entry.sentence.slice(0, 200),
      });
      askedAbout.add(entry.term.toLowerCase());
    }
  }

  // ═══════════════════════════════════════════════
  // TYPE 2: FILL IN THE BLANK
  // ═══════════════════════════════════════════════
  {
    const available = definitions.filter(d => !askedAbout.has(d.term.toLowerCase()));
    const toUse = available.length > 0 ? available : definitions;

    for (const entry of shuffle(toUse).slice(0, 4)) {
      const blanked = entry.sentence.replace(
        new RegExp(escapeRegex(entry.term), 'gi'), '________'
      );
      if (blanked === entry.sentence) continue;

      const wrongTerms = shuffle(
        definitions.filter(d => d.term.toLowerCase() !== entry.term.toLowerCase()).map(d => d.term)
      ).slice(0, 3);
      while (wrongTerms.length < 3) wrongTerms.push("None of the above");

      quiz.push({
        type: 'fill_blank',
        question: `Fill in the blank:\n"${blanked.slice(0, 180)}"`,
        options: shuffle([entry.term, ...wrongTerms]),
        answer: entry.term,
        explanation: entry.sentence.slice(0, 200),
      });
      askedAbout.add(entry.term.toLowerCase());
    }
  }

  // ═══════════════════════════════════════════════
  // TYPE 3: TRUE / FALSE
  // ═══════════════════════════════════════════════
  {
    // Pick factual statements. Half are true (original), half are false (modified).
    const trueFacts = shuffle(facts).slice(0, 6);
    let tfCount = 0;

    for (let i = 0; i < trueFacts.length && tfCount < 4; i++) {
      const fact = trueFacts[i].trim();
      const isTrue = i % 2 === 0; // Alternate true and false

      if (isTrue) {
        // TRUE statement — show as-is
        quiz.push({
          type: 'true_false',
          question: `True or False:\n"${fact.slice(0, 200)}"`,
          options: ['True', 'False'],
          answer: 'True',
          explanation: `This statement is correct. ${fact.slice(0, 150)}`,
        });
        tfCount++;
      } else {
        // FALSE statement — modify the fact to make it wrong
        const falsified = falsifyStatement(fact);
        if (falsified && falsified !== fact) {
          quiz.push({
            type: 'true_false',
            question: `True or False:\n"${falsified.slice(0, 200)}"`,
            options: ['True', 'False'],
            answer: 'False',
            explanation: `The correct statement is: ${fact.slice(0, 150)}`,
          });
          tfCount++;
        }
      }
    }
  }

  // ═══════════════════════════════════════════════
  // TYPE 4: MULTI-SELECT (Select ALL that apply)
  // ═══════════════════════════════════════════════
  {
    // Strategy A: Use lists found in the document
    for (const list of lists.slice(0, 2)) {
      if (list.items.length < 2) continue;

      // Correct items from the list
      const correctItems = list.items.slice(0, 3);
      // Wrong items from other definitions/terms not in this list
      const wrongItems = definitions
        .map(d => d.term)
        .filter(t => !correctItems.some(c => c.toLowerCase().includes(t.toLowerCase())))
        .slice(0, 2);

      if (wrongItems.length < 1) continue;

      const allOptions = shuffle([...correctItems, ...wrongItems]);

      quiz.push({
        type: 'multi_select',
        question: `Select ALL that are ${list.category.toLowerCase().includes('type') ? '' : 'features/types of '}${list.category}:`,
        options: allOptions,
        answer: correctItems, // Array of correct answers
        explanation: `The correct items are: ${correctItems.join(', ')}`,
      });
    }

    // Strategy B: Group related definitions
    if (definitions.length >= 4) {
      // Pick 2-3 true facts and 2 unrelated ones
      const trueStatements = shuffle(facts.filter(f => f.length < 150)).slice(0, 2);
      const falseStatements = definitions
        .map(d => `${d.term} is not related to this document.`)
        .slice(0, 2);

      if (trueStatements.length >= 2) {
        quiz.push({
          type: 'multi_select',
          question: 'Select ALL statements that are correct according to the document:',
          options: shuffle([...trueStatements.map(s => s.slice(0, 120)), ...falseStatements.slice(0, 2)]),
          answer: trueStatements.map(s => s.slice(0, 120)),
          explanation: 'The correct statements are those directly stated in the document.',
        });
      }
    }
  }

  // ═══════════════════════════════════════════════
  // TYPE 5: REVERSE MCQ — "Which term is defined as...?"
  // ═══════════════════════════════════════════════
  {
    const available = definitions.filter(d => !askedAbout.has(d.term.toLowerCase()));
    const toUse = available.length >= 2 ? available : definitions;

    for (const entry of shuffle(toUse).slice(0, 3)) {
      if (askedAbout.has(`reverse_${entry.term.toLowerCase()}`)) continue;

      const wrongTerms = shuffle(
        definitions.filter(d => d.term.toLowerCase() !== entry.term.toLowerCase()).map(d => d.term)
      ).slice(0, 3);
      while (wrongTerms.length < 3) wrongTerms.push("None of the above");

      quiz.push({
        type: 'mcq',
        question: `Which term is defined as: "${entry.definition.slice(0, 120)}"?`,
        options: shuffle([entry.term, ...wrongTerms]),
        answer: entry.term,
        explanation: entry.sentence.slice(0, 200),
      });
      askedAbout.add(`reverse_${entry.term.toLowerCase()}`);
    }
  }

  // ═══════════════════════════════════════════════
  // TYPE 6: "Which is NOT" — Negative MCQ
  // ═══════════════════════════════════════════════
  {
    // Use lists to build "Which is NOT a type of X?" questions
    for (const list of lists) {
      if (list.items.length < 2) continue;

      // The wrong answer (the one that is NOT in the list)
      const wrongItem = definitions
        .map(d => d.term)
        .find(t => !list.items.some(i => i.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(i.toLowerCase())));

      if (!wrongItem) continue;

      const correctItems = shuffle(list.items).slice(0, 3);

      quiz.push({
        type: 'mcq',
        question: `Which of the following is NOT a type/feature of ${list.category}?`,
        options: shuffle([wrongItem, ...correctItems]),
        answer: wrongItem,
        explanation: `${wrongItem} is not listed as a type/feature of ${list.category}. The actual ones are: ${list.items.join(', ')}.`,
      });
    }

    // Also use definitions to build "NOT" questions
    if (definitions.length >= 4 && quiz.filter(q => q.question.includes('NOT')).length < 2) {
      const subset = shuffle(definitions).slice(0, 4);
      const correctDefs = subset.slice(0, 3);
      const wrongTerm = subset[3];

      quiz.push({
        type: 'mcq',
        question: `Which of the following is NOT a concept defined in this document?`,
        options: shuffle([
          ...correctDefs.map(d => d.term),
          `${wrongTerm.term} Processor` // Made-up variant
        ]),
        answer: `${wrongTerm.term} Processor`,
        explanation: `"${wrongTerm.term} Processor" is not defined in the document. The actual terms are: ${correctDefs.map(d => d.term).join(', ')}.`,
      });
    }
  }

  // ═══════════════════════════════════════════════
  // FALLBACK — If we have very few questions, add more from facts
  // ═══════════════════════════════════════════════
  if (quiz.length < 5) {
    const cleanSentences = (nlp(text).sentences().out('array') as string[])
      .filter((s: string) => isCleanSentence(s) && s.length > 50);
    const allTerms = extractMeaningfulTerms(text);
    const step = Math.max(1, Math.floor(cleanSentences.length / 6));

    for (const sent of cleanSentences.filter((_: string, i: number) => i % step === 0).slice(0, 6)) {
      if (quiz.length >= 20) break;
      const mainNoun = nlp(sent).nouns().first().text();
      if (!mainNoun || mainNoun.length < 3 || isCodeSnippet(mainNoun)) continue;

      const wrong = shuffle(allTerms.filter(t => t.toLowerCase() !== mainNoun.toLowerCase())).slice(0, 3);
      if (wrong.length < 2) continue;
      while (wrong.length < 3) wrong.push("None of the above");

      const blanked = sent.replace(new RegExp(escapeRegex(mainNoun), 'i'), '________');
      if (blanked === sent) continue;

      quiz.push({
        type: 'fill_blank',
        question: `Complete the statement:\n"${blanked.slice(0, 180)}"`,
        options: shuffle([mainNoun, ...wrong]),
        answer: mainNoun,
        explanation: sent.slice(0, 200),
      });
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = quiz.filter((q: any) => {
    const key = q.question.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, 20);
}

// ────────────────────────────────────────────────
// FLASHCARDS
// ────────────────────────────────────────────────

function generateFlashcards(text: string): any[] {
  const defs = extractDefinitions(text);
  const cards: any[] = [];
  const used = new Set<string>();

  // Strategy 1: Use extracted definitions (highest quality)
  for (const d of defs) {
    if (cards.length >= 15) break;
    if (used.has(d.term.toLowerCase())) continue;

    // Quality check: back must be a real explanation, not a fragment
    const back = d.definition.trim();
    if (back.length < 30) continue; // Too short — fragment like "some state"
    const wordCount = back.split(/\s+/).filter(w => w.length > 2).length;
    if (wordCount < 5) continue; // Needs at least 5 real words

    used.add(d.term.toLowerCase());
    cards.push({ front: d.term, back });
  }

  // Strategy 2: Find important terms with DEFINITIONAL context sentences
  if (cards.length < 10) {
    const doc = nlp(text);
    const nouns = doc.nouns().unique().out('array') as string[];
    const sents = doc.sentences().out('array') as string[];

    // Prefer sentences that define/explain the term
    const definitionalVerbs = [' is a ', ' is an ', ' is the ', ' refers to ', ' means ', ' is used to ', ' is used for ', ' can be defined as ', ' represents ', ' provides '];

    for (const noun of nouns.filter((n: string) => n.length > 4 && !used.has(n.toLowerCase()) && !isCodeSnippet(n)).slice(0, 30)) {
      if (cards.length >= 15) break;

      // Find the BEST sentence: one that DEFINES the noun, not just mentions it
      const ctx = sents.find((s: string) => {
        const lower = s.toLowerCase();
        if (!lower.includes(noun.toLowerCase())) return false;
        if (!isCleanSentence(s)) return false;
        // Must contain a definitional verb — ensures the sentence explains WHAT the term is
        return definitionalVerbs.some(v => lower.includes(v));
      });

      if (ctx) {
        const back = ctx.trim().slice(0, 200);
        // Quality check
        if (back.length < 30) continue;
        const wordCount = back.split(/\s+/).filter(w => w.length > 2).length;
        if (wordCount < 5) continue;

        used.add(noun.toLowerCase());
        cards.push({ front: noun.charAt(0).toUpperCase() + noun.slice(1), back });
      }
    }
  }
  return cards;
}

// ────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────

/**
 * Create a false version of a true statement by negating it or swapping terms
 */
function falsifyStatement(fact: string): string | null {
  // Strategy 1: Negate "is" → "is not", "can" → "cannot"
  if (fact.includes(' is ') && !fact.includes(' is not ')) {
    return fact.replace(/\bis\b/, 'is not');
  }
  if (fact.includes(' can ') && !fact.includes(' cannot ')) {
    return fact.replace(/\bcan\b/, 'cannot');
  }
  if (fact.includes(' are ') && !fact.includes(' are not ')) {
    return fact.replace(/\bare\b/, 'are not');
  }
  if (fact.includes(' supports ')) {
    return fact.replace('supports', 'does not support');
  }
  if (fact.includes(' allows ')) {
    return fact.replace('allows', 'does not allow');
  }
  if (fact.includes(' enables ')) {
    return fact.replace('enables', 'does not enable');
  }
  // Strategy 2: Swap "does not" → remove "not"
  if (fact.includes(' does not ')) {
    return fact.replace(' does not ', ' does ');
  }
  if (fact.includes(' cannot ')) {
    return fact.replace(' cannot ', ' can ');
  }
  if (fact.includes(' is not ')) {
    return fact.replace(' is not ', ' is ');
  }
  return null;
}

function extractMeaningfulTerms(text: string): string[] {
  const doc = nlp(text);
  const nouns = doc.nouns().unique().out('array') as string[];
  const stop = new Set([
    'example', 'case', 'way', 'time', 'thing', 'part', 'end',
    'line', 'code', 'file', 'page', 'section', 'chapter', 'figure',
    'table', 'number', 'value', 'result', 'output', 'input', 'data',
    'the', 'this', 'that', 'it', 'they', 'we', 'you', 'note', 'program',
  ]);
  return nouns.filter((n: string) => n.length > 3 && !stop.has(n.toLowerCase()) && !isCodeSnippet(n)).map((n: string) => n.trim());
}

/**
 * Skill Gap Analysis
 */
export async function analyzeSkillGap(resumeText: string, jobDescription: string) {
  try {
    const rDoc = nlp(resumeText);
    const jDoc = nlp(jobDescription);
    const rSkills = rDoc.nouns().out('array') as string[];
    const jSkills = jDoc.nouns().out('array') as string[];
    const matches = jSkills.filter((s: string) => rSkills.some((rs: string) => rs.toLowerCase() === s.toLowerCase()));
    return {
      matchPercentage: Math.round((matches.length / (jSkills.length || 1)) * 100),
      matches: Array.from(new Set(matches)),
      gaps: Array.from(new Set(jSkills.filter((s: string) => !matches.includes(s)).slice(0, 10))),
      recommendations: "Focus on strengthening the identified skill gaps.",
    };
  } catch (error) {
    return { matchPercentage: 0, matches: [], gaps: [], recommendations: "Analysis failed." };
  }
}
