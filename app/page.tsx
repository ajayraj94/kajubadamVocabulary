import { getAllStories } from "@/lib/stories";
import { getAllDailyNews } from "@/lib/daily-news";
import { getErrorDetectionData } from "@/lib/error-detection";
import { getSentenceImprovementData } from "@/lib/sentence-improvement";
import HomePageClient from "./HomePageClient";

export default function Home() {
  const allStories = getAllStories();

  // Categorize stories based on vocab_part field
  const part1Stories = allStories.filter(story => story.vocab_part === 'part 1');
  const part2Stories = allStories.filter(story => story.vocab_part === 'part 2');

  // Load daily news articles
  const dailyNews = getAllDailyNews();

  // Load error detection data
  const errorDetectionData = getErrorDetectionData();
  const PAGE_SIZE = 50;
  const totalErrorDetectionQuestions = errorDetectionData.totalQuestions;
  const errorDetectionTotalPages = Math.ceil(totalErrorDetectionQuestions / PAGE_SIZE);

  // Load sentence improvement data
  const sentenceImprovementData = getSentenceImprovementData();
  const totalSentenceImprovementQuestions = sentenceImprovementData.totalQuestions;
  const sentenceImprovementTotalPages = Math.ceil(totalSentenceImprovementQuestions / PAGE_SIZE);

  return (
    <HomePageClient
      part1Stories={part1Stories}
      part2Stories={part2Stories}
      dailyNews={dailyNews}
      totalErrorDetectionQuestions={totalErrorDetectionQuestions}
      errorDetectionTotalPages={errorDetectionTotalPages}
      totalSentenceImprovementQuestions={totalSentenceImprovementQuestions}
      sentenceImprovementTotalPages={sentenceImprovementTotalPages}
    />
  );
}