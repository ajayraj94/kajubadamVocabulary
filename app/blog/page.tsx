import Link from "next/link";
import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog";

const SITE_URL = process.env.SITE_URL || "https://kajubadamvocabulary.in";

export const metadata: Metadata = {
    title: "Blog | kajubadam Vocabulary",
    description:
        "Read expert articles about SSC CGL, Banking, and UPSC English preparation. Vocabulary tips, grammar guides, idioms, and study strategies for Hindi-medium students.",
    openGraph: {
        title: "kajubadam Vocabulary Blog — SSC CGL, Banking & UPSC English Tips",
        description:
            "Expert articles on English vocabulary, grammar, and exam strategies for competitive exams. Bilingual tips for Hindi-medium aspirants.",
        url: `${SITE_URL}/blog`,
        siteName: "kajubadam Vocabulary",
        locale: "en_IN",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "kajubadam Vocabulary Blog — Exam English Tips",
        description:
            "Learn English for SSC CGL, Banking, and UPSC with expert articles, vocabulary guides, and study strategies.",
    },
    alternates: {
        canonical: `${SITE_URL}/blog`,
    },
};

export default function BlogPage() {
    const posts = getAllBlogPosts();

    return (
        <div className="min-h-screen bg-gray-50/40 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-6 md:py-8">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1 text-[12px] font-semibold text-gray-400 hover:text-[#1c4a8a] transition-colors mb-3"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Home
                            </Link>
                            <h1 className="text-[28px] md:text-[36px] font-black text-gray-900 tracking-tight leading-tight">
                                📝 Blog
                            </h1>
                            <p className="text-[14px] md:text-[15px] text-gray-500 mt-2 leading-relaxed max-w-2xl">
                                Expert guides and tips for SSC CGL, Banking, and UPSC English preparation. 
                                Learn vocabulary, grammar, and exam strategies — all with Hindi explanations.
                            </p>
                        </div>
                        <Link
                            href="/blog/roadmap"
                            className="flex-shrink-0 inline-flex items-center gap-1.5 bg-[#1c4a8a]/5 border border-[#1c4a8a]/20 hover:bg-[#1c4a8a]/10 hover:border-[#1c4a8a]/30 text-[#1c4a8a] font-bold text-[12px] px-3.5 py-2 rounded-full transition-all active:scale-95 mt-9"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            View Roadmap
                        </Link>
                    </div>
                </div>
            </div>

            {/* Blog Posts */}
            <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-6 md:py-8">
                {posts.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm max-w-md mx-auto">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <h3 className="text-[16px] font-bold text-gray-700 mb-1">Coming Soon</h3>
                        <p className="text-gray-400 text-[13px]">Blog posts are being written. Check back soon!</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {posts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="block bg-white border border-gray-100 rounded-xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)] hover:border-gray-200 transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-3 mb-1.5">
                                    <span className="text-[11px] font-semibold text-gray-400">
                                        {new Date(post.date).toLocaleDateString("en-IN", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                    <span className="text-[10px] text-gray-300">·</span>
                                    <span className="text-[11px] font-medium text-[#1c4a8a] bg-[#1c4a8a]/5 px-2 py-0.5 rounded-full">
                                        {post.readingTime}
                                    </span>
                                </div>
                                <h2 className="text-[17px] md:text-[19px] font-bold text-gray-800 group-hover:text-[#1c4a8a] transition-colors leading-snug">
                                    {post.title}
                                </h2>
                                <p className="text-[13px] md:text-[14px] text-gray-500 mt-2 leading-relaxed">
                                    {post.description}
                                </p>
                                {post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {post.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* CTA Section */}
            <div className="border-t border-gray-100 bg-white">
                <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-8 text-center">
                    <p className="text-[13px] text-gray-400 mb-3">
                        📚 Master 11,762+ exam vocabulary words through bilingual stories
                    </p>
                    <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 bg-[#1c4a8a] hover:bg-blue-900 text-white font-bold text-[13px] px-6 py-2.5 rounded-full transition-all active:scale-95 shadow-sm"
                    >
                        Get Full Access — Lifetime ₹299
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
