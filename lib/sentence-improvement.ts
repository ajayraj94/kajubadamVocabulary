import fs from "fs";
import path from "path";

// ── Types ──

export interface SentenceImprovementQuestion {
  id: number;
  title: string;
  examInfo: string;
  questionText: string;
  options: string[];
  correctAnswer: string; // "A", "B", "C", or "D"
  incorrectPart: string;
  correctReplacement: string;
  fullExplanation: string; // Full explanation markdown (all sections)
}

export interface SentenceImprovementData {
  slug: string;
  title: string;
  totalQuestions: number;
  questions: SentenceImprovementQuestion[];
}

// ── File path ──

const filePath = path.join(
  process.cwd(),
  "content",
  "Sentence-Improvement",
  "SSC Sentence Improvement  790 PYQ.md"
);

// ── Module-level cache ──

let cached: SentenceImprovementData | null = null;

export function clearCache(): void {
  cached = null;
}

// ── Parser helpers ──

/**
 * Parse the full 790-question markdown file into structured data.
 */
export function getSentenceImprovementData(): SentenceImprovementData {
  if (cached) return cached;

  const content = fs.readFileSync(filePath, "utf8");

  // Split by question headers (### Q.X.)
  const rawBlocks = content.split(/(?=^### Q\.)/m);

  const questions: SentenceImprovementQuestion[] = [];

  // Track seen IDs to deduplicate
  const seenIds = new Set<number>();

  for (const block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Parse header: ### Q.1. [TOPIC] or ### Q.1. TOPIC
    const headerMatch = trimmed.match(/^### Q\.(\d+)\.\s*(.*?)$/m);
    if (!headerMatch) continue;

    const id = parseInt(headerMatch[1], 10);
    const title = headerMatch[2].trim();

    // Parse exam info
    // Usually: 📚 Pinnacle Sentence Improvement
    // Then next line: *(SSC Exam Date - Shift)*
    const lines = trimmed.split("\n").map((l) => l.trim());
    let examInfo = "";
    let questionText = "";

    // Find exam info
    for (const line of lines) {
      if (
        line.startsWith("📚") ||
        (line.startsWith("*(") && line.includes("SSC") && line.endsWith(")*")) ||
        (line.includes("SSC") && !line.startsWith("###") && !line.startsWith("**Question"))
      ) {
        examInfo = line.replace(/^📚\s*/, "").replace(/^\*\(|\)\*$/g, "");
        break;
      }
    }

    // Parse question text
    const questionMatch = trimmed.match(/\*\*Question:\*\*\s*"([^"]+)"/);
    if (questionMatch) {
      questionText = questionMatch[1].trim();
    }

    // Parse options
    const options: string[] = [];
    const optionsMatch = trimmed.match(/\*\*Options:\*\*\s*([\s\S]*?)(?:^-{3,}$|^###|^🟢|^---)/m);
    if (optionsMatch) {
      const optsBlock = optionsMatch[1];
      const optLines = optsBlock.split("\n").map((l) => l.trim()).filter(Boolean);
      for (const line of optLines) {
        const optMatch = line.match(/^\(([A-D])\)\s*(.*)$/);
        if (optMatch) {
          options.push(optMatch[2].trim());
        }
      }
    }

    // Parse correct answer (just the letter)
    // Format: 🟢 **Correct Answer: (B) Full sentence...**
    let correctAnswer = "";
    const answerMatch = trimmed.match(/🟢\s*\*\*Correct Answer:\s*\(([A-D])\)/);
    if (answerMatch) {
      correctAnswer = answerMatch[1];
    } else {
      // Try alternate format: 🟢 **Correct Answer: (B)**
      const altMatch = trimmed.match(/🟢\s*\*\*Correct Answer:\s*\(([A-D])\)\s*\*\*/);
      if (altMatch) {
        correctAnswer = altMatch[1];
      }
    }

    // Parse incorrect part (Original Underlined Part)
    let incorrectPart = "";
    const incorrectMatch = trimmed.match(/❌\s*\*\*Original Underlined Part:\*\*\s*(.*?)(?:\n|$)/);
    if (incorrectMatch) {
      incorrectPart = incorrectMatch[1].trim();
    }

    // Parse correct replacement (Improved/Replacement Part)
    let correctReplacement = "";
    const replacementMatch = trimmed.match(/✔️\s*\*\*Improved\/Replacement Part:\*\*\s*(.*?)(?:\n|$)/);
    if (replacementMatch) {
      correctReplacement = replacementMatch[1].trim();
    }

    // Full explanation: everything from 🟢 to the end of the block (or next ---)
    const answerIdx = trimmed.indexOf("🟢");
    let fullExplanation = "";
    if (answerIdx >= 0) {
      fullExplanation = trimmed.slice(answerIdx).trim();
    }

    // Deduplicate
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    // Skip if no meaningful data
    if (!questionText && options.length === 0 && !correctAnswer) continue;

    questions.push({
      id,
      title,
      examInfo,
      questionText,
      options,
      correctAnswer,
      incorrectPart,
      correctReplacement,
      fullExplanation,
    });
  }

  const result: SentenceImprovementData = {
    slug: "ssc-sentence-improvement-790-pyq",
    title: "SSC Sentence Improvement 790 PYQ",
    totalQuestions: questions.length,
    questions,
  };

  cached = result;
  return result;
}

/**
 * Get a specific page of questions (50 per page for 10×5 palette)
 */
export function getSentenceImprovementPage(
  page: number,
  pageSize: number = 50
): { questions: SentenceImprovementQuestion[]; page: number; totalPages: number } {
  const data = getSentenceImprovementData();
  const totalPages = Math.ceil(data.totalQuestions / pageSize);
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, data.totalQuestions);
  return {
    questions: data.questions.slice(start, end),
    page,
    totalPages,
  };
}
