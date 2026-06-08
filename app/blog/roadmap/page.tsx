"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { roadmapCategories } from "@/lib/roadmap";

// ── Progress data (update this as posts are published) ──
const PUBLISHED_POSTS = 2;
const TOTAL_POSTS = 1000;

export default function BlogRoadmapPage() {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [expandedSubCategory, setExpandedSubCategory] = useState<string | null>(null);

    // Set page title for SEO (client component constraint)
    useEffect(() => {
        document.title = "Content Roadmap — 1,000 Blog Posts Plan | kajubadam Vocabulary";
    }, []);

    const progressPercent = Math.round((PUBLISHED_POSTS / TOTAL_POSTS) * 100);

    return (
        <div className="min-h-screen bg-gray-50/40 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-[1100px] mx-auto px-4 lg:px-8 py-6 md:py-8">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-gray-400 hover:text-[#1c4a8a] transition-colors mb-3"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Blog
                    </Link>
                    <h1 className="text-[28px] md:text-[36px] font-black text-gray-900 tracking-tight leading-tight">
                        🗺️ Content Roadmap
                    </h1>
                    <p className="text-[14px] md:text-[15px] text-gray-500 mt-2 leading-relaxed max-w-3xl">
                        Our complete plan for <strong>1,000 blog posts</strong> across 5 major categories — 
                        covering everything from idioms and grammar to A-to-Z vocabulary and spoken English. 
                        Posts are being added gradually. <em>Sab kuch Hindi-English mein!</em>
                    </p>
                </div>
            </div>

            <div className="max-w-[1100px] mx-auto px-4 lg:px-8 py-6 md:py-8 space-y-8">
                {/* ── Progress Card ── */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 md:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-[18px] font-bold text-gray-800">📊 Overall Progress</h2>
                            <p className="text-[13px] text-gray-400 mt-0.5">
                                {PUBLISHED_POSTS} of {TOTAL_POSTS.toLocaleString()} posts published
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[32px] font-black text-[#1c4a8a]">{progressPercent}%</span>
                            <span className="text-[12px] text-gray-400">complete</span>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#1c4a8a] to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4 text-[12px] text-gray-400">
                        <span>📖 2 Published</span>
                        <span>✍️ {Math.floor(TOTAL_POSTS * 0.3)} In Planning</span>
                        <span>📋 {TOTAL_POSTS - PUBLISHED_POSTS} To Write</span>
                    </div>
                </div>

                {/* ── Category Breakdown ── */}
                <div>
                    <h2 className="text-[20px] font-extrabold text-gray-800 mb-4">
                        📂 Categories &amp; Topics
                    </h2>
                    <div className="space-y-3">
                        {roadmapCategories.map((cat) => {
                            const isExpanded = expandedCategory === cat.id;

                            return (
                                <div
                                    key={cat.id}
                                    className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all duration-200"
                                >
                                    {/* Category Header (clickable) */}
                                    <button
                                        onClick={() =>
                                            setExpandedCategory(isExpanded ? null : cat.id)
                                        }
                                        className="w-full flex items-center gap-3 p-4 md:p-5 hover:bg-gray-50/60 transition-colors text-left"
                                    >
                                        <span className="text-[28px] flex-shrink-0">{cat.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-[16px] md:text-[18px] font-bold text-gray-800">
                                                    {cat.name}
                                                </h3>
                                                <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                                                    {cat.nameHindi}
                                                </span>
                                            </div>
                                            <p className="text-[12px] text-gray-400 mt-0.5">
                                                {cat.totalPosts} posts &middot; {cat.subCategories.length} sub-categories &middot; {cat.postRange}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="text-[12px] font-semibold text-[#1c4a8a] bg-[#1c4a8a]/5 px-2.5 py-1 rounded-full">
                                                {cat.totalPosts} posts
                                            </span>
                                            <svg
                                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                                    isExpanded ? "rotate-180" : ""
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2.5"
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 px-4 md:px-5 pb-4 pt-3 space-y-3">
                                            <p className="text-[13px] text-gray-500 leading-relaxed">
                                                {cat.description}
                                            </p>

                                            {/* Sub-categories */}
                                            <div className="space-y-2 mt-3">
                                                {cat.subCategories.map((sub) => {
                                                    const subKey = `${cat.id}-${sub.name}`;
                                                    const isSubExpanded = expandedSubCategory === subKey;

                                                    return (
                                                        <div
                                                            key={subKey}
                                                            className="border border-gray-50 rounded-lg overflow-hidden"
                                                        >
                                                            <button
                                                                onClick={() =>
                                                                    setExpandedSubCategory(
                                                                        isSubExpanded ? null : subKey
                                                                    )
                                                                }
                                                                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-gray-50/60 transition-colors text-left"
                                                            >
                                                                <div>
                                                                    <span className="text-[13px] font-semibold text-gray-700">
                                                                        {sub.name}
                                                                    </span>
                                                                    <span className="text-[11px] text-gray-400 ml-2">
                                                                        ({sub.topicCount} topics &middot; {sub.postRange})
                                                                    </span>
                                                                </div>
                                                                <svg
                                                                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                                                                        isSubExpanded ? "rotate-180" : ""
                                                                    }`}
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2.5"
                                                                        d="M19 9l-7 7-7-7"
                                                                    />
                                                                </svg>
                                                            </button>

                                                            {isSubExpanded && (
                                                                <div className="px-3 pb-3 pt-1">
                                                                    <ul className="space-y-0.5">
                                                                        {sub.topics.map((topic, tIdx) => {
                                                                            // Check if this topic is already published
                                                                            // For now, just show as planned
                                                                            return (
                                                                                <li
                                                                                    key={tIdx}
                                                                                    className="flex items-start gap-2 text-[12px] text-gray-500 py-0.5"
                                                                                >                            <span className="text-gray-300 mt-0.5 flex-shrink-0">📌</span>
                                                                                    <span>{topic}</span>
                                                                                </li>
                                                                            );
                                                                        })}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>


                {/* ── Published Posts ── */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 md:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
                    <h2 className="text-[18px] font-extrabold text-gray-800 mb-3">
                        ✅ Published So Far ({PUBLISHED_POSTS}/{TOTAL_POSTS})
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/blog/top-50-idioms-ssc-cgl"
                            className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2 hover:bg-green-100/60 transition-colors group"
                        >
                            <span className="text-[16px]">✅</span>
                            <div>
                                <span className="text-[13px] font-semibold text-gray-700 group-hover:text-[#1c4a8a] transition-colors">
                                    Top 50 Idioms for SSC CGL
                                </span>
                                <span className="text-[11px] text-gray-400 block">Jun 8, 2026</span>
                            </div>
                        </Link>
                        <Link
                            href="/blog/how-to-prepare-english-ssc-cgl"
                            className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2 hover:bg-green-100/60 transition-colors group"
                        >
                            <span className="text-[16px]">✅</span>
                            <div>
                                <span className="text-[13px] font-semibold text-gray-700 group-hover:text-[#1c4a8a] transition-colors">
                                    How to Prepare English for SSC CGL
                                </span>
                                <span className="text-[11px] text-gray-400 block">Jun 7, 2026</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* ── Hierarchy Info ── */}
                <div className="bg-gradient-to-br from-[#1c4a8a]/5 to-blue-50 border border-[#1c4a8a]/10 rounded-xl p-5 md:p-6">
                    <h2 className="text-[16px] font-extrabold text-gray-800 mb-2">
                        🏗️ URL Structure
                    </h2>
                    <p className="text-[13px] text-gray-500 mb-3">
                        Each blog post will follow a clean hierarchical URL structure:
                    </p>
                    <div className="bg-white/70 border border-gray-100 rounded-lg p-3 md:p-4 font-mono text-[12px] leading-relaxed text-gray-600 space-y-1">
                        <p className="text-gray-400">kajubadamvocabulary.in/blog/</p>
                        <p className="pl-4">├── idioms-phrases-phrasal-verbs/</p>
                        <p className="pl-8">│   └── phrasal-verbs-look-part-1</p>
                        <p className="pl-4">├── grammar-error-spotting/</p>
                        <p className="pl-8">│   └── noun-rules-part-1</p>
                        <p className="pl-4">├── topic-wise-vocabulary/</p>
                        <p className="pl-8">│   └── medical-vocabulary</p>
                        <p className="pl-4">├── a-to-z-vocabulary/</p>
                        <p className="pl-8">│   └── daily-use-words-starting-with-a</p>
                        <p className="pl-4">└── daily-sentences-spoken-english/</p>
                        <p className="pl-8">    └── bank-conversation-english</p>
                    </div>
                </div>
            </div>

            {/* Footer CTA */}
            <div className="border-t border-gray-100 bg-white">
                <div className="max-w-[1100px] mx-auto px-4 lg:px-8 py-8 text-center">
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
