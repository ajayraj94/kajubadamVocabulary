import Link from "next/link";
import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog";
import BlogNav from "@/app/_components/BlogNav";

// ── Force dynamic (SSR) so that simply pushing a new .md file
// to content/blog/ makes it appear on the listing — no rebuild needed.
export const dynamic = "force-dynamic";

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
            <BlogNav />

            {/* ═══ HERO HEADER — Daily News Tab Style ═══ */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#d97706] to-[#0f172a] border-b border-amber-500/20">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
                    <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-orange-500/10 blur-3xl animate-pulse" style={{animationDuration: '6s'}}></div>
                </div>

                <div className="relative max-w-[1600px] mx-auto px-4 lg:px-8 py-4 md:py-6">
                    <div className="max-w-3xl">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-200/80 hover:text-amber-200 transition-colors mb-2"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Home
                        </Link>

                        <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-400/20">
                                <span className="w-1 h-1 bg-amber-400 rounded-full animate-pulse"></span>
                                Free Blog
                            </span>
                            <span className="text-amber-300/50 text-[9px]">·</span>
                            <span className="text-amber-300/60 text-[9px] font-medium">
                                {posts.length} {posts.length === 1 ? "article" : "articles"}
                            </span>
                        </div>

                        <h1 className="text-[20px] md:text-[28px] font-black text-white tracking-tight leading-tight">
                            <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
                                📝 Blog
                            </span>
                        </h1>
                        <p className="text-[13px] md:text-[14px] text-amber-100/80 mt-2 leading-relaxed max-w-2xl">
                            Expert guides and tips for SSC CGL, Banking, and UPSC English preparation. 
                            Learn vocabulary, grammar, and exam strategies — all with Hindi explanations.
                        </p>
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1">
                            <span className="text-[10px] font-bold text-amber-200">{posts.length} Posts</span>
                        </div>
                        <Link
                            href="/blog/roadmap"
                            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-400 text-[#0f172a] font-extrabold text-[10px] px-3 py-1 rounded-full shadow-[0_2px_8px_-2px_rgba(251,191,36,0.4)] hover:shadow-[0_4px_12px_-2px_rgba(251,191,36,0.6)] transition-all duration-200"
                        >
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            View Roadmap
                        </Link>
                    </div>
                </div>
            </div>

            {/* ═══ BLOG POSTS GRID — Daily News Tab Style ═══ */}
            <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 md:py-8">
                {posts.length === 0 ? (
                    <div className="bg-white rounded-xl p-16 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <h3 className="text-[18px] font-bold text-gray-700 mb-1">Coming Soon</h3>
                        <p className="text-gray-400 text-[14px]">Blog posts are being written. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-4">
                        {posts.map((post, idx) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group relative bg-white rounded-2xl p-5 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_-8px_rgba(217,119,6,0.15)] transition-all duration-300 flex flex-col min-h-[200px] border border-transparent hover:border-amber-200/40"
                            >
                                {/* Top row: serial number + reading time */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {post.serialNumber && (
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 text-white text-[10px] font-black rounded-lg shadow-sm">
                                                {post.serialNumber}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                        {post.readingTime}
                                    </span>
                                </div>

                                {/* Category badge */}
                                {post.category && (
                                    <div className="mb-2">
                                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                                            {post.category}
                                        </span>
                                    </div>
                                )}

                                {/* Title */}
                                <div className="flex-1">
                                    <h2 className="text-[14px] md:text-[15px] font-bold text-gray-800 leading-snug group-hover:text-[#d97706] transition-colors">
                                        {post.title.length > 70 ? post.title.slice(0, 70) + "..." : post.title}
                                    </h2>
                                    <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-2">
                                        {post.description.length > 90 ? post.description.slice(0, 90) + "..." : post.description}
                                    </p>
                                </div>

                                {/* Tags */}
                                {post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3 mb-2">
                                        {post.tags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-[8px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full"
                                            >
                                                #{tag.length > 12 ? tag.slice(0, 12) + "..." : tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Read button */}
                                <div className="mt-auto pt-2">
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#d97706] group-hover:text-[#b45309] transition-colors">
                                        <span>Read Article</span>
                                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* ═══ CTA SECTION — Amber Theme ═══ */}
            <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50/40 border-t border-amber-100">
                <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-10 md:py-12 text-center">
                    <div className="max-w-xl mx-auto">
                        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full mb-4">
                            📚 Free Blog
                        </span>
                        <p className="text-[15px] text-gray-600 mb-4 leading-relaxed">
                            Master <strong className="text-gray-800 font-bold">11,762+ exam vocabulary words</strong> through bilingual stories with interactive quizzes.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link
                                href="/pricing"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-[#0f172a] font-extrabold text-[13px] px-6 py-2.5 rounded-full shadow-[0_2px_10px_-2px_rgba(251,191,36,0.5)] hover:shadow-[0_4px_16px_-2px_rgba(251,191,36,0.7)] hover:scale-105 transition-all duration-200 active:scale-95"
                            >
                                <span>Get Full Access — Lifetime ₹299</span>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            <Link
                                href="/daily-news"
                                className="inline-flex items-center gap-1.5 bg-white border border-amber-200 hover:border-amber-300 text-gray-600 hover:text-amber-700 font-bold text-[12px] px-5 py-2.5 rounded-full transition-all active:scale-95"
                            >
                                📰 Free Daily News
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
