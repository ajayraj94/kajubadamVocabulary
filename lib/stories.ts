import fs from "fs";
import path from "path";
import matter from "gray-matter";

// Directory where all story .md files live
const storiesDirectory = path.join(process.cwd(), "content", "stories");

// ── Module-level cache: read all files ONCE, reuse everywhere ──
interface CachedStory {
  fileName: string;
  slug: string;
  data: Record<string, any>;
  content: string;
}

let cache: CachedStory[] | null = null;

function loadAllStories(): CachedStory[] {
  if (cache) return cache;

  const fileNames = fs.readdirSync(storiesDirectory);
  cache = fileNames
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const fullPath = path.join(storiesDirectory, name);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      // Derive slug from frontmatter or filename
      let slug = data.slug;
      if (!slug) {
        slug = name
          .replace(/\.md$/, "")
          .toLowerCase()
          .replace(/\s+/g, "-");
      }

      return { fileName: name, slug, data, content };
    });

  return cache;
}

// Invalidate cache (useful for testing / hot reloads)
export function clearCache() {
  cache = null;
}

/**
 * Returns all story slugs for generateStaticParams.
 */
export function getAllStorySlugs(): { slug: string }[] {
  return loadAllStories().map((s) => ({ slug: s.slug }));
}

/**
 * Story summary type returned by getAllStories.
 */
export interface StorySummary {
  slug: string;
  title: string;
  saga_id: string;
  vocab_part: string;
  vocabCount: number;
}

/**
 * Returns the full list of stories with frontmatter metadata.
 * Now uses cache — no redundant file reads.
 */
export function getAllStories(): StorySummary[] {
  return loadAllStories().map((s) => {
    const { data, content } = s;

    // Count vocabulary words same way as getStoryQuiz — only **WORD** _(meaning)_ patterns on English lines
    const VOCAB_REGEX = /\*\*([^*]+)\*\*\s*_?\(([^)]+)\)_?/g;
    const ENGLISH_TOKEN = /^[A-Za-z\s/\-,;:&\'!?\u2014\u2013.]+$/;
    const lines = content.split("\n");
    let vocabCount = 0;
    for (const rawLine of lines) {
      const stripped = rawLine.trim();
      if (stripped.startsWith("## ") && /[✅✔]/.test(stripped)) break;
      if (/^##\s*GROUP/i.test(stripped)) break;
      const enMatches = [...stripped.matchAll(VOCAB_REGEX)]
        .filter((m) => ENGLISH_TOKEN.test(m[1].trim()));
      vocabCount += enMatches.length;
    }

    return {
      slug: s.slug,
      title: data.title || s.fileName.replace(/\.md$/, ""),
      saga_id: data.saga_id || s.fileName.replace(/\.md$/, ""),
      vocab_part:
        data.vocab_part ||
        (s.fileName.startsWith("Saga 1")
          ? "part 1"
          : s.fileName.startsWith("Saga 2")
            ? "part 2"
            : ""),
      vocabCount,
    };
  });
}

export interface VocabQuestion {
  english: string;
  englishMeaning: string;
  hindi: string;
  hindiMeaning: string;
  sentence: string;
  hindiSentence: string;
}

/**
 * Parses vocabulary words and definitions from a story to generate quiz questions.
 * Uses cache instead of scanning all files.
 */
export function getStoryQuiz(slug: string): VocabQuestion[] {
  const stories = loadAllStories();
  const matched = stories.find((s) => s.slug === slug);
  if (!matched) return [];

  const { content } = matched;
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const questions: VocabQuestion[] = [];

  // Regex to match **WORD** _(meaning)_ patterns
  const VOCAB_REGEX = /\*\*([^*]+)\*\*\s*_?\(([^)]+)\)_?/g;
  // Regex to check if a token/word is English (alphabetic + common punctuation)
  const ENGLISH_TOKEN = /^[A-Za-z\s/\-,;:&\'!?\u2014\u2013.]+$/;

  for (let i = 0; i < lines.length; i++) {
    const lineE = lines[i];

    // Stop at word-verification or other sections
    if (lineE.startsWith("## ") && /[✅✔]/.test(lineE)) break;
    if (/^##\s*GROUP/i.test(lineE)) break;

    // Find ALL English bold vocab matches on this line (e.g. "...**ADJURE**_(...)...**ABJURE**_(...)...")
    const enMatches = [...lineE.matchAll(VOCAB_REGEX)]
      .filter((m) => ENGLISH_TOKEN.test(m[1].trim()));
    if (enMatches.length === 0) continue;

    // Find the Hindi line (next non-blank line containing Devanagari)
    let lineH = "";
    let hiIdx = i + 1;
    while (hiIdx < lines.length) {
      const candidate = lines[hiIdx];
      if (/[\u0900-\u097F]/.test(candidate)) { lineH = candidate; break; }
      hiIdx++;
    }

    // Find ALL Hindi bold vocab matches on the Hindi line
    const hiMatches = lineH ? [...lineH.matchAll(VOCAB_REGEX)] : [];

    // Build one question per English match; pair with corresponding Hindi match by index
    for (let j = 0; j < enMatches.length; j++) {
      const english = enMatches[j][1].trim();
      const englishMeaning = enMatches[j][2].trim();

      // Replace only the j-th bold occurrence with "______", leave others intact
      let sentence = lineE;
      let enReplaceCount = 0;
      sentence = sentence.replace(VOCAB_REGEX, (match) => {
        enReplaceCount++;
        return enReplaceCount === j + 1 ? "______" : match;
      }).trim();

      let hindiSentence = "";
      let hindi = "";
      let hindiMeaning = "";

      if (hiMatches.length > j) {
        hindi = hiMatches[j][1].trim();
        hindiMeaning = hiMatches[j][2].trim();

        // Replace only the j-th bold occurrence in Hindi line
        let hiReplaceCount = 0;
        hindiSentence = lineH.replace(VOCAB_REGEX, (match) => {
          hiReplaceCount++;
          return hiReplaceCount === j + 1 ? "______" : match;
        }).trim();
      }

      questions.push({ english, englishMeaning, hindi, hindiMeaning, sentence, hindiSentence });
    }

    // Skip the Hindi line if we consumed it
    if (lineH && hiIdx > i + 1) { i = hiIdx; }
    else if (lineH) { i++; }
  }

  return questions;
}

// ── Styled HTML Formatter ──────────────────────────────────────────────────

/**
 * The CSS style string for highlighted vocabulary words.
 */
const VOCAB_STYLE =
  "font-weight: bold; color: #0B5394; background-color: #E8F0FE; padding: 2px 4px; border-radius: 3px;";

/**
 * The CSS style string for italicized meanings.
 */
const MEANING_STYLE = "font-style: italic; color: #555555;";

/**
 * The base paragraph style for story content.
 */
const PARA_BASE_STYLE =
  "font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px; color: #333333; line-height: 1.5;";

/**
 * Transforms a line of story text into HTML with styled vocabulary highlights.
 * Handles ** bold **, _(italic meaning)_, and Devanagari (Hindi) detection.
 */
function transformLine(line: string): string {
  // Step 1: Handle _(meaning)_ -> italic gray span
  let result = line.replace(
    /_\(([^)]+)\)_/g,
    '<span style="' + MEANING_STYLE + '">($1)</span>'
  );

  // Step 2: Handle remaining bare (meaning) not already wrapped
  result = result.replace(
    /\(([^)]+)\)/g,
    '<span style="' + MEANING_STYLE + '">($1)</span>'
  );

  // Step 3: Handle **WORD** -> bold with blue highlight
  result = result.replace(/\*\*([^*]+)\*\*/g, (_match: string, word: string) => {
    const isEnglish = /^[A-Za-z\s/\-,;:\'!?\u2014\u2013]+$/.test(word);
    const displayWord = isEnglish ? word.toUpperCase() : word;
    return '<span style="' + VOCAB_STYLE + '">' + displayWord + "</span>";
  });

  return result;
}

/**
 * Converts markdown story content (body only, no frontmatter) into
 * styled HTML matching the specified MS Word copy-paste design.
 */
function formatStoryContent(rawContent: string): string {
  const lines = rawContent.split("\n");
  const htmlParts: string[] = [];

  for (const rawLine of lines) {
    const stripped = rawLine.trim();

    // Skip main title line
    if (stripped.startsWith("# ")) continue;

    // Skip horizontal rules
    if (stripped === "---") continue;

    // Skip empty lines
    if (!stripped) continue;

    // Stop at word-verification sections
    if (stripped.startsWith("## ") && /[✅✔]/.test(stripped)) break;
    if (/^##\s*GROUP/i.test(stripped)) break;

    // ACT title lines: "## ACT 1: ..." or "## ACT I: ..."
    if (/^##\s+ACT\s/i.test(stripped)) {
      const title = stripped.replace(/^##\s+/, "");
      htmlParts.push(
        '<h2 style="font-family: \'Segoe UI\', Arial, sans-serif; color: #0B5394; border-bottom: 3px solid #E69138; padding-bottom: 8px; font-size: 22px; margin-bottom: 25px;">' +
        title +
        "</h2>"
      );
      continue;
    }

    // Chapter title lines: "### Chapter 1: ..."
    if (/^###\s+Chapter\s/i.test(stripped)) {
      const title = stripped.replace(/^###\s+/, "");
      htmlParts.push(
        '<h3 style="font-family: \'Segoe UI\', Arial, sans-serif; color: #E69138; font-size: 18px; margin-top: 20px; margin-bottom: 15px;">' +
        title +
        "</h3>"
      );
      continue;
    }

    // Regular paragraph
    const hasHindi = /[\u0900-\u097F]/.test(stripped);
    const transformed = transformLine(stripped);
    const mb = hasHindi ? "18px" : "4px";

    htmlParts.push(
      '<p style="' +
      PARA_BASE_STYLE +
      " margin-bottom: " +
      mb +
      ';">' +
      transformed +
      "</p>"
    );
  }

  return htmlParts.join("\n");
}

// ── Story Data Functions ───────────────────────────────────────────────────

export async function getStoryBySlug(slug: string) {
  const stories = loadAllStories();
  const matched = stories.find((s) => s.slug === slug);

  if (!matched) {
    return null;
  }

  const { data, content, fileName } = matched;

  // Extract title from frontmatter or first heading
  const title =
    data.title ||
    content.match(/^#\s+(.+)$/m)?.[1] ||
    fileName.replace(/\.md$/, "");

  // Convert markdown -> styled HTML
  const contentHtml = formatStoryContent(content);

  return {
    slug,
    title,
    contentHtml,
    meta: data,
  };
}
