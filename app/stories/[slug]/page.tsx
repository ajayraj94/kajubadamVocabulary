import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllStorySlugs, getStoryBySlug, getStoryQuiz } from "@/lib/stories";
import SagaVocabQuizClient from "./quiz/SagaVocabQuizClient";

// ── JSON-LD helper ──
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ── Pre-render all story slugs at build time ──
export async function generateStaticParams() {
  return getAllStorySlugs();
}

// ── SEO metadata ──
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    return { title: "Story Not Found" };
  }

  return {
    title: story.title,
    description: `Read the vocabulary story: ${story.title}`,
  };
}

// ── Page Component ──
export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  // Get all quiz questions for merged page
  const allQuestions = getStoryQuiz(slug);

  // Determine which tab this story belongs to from frontmatter
  const tabLabel = story.meta?.vocab_part === "part 2" ? "Part 2" : "Part 1";

  // Build saga series name for schema
  const sagaId = story.meta?.saga_id || "";
  const sagaSeries = sagaId.startsWith("Saga") ? sagaId : `Saga ${sagaId}`;

  const totalVocab = allQuestions.length;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: story.title,
        description: `Read the bilingual vocabulary story: ${story.title}. Includes ${totalVocab} fill-in-the-blank vocabulary questions for exam preparation.`,
        inLanguage: ["en", "hi"],
        author: {
          "@type": "Organization",
          name: "kajubadam Vocabulary",
        },
        about: {
          "@type": "Thing",
          name: "English-Hindi Vocabulary Learning Through Stories",
          description:
            "Learn English vocabulary with Hindi translations through immersive bilingual stories. Each word is bolded, defined, and reinforced with fill-in-the-blank quiz questions.",
        },
        educationalLevel: "Intermediate",
        ...(sagaSeries && {
          isPartOf: {
            "@type": "CreativeWorkSeries",
            name: sagaSeries,
          },
        }),
      },
      {
        "@type": "WebPage",
        name: `${story.title} — Saga Vocabulary Quiz | kajubadam`,
        description: `Complete ${totalVocab} fill-in-the-blank vocabulary questions from the bilingual story: ${story.title}. Ideal for SSC, Banking, and competitive exam vocabulary preparation.`,
        inLanguage: ["en", "hi"],
        about: {
          "@type": "Thing",
          name: "Fill-in-the-Blanks Bilingual Vocabulary Quiz",
          description:
            "Interactive bilingual (English-Hindi) vocabulary quiz with fill-in-the-blank questions extracted directly from story text. Reinforces word meanings, spellings, and contextual usage.",
        },
        educationalLevel: "Intermediate",
        teaches: "English-Hindi Vocabulary, Spelling, and Contextual Usage",
        assesses: "Vocabulary Comprehension, Word Recall, and Contextual Understanding",
      },
    ],
  };

  return (
    <>
      <JsonLd data={schema} />
      <SagaVocabQuizClient
        slug={slug}
        title={story.title}
        sagaId={story.meta?.saga_id || ""}
        vocabPart={story.meta?.vocab_part || ""}
        rawQuestions={allQuestions}
        contentHtml={story.contentHtml}
      />
    </>
  );
}
