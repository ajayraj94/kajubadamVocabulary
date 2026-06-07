import { getAllDailyNews } from "@/lib/daily-news";

const SITE_URL = process.env.SITE_URL || "https://kajubadamvocabulary.in";

export async function GET() {
  const allNews = getAllDailyNews();

  // RSS 2.0 feed with the latest daily news articles (max 20)
  const items = allNews.slice(0, 20).map((news) => {
    const pubDate = new Date(news.date);
    const pubDateRFC2822 = isNaN(pubDate.getTime())
      ? new Date().toUTCString()
      : pubDate.toUTCString();

    const articleUrl = `${SITE_URL}/daily-news/${news.slug}`;

    return `
    <item>
      <title><![CDATA[${news.title} — ${news.questionCount} Exam Vocabulary Questions for SSC CGL, Banking & UPSC]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDateRFC2822}</pubDate>
      <source>${news.source}</source>
      <description><![CDATA[${news.questionCount} exam-style bilingual (English-Hindi) vocabulary questions from ${news.source} editorial. Error Detection, Sentence Improvement, Para Jumbles, Fill in the Blanks, Synonyms, Antonyms, Collocation, and Reading Comprehension practice for SSC CGL, Banking, UPSC aspirants. 🎯 Full 11,762+ word premium course: Part 1 (₹299) + Part 2 (₹399) + SSC PYQs (₹149 each) at ${SITE_URL}/pricing]]></description>
      <category>Vocabulary</category>
      <category>Competitive Exams</category>
      <category>SSC CGL</category>
    </item>`;
  });

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>kajubadam Vocabulary — Daily News Quiz for SSC CGL, Banking & UPSC</title>
    <link>${SITE_URL}</link>
    <description>Daily bilingual (English-Hindi) vocabulary quizzes based on current affairs editorials. 40+ exam-style questions per article covering Error Detection, Sentence Improvement, Para Jumbles, Fill in the Blanks, Synonyms, Antonyms, Collocation, and Reading Comprehension. Practice for SSC CGL, Banking, UPSC, Railway, and other competitive exams. Full 11,762+ word premium course also available.</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/web-app-manifest-512x512.png</url>
      <title>kajubadam Vocabulary</title>
      <link>${SITE_URL}</link>
      <width>512</width>
      <height>512</height>
    </image>
    <category>Education</category>
    <category>Competitive Exams</category>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <managingEditor>contact@kajubadamvocabulary.in (Kajubadam Vocabulary)</managingEditor>
    <webMaster>contact@kajubadamvocabulary.in (Kajubadam Vocabulary)</webMaster>
    <copyright>${new Date().getFullYear()} kajubadam Vocabulary. All rights reserved.</copyright>
    ${items.join("\n")}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
