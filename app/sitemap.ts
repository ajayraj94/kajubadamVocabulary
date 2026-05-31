import { MetadataRoute } from "next";
import { getAllStories } from "@/lib/stories";
import { getAllDailyNews } from "@/lib/daily-news";
import { isStoryFree } from "@/lib/access";

const SITE_URL = process.env.SITE_URL || "https://kajubadamvocabulary.in";

export default function sitemap(): MetadataRoute.Sitemap {
    const stories = getAllStories();
    const dailyNews = getAllDailyNews();

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
    const freeStoryPages: MetadataRoute.Sitemap = stories
        .filter((story) => isStoryFree(story.slug))
        .map((story) => ({
            url: `${SITE_URL}/stories/${story.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.9,
        }));

    // ── Daily News (completely free, all pages indexed) ──
    const dailyNewsListing: MetadataRoute.Sitemap = [
        {
            url: `${SITE_URL}/daily-news`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
    ];

    const dailyNewsPages: MetadataRoute.Sitemap = dailyNews.map((news) => ({
        url: `${SITE_URL}/daily-news/${news.slug}`,
        lastModified: new Date(news.date),
        changeFrequency: "daily" as const,
        priority: 0.9,
    }));

    return [...staticPages, ...freeStoryPages, ...dailyNewsListing, ...dailyNewsPages];
}