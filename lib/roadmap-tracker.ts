// ── Roadmap Tracker: Reads blog posts & matches them to roadmap categories ──

import { getAllBlogPosts } from "@/lib/blog";
import { roadmapCategories } from "@/lib/roadmap";
import type { BlogMeta } from "@/lib/blog";

export interface PublishedPostInfo {
    serialNumber: number;
    slug: string;
    title: string;
    date: string;
}

export interface CategoryProgress {
    categoryId: string;
    categoryName: string;
    categoryNameHindi: string;
    categorySlug: string;
    categoryIcon: string;
    totalPosts: number;
    publishedPosts: number;
    published: PublishedPostInfo[];
}

let _cachedPosts: BlogMeta[] | null = null;

function getPosts(): BlogMeta[] {
    if (!_cachedPosts) {
        _cachedPosts = getAllBlogPosts();
    }
    return _cachedPosts;
}

/**
 * Get overall progress stats.
 */
export function getRoadmapStats() {
    const posts = getPosts();
    const publishedCount = posts.length;
    const totalPlanned = roadmapCategories.reduce((sum, c) => sum + c.totalPosts, 0);
    return {
        publishedCount,
        totalPlanned,
        progressPercent: totalPlanned > 0 ? Math.round((publishedCount / totalPlanned) * 100) : 0,
    };
}

/**
 * Get all published blog posts with their roadmap metadata.
 */
export function getAllPublishedPosts(): PublishedPostInfo[] {
    return getPosts()
        .filter((p) => p.serialNumber !== undefined)
        .sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0))
        .map((p) => ({
            serialNumber: p.serialNumber!,
            slug: p.slug,
            title: p.title,
            date: p.date,
        }));
}

/**
 * Get progress breakdown per roadmap category.
 * Maps each blog post to the right category by serialNumber range.
 */
export function getCategoryProgress(): CategoryProgress[] {
    const posts = getPosts();

    // Build serialNumber ranges for each category
    const categoryRanges: { id: string; start: number; end: number }[] = [];
    let globalStart = 1;
    for (const cat of roadmapCategories) {
        const end = globalStart + cat.totalPosts - 1;
        categoryRanges.push({ id: cat.id, start: globalStart, end });
        globalStart = end + 1;
    }

    return roadmapCategories.map((cat, idx) => {
        const range = categoryRanges[idx];
        const publishedPostsInCat = posts
            .filter(
                (p) =>
                    p.serialNumber !== undefined &&
                    p.serialNumber >= range.start &&
                    p.serialNumber <= range.end
            )
            .sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0))
            .map((p) => ({
                serialNumber: p.serialNumber!,
                slug: p.slug,
                title: p.title,
                date: p.date,
            }));

        return {
            categoryId: cat.id,
            categoryName: cat.name,
            categoryNameHindi: cat.nameHindi,
            categorySlug: cat.slug,
            categoryIcon: cat.icon,
            totalPosts: cat.totalPosts,
            publishedPosts: publishedPostsInCat.length,
            published: publishedPostsInCat,
        };
    });
}

// ── Topic Serial Range Computation ──

/**
 * Parse how many posts a topic spans by looking at the topic string.
 * Examples:
 *   "Look (4 posts): ..."        → 4
 *   "Animals & Birds Idioms (2 posts): ..."  → 2
 *   "Nouns that look plural..."  → 1 (no count found)
 */
function parsePostCount(topic: string): number {
    // Match ALL "(N posts)" or "(N posts: ...)" patterns and SUM them.
    // Handles compound topics like "Turn (4 posts), Keep (4 posts), Come (4 posts), Give (4 posts)"
    // which should return 16 (4+4+4+4), not just 4.
    const regex = /\((\d+)\s+posts?(?::|\))/g;
    const matches = [...topic.matchAll(regex)];
    if (matches.length === 0) return 1;
    return matches.reduce((sum, m) => sum + parseInt(m[1], 10), 0);
}

/**
 * Compute the global serial number range for each topic in the roadmap.
 * Returns a flat array of all topics with their serial ranges.
 */
export interface TopicSerialInfo {
    categoryId: string;
    subCategoryName: string;
    topicIndex: number;
    topicText: string;
    serialStart: number;
    serialEnd: number;
    postCount: number;
}

export function computeAllTopicSerials(): TopicSerialInfo[] {
    const result: TopicSerialInfo[] = [];
    let globalSerial = 1;

    for (const cat of roadmapCategories) {
        for (const sub of cat.subCategories) {
            for (let tIdx = 0; tIdx < sub.topics.length; tIdx++) {
                const topic = sub.topics[tIdx];
                const count = parsePostCount(topic);
                result.push({
                    categoryId: cat.id,
                    subCategoryName: sub.name,
                    topicIndex: tIdx,
                    topicText: topic,
                    serialStart: globalSerial,
                    serialEnd: globalSerial + count - 1,
                    postCount: count,
                });
                globalSerial += count;
            }
        }
    }

    return result;
}

/**
 * Get the flat topic list with published status pre-computed.
 */
export interface TopicWithStatus extends TopicSerialInfo {
    isFullyPublished: boolean;
    publishedCount: number;
}

export function getAllTopicsWithStatus(): TopicWithStatus[] {
    const posts = getPosts();
    const publishedSerials = new Set(
        posts.filter((p) => p.serialNumber !== undefined).map((p) => p.serialNumber!)
    );

    return computeAllTopicSerials().map((topic) => {
        let publishedCount = 0;
        for (let sn = topic.serialStart; sn <= topic.serialEnd; sn++) {
            if (publishedSerials.has(sn)) publishedCount++;
        }
        return {
            ...topic,
            isFullyPublished: publishedCount === topic.postCount,
            publishedCount,
        };
    });
}
