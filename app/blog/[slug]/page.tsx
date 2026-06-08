import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getBlogPost } from "@/lib/blog";
import BlogNav from "@/app/_components/BlogNav";

const SITE_URL = process.env.SITE_URL || "https://kajubadamvocabulary.in";

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
            publishedTime: post.meta.date,
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

    return (
        <div className="min-h-screen bg-gray-50/40 font-sans">
            <BlogNav />

            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-5 md:py-6">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-gray-400 hover:text-[#1c4a8a] transition-colors mb-3"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Blog
                    </Link>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-semibold text-gray-400">
                            {new Date(post.meta.date).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[11px] font-medium text-[#1c4a8a] bg-[#1c4a8a]/5 px-2 py-0.5 rounded-full">
                            {post.meta.readingTime}
                        </span>
                    </div>
                    {post.meta.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {post.meta.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-6 md:py-8">
                <article className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] blog-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({ children, ...props }) => (
                                <h1 className="text-[24px] md:text-[30px] font-black text-gray-900 tracking-tight leading-tight mt-0 mb-4" {...props}>
                                    {children}
                                </h1>
                            ),
                            h2: ({ children, ...props }) => (
                                <h2 className="text-[18px] md:text-[22px] font-extrabold text-gray-800 tracking-tight mt-8 mb-3 pb-1 border-b border-gray-100" {...props}>
                                    {children}
                                </h2>
                            ),
                            h3: ({ children, ...props }) => (
                                <h3 className="text-[16px] md:text-[18px] font-bold text-gray-700 mt-6 mb-2" {...props}>
                                    {children}
                                </h3>
                            ),
                            h4: ({ children, ...props }) => (
                                <h4 className="text-[15px] font-extrabold text-gray-700 mt-5 mb-2" {...props}>
                                    {children}
                                </h4>
                            ),
                            h5: ({ children, ...props }) => (
                                <h5 className="text-[14px] font-bold text-gray-600 mt-4 mb-1.5" {...props}>
                                    {children}
                                </h5>
                            ),
                            p: ({ children, ...props }) => (
                                <p className="text-[14px] md:text-[15px] text-gray-600 leading-[1.8] mb-4" {...props}>
                                    {children}
                                </p>
                            ),
                            ul: ({ children, ...props }) => (
                                <ul className="space-y-1.5 mb-4 pl-5" {...props}>
                                    {children}
                                </ul>
                            ),
                            ol: ({ children, ...props }) => (
                                <ol className="space-y-1.5 mb-4 pl-5 list-decimal" {...props}>
                                    {children}
                                </ol>
                            ),
                            li: ({ children, ...props }) => (
                                <li className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed" {...props}>
                                    {children}
                                </li>
                            ),
                            strong: ({ children, ...props }) => (
                                <strong className="font-bold text-gray-800" {...props}>
                                    {children}
                                </strong>
                            ),
                            a: ({ href, children, ...props }) => {
                                const isInternal = href && (href.startsWith("/") || href.startsWith(SITE_URL));
                                return (
                                    <a
                                        href={href}
                                        target={isInternal ? undefined : "_blank"}
                                        rel={isInternal ? undefined : "noopener noreferrer"}
                                        className="text-[#1c4a8a] font-semibold hover:text-blue-700 underline decoration-[#1c4a8a]/30 hover:decoration-[#1c4a8a]/60 transition-all"
                                        {...props}
                                    >
                                        {children}
                                    </a>
                                );
                            },
                            blockquote: ({ children, ...props }) => (
                                <blockquote className="border-l-4 border-[#1c4a8a]/20 bg-[#1c4a8a]/5 rounded-r-xl px-4 py-3 my-4 text-[14px] text-gray-600 italic" {...props}>
                                    {children}
                                </blockquote>
                            ),
                            code: ({ children, ...props }) => (
                                <code className="bg-gray-100 text-[13px] font-mono px-1.5 py-0.5 rounded text-gray-800" {...props}>
                                    {children}
                                </code>
                            ),
                            pre: ({ children, ...props }) => (
                                <pre className="bg-[#f8fafc] border border-gray-100 rounded-xl p-4 md:p-5 overflow-x-auto text-[13px] leading-relaxed mb-4" {...props}>
                                    {children}
                                </pre>
                            ),
                            em: ({ children, ...props }) => (
                                <em className="italic text-gray-500" {...props}>
                                    {children}
                                </em>
                            ),
                            hr: (props) => (
                                <hr className="border-gray-100 my-3 opacity-40" {...props} />
                            ),
                            table: ({ children, ...props }) => (
                                <div className="overflow-x-auto mb-4">
                                    <table className="w-full text-[13px] md:text-[14px] border-collapse" {...props}>
                                        {children}
                                    </table>
                                </div>
                            ),
                            th: ({ children, ...props }) => (
                                <th className="bg-gray-50 border border-gray-200 px-3 py-2 text-left font-bold text-gray-700" {...props}>
                                    {children}
                                </th>
                            ),
                            td: ({ children, ...props }) => (
                                <td className="border border-gray-200 px-3 py-2 text-gray-600" {...props}>
                                    {children}
                                </td>
                            ),
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </article>

                {/* Navigation */}
                <div className="mt-6 flex items-center justify-between">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-400 hover:text-[#1c4a8a] transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                        All Articles
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-400 hover:text-[#1c4a8a] transition-colors"
                    >
                        Home
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                {/* CTA */}
                <div className="mt-8 bg-gradient-to-br from-[#1c4a8a]/5 to-blue-50 border border-[#1c4a8a]/10 rounded-xl p-5 md:p-6 text-center">
                    <p className="text-[14px] md:text-[15px] font-bold text-gray-800 mb-1">
                        🎯 Master 11,762+ Exam Words with Stories
                    </p>
                    <p className="text-[12px] md:text-[13px] text-gray-500 mb-3">
                        Bilingual stories + interactive quizzes — one-time payment, lifetime access
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-1.5 bg-[#1c4a8a] hover:bg-blue-900 text-white font-bold text-[12px] px-5 py-2 rounded-full transition-all active:scale-95 shadow-sm"
                        >
                            View Pricing
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                        <Link
                            href="/daily-news"
                            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#1c4a8a]/30 text-gray-600 hover:text-[#1c4a8a] font-bold text-[12px] px-5 py-2 rounded-full transition-all active:scale-95"
                        >
                            Free Daily News
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
