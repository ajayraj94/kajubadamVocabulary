import { getAllDailyNews } from "@/lib/daily-news";

const SITE_URL = process.env.SITE_URL || "https://kajubadamvocabulary.in";

/** Escape XML special characters: & < > " ' */
function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const allNews = getAllDailyNews();

  const items = allNews.slice(0, 20).map((news) => {
    const pubDate = new Date(news.date);
    const pubDateRFC2822 = isNaN(pubDate.getTime())
      ? new Date().toUTCString()
      : pubDate.toUTCString();

    const articleUrl = SITE_URL + "/daily-news/" + news.slug;
    const title = esc(news.title + " \u2014 " + news.questionCount + " Exam Questions for SSC CGL, Banking & UPSC");
    const source = esc(news.source);
    const description = esc(
      news.questionCount + " exam-style vocabulary questions from " + news.source +
      " editorial. Error Detection, Sentence Improvement, Para Jumbles, Fill in the Blanks, Synonyms, Antonyms, Collocation, and Reading Comprehension practice for SSC CGL, Banking, UPSC aspirants. Full 11,762+ word premium course: Part 1 (\u20B9299) + Part 2 (\u20B9399) + SSC PYQs (\u20B9149 each) at " + SITE_URL + "/pricing"
    );

    return [
      "    <item>",
      "      <title>" + title + "</title>",
      "      <link>" + articleUrl + "</link>",
      '      <guid isPermaLink="true">' + articleUrl + "</guid>",
      "      <pubDate>" + pubDateRFC2822 + "</pubDate>",
      "      <source>" + source + "</source>",
      "      <description>" + description + "</description>",
      '      <category domain="blog-tag">Vocabulary</category>',
      '      <category domain="blog-tag">Competitive Exams</category>',
      '      <category domain="blog-tag">SSC CGL</category>',
      "    </item>",
    ].join("\n");
  });

  const channelTitle = esc("kajubadam Vocabulary \u2014 Daily News Quiz for SSC CGL, Banking & UPSC");
  const channelDesc = esc(
    "Daily bilingual (English-Hindi) vocabulary quizzes based on current affairs editorials. " +
    "40+ exam-style questions per article covering Error Detection, Sentence Improvement, " +
    "Para Jumbles, Fill in the Blanks, Synonyms, Antonyms, Collocation, and Reading Comprehension. " +
    "Practice for SSC CGL, Banking, UPSC, Railway, and other competitive exams. " +
    "Full 11,762+ word premium course also available."
  );

  const rssLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>" + channelTitle + "</title>",
    "    <link>" + SITE_URL + "</link>",
    "    <description>" + channelDesc + "</description>",
    "    <language>en-in</language>",
    "    <lastBuildDate>" + new Date().toUTCString() + "</lastBuildDate>",
    '    <atom:link href="' + SITE_URL + '/feed.xml" rel="self" type="application/rss+xml"/>',
    "    <image>",
    "      <url>" + SITE_URL + "/web-app-manifest-512x512.png</url>",
    "      <title>kajubadam Vocabulary</title>",
    "      <link>" + SITE_URL + "</link>",
    '      <width>512</width>',
    '      <height>512</height>',
    "    </image>",
    '    <category domain="blog-tag">Education</category>',
    '    <category domain="blog-tag">Competitive Exams</category>',
    "    <docs>https://www.rssboard.org/rss-specification</docs>",
    "    <managingEditor>contact@kajubadamvocabulary.in (Kajubadam Vocabulary)</managingEditor>",
    "    <webMaster>contact@kajubadamvocabulary.in (Kajubadam Vocabulary)</webMaster>",
    "    <copyright>" + new Date().getFullYear() + " kajubadam Vocabulary. All rights reserved.</copyright>",
    ...items,
    "  </channel>",
    "</rss>",
  ];

  return new Response(rssLines.join("\n"), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
