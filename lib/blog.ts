import fs from "fs";
import path from "path";
import matter from "gray-matter";

const blogDirectory = path.join(process.cwd(), "content", "blog");

// ── Types ──

export interface BlogMeta {
    slug: string;
    title: string;
    date: string;
    description: string;
    tags: string[];
    readingTime: string;
    /** Overall serial number across all 1,000 blog posts */
    serialNumber?: number;
    /** Category name, e.g. "Category 4: Idioms & Phrasal Verbs" */
    category?: string;
    /** Serial number within the category */
    categorySerial?: number;
    /** Raw file name for ordering (e.g. "001-Top-phrasal-verbs...") */
    _fileName?: string;
}

export interface BlogPost {
    meta: BlogMeta;
    content: string;
}

export interface AdjacentPosts {
    prev: { slug: string; title: string } | null;
    next: { slug: string; title: string } | null;
}

function loadAllPosts(): BlogPost[] {
    if (!fs.existsSync(blogDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(blogDirectory);
    const posts = fileNames
        .filter((name) => name.endsWith(".md"))
        .map((name) => {
            const fullPath = path.join(blogDirectory, name);
            const fileContents = fs.readFileSync(fullPath, "utf8");
            const { data, content } = matter(fileContents);

            // Use frontmatter slug if available, otherwise derive from filename
            const slug = data.slug || name.replace(/\.md$/, "");
            const title = data.title || slug;
            const description = data.description || "";
            const date = data.date || "2026-01-01";
            const tags: string[] = data.tags || [];
            const serialNumber: number | undefined = data.serialNumber || undefined;
            const category: string | undefined = data.category || undefined;
            const categorySerial: number | undefined = data.categorySerial || undefined;

            // Calculate reading time
            const wordCount = content.split(/\s+/).filter(Boolean).length;
            const readingTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

            return {
                meta: { slug, title, date, description, tags, readingTime, serialNumber, category, categorySerial, _fileName: name },
                content,
            };
        })
        .sort((a, b) => {
            // Sort by serialNumber descending (latest first), otherwise by date
            if (a.meta.serialNumber !== undefined && b.meta.serialNumber !== undefined) {
                return b.meta.serialNumber - a.meta.serialNumber;
            }
            return b.meta.date.localeCompare(a.meta.date);
        });

    return posts;
}

// ── Public API ──

export function getAllBlogPosts(): BlogMeta[] {
    return loadAllPosts().map((p) => p.meta);
}

export function getBlogPost(slug: string): BlogPost | null {
    return loadAllPosts().find((p) => p.meta.slug === slug) || null;
}

export function getAllBlogSlugs(): { slug: string }[] {
    return loadAllPosts().map((p) => ({ slug: p.meta.slug }));
}

/**
 * Get previous and next blog posts for "Related Posts" navigation.
 * Uses alphabetical filename ordering (001, 002, 003...) which matches the serial number pattern.
 */
export function getAdjacentPosts(slug: string): AdjacentPosts {
    const allPosts = loadAllPosts();
    // Sort by filename to get the intended reading order
    const sorted = [...allPosts].sort((a, b) => {
        const nameA = a.meta._fileName || "";
        const nameB = b.meta._fileName || "";
        return nameA.localeCompare(nameB);
    });

    const idx = sorted.findIndex((p) => p.meta.slug === slug);
    if (idx === -1) return { prev: null, next: null };

    const prev = idx > 0 ? { slug: sorted[idx - 1].meta.slug, title: sorted[idx - 1].meta.title } : null;
    const next = idx < sorted.length - 1 ? { slug: sorted[idx + 1].meta.slug, title: sorted[idx + 1].meta.title } : null;

    return { prev, next };
}

/**
 * Extract FAQ items from blog content for FAQPage JSON-LD schema.
 * Looks for the FAQ section (## ❓ Frequently Asked Questions) and parses ### Q... headings + answers.
 */
export function extractFaqFromContent(content: string): { question: string; answer: string }[] {
    const faqs: { question: string; answer: string }[] = [];

    // Find the FAQ section
    const faqMatch = content.match(/^##\s+[❓📝]*\s*Frequently Asked Questions.*$[\s\S]*/m);
    if (!faqMatch) return faqs;

    const faqContent = faqMatch[0];

    // Split by ### headings (FAQ questions)
    const qBlocks = faqContent.split(/\n(?=###\s+)/);
    for (const block of qBlocks) {
        const headMatch = block.match(/^###\s+(.*)$/m);
        if (!headMatch) continue;

        const question = headMatch[1].trim();
        // Get everything after the heading until the next ### or end
        const bodyLines = block
            .replace(/^###\s+.*$/m, "")
            .replace(/^---\s*$/gm, "")
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);

        // Take the answer text — first meaningful paragraph(s) after the heading
        const answer = bodyLines
            .filter((l) => !l.startsWith("###") && !l.startsWith("---") && l.length > 10)
            .slice(0, 4) // Max 2-3 sentences for schema
            .join(" ")
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
            .substring(0, 500); // Limit for schema

        if (question && answer) {
            faqs.push({ question, answer });
        }
    }

    return faqs;
}
