import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoryBySlug, getStoryQuiz } from "@/lib/stories";
import { isStoryFree } from "@/lib/access";
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

const SITE_URL = process.env.SITE_URL || "https://kajubadamvocabulary.in";

// ── SEO metadata with full GEO optimization ──
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

  const allQuestions = getStoryQuiz(slug);
  const totalVocab = allQuestions.length;
  const isFree = isStoryFree(slug);
  const sagaId = story.meta?.saga_id || "";

  return {
    title: `${story.title} — Bilingual Vocabulary Story | kajubadam`,
    description: `Read the ${isFree ? "free" : "sample"} bilingual vocabulary story: ${story.title}. ${totalVocab} exam-frequency vocabulary words with Hindi translations, fill-in-the-blank quiz, and detailed explanations for SSC CGL, Banking, and UPSC exam preparation.${isFree ? " Completely free." : ""}`,
    keywords: [
      story.title.toLowerCase(),
      "english vocabulary story",
      "hindi meaning english words",
      "bilingual story",
      sagaId.toLowerCase(),
      "ssc cgl vocabulary",
      "banking exam english",
      "upsc english preparation",
      "vocabulary building",
      ...(isFree ? ["free vocabulary course", "ssc english free"] : []),
    ],
    openGraph: {
      title: `${story.title} — ${totalVocab} Exam Vocabulary Words with Hindi | kajubadam`,
      description: `${isFree ? "Free" : "Sample"} bilingual vocabulary story with ${totalVocab} exam-frequency words. Read the story, learn Hindi meanings, and practice with fill-in-the-blank quizzes.`,
      url: `${SITE_URL}/stories/${slug}`,
      siteName: "kajubadam Vocabulary",
      locale: "en_IN",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${story.title} — ${totalVocab} Exam Vocab Words`,
      description: `${isFree ? "Free" : "Sample"} bilingual vocabulary story. ${totalVocab} words with Hindi translations & quiz.`,
    },
    robots: {
      index: isFree,
      follow: isFree,
      googleBot: {
        index: isFree,
        follow: isFree,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `${SITE_URL}/stories/${slug}`,
    },
  };
}

// ── Dynamic FAQ Props ──
interface FaqItem {
  q: string;
  a: string;
}

function getFaqItems(title: string, sagaId: string, totalVocab: number): FaqItem[] {
  return [
    {
      q: `How does the "${title}" story help with SSC CGL English preparation?`,
      a: `This story embeds ${totalVocab} high-yield, exam-frequency vocabulary words directly inside an engaging narrative. Reading words in context helps SSC CGL, UPSC, and Banking aspirants remember vocabulary much faster than trying to memorize static word lists.`,
    },
    {
      q: `Can I get Hindi meanings for the vocabulary words in "${title}"?`,
      a: `Yes. Every advanced English word introduced in this story is mapped with its corresponding Hindi translation, parts of speech, synonyms, and usage examples to ensure complete comprehension for Hindi-medium aspirants.`,
    },
    {
      q: `How can I access more vocabulary stories like "${title}"?`,
      a: `While '${title}' is a free introductory chapter${sagaId ? ` (${sagaId})` : ""}, the complete course (Vocab Part 1) features 48 structured story chapters teaching over 11,000+ words. You can unlock lifetime access to the entire course on the Kajubadam homepage.`,
    },
  ];
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

  // Build saga series name for schema
  const sagaId = story.meta?.saga_id || "";
  const sagaSeries = sagaId.startsWith("Saga") ? sagaId : `Saga ${sagaId}`;

  const totalVocab = allQuestions.length;

  // Compute course-part label
  const coursePart = story.meta?.vocab_part === "part 1" ? "Part 1" : story.meta?.vocab_part === "part 2" ? "Part 2" : "";
  const isFree = isStoryFree(slug);

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
      // ── GEO: Course schema marking this story as a free sample of a paid course ──
      {
        "@type": "Course",
        name: "Kajubadam English Vocabulary Course",
        description: `An immersive, story-based English vocabulary-building course designed for Indian competitive exams like SSC CGL, Banking, and UPSC${coursePart ? ` — ${coursePart}` : ""}.`,
        provider: {
          "@type": "Organization",
          name: "Kajubadam Vocabulary",
          url: "https://kajubadamvocabulary.in",
          logo: {
            "@type": "ImageObject",
            url: "https://kajubadamvocabulary.in/logo.png",
            width: 512,
            height: 512,
          },
        },
        isAccessibleForFree: isFree ? "true" : "false",
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          name: `${sagaId || story.title}: ${story.title}`,
          url: `https://kajubadamvocabulary.in/stories/${slug}`,
          isAccessibleForFree: "true",
          description: `${isFree ? "A free" : "A sample"} introductory module containing ${totalVocab} high-yield exam vocabulary words mapped with Hindi translations and interactive quizzes.`,
        },
      },
    ],
  };

  // ── Build vocabulary table data (first 10 words) ──
  const wordTableData = allQuestions.slice(0, 10).map((q) => ({
    english: q.english,
    hindi: q.hindi || q.hindiMeaning,
    meaning: q.englishMeaning,
    sentence: q.sentence.replace(/______/g, q.english),
  }));

  // ── Build FAQ items dynamically from story data ──
  const faqItems = getFaqItems(story.title, sagaId, totalVocab);

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

      {/* ═══════════════════════════════════════════════
         GEO: FAQ SECTION — helps LLMs answer user queries
         ═══════════════════════════════════════════════ */}
      <section className="max-w-[800px] mx-auto px-4 py-10 md:py-14">
        <div className="bg-[#f9f9f9] border border-gray-200 rounded-xl p-6 md:p-8">
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
      {wordTableData.length > 0 && (
        <section className="max-w-[800px] mx-auto px-4 pb-12 md:pb-16">
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <h2 className="text-lg md:text-xl font-black text-gray-800 px-6 pt-6 pb-3">
              Vocabulary Word Index: &ldquo;{story.title}&rdquo;
            </h2>
            <table className="w-full border-collapse text-sm md:text-[14px]">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-200 text-left">
                  <th className="px-4 md:px-6 py-3 font-bold text-gray-700">English Word</th>
                  <th className="px-4 md:px-6 py-3 font-bold text-gray-700">Hindi Meaning</th>
                  <th className="px-4 md:px-6 py-3 font-bold text-gray-700 hidden sm:table-cell">Exam Synonyms</th>
                </tr>
              </thead>
              <tbody>
                {wordTableData.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50/50 transition-colors`}
                  >
                    <td className="px-4 md:px-6 py-3 font-bold text-blue-600">
                      {row.english}
                    </td>
                    <td className="px-4 md:px-6 py-3 font-medium text-gray-700">
                      {row.hindi}
                    </td>
                    <td className="px-4 md:px-6 py-3 text-gray-500 hidden sm:table-cell">
                      {row.meaning}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allQuestions.length > 10 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
                <p className="text-[13px] text-gray-500">
                  Showing 10 of {allQuestions.length} words. 
                  <Link href={`/stories/${slug}#quiz-section`} className="text-blue-600 hover:text-blue-800 underline font-medium ml-1">
                    Start the quiz to practice all {allQuestions.length} words &rarr;
                  </Link>
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
