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
}

export interface BlogPost {
    meta: BlogMeta;
    content: string;
}

// ── Cache ──

const IS_DEV = process.env.NODE_ENV !== "production";
let cache: BlogPost[] | null = null;

function loadAllPosts(): BlogPost[] {
    if (!IS_DEV && cache) return cache;

    if (!fs.existsSync(blogDirectory)) {
        if (!IS_DEV) cache = [];
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
                meta: { slug, title, date, description, tags, readingTime, serialNumber, category, categorySerial },
                content,
            };
        })
        .sort((a, b) => {
            // Sort by serialNumber if available, otherwise by date
            if (a.meta.serialNumber !== undefined && b.meta.serialNumber !== undefined) {
                return a.meta.serialNumber - b.meta.serialNumber;
            }
            return b.meta.date.localeCompare(a.meta.date);
        });

    if (!IS_DEV) cache = posts;
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
