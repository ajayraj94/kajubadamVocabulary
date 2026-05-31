import { MetadataRoute } from "next";
import { getAllStories } from "@/lib/stories";
import { isStoryFree } from "@/lib/access";

const SITE_URL = process.env.SITE_URL || "https://kajubadamvocabulary.in";

export default function sitemap(): MetadataRoute.Sitemap {
    const stories = getAllStories();

    // ── Static Core Pages ──
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.4,
        },
        {
            url: `${SITE_URL}/pricing`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/disclaimer`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
    ];

    // ── Free Stories Only (Saga 1-01 & Saga 2-01) ──
    // Paid course stories should NOT be indexed to avoid content duplication
    const freeStoryPages: MetadataRoute.Sitemap = stories
        .filter((story) => isStoryFree(story.slug))
        .map((story) => ({
            url: `${SITE_URL}/stories/${story.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.9,
        }));

    return [...staticPages, ...freeStoryPages];
}