import { MetadataRoute } from "next";
import { getAllStories } from "@/lib/stories";
import { getAllDailyNews } from "@/lib/daily-news";

const SITE_URL = process.env.SITE_URL || "https://kajubadam.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
    const stories = getAllStories();
    const dailyNews = getAllDailyNews();

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
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

    const storyPages: MetadataRoute.Sitemap = stories.map((story) => ({
        url: `${SITE_URL}/stories/${story.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    const dailyNewsPages: MetadataRoute.Sitemap = dailyNews.map((news) => ({
        url: `${SITE_URL}/daily-news/${news.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
    }));

    return [...staticPages, ...storyPages, ...dailyNewsPages];
}