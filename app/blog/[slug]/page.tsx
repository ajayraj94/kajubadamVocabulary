import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPost, getAdjacentPosts, extractFaqFromContent } from "@/lib/blog";
import BlogNav from "@/app/_components/BlogNav";
import BlogPostRenderer from "@/app/_components/BlogPostRenderer";

const SITE_URL = process.env.SITE_URL || "https://kajubadamvocabulary.in";

// ── JSON-LD helper ──
function JsonLd({ data }: { data: Record<string, unknown> }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

// ── SEO metadata ──
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = getBlogPost(slug);

    if (!post) {
        return { title: "Post Not Found | kajubadam Vocabulary" };
    }

    return {
        title: `${post.meta.title} | kajubadam Vocabulary Blog`,
        description: post.meta.description,
        keywords: [...post.meta.tags, "SSC CGL", "vocabulary", "English preparation", "competitive exams"],
        openGraph: {
            title: post.meta.title,
            description: post.meta.description,
            url: `${SITE_URL}/blog/${slug}`,
            siteName: "kajubadam Vocabulary",
            locale: "en_IN",
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: post.meta.title,
            description: post.meta.description,
        },
        alternates: {
            canonical: `${SITE_URL}/blog/${slug}`,
        },
    };
}

// ── Page Component ──
export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = getBlogPost(slug);

    if (!post) {
        notFound();
    }

    const adjacent = getAdjacentPosts(slug);

    // Build JSON-LD schema
    const cleanBody = post.content
        .replace(/\*\*/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    // Extract FAQ items for FAQPage schema
    const faqItems = extractFaqFromContent(post.content);

    const graphItems: Record<string, unknown>[] = [
        {
            "@type": "Article",
            "@id": `${SITE_URL}/blog/${slug}#article`,
            headline: post.meta.title,
            description: post.meta.description,
            articleBody: cleanBody.substring(0, 5000),
            author: {
                "@type": "Organization",
                name: "kajubadam Vocabulary",
                url: SITE_URL,
            },
            publisher: {
                "@type": "Organization",
                name: "kajubadam Vocabulary",
                url: SITE_URL,
            },
            inLanguage: ["en", "hi"],
            about: {
                "@type": "Thing",
                name: "Competitive Exam English Preparation",
                description: "Vocabulary, phrasal verbs, idioms, and grammar for SSC CGL, Banking, and UPSC exams.",
            },
            educationalLevel: "Advanced",
            teaches: "English Vocabulary for Competitive Exams",
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
                { "@type": "ListItem", position: 3, name: post.meta.title, item: `${SITE_URL}/blog/${slug}` },
            ],
        },
    ];

    // Add FAQPage schema if we have FAQ items
    if (faqItems.length > 0) {
        graphItems.push({
            "@type": "FAQPage",
            mainEntity: faqItems.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faq.answer,
                },
            })),
        });
    }

    const schema = {
        "@context": "https://schema.org",
        "@graph": graphItems,
    };

    return (
        <div className="min-h-screen bg-gray-50/40 font-sans">
            <BlogNav />

            {/* ═══ HERO HEADER — Daily News Reading Style ═══ */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#d97706] to-[#0f172a] border-b border-amber-500/20">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
                    <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-orange-500/10 blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
                </div>

                <div className="relative max-w-[1200px] mx-auto px-4 lg:px-8 py-4 md:py-6">
                    {/* ═══ VISIBLE BREADCRUMB NAVIGATION ═══ */}
                    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-medium mb-2">
                        <Link href="/" className="text-amber-200/70 hover:text-amber-200 transition-colors">
                            Home
                        </Link>
                        <svg className="w-3 h-3 text-amber-300/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                        <Link href="/blog" className="text-amber-200/70 hover:text-amber-200 transition-colors">
                            Blog
                        </Link>
                        <svg className="w-3 h-3 text-amber-300/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-amber-200/80 font-bold truncate max-w-[300px]">
                            {post.meta.title}
                        </span>
                    </nav>

                    <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-400/20">
                            <span className="w-1 h-1 bg-amber-400 rounded-full animate-pulse"></span>
                            Blog
                        </span>
                        <span className="text-amber-300/40 text-[9px]">·</span>
                        <span className="text-[10px] font-medium text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                            {post.meta.readingTime}
                        </span>
                    </div>

                    <h1 className="text-[20px] md:text-[28px] font-black text-white tracking-tight leading-tight max-w-3xl">
                        <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
                            {post.meta.title}
                        </span>
                    </h1>

                    {post.meta.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {post.meta.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="text-[8px] font-semibold text-amber-200/60 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ CONTENT — Daily News Reading Layout ═══ */}
            <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-6 md:py-8">
                <article className="blog-content">
                    <BlogPostRenderer content={post.content} />
                </article>

                {/* ═══ PREVIOUS / NEXT POST NAVIGATION ═══ */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-amber-100 pt-6">
                    {/* Previous Post */}
                    {adjacent.prev ? (
                        <Link
                            href={`/blog/${adjacent.prev.slug}`}
                            className="group flex items-start gap-3 bg-white border border-gray-200 hover:border-[#d97706]/30 rounded-xl p-4 transition-all hover:shadow-md"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-amber-100 flex items-center justify-center shrink-0 transition-colors mt-0.5">
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#d97706] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    ← Previous Post
                                </span>
                                <p className="text-[13px] font-semibold text-gray-700 group-hover:text-[#d97706] leading-snug mt-0.5 line-clamp-2 transition-colors">
                                    {adjacent.prev.title}
                                </p>
                            </div>
                        </Link>
                    ) : (
                        <div />
                    )}

                    {/* Next Post */}
                    {adjacent.next ? (
                        <Link
                            href={`/blog/${adjacent.next.slug}`}
                            className="group flex items-start gap-3 bg-white border border-gray-200 hover:border-[#d97706]/30 rounded-xl p-4 transition-all hover:shadow-md md:text-right"
                        >
                            <div className="min-w-0 flex-1 md:order-1 order-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Next Post →
                                </span>
                                <p className="text-[13px] font-semibold text-gray-700 group-hover:text-[#d97706] leading-snug mt-0.5 line-clamp-2 transition-colors">
                                    {adjacent.next.title}
                                </p>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-amber-100 flex items-center justify-center shrink-0 transition-colors mt-0.5 md:order-2 order-1">
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#d97706] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ) : (
                        <div />
                    )}
                </div>

                {/* Bottom links */}
                <div className="mt-6 flex items-center justify-between border-t border-amber-100 pt-6">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-400 hover:text-[#d97706] transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                        All Articles
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-400 hover:text-[#d97706] transition-colors"
                    >
                        Home
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                {/* CTA — Amber Theme */}
                <div className="mt-8 bg-gradient-to-br from-amber-50 via-white to-orange-50/40 border border-amber-200/60 rounded-2xl p-6 md:p-8 text-center shadow-sm">
                    <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full mb-3">
                        📚 Free Blog
                    </span>
                    <p className="text-[14px] md:text-[15px] font-bold text-gray-800 mb-1">
                        🎯 Master 11,762+ Exam Words with Stories
                    </p>
                    <p className="text-[12px] md:text-[13px] text-gray-500 mb-4">
                        Bilingual stories + interactive quizzes — one-time payment, lifetime access
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-[#0f172a] font-extrabold text-[12px] px-5 py-2.5 rounded-full shadow-[0_2px_10px_-2px_rgba(251,191,36,0.5)] hover:shadow-[0_4px_16px_-2px_rgba(251,191,36,0.7)] hover:scale-105 transition-all duration-200 active:scale-95"
                        >
                            Get Full Access — Lifetime ₹299
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

            {/* JSON-LD */}
            <JsonLd data={schema} />
        </div>
    );
}
