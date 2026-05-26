import fs from "fs";
import path from "path";

// ── Types ──

export interface ErrorDetectionQuestion {
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

export interface ErrorDetectionData {
  slug: string;
  title: string;
  totalQuestions: number;
  questions: ErrorDetectionQuestion[];
}

// ── File path ──

const filePath = path.join(
  process.cwd(),
  "content",
  "error-detection",
  "SSC Error Detection 716 PYQ.md"
);

// ── Module-level cache ──

let cached: ErrorDetectionData | null = null;

export function clearCache(): void {
  cached = null;
}

// ── Parsers ──

function parseOptions(optionsBlock: string): string[] {
  const options: string[] = [];
  const lines = optionsBlock.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const match = line.match(/^\(([A-D])\)\s*(.*)$/);
    if (match) {
      options.push(match[2].trim());
    }
  }
  return options;
}

/**
 * Parse the full 716-question markdown file into structured data.
 */
export function getErrorDetectionData(): ErrorDetectionData {
  if (cached) return cached;

  const content = fs.readFileSync(filePath, "utf8");

  // Split by question headers (### Q.X.)
  const rawBlocks = content.split(/(?=^### Q\.)/m);

  const questions: ErrorDetectionQuestion[] = [];

  // Track seen IDs to deduplicate
  const seenIds = new Set<number>();

  for (const block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Parse header: ### Q.1. TITLE
    const headerMatch = trimmed.match(/^### Q\.(\d+)\.\s*(.*?)$/m);
    if (!headerMatch) continue;

    const id = parseInt(headerMatch[1], 10);
    const title = headerMatch[2].trim();

    // Parse exam info (next line after header)
    const lines = trimmed.split("\n").map((l) => l.trim());
    let examInfo = "";
    let questionText = "";
    const options: string[] = [];
    let correctAnswer = "";
    let incorrectPart = "";
    let correctReplacement = "";

    // Find exam info (second line after header, usually with SSC/ exam name)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // First line with SSC or exam name after the header
      if (
        line.startsWith("📚") ||
        line.startsWith("*(") ||
        (line.includes("SSC") && !line.startsWith("###") && !line.startsWith("**Question"))
      ) {
        examInfo = line.replace(/^📚\s*/, "");
        break;
      }
    }

    // Parse question text
    const questionMatch = trimmed.match(/\*\*Question:\*\*\s*"([^"]+)"/);
    if (questionMatch) {
      questionText = questionMatch[1].trim();
    }

    // Parse options
    const optionsMatch = trimmed.match(/\*\*Options:\*\*\s*([\s\S]*?)(?:\n-{3,}|\n###|$)/);
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

    // Parse correct answer
    const answerMatch = trimmed.match(/🟢\s*\*\*Correct Answer:\s*\(([A-D])\)/);
    if (answerMatch) {
      correctAnswer = answerMatch[1];
    }

    // Parse incorrect part
    const incorrectMatch = trimmed.match(/❌\s*\*\*Incorrect Part:\*\*\s*(.*?)(?:\n|$)/);
    if (incorrectMatch) {
      incorrectPart = incorrectMatch[1].trim();
    }

    // Parse correct replacement
    const replacementMatch = trimmed.match(/✔️\s*\*\*Correct Replacement:\*\*\s*(.*?)(?:\n|$)/);
    if (replacementMatch) {
      correctReplacement = replacementMatch[1].trim();
    }

    // Full explanation: everything from the answer section to the end of the block
    // Start from the line after the options
    let explanationStart = false;
    let explanationLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("🟢") || line.startsWith("---")) {
        if (line.startsWith("🟢")) {
          explanationStart = true;
        }
        if (explanationStart) {
          explanationLines.push(line);
        }
        continue;
      }
      if (explanationStart) {
        explanationLines.push(line);
      }
    }

    const fullExplanation = explanationLines.join("\n");

    // Deduplicate: if we've already seen this ID, skip it
    if (seenIds.has(id)) continue;
    seenIds.add(id);

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

  const result: ErrorDetectionData = {
    slug: "ssc-error-detection-716-pyq",
    title: "SSC Error Detection 716 PYQ",
    totalQuestions: questions.length,
    questions,
  };

  cached = result;
  return result;
}

/**
 * Get a specific page of questions (50 per page for 10×5 palette)
 */
export function getErrorDetectionPage(
  page: number,
  pageSize: number = 50
): { questions: ErrorDetectionQuestion[]; page: number; totalPages: number } {
  const data = getErrorDetectionData();
  const totalPages = Math.ceil(data.totalQuestions / pageSize);
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, data.totalQuestions);
  return {
    questions: data.questions.slice(start, end),
    page,
    totalPages,
  };
}
