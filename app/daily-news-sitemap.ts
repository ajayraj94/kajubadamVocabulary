import { MetadataRoute } from "next";
import { getAllDailyNews } from "@/lib/daily-news";

const SITE_URL = process.env.SITE_URL || "https://kajubadamvocabulary.in";

export default function dailyNewsSitemap(): MetadataRoute.Sitemap {
    const dailyNews = getAllDailyNews();

    // ── Daily News Listing Page ──
    const listingPage: MetadataRoute.Sitemap = [
        {
            url: `${SITE_URL}/daily-news`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
    ];

    // ── All Daily News Article Pages (completely free, all indexed) ──
    // New articles added to content/daily-news/ will automatically appear here
    const articlePages: MetadataRoute.Sitemap = dailyNews.map((news) => ({
        url: `${SITE_URL}/daily-news/${news.slug}`,
        lastModified: new Date(news.date),
        changeFrequency: "daily" as const,
        priority: 0.9,
    }));

    return [...listingPage, ...articlePages];
}
