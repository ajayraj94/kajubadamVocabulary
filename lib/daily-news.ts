import fs from "fs";
import path from "path";
import matter from "gray-matter";

// ── FAQ Item Type ──

export interface FaqItem {
    q: string;
    a: string;
}

// ── Directory ──
const dailyNewsDirectory = path.join(process.cwd(), "content", "daily-news");

// ── Types ──

export type SectionType =
    // Old format
    | "error-detection"
    | "sentence-improvement"
    | "para-jumbles"
    | "fill-blanks"
    | "synonyms"
    | "antonyms"
    | "collocation"
    | "reading-comprehension"
    // New Super Mock format
    | "context-vocabulary-shifts"
    | "advanced-spotting-error"
    | "triple-sentence-fillers"
    | "fragment-completion"
    | "advanced-cloze-test"
    | "advanced-para-jumbles"
    | "collocations-fixed-prepositions"
    | "active-passive-voice"
    | "direct-indirect-speech";

const SECTION_TYPE_MAP: Record<string, SectionType> = {
    "1": "error-detection",
    "2": "sentence-improvement",
    "3": "para-jumbles",
    "4": "fill-blanks",
    "5": "synonyms",
    "6": "antonyms",
    "7": "collocation",
    "8": "reading-comprehension",
};

const NEW_SECTION_TYPE_MAP: Record<string, SectionType> = {
    "1": "context-vocabulary-shifts",
    "2": "advanced-spotting-error",
    "3": "triple-sentence-fillers",
    "4": "fragment-completion",
    "5": "advanced-cloze-test",
    "6": "advanced-para-jumbles",
    "7": "collocations-fixed-prepositions",
    "8": "active-passive-voice",
    "9": "direct-indirect-speech",
};

export interface DailyNewsMeta {
    slug: string;
    date: string;
    title: string;
    source: string;
    questionCount: number;
}

export interface DailyNewsQuestion {
    id: number; // 1-5 (local to section) or global
    stem: string;
    options: string[];
    correctAnswer: string; // "A", "B", "C", "D", or "E"
    explanation: string;
    sectionContext?: string; // Shared context text (e.g., para jumble sentences A-F)
}

export interface DailyNewsSection {
    type: SectionType;
    typeName: string;
    number: number; // 1-8
    questions: DailyNewsQuestion[];
}

export interface EditorialParagraph {
    english: string;
    hindi: string;
}

export interface DailyNewsArticle {
    slug: string;
    date: string;
    title: string;
    source: string;
    editorialParagraphs: EditorialParagraph[];
    editorialEnglish: string;
    editorialHindi: string;
    sections: DailyNewsSection[];
    faqItems: FaqItem[];
    vocabRawMarkdown: string;
    keepLearningMarkdown: string;
}

// ── Cache (only in production; dev always reads fresh from disk) ──

interface CachedArticle {
    slug: string;
    date: string;
    title: string;
    source: string;
    content: string;
}

const IS_DEV = process.env.NODE_ENV !== "production";
let cache: CachedArticle[] | null = null;

function loadAllRawArticles(): CachedArticle[] {
    if (!IS_DEV && cache) return cache;

    if (!fs.existsSync(dailyNewsDirectory)) {
        if (!IS_DEV) cache = [];
        return [];
    }

    const fileNames = fs.readdirSync(dailyNewsDirectory);
    const articles = fileNames
        .filter((name) => name.endsWith(".md"))
        .map((name) => {
            const fullPath = path.join(dailyNewsDirectory, name);
            const fileContents = fs.readFileSync(fullPath, "utf8");
            const { data, content } = matter(fileContents);

            const slug = name.replace(/\.md$/, "");

            // If frontmatter has aeoDefinition or metaDescription but no date/source,
            // treat as new Super Mock format — use slug as date
            const date = data.date ? normalizeDate(data.date) : normalizeDate(slug);
            const source = data.source || "Daily Editorial Analysis";
            // Extract title: first from frontmatter, then from first # heading in content, else slug
            const firstHeading = content.match(/^#\s+(.+)$/m);
            const title = data.title || (firstHeading ? firstHeading[1].trim() : slug);

            return {
                slug,
                date,
                title,
                source,
                content,
            };
        })
        .sort((a, b) => b.date.localeCompare(a.date)); // newest first

    // Only cache in production
    if (!IS_DEV) cache = articles;
    return articles;
}

// ── Editorial Parser ──

function parseEditorial(lines: string[]): {
    paragraphs: EditorialParagraph[];
    english: string;
    hindi: string;
} {
    const paragraphs: EditorialParagraph[] = [];
    const englishParts: string[] = [];
    const hindiParts: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Detect if line is Hindi (Devanagari characters)
        const hasHindi = /[\u0900-\u097F]/.test(line);

        if (hasHindi) {
            hindiParts.push(line);
            // If we already have an English paragraph without a Hindi partner, pair them
            if (paragraphs.length > 0 && !paragraphs[paragraphs.length - 1].hindi) {
                paragraphs[paragraphs.length - 1] = {
                    ...paragraphs[paragraphs.length - 1],
                    hindi: line,
                };
            } else {
                // Orphan Hindi line - still add
                paragraphs.push({ english: "", hindi: line });
            }
        } else {
            englishParts.push(line);
            paragraphs.push({ english: line, hindi: "" });
        }
    }

    return {
        paragraphs,
        english: englishParts.join("\n\n"),
        hindi: hindiParts.join("\n\n"),
    };
}

// ── Section Question Parser ──

const SECTION_HEADER_REGEX = /^##\s+(\d+)\.\s+(.+)$/;

// ── New format patterns (Super Mock / SEO-optimized) ──

const NEW_SECTION_HEADER_REGEX = /^#{2,3}\s*\S*\s*Section\s+(\d+)[:.)]\s*(.*)$/;
const NEW_ANSWER_MARKER = /(?:\*{0,2}Correct\s*(?:Answer)?\s*[-:–—]\s*\*{0,2}\s*)\(?([A-E])\)?/i;
const QUESTION_HEADER_REGEX = /^#{3,4}\s+Q(\d+)\.\s*(.*)$/;
const OPTION_REGEX = /^([A-E])\)\s*(.*)$/;
const ANSWER_REGEX = /^Ans:\s*([A-E])$/;
const EXPLANATION_REGEX = /^Explanation:\s*(.*)$/;

function isNewFormat(body: string): boolean {
    return /^#{2,3}\s+[^\n]*?Section\s+\d+\s*[:.)]/im.test(body);
}

function parseNewFormatEditorial(body: string): string[] {
    // Editorial content is everything before the first section header
    const secMatch = body.match(/^#{2,3}\s+[^\n]*?Section\s+\d+\s*[:.)]/m);
    if (!secMatch) return [];
    const editorialText = body.substring(0, secMatch.index).trim();
    const lines = editorialText.split('\n');
    // Stop at the first standalone '---' (frontmatter separator)
    // This keeps only the actual editorial text and avoids YAML/intro noise
    const result: string[] = [];
    for (const line of lines) {
        if (line.trim() === '---') break;
        result.push(line);
    }
    return result;
}

// ── Clean markdown artifacts from explanation text ──

function cleanMarkdown(text: string): string {
    if (!text) return "";
    return text
        .split("\n")
        .map((line) => {
            let l = line;
            // Remove bold labels like **Reasoning:** or **Correct - X** etc.
            l = l.replace(/^\*{0,2}(?:Reasoning|Correct(?:\s*-\s*[A-E])?)\s*[-:]*\*{0,2}\s*/i, "");
            // Remove blockquote prefix (> ) and optional [!TAG]
            l = l.replace(/^>\s*(\[!\w+\])?\s*/, "");
            // Remove HTML tags used in markdown
            l = l.replace(/<\/?details>/gi, "");
            l = l.replace(/<\/?summary>/gi, "");
            l = l.replace(/<\/?b>/gi, "");
            l = l.replace(/<br\s*\/?>/gi, "");
            // Remove horizontal rules (---, ***, ___) and table separators (|---|---|)
            if (/^[-*_]{3,}\s*$/.test(l.trim())) return "";
            if (/^\|?[-:| ]+\|[-:| ]+(\|[-:| ]+)*$/.test(l.trim())) return "";
            // Remove markdown headers (###, ####, etc.)
            l = l.replace(/^#{1,6}\s+/, "");
            // Remove leading list markers (•, -, *, etc.)
            l = l.replace(/^[•●○▪➢]\s*/, "");
            return l;
        })
        .filter((line) => line.trim())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function parseNewFormatSections(body: string): DailyNewsSection[] {
    const sections: DailyNewsSection[] = [];

    // Find all section header positions
    const sectionStarts: Array<{ index: number; num: string; name: string }> = [];
    let secMatch: RegExpExecArray | null;
    const secRe = new RegExp(NEW_SECTION_HEADER_REGEX.source, "gm");
    while ((secMatch = secRe.exec(body)) !== null) {
        sectionStarts.push({
            index: secMatch.index,
            num: secMatch[1],
            name: secMatch[2].trim() || `Section ${secMatch[1]}`,
        });
    }

    for (let s = 0; s < sectionStarts.length; s++) {
        const { num: secNum, name: secName, index: secIndex } = sectionStarts[s];
        const nextSecIndex = s + 1 < sectionStarts.length ? sectionStarts[s + 1].index : body.length;
        let secContent = body.substring(secIndex, nextSecIndex);

        // ── Truncate section content at any non-section ## heading ──
        // This prevents content outside the section (e.g., ## ❓ Frequently Asked Questions)
        // from being incorrectly parsed as questions within this section
        const secHeaderEnd = secContent.indexOf('\n');
        if (secHeaderEnd > 0) {
            const afterHeader = secContent.substring(secHeaderEnd + 1);
            // Match ## NOT followed by # (i.e., not ###) — catches standalone level-2 headings
            const secondaryHeadingMatch = afterHeader.match(/^##(?!#)\s+.+$/m);
            if (secondaryHeadingMatch) {
                secContent = secContent.substring(0, secHeaderEnd + 1 + secondaryHeadingMatch.index);
            }
        }

        let sectionType = NEW_SECTION_TYPE_MAP[secNum];
        if (!sectionType) continue;

        // Override section type by name when numeric mapping doesn't match content
        const nameLower = secName.toLowerCase();
        if (nameLower.includes('reading comprehension') || nameLower.includes('inference')) {
            sectionType = "reading-comprehension";
        } else if (nameLower.includes('collocation') || nameLower.includes('fixed preposition')) {
            sectionType = "collocations-fixed-prepositions";
        } else if (nameLower.includes('para jumble') || nameLower.includes('sentence rearrangement')) {
            sectionType = "advanced-para-jumbles";
        } else if (nameLower.includes('active') || nameLower.includes('passive') || nameLower.includes('voice')) {
            sectionType = "active-passive-voice";
        } else if (nameLower.includes('direct') || nameLower.includes('indirect') || nameLower.includes('narration') || nameLower.includes('speech')) {
            sectionType = "direct-indirect-speech";
        }

        const section: DailyNewsSection = {
            type: sectionType,
            typeName: secName,
            number: parseInt(secNum),
            questions: [],
        };

        // Find all question positions within this section
        const qStarts: Array<{ index: number; num: number; name: string }> = [];
        let qMatch: RegExpExecArray | null;
        const qRe = /^#{3,4}\s+Q(\d+)\.\s*(.*)$/gm;
        while ((qMatch = qRe.exec(secContent)) !== null) {
            qStarts.push({
                index: qMatch.index,
                num: parseInt(qMatch[1]),
                name: qMatch[2].trim(),
            });
        }

        for (let q = 0; q < qStarts.length; q++) {
            const { num: qNum, name: qName, index: qIndex } = qStarts[q];
            const nextQIndex = q + 1 < qStarts.length ? qStarts[q + 1].index : secContent.length;
            const qContent = secContent.substring(qIndex, nextQIndex);

            // Extract options: (A), (B), etc.
            const options: string[] = [];
            const optRe = /^\(([A-E])\)\s*(.*)$/gm;
            let optMatch: RegExpExecArray | null;
            while ((optMatch = optRe.exec(qContent)) !== null) {
                options.push(optMatch[2].trim());
            }

            // If no options found with (A) format, try A) format
            if (options.length === 0) {
                const oldOptRe = /^([A-E]\))\s*(.*)$/gm;
                let oldOptMatch: RegExpExecArray | null;
                while ((oldOptMatch = oldOptRe.exec(qContent)) !== null) {
                    options.push(oldOptMatch[2].trim());
                }
            }

            // Extract correct answer
            let correctAnswer = "";
            const ansMatch = qContent.match(NEW_ANSWER_MARKER);
            if (ansMatch) {
                correctAnswer = ansMatch[1];
            } else {
                const oldAns = qContent.match(ANSWER_REGEX);
                if (oldAns) {
                    correctAnswer = oldAns[1];
                }
            }

            // Extract explanation (everything after the answer line)
            let explanation = "";
            const ansLineIdx = qContent.search(/(?:\*{0,2}Correct\s*(?:Answer)?\s*[-:–—][^\n]*)/i);
            if (ansLineIdx >= 0) {
                const lineEnd = qContent.indexOf("\n", ansLineIdx);
                const afterAns = lineEnd >= 0 ? qContent.substring(lineEnd + 1) : "";
                explanation = afterAns
                    .replace(/^[\s\-—=*]+/, "")
                    .replace(/\n{3,}/g, "\n\n")
                    .trim();
                // Strip markdown block formatting for clean display
                explanation = cleanMarkdown(explanation);
            }

            // Extract full question stem (text between Q header and options/answer)
            let stem = qName || `Question ${qNum}`;
            // Try to find the question body start: **Question:** or **Sentences:**
            const questionBodyStart = qContent.search(/^\*{0,2}(?:Question|Sentences)\*{0,2}:?\*{0,2}/m);
            // Try to find the options start: **Options ... :** or **Options**
            const questionBodyEnd = qContent.search(/^\*{0,2}Options(?:\s+\([^)]*\))?\*{0,2}:?\*{0,2}\s*$/m);
            if (questionBodyStart >= 0 && questionBodyEnd > questionBodyStart) {
                const nlIdx = qContent.indexOf("\n", questionBodyStart);
                const rawBody = nlIdx >= 0
                    ? qContent.substring(nlIdx + 1, questionBodyEnd).trim()
                    : qContent.substring(questionBodyStart, questionBodyEnd).trim();
                if (rawBody) {
                    // Clean markdown list markers (*) from each line — no truncation
                    stem = rawBody
                        .split('\n')
                        .map(line => line.replace(/^\s*\*\s+/, '').trim())
                        .filter(Boolean)
                        .join('\n');
                }
            }

            section.questions.push({
                id: qNum,
                stem,
                options,
                correctAnswer,
                explanation,
            });
        }

        // Extract shared context — text between section header and first question
        // (used for para jumbles, shared reading passages, etc.)
        let sectionContext = '';
        if (qStarts.length > 0) {
            const secHeaderEnd = secContent.indexOf('\n');
            const firstQStart = qStarts[0].index;
            if (firstQStart > secHeaderEnd + 1) {
                const raw = secContent.substring(secHeaderEnd + 1, firstQStart).trim();
                if (raw) {
                    // Clean markdown: remove blockquote prefixes, HTML tags, headings
                    sectionContext = raw
                        .split('\n')
                        .map(l => l.replace(/^>\s*(\[!\w+\])?\s*/, '').trim())
                        .filter(l => l && !/^#{1,6}\s/.test(l) && !/^---/.test(l) && !l.startsWith('<') && !l.endsWith('>'))
                        .join('\n')
                        .replace(/\n{3,}/g, '\n\n')
                        .trim();
                    // Clean hyphen range notations like "Q11-Q15" → "Q11–Q15" (en dash)
                    sectionContext = sectionContext.replace(/(Q\d+)-(Q\d+)/g, '$1–$2');
                }
            }
        }

        if (sectionContext) {
            section.questions = section.questions.map(q => ({ ...q, sectionContext }));
        }

        if (section.questions.length > 0) {
            sections.push(section);
        }
    }

    return sections;
}

function parseSections(body: string): DailyNewsSection[] {
    const sections: DailyNewsSection[] = [];
    const fullLines = body.split("\n");

    let currentSection: DailyNewsSection | null = null;
    let currentQuestion: DailyNewsQuestion | null = null;
    let collectingExplanation = false;

    for (let i = 0; i < fullLines.length; i++) {
        const rawLine = fullLines[i];
        const trimmed = rawLine.trim();

        // Skip editorial section
        if (trimmed === "## Editorial" || trimmed === "## Editorial ") {
            continue;
        }

        // Check for section header: ## 1. Error Detection
        const sectionMatch = trimmed.match(SECTION_HEADER_REGEX);
        if (sectionMatch) {
            // Save previous question if any
            if (currentQuestion && currentSection) {
                currentSection.questions.push(currentQuestion);
                currentQuestion = null;
            }
            collectingExplanation = false;

            const sectionNumber = sectionMatch[1];
            const typeName = sectionMatch[2].trim();
            const sectionType = SECTION_TYPE_MAP[sectionNumber];

            if (sectionType) {
                currentSection = {
                    type: sectionType,
                    typeName,
                    number: parseInt(sectionNumber),
                    questions: [],
                };
                sections.push(currentSection);
            }
            continue;
        }

        if (!currentSection) continue;

        // Check for question header: ### Q1. ...
        const qMatch = trimmed.match(QUESTION_HEADER_REGEX);
        if (qMatch) {
            // Save previous question
            if (currentQuestion) {
                currentSection.questions.push(currentQuestion);
            }

            collectingExplanation = false;

            currentQuestion = {
                id: parseInt(qMatch[1]),
                stem: qMatch[2].trim(),
                options: [],
                correctAnswer: "",
                explanation: "",
            };
            continue;
        }

        if (!currentQuestion) continue;

        // Check for option line: A) ...
        const optMatch = trimmed.match(OPTION_REGEX);
        if (optMatch) {
            collectingExplanation = false;
            // Format: "Option text" 
            currentQuestion.options.push(optMatch[2].trim());
            continue;
        }

        // Check for answer: Ans: B
        const ansMatch = trimmed.match(ANSWER_REGEX);
        if (ansMatch) {
            collectingExplanation = false;
            currentQuestion.correctAnswer = ansMatch[1];
            continue;
        }

        // Check for explanation: Explanation: ...
        const expMatch = trimmed.match(EXPLANATION_REGEX);
        if (expMatch) {
            collectingExplanation = true;
            currentQuestion.explanation = expMatch[1].trim();
            continue;
        }

        // Continuation of explanation (indented or continuation lines)
        if (collectingExplanation && trimmed) {
            currentQuestion.explanation += " " + trimmed;
            continue;
        }

        // Reset explanation collection on empty lines or new sections
        if (!trimmed) {
            collectingExplanation = false;
        }
    }

    // Save last question
    if (currentQuestion && currentSection) {
        currentSection.questions.push(currentQuestion);
    }

    return sections;
}

// ── Date normalization ──

function normalizeDate(dateStr: string): string {
    // Handle DD-MM-YYYY format → YYYY-MM-DD
    const dmyMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (dmyMatch) {
        return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
    }
    return dateStr;
}

// ── Public API ──

export function getAllDailyNews(): DailyNewsMeta[] {
    const articles = loadAllRawArticles();
    return articles.map((a) => ({
        slug: a.slug,
        date: a.date,
        title: a.title,
        source: a.source,
        // Count questions: new format uses #### Q (4 hashes), old format uses ### Q (3 hashes)
        // This avoids counting FAQ questions (which also use ### Q)
        questionCount: isNewFormat(a.content)
            ? (a.content.match(/^####\s+Q\d+\./gm) || []).length
            : (a.content.match(/^###\s+Q\d+\./gm) || []).length,
    }));
}

export function getDailyNewsArticle(slug: string): DailyNewsArticle | null {
    const articles = loadAllRawArticles();
    const matched = articles.find((a) => a.slug === slug);
    if (!matched) return null;

    const body = matched.content;
    const isNew = isNewFormat(body);

    let sections: DailyNewsSection[];
    let editorialLines: string[];

    if (isNew) {
        sections = parseNewFormatSections(body);
        editorialLines = parseNewFormatEditorial(body);
    } else {
        sections = parseSections(body);

        // Extract editorial from the body manually (old format)
        editorialLines = [];
        const lines = body.split("\n");
        let inEditorial = false;

        for (const rawLine of lines) {
            const trimmed = rawLine.trim();
            if (trimmed === "## Editorial") {
                inEditorial = true;
                continue;
            }
            if (inEditorial) {
                // Stop at next section
                if (SECTION_HEADER_REGEX.test(trimmed)) break;
                editorialLines.push(rawLine);
            }
        }
    }

    const faqItems = extractFaqItems(body);
    const vocabRawMarkdown = extractVocabSection(body);
    const keepLearningMarkdown = extractKeepLearning(body);

    const { paragraphs, english, hindi } = parseEditorial(editorialLines);

    return {
        slug: matched.slug,
        date: matched.date,
        title: matched.title,
        source: matched.source,
        editorialParagraphs: paragraphs,
        editorialEnglish: english,
        editorialHindi: hindi,
        sections,
        faqItems,
        vocabRawMarkdown,
        keepLearningMarkdown,
    };
}

export function getDailyNewsSection(
    slug: string,
    sectionType: SectionType
): DailyNewsSection | null {
    const article = getDailyNewsArticle(slug);
    if (!article) return null;
    return article.sections.find((s) => s.type === sectionType) || null;
}

// ── Vocab Section Extractor ──
// Captures the raw markdown of "##  What are the most important vocabulary words from this editorial?"
// and its following table, everything between Q45 and the FAQ section.
function extractVocabSection(body: string): string {
    // Look for the vocab heading after Q45 and before FAQ
    const vocabMatch = body.match(/^##\s+What are the most important vocabulary words from this editorials?\?$/im);
    if (!vocabMatch) return '';

    const startIdx = vocabMatch.index!;

    // Find the first newline after the vocab heading, then search for next ## heading
    const afterVocabLine = body.indexOf('\n', startIdx);
    if (afterVocabLine < 0) return '';
    const afterVocab = body.substring(afterVocabLine + 1);
    const nextHeading = afterVocab.match(/^##(?!#)\s+.+$/m);
    const endIdx = nextHeading
        ? afterVocabLine + 1 + nextHeading.index!
        : body.length;

    // Return the raw markdown content from vocab heading to before FAQ
    let raw = body.substring(startIdx, endIdx).trim();

    // Also strip trailing whitespace / extra newlines
    raw = raw.replace(/\n{3,}/g, '\n\n').trim();
    return raw;
}

// ── FAQ Parser ──

function extractFaqItems(body: string): FaqItem[] {
    const items: FaqItem[] = [];

    // Find FAQ section header: ## ❓ Frequently Asked Questions (FAQ)
    const faqSectionMatch = body.match(/^## ❓ Frequently Asked Questions \(FAQ\)$/m);
    if (!faqSectionMatch) return items;

    const faqStart = faqSectionMatch.index! + faqSectionMatch[0].length;

    // Find where FAQ section ends — next ## heading that's not ###
    const afterFaq = body.substring(faqStart);
    const nextHeadingMatch = afterFaq.match(/^##(?!#)\s+/m);
    const faqEnd = nextHeadingMatch
        ? faqStart + nextHeadingMatch.index!
        : body.length;

    const faqContent = body.substring(faqStart, faqEnd);

    // Parse individual Q&A from: ### Q<num>. <question> ... **Answer:** <text>
    const qRe = /^### Q(\d+)\.\s*(.*)$/gm;
    let match: RegExpExecArray | null;
    while ((match = qRe.exec(faqContent)) !== null) {
        const questionText = match[2].trim();

        // Find the answer for this question
        const qStartInFaq = match.index;
        const remainingAfterQ = faqContent.substring(qStartInFaq);
        const answerMarkerMatch = remainingAfterQ.match(/\*\*Answer:\*\*\s*/);
        if (!answerMarkerMatch) {
            items.push({ q: questionText, a: '' });
            continue;
        }

        const answerStart = qStartInFaq + answerMarkerMatch.index! + answerMarkerMatch[0].length;

        // Find next question or end of FAQ content
        const nextQMatch = faqContent.substring(answerStart).match(/^### Q\d+\./m);
        const answerEnd = nextQMatch
            ? answerStart + nextQMatch.index!
            : faqContent.length;

        const answerText = faqContent.substring(answerStart, answerEnd).trim();
        items.push({ q: questionText, a: answerText });
    }

    return items;
}

// ── Keep Learning Extractor ──
// Captures the "### 🎓 Keep Learning with kajubadamvocabulary.in" section
function extractKeepLearning(body: string): string {
    const match = body.match(/^#{1,3}\s+🎓\s*Keep Learning with kajubadamvocabulary\.in[.!]?\s*$/im);
    if (!match) return '';

    const startIdx = match.index!;
    const afterLine = body.indexOf('\n', startIdx);
    if (afterLine < 0) return '';

    // Everything from the heading to end of file
    let raw = body.substring(startIdx).trim();
    return raw;
}

// ── Total question count helper ──
export function getDailyNewsQuestionCount(slug: string): number {
    const article = getDailyNewsArticle(slug);
    if (!article) return 0;
    return article.sections.reduce(
        (total, section) => total + section.questions.length,
        0
    );
}