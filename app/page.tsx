import { getAllStories } from "@/lib/stories";
import { getAllDailyNews } from "@/lib/daily-news";
import HomePageClient from "./HomePageClient";

export default function Home() {
  const allStories = getAllStories();

  // Categorize stories based on vocab_part field
  const part1Stories = allStories.filter(story => story.vocab_part === 'part 1');
  const part2Stories = allStories.filter(story => story.vocab_part === 'part 2');

  // Load daily news articles
  const dailyNews = getAllDailyNews();

  return (
    <HomePageClient
      part1Stories={part1Stories}
      part2Stories={part2Stories}
      dailyNews={dailyNews}
    />
  );
}