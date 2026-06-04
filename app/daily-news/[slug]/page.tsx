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
import DailyNewsVocabQuizClient from "./DailyNewsVocabQuizClient";

const SITE_URL = process.env.SITE_URL || "https://kajubadamvocabulary.in";

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

    // ── Build keyword-rich title ──
    const seoTitle = `${article.title} — ${article.source} Editorial: ${totalQ} Exam Vocabulary Questions for SSC CGL, Banking & UPSC`;

    return {
        title: seoTitle,
        description: `${article.title} — ${article.date} editorial from ${article.source}. ${totalQ} exam-style vocabulary questions covering ${sectionTypeNames.join(", ")}. Bilingual (English-Hindi) daily news vocabulary quiz for SSC CGL, Banking, and UPSC preparation with detailed explanations.`,
        keywords: [
            "SSC CGL vocabulary practice",
            "Banking English grammar",
            "daily editorial vocabulary",
            "UPSC English preparation",
            "English vocabulary with Hindi meaning",
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
            title: `${article.title} — ${totalQ} SSC CGL & Banking Exam Vocab Questions from ${article.source} Editorial`,
            description: `${totalQ} bilingual vocabulary questions from ${article.source} editorial (${article.date}). Learn exam-relevant English words with Hindi translations for SSC CGL, Banking, UPSC.`,
            url: `${SITE_URL}/daily-news/${slug}`,
            siteName: "kajubadam Vocabulary",
            locale: "en_IN",
            type: "article",
            publishedTime: article.date,
        },
        twitter: {
            card: "summary_large_image",
            title: `${article.title} — ${totalQ} Exam Vocab Questions for SSC CGL & Banking`,
            description: `${totalQ} bilingual vocabulary questions from ${article.source} editorial. SSC CGL, Banking, UPSC exam prep with Hindi meanings.`,
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
            "article:tag": "SSC CGL, Banking English, UPSC, Editorial Analysis, Bilingual Vocabulary",
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
        vocabRawMarkdown: article.vocabRawMarkdown,
        faqItems: article.faqItems,
        keepLearningMarkdown: article.keepLearningMarkdown,
    };

    const sectionTypeNames = sectionsInfo.map((s) => s.typeName);
    const totalQ = allQuestions.length;
    const OPTION_LETTERS = ["A", "B", "C", "D", "E"];

    // Strip markdown bold/italic markers and link syntax from text for schema.org
    function stripMarkdown(text: string): string {
        if (!text) return "";
        return text
            .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold** → bold
            .replace(/\*([^*]+)\*/g, '$1')        // *italic* → italic
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // [text](url) → text
            .replace(/^[#]+\s+/gm, '')              // ## headings → text
            .replace(/`([^`]+)`/g, '$1')             // `code` → code
            .trim();
    }

    const sectionListItems = sectionsInfo.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${s.number}. ${s.typeName}`,
        description: `${s.typeName} questions for vocabulary practice`, 
    }));

    // Build FAQPage mainEntity from static FAQ items
    const faqMainEntity = article.faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
        },
    }));

    // Build QAPage data from first 5 quiz questions (shows question + correct answer in search)
    const quizQuestions = allQuestions.slice(0, 5).map((q) => {
        const answerLetter = q.correctAnswer;
        const letterIndex = OPTION_LETTERS.indexOf(answerLetter);
        const answerText = letterIndex >= 0 && letterIndex < q.options.length
            ? `${answerLetter}) ${q.options[letterIndex]}`
            : answerLetter;
        const cleanStem = stripMarkdown(q.stem).substring(0, 500);
        const fullStem = stripMarkdown(q.stem).substring(0, 2000);
        return {
            "@type": "Question",
            name: cleanStem,
            text: fullStem,
            answerCount: q.options.length,
            datePublished: article.date,
            author: {
                "@type": "Organization",
                name: article.source,
            },
            acceptedAnswer: {
                "@type": "Answer",
                text: `The correct answer is ${answerLetter}: ${answerText}. ${q.explanation.substring(0, 500)}`,
                datePublished: article.date,
                url: `${SITE_URL}/daily-news/${slug}`,
                author: {
                    "@type": "Organization",
                    name: "kajubadam Vocabulary",
                },
                upvoteCount: 0,
            },
            suggestedAnswer: q.options.map((opt, idx) => ({
                "@type": "Answer",
                text: `${OPTION_LETTERS[idx]}) ${opt}`,
                datePublished: article.date,
                url: `${SITE_URL}/daily-news/${slug}`,
                author: {
                    "@type": "Organization",
                    name: "kajubadam Vocabulary",
                },
                upvoteCount: 0,
            })),
        };
    });

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
            // ── FAQPage for rich snippet eligibility ──
            {
                "@type": "FAQPage",
                mainEntity: faqMainEntity,
            },
            // ── QAPage for quiz questions (first 5) ──
            {
                "@type": "QAPage",
                mainEntity: quizQuestions,
            },
        ],
    };

    return (
        <>
            <JsonLd data={schema} />
            <DailyNewsVocabQuizClient {...commonProps} />


        </>
    );
}