import { getSentenceImprovementData } from "@/lib/sentence-improvement";
import SentenceImprovementQuizClient from "../SentenceImprovementQuizClient";

const PAGE_SIZE = 50;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const pageNum = parseInt(pageId, 10);
  const page = Math.max(1, isNaN(pageNum) ? 1 : pageNum);
  const startQ = (page - 1) * PAGE_SIZE + 1;
  const endQ = page * PAGE_SIZE;

  const isFree = page === 1;

  return {
    title: `SSC Sentence Improvement PYQ — Page ${page} (Q.${startQ}–Q.${endQ}) | Kajubadam Vocabulary`,
    description: `Practice SSC Sentence Improvement questions Q.${startQ} through Q.${endQ}. Detailed bilingual explanations with grammar rule cards, extra practice, and exam pro-tips for competitive exam preparation.`,
    robots: {
      index: isFree,
      follow: isFree,
    },
    alternates: {
      canonical: `/sentence-improvement/${page}`,
    },
  };
}

export default async function SentenceImprovementPageRoute({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const pageNum = parseInt(pageId, 10);
  const page = Math.max(1, isNaN(pageNum) ? 1 : pageNum);

  const data = getSentenceImprovementData();

  const totalPages = Math.ceil(data.totalQuestions / PAGE_SIZE);
  const safePage = Math.min(page, totalPages);

  const start = (safePage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, data.totalQuestions);
  const pageQuestions = data.questions.slice(start, end);

  return (
    <SentenceImprovementQuizClient
      questions={pageQuestions}
      page={safePage}
      totalPages={totalPages}
      totalQuestions={data.totalQuestions}
      isFreePage={safePage === 1}
    />
  );
}
