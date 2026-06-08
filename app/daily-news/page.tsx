import type { Metadata } from "next";
import Link from "next/link";
import { getAllDailyNews } from "@/lib/daily-news";
import DailyNewsPageClient from "../DailyNewsPageClient";

const SITE_URL = process.env.SITE_URL || "https://kajubadamvocabulary.in";

export const metadata: Metadata = {
    title: "Daily News Vocabulary | kajubadam Vocabulary",
    description:
        "Free daily news vocabulary practice for SSC CGL, Banking, and UPSC. 45 exam-style questions per article with bilingual explanations. Updated daily with current affairs editorial analysis.",
    openGraph: {
        title: "Daily News Vocabulary — Free SSC CGL & Banking English Practice",
        description:
            "45 daily exam-style vocabulary questions from current affairs editorials. Error Detection, Sentence Improvement, Para Jumbles, and more. Free bilingual practice.",
        url: `${SITE_URL}/daily-news`,
        siteName: "kajubadam Vocabulary",
        locale: "en_IN",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Daily News Vocabulary — Free Exam Practice",
        description:
            "Free daily editorial-based English practice for SSC CGL, Banking & UPSC. 45 questions per article with Hindi translations.",
    },
    alternates: {
        canonical: `${SITE_URL}/daily-news`,
    },
};

export default function DailyNewsPage() {
    const dailyNews = getAllDailyNews();

    return (
        <div className="min-h-screen bg-gray-50/40 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 md:py-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-gray-400 hover:text-[#d97706] transition-colors mb-3"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </Link>
                    <h1 className="text-[28px] md:text-[36px] font-black text-gray-900 tracking-tight leading-tight">
                        📰 Daily News Vocabulary
                    </h1>
                    <p className="text-[14px] md:text-[15px] text-gray-500 mt-2 leading-relaxed max-w-2xl">
                        Free daily editorial-based English practice. Each article includes 45 exam-style questions 
                        covering Error Detection, Sentence Improvement, Para Jumbles, Fill in the Blanks, 
                        Synonyms, Antonyms, Collocations, and Reading Comprehension — all with Hindi translations.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 md:py-8">
                <DailyNewsPageClient dailyNews={dailyNews} />
            </div>
        </div>
    );
}
