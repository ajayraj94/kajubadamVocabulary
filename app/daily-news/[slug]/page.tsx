import { notFound } from "next/navigation";

// ── JSON-LD helper ──
function JsonLd({ data }: { data: Record<string, unknown> }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

import { getAllDailyNews, getDailyNewsArticle } from "@/lib/daily-news";
import type { EditorialParagraph } from "@/lib/daily-news";
import DailyNewsVocabQuizClient from "./DailyNewsVocabQuizClient";

const SITE_URL = process.env.SITE_URL || "https://kajubadamvocabulary.in";

// ── Helper: Extract bolded vocabulary words from editorial ──
function extractBoldWords(paragraphs: EditorialParagraph[]): { word: string; context: string }[] {
    const seen = new Set<string>();
    const result: { word: string; context: string }[] = [];

    for (const para of paragraphs) {
        const matches = para.english.matchAll(/\*\*([^*]+)\*\*/g);
        for (const match of matches) {
            const word = match[1].trim();
            if (word && !seen.has(word.toLowerCase())) {
                seen.add(word.toLowerCase());
                const idx = match.index!;
                const start = Math.max(0, idx - 60);
                const end = Math.min(para.english.length, idx + match[0].length + 60);
                let context = para.english.slice(start, end).replace(/\*\*/g, "");
                if (start > 0) context = "..." + context;
                if (end < para.english.length) context = context + "...";
                result.push({ word, context });
            }
        }
    }

    return result;
}

// ── Dynamic FAQ items ──
interface FaqItem { q: string; a: string; }

function getFaqItems(title: string, sectionNames: string[], totalQ: number, date: string, source: string): FaqItem[] {
    return [
        {
            q: `How does the "${title}" daily news editorial help with English exam preparation?`,
            a: `This daily news article from ${source} (${date}) contains ${totalQ} exam-style vocabulary questions across ${sectionNames.length} sections including ${sectionNames.join(", ")}. Reading current affairs editorials with bilingual (English-Hindi) support helps SSC CGL, UPSC, and Banking aspirants build contextual vocabulary for competitive exams far more effectively than static word lists.`,
        },
        {
            q: `What types of vocabulary questions are included in this daily news article?`,
            a: `This article covers ${sectionNames.join(", ")} sections with a total of ${totalQ} questions. Each question includes the original sentence context, multiple-choice options with letters (A-E), the correct answer, and a detailed bilingual explanation in both English and Hindi. The explanations break down grammar rules, word meanings, and usage patterns.`,
        },
        {
            q: `Are there Hindi translations available for the vocabulary questions?`,
            a: `Yes. Every question in this daily news article comes with a detailed Hindi (हिंदी) explanation. The editorial passage itself is fully bilingual with English and Hindi translations side by side, making it ideal for Hindi-medium aspirants preparing for SSC CGL, Banking PO, UPSC, and other government exams.`,
        },
    ];
}

// ── Pre-render all daily news slugs ──
export async function generateStaticParams() {
    const articles = getAllDailyNews();
    return articles.map((a) => ({ slug: a.slug }));
}

// ── SEO metadata with full GEO optimization ──
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const article = getDailyNewsArticle(slug);

    if (!article) {
        return { title: "Article Not Found" };
    }

    const totalQ = article.sections.reduce((sum, s) => sum + s.questions.length, 0);
    const sectionTypeNames = article.sections.map((s) => s.typeName);
    const slugLower = slug.toLowerCase();

    return {
        title: article.title,
        description: `${article.title} — ${article.date} editorial from ${article.source}. ${totalQ} exam-style vocabulary questions covering ${sectionTypeNames.join(", ")}. Bilingual (English-Hindi) daily news vocabulary quiz for SSC CGL, Banking, and UPSC preparation with detailed explanations.`,
        keywords: [
            "daily news vocabulary",
            article.source.toLowerCase(),
            "current affairs vocabulary",
            "English vocabulary for SSC CGL",
            "bilingual vocabulary quiz",
            "Hindi meaning English words",
            "exam vocabulary practice",
            `${article.title.toLowerCase()} vocabulary`,
            ...sectionTypeNames.map((n) => n.toLowerCase()),
        ],
        openGraph: {
            title: `${article.title} — Daily News Vocabulary Quiz | kajubadam`,
            description: `${totalQ} bilingual vocabulary questions from ${article.source} editorial (${article.date}). Learn exam-relevant English words with Hindi translations for SSC/Banking/UPSC.`,
            url: `${SITE_URL}/daily-news/${slug}`,
            siteName: "kajubadam Vocabulary",
            locale: "en_IN",
            type: "article",
            publishedTime: article.date,
        },
        twitter: {
            card: "summary_large_image",
            title: `${article.title} — Daily News Vocab Quiz`,
            description: `${totalQ} bilingual vocabulary questions from ${article.source} editorial. SSC/Banking/UPSC exam prep.`,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
        alternates: {
            canonical: `${SITE_URL}/daily-news/${slug}`,
        },
        other: {
            "article:published_time": article.date,
            "article:section": "Daily News Vocabulary",
        },
    };
}

// ── Page Component ──
export default async function DailyNewsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const article = getDailyNewsArticle(slug);

    if (!article) {
        notFound();
    }

    // Build a flat list of all questions with section info
    const allQuestions = article.sections.flatMap((section) =>
        section.questions.map((q) => ({
            ...q,
            sectionType: section.type,
            sectionName: section.typeName,
            sectionNumber: section.number,
            sectionContext: q.sectionContext,
        }))
    );

    const sectionsInfo = article.sections.map((s) => ({
        number: s.number,
        type: s.type,
        typeName: s.typeName,
    }));

    const commonProps = {
        title: article.title,
        date: article.date,
        source: article.source,
        editorialParagraphs: article.editorialParagraphs,
        allQuestions,
        sections: sectionsInfo,
    };

    const sectionTypeNames = sectionsInfo.map((s) => s.typeName);
    const totalQ = allQuestions.length;
    const boldWords = extractBoldWords(article.editorialParagraphs);
    const faqItems = getFaqItems(article.title, sectionTypeNames, totalQ, article.date, article.source);

    const sectionListItems = sectionsInfo.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${s.number}. ${s.typeName}`,
        description: `${s.typeName} questions for vocabulary practice`, 
    }));

    // Clean editorial body for articleBody (strip markdown bold markers)
    const cleanEditorialBody = article.editorialEnglish
        .replace(/\*\*/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            // ── NewsArticle ──
            {
                "@type": "NewsArticle",
                "@id": `${SITE_URL}/daily-news/${slug}#newsarticle`,
                mainEntityOfPage: `${SITE_URL}/daily-news/${slug}`,
                headline: article.title,
                description: `${article.date} editorial analysis from ${article.source}. ${totalQ} exam-style vocabulary questions covering ${sectionTypeNames.join(", ")} with bilingual (English-Hindi) explanations.`,
                articleBody: cleanEditorialBody,
                datePublished: article.date,
                author: {
                    "@type": "Organization",
                    name: article.source,
                },
                publisher: {
                    "@type": "Organization",
                    name: "kajubadam Vocabulary",
                    url: SITE_URL,
                    logo: {
                        "@type": "ImageObject",
                        url: `${SITE_URL}/logo.png`,
                        width: 512,
                        height: 512,
                    },
                },
                inLanguage: ["en", "hi"],
                about: {
                    "@type": "Thing",
                    name: "Vocabulary Building with Current Affairs",
                    description:
                        "Learn exam-relevant English vocabulary through editorial analysis with Hindi translations for SSC CGL, Banking, and UPSC preparation.",
                },
                educationalLevel: "Advanced",
                teaches: "English Vocabulary, Grammar, Reading Comprehension",
                wordCount: article.editorialEnglish.split(/\s+/).filter(Boolean).length,
                speakable: {
                    "@type": "SpeakableSpecification",
                    cssSelector: ["#editorial-content"],
                },
            },
            // ── WebPage ──
            {
                "@type": "WebPage",
                name: `${article.title} — Daily News Vocabulary Quiz`,
                description: `Complete ${totalQ} exam-style vocabulary questions: ${sectionTypeNames.join(", ")}. Bilingual daily news vocabulary practice for competitive exam preparation.`,
                inLanguage: ["en", "hi"],
                about: {
                    "@type": "Thing",
                    name: "Competitive Exam Vocabulary Practice with Current Affairs",
                    description:
                        "Exam-style vocabulary questions from daily news editorials for SSC CGL, Banking, and government exam preparation with Hindi translations.",
                },
                educationalLevel: "Advanced",
                teaches: "English Vocabulary for Competitive Exams",
                assesses: "English Vocabulary, Error Detection, Sentence Improvement, Reading Comprehension",
                datePublished: article.date,
            },
            // ── BreadcrumbList for GEO ──
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                    { "@type": "ListItem", position: 2, name: "Daily News", item: `${SITE_URL}/daily-news` },
                    { "@type": "ListItem", position: 3, name: article.title, item: `${SITE_URL}/daily-news/${slug}` },
                ],
            },
            // ── ItemList of sections for structured extraction ──
            {
                "@type": "ItemList",
                name: `Vocabulary Question Sections in "${article.title}"`,
                description: `${totalQ} vocabulary questions organized across ${sectionsInfo.length} sections`,
                numberOfItems: totalQ,
                itemListElement: sectionListItems,
            },
        ],
    };

    return (
        <>
            <JsonLd data={schema} />
            <DailyNewsVocabQuizClient {...commonProps} />

            {/* ═══════════════════════════════════════════════
               GEO: FAQ SECTION — helps LLMs answer user queries
               ═══════════════════════════════════════════════ */}
            <section className="max-w-[860px] mx-auto px-5 py-10 md:py-14">
                <div className="bg-[#f9f9f9] border border-amber-200 rounded-xl p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-5">
                        {faqItems.map((item, i) => (
                            <div key={i} className="border-b border-gray-200 pb-5 last:border-b-0 last:pb-0">
                                <h3 className="text-[15px] font-bold text-gray-700 mb-2">
                                    Q: {item.q}
                                </h3>
                                <p className="text-[14px] text-gray-600 leading-relaxed">
                                    <strong>A:</strong> {item.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
               GEO: VOCABULARY WORD TABLE — helps AI extract structured data
               ═══════════════════════════════════════════════ */}
            {boldWords.length > 0 && (
                <section className="max-w-[860px] mx-auto px-5 pb-12 md:pb-16">
                    <div className="overflow-x-auto border border-amber-200 rounded-xl">
                        <h2 className="text-lg md:text-xl font-black text-gray-800 px-6 pt-6 pb-3">
                            Key Vocabulary Words from Editorial: &ldquo;{article.title}&rdquo;
                        </h2>
                        <table className="w-full border-collapse text-sm md:text-[14px]">
                            <thead>
                                <tr className="bg-amber-50 border-b-2 border-amber-200 text-left">
                                    <th className="px-4 md:px-6 py-3 font-bold text-gray-700">English Word</th>
                                    <th className="px-4 md:px-6 py-3 font-bold text-gray-700">Context in Editorial</th>
                                </tr>
                            </thead>
                            <tbody>
                                {boldWords.slice(0, 15).map((row, i) => (
                                    <tr
                                        key={i}
                                        className={`border-b border-amber-100 ${i % 2 === 0 ? "bg-white" : "bg-amber-50/30"} hover:bg-amber-50/60 transition-colors`}
                                    >
                                        <td className="px-4 md:px-6 py-3 font-bold text-amber-900 text-[14px]">
                                            {row.word}
                                        </td>
                                        <td className="px-4 md:px-6 py-3 text-gray-600 text-[13px] leading-relaxed italic">
                                            &ldquo;{row.context}&rdquo;
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {boldWords.length > 15 && (
                            <div className="px-6 py-4 bg-amber-50/50 border-t border-amber-100 text-center">
                                <p className="text-[13px] text-gray-500">
                                    Showing 15 of {boldWords.length} key vocabulary words.
                                    <span className="text-amber-700 font-medium ml-1">
                                        Start the quiz to practice all {totalQ} questions &rarr;
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </>
    );
}