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

// ── Pre-render all daily news slugs ──
export async function generateStaticParams() {
    const articles = getAllDailyNews();
    return articles.map((a) => ({ slug: a.slug }));
}

// ── SEO metadata ──
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

    return {
        title: article.title,
        description: `Read the daily news vocabulary article: ${article.title}`,
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

    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Article",
                headline: article.title,
                description: `Read the daily news vocabulary article: ${article.title}`,
                datePublished: article.date,
                author: {
                    "@type": "Organization",
                    name: article.source,
                },
                inLanguage: ["en", "hi"],
                about: {
                    "@type": "Thing",
                    name: "Vocabulary Building with Current Affairs",
                    description:
                        "Learn exam-relevant English vocabulary through editorial analysis.",
                },
                educationalLevel: "Advanced",
            },
            {
                "@type": "WebPage",
                name: `${article.title} — Daily News Vocabulary Quiz`,
                description: `Complete exam-style vocabulary questions: ${sectionTypeNames.join(", ")}.`,
                inLanguage: "en",
                about: {
                    "@type": "Thing",
                    name: "Competitive Exam Vocabulary Practice",
                    description:
                        "Exam-style vocabulary questions for SSC, Banking, and government exam preparation.",
                },
                educationalLevel: "Advanced",
                teaches: "Vocabulary for Competitive Exams",
                assesses: "English Vocabulary, Grammar, and Comprehension",
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