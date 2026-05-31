import fs from "fs";
import path from "path";
import matter from "gray-matter";

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
    | "collocations-fixed-prepositions";

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
    "8": "reading-comprehension",
};

export interface DailyNewsMeta {
    slug: string;
    date: string;
    title: string;
    source: string;
}

export interface DailyNewsQuestion {
    id: number; // 1-5 (local to section) or global
    stem: string;
    options: string[];
    correctAnswer: string; // "A", "B", "C", "D", or "E"
    explanation: string;
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
                        const date = data.date || slug;
            const source = data.source || "Daily Editorial Analysis";
            const title = data.title || slug;

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

const NEW_SECTION_HEADER_REGEX = /^##\s*\S*\s*Section\s+(\d+)[:.)]\s*(.*)$/;
const NEW_ANSWER_MARKER = /(?:🟢\s*)?\*{0,2}Correct Answer:\s*\(?([A-E])\)?/i;
const QUESTION_HEADER_REGEX = /^###\s+Q(\d+)\.\s*(.*)$/;
const OPTION_REGEX = /^([A-E])\)\s*(.*)$/;
const ANSWER_REGEX = /^Ans:\s*([A-E])$/;
const EXPLANATION_REGEX = /^Explanation:\s*(.*)$/;

function isNewFormat(body: string): boolean {
    return /^##\s+[^\n]*?Section\s+\d+\s*[:.)]/im.test(body);
}

function parseNewFormatEditorial(body: string): string[] {
    // Editorial content is everything before the first section header
    const secMatch = body.match(/^##\s+[^\n]*?Section\s+\d+\s*[:.)]/m);
    if (!secMatch) return [];
    const editorialText = body.substring(0, secMatch.index).trim();
    return editorialText ? [editorialText] : [];
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
        const secContent = body.substring(secIndex, nextSecIndex);

        const sectionType = NEW_SECTION_TYPE_MAP[secNum];
        if (!sectionType) continue;

        const section: DailyNewsSection = {
            type: sectionType,
            typeName: secName,
            number: parseInt(secNum),
            questions: [],
        };

        // Find all question positions within this section
        const qStarts: Array<{ index: number; num: number; name: string }> = [];
        let qMatch: RegExpExecArray | null;
        const qRe = /^###\s+Q(\d+)\.\s*(.*)$/gm;
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
            const ansLineIdx = qContent.search(/(?:🟢\s*)?\*{0,2}Correct Answer:[^\n]*/i);
            if (ansLineIdx >= 0) {
                const lineEnd = qContent.indexOf("\n", ansLineIdx);
                const afterAns = lineEnd >= 0 ? qContent.substring(lineEnd + 1) : "";
                explanation = afterAns
                    .replace(/^[\s\-—=*]+/, "")
                    .replace(/\n{3,}/g, "\n\n")
                    .trim()
                    .substring(0, 2000);
            }

            // Extract full question stem (text between Q header and options/answer)
            let stem = qName || `Question ${qNum}`;
            const questionBodyEnd = qContent.search(/^\*{0,2}Options\*{0,2}:?\*{0,2}\s*$/m);
            const questionBodyStart = qContent.search(/^\*{0,2}Question\*{0,2}:?\*{0,2}\s*$/m);
            if (questionBodyStart >= 0 && questionBodyEnd > questionBodyStart) {
                const nlIdx = qContent.indexOf("\n", questionBodyStart);
                const rawBody = nlIdx >= 0
                    ? qContent.substring(nlIdx + 1, questionBodyEnd).trim()
                    : qContent.substring(questionBodyStart, questionBodyEnd).trim();
                if (rawBody) {
                    stem = rawBody.substring(0, 600);
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

// ── Public API ──

export function getAllDailyNews(): DailyNewsMeta[] {
    const articles = loadAllRawArticles();
    return articles.map((a) => ({
        slug: a.slug,
        date: a.date,
        title: a.title,
        source: a.source,
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

// ── Total question count helper ──
export function getDailyNewsQuestionCount(slug: string): number {
    const article = getDailyNewsArticle(slug);
    if (!article) return 0;
    return article.sections.reduce(
        (total, section) => total + section.questions.length,
        0
    );
}