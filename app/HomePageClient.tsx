"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { DailyNewsMeta } from "@/lib/daily-news";
import DailyNewsPageClient from "./DailyNewsPageClient";

interface Story {
  slug: string;
  title: string;
  saga_id: string;
  vocabCount: number;
}

interface Props {
  part1Stories: Story[];
  part2Stories: Story[];
  dailyNews: DailyNewsMeta[];
}

export default function HomePageClient({ part1Stories, part2Stories, dailyNews }: Props) {
  const [activeTab, setActiveTab] = useState<"part1" | "part2" | "daily">("part1");
  const [currentPage, setCurrentPage] = useState(1);
  const [masteredSlugs, setMasteredSlugs] = useState<string[]>([]);

  // Init tab from URL param / sessionStorage and load progress on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    const savedTab = sessionStorage.getItem("activeTab");

    // Priority: URL param > sessionStorage (back-nav) > default "part1"
    if (tabParam === "part1" || tabParam === "part2" || tabParam === "daily") {
      setActiveTab(tabParam);
      sessionStorage.setItem("activeTab", tabParam);
    } else if (savedTab === "part1" || savedTab === "part2" || savedTab === "daily") {
      setActiveTab(savedTab);
    }

    // Restore mastered stories progress from localStorage
    const saved = localStorage.getItem("mastered_stories");
    if (saved) {
      try {
        setMasteredSlugs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse mastered stories progress", e);
      }
    }
  }, []);

  // Save activeTab to sessionStorage on every change (for Chrome back button)
  useEffect(() => {
    sessionStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  // Save progress
  const saveMastered = (slugs: string[]) => {
    setMasteredSlugs(slugs);
    localStorage.setItem("mastered_stories", JSON.stringify(slugs));
  };

  const toggleMastery = (slug: string) => {
    if (masteredSlugs.includes(slug)) {
      saveMastered(masteredSlugs.filter((s) => s !== slug));
    } else {
      saveMastered([...masteredSlugs, slug]);
    }
  };

  const activeStories = activeTab === "part1" ? part1Stories : activeTab === "part2" ? part2Stories : [];

  // For daily tab, use dailyNews directly
  const dailyItems = activeTab === "daily" ? dailyNews : [];

  // Pagination Configuration
  const PAGE_SIZE = 10;
  const totalPages = activeTab === "daily"
    ? Math.max(1, Math.ceil(dailyItems.length / PAGE_SIZE))
    : Math.max(1, Math.ceil(activeStories.length / PAGE_SIZE));

  // Reset pagination on tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Paginated daily news
  const paginatedDaily = dailyItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const paginatedStories = activeStories.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  };

  // Dynamic Vocab Counter
  const totalVocabCount =
    part1Stories.reduce((acc, s) => acc + (s.vocabCount || 0), 0) +
    part2Stories.reduce((acc, s) => acc + (s.vocabCount || 0), 0);

  // Active Tab Mastery stats
  const activeMasteredCount = activeStories.filter((s) =>
    masteredSlugs.includes(s.slug)
  ).length;

  return (
    <div className="min-h-screen bg-gray-50/40 font-sans relative">
      {/* Top Header Section */}
      <header className="bg-white pt-4 pb-2 border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo & Total */}
          <div className="flex items-center gap-6 shrink-0">
            <h1 className="text-xl md:text-2xl font-black text-[#1c4a8a] tracking-tight leading-tight">
              kajubadam<br />Vocabulary
            </h1>
            <span className="bg-[#1c4a8a] text-white text-xs font-extrabold px-5 py-1.5 rounded-full shadow-sm">
              Total: {totalVocabCount.toLocaleString()} Vocab
            </span>
          </div>

          {/* Mobile/Tablet Mini Breakdown (below lg) */}
          <div className="flex lg:hidden items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-[#1c4a8a] bg-[#1c4a8a]/5 px-2 py-0.5 rounded border border-[#1c4a8a]/10">P1: 5,062</span>
            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">P2: 6,700</span>
          </div>

          {/* Middle Stats — Breakdown (lg+) */}
          <div className="hidden lg:flex flex-1 mx-8 justify-center">
            <div className="flex items-stretch gap-0">
              {/* PART 1 COLUMN */}
              <div className="flex flex-col items-center px-6 py-1">
                <span className="text-[11px] font-black text-[#1c4a8a] tracking-wider uppercase bg-[#1c4a8a]/5 px-3 py-1 rounded-full border border-[#1c4a8a]/15 mb-2">
                  PART 1
                </span>
                <div className="flex flex-wrap gap-1.5 justify-center max-w-[300px]">
                  {['627 Homonyms', '2,300 Idioms', '1,028 Phrasal', '588 Prep', '219 Proverbs', '300 Stories'].map((t, i) => (
                    <span key={t} className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${i === 0 ? 'bg-blue-50 text-blue-600 border-blue-200' : i === 1 ? 'bg-green-50 text-green-600 border-green-200' : i === 2 ? 'bg-purple-50 text-purple-600 border-purple-200' : i === 3 ? 'bg-rose-50 text-rose-600 border-rose-200' : i === 4 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-teal-50 text-teal-600 border-teal-200'}`}>{t}</span>
                  ))}
                </div>
              </div>

              {/* VERTICAL DIVIDER */}
              <div className="w-px bg-gray-200 self-stretch mx-1"></div>

              {/* PART 2 COLUMN */}
              <div className="flex flex-col items-center px-6 py-1">
                <span className="text-[11px] font-black text-orange-500 tracking-wider uppercase bg-orange-50 px-3 py-1 rounded-full border border-orange-200 mb-2">
                  PART 2
                </span>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  <span className="bg-orange-50 text-orange-600 text-[11px] font-semibold px-3 py-1 rounded-md border border-orange-200">67 Batches</span>
                  <span className="bg-orange-50 text-orange-600 text-[11px] font-semibold px-3 py-1 rounded-md border border-orange-200">= 6,700 Vocab</span>
                </div>
              </div>
            </div>
          </div>


        </div>
      </header>

      {/* Homepage Intro — SEO + AdSense content */}
      <div className="bg-[#f8fafc] border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-5 text-[13px] text-slate-600 leading-relaxed">

          {/* Hero heading */}
          <h2 className="text-[17px] font-extrabold text-[#1c4a8a] mb-3 tracking-tight">
            Welcome to Kajubadam Vocabulary – Your Ultimate Exam Prep Partner
          </h2>

          {/* Paragraph 1 */}
          <p className="mb-3">
            <strong className="text-slate-800 font-bold">Kajubadam Vocabulary</strong> is a comprehensive, 100% free vocabulary-building platform purpose-built for aspirants preparing for various competitive exams across India. We specifically cater to students targeting{" "}
            <strong className="text-slate-800 font-bold">SSC (CGL, CHSL, MTS, CPO), Banking (IBPS PO/Clerk, SBI PO), UPSC (CDS, NDA, CAPF), Railway, State PSCs</strong>, and other government recruitment exams.
          </p>
          <p className="mb-4">
            Our core philosophy is to simplify English preparation. We help you master high-yield English words systematically through real-world context, completely eliminating the need for old-school, boring rote memorization. With no registration or signup required, you can start your vocabulary learning and preparation journey instantly.
          </p>

          {/* Divider */}
          <hr className="border-slate-200 mb-4" />

          {/* Curriculum Section */}
          <h2 className="text-[15px] font-extrabold text-[#1c4a8a] mb-2 tracking-tight">
            Our Curriculum: 11,762+ Exam-Oriented Words
          </h2>
          <p className="mb-3">
            To ensure you are fully prepared for any question type—be it synonyms, antonyms, cloze tests, spelling errors, or reading comprehension—our syllabus is organized across two highly structured parts:
          </p>
          <ul className="space-y-2 mb-4 pl-1">
            <li className="flex gap-2">
              <span className="text-[#1c4a8a] font-extrabold shrink-0">Part 1:</span>
              <span>
                <strong className="text-slate-800 font-bold">Core Vocabulary Essentials (5,062 Words)</strong> — Master the absolute building blocks of competitive English. This section covers{" "}
                <strong className="text-slate-800 font-bold">627 Homonyms/Confused Words</strong>,{" "}
                <strong className="text-slate-800 font-bold">2,300 Idioms & Phrases</strong>,{" "}
                <strong className="text-slate-800 font-bold">1,028 Phrasal Verbs</strong>,{" "}
                <strong className="text-slate-800 font-bold">588 Fixed Prepositions</strong>, and{" "}
                <strong className="text-slate-800 font-bold">219 Proverbs</strong>. These are the high-frequency patterns that regularly appear in exam papers.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#1c4a8a] font-extrabold shrink-0">Part 2:</span>
              <span>
                <strong className="text-slate-800 font-bold">Story-Based Vocabulary (6,700 Words)</strong> — Learn through our unique method consisting of{" "}
                <strong className="text-slate-800 font-bold">67 batch-wise bilingual story sets</strong>. Each story naturally weaves high-yield target words into an engaging English narrative accompanied by precise Hindi translations.
              </span>
            </li>
          </ul>

          {/* Divider */}
          <hr className="border-slate-200 mb-4" />

          {/* Why Contextual Section */}
          <h2 className="text-[15px] font-extrabold text-[#1c4a8a] mb-2 tracking-tight">
            Why Contextual & Story-Based Learning Works?
          </h2>
          <p className="mb-4">
            Scientific research in language acquisition proves that the human brain retains words much better when they are learned in a sentence or story rather than in isolation. When you read a 100-word story on our platform, you do not just memorize a definition; you understand how that word interacts with other parts of speech, its tone (positive or negative), and its exact application in sentences.
          </p>

          {/* Divider */}
          <hr className="border-slate-200 mb-4" />

          {/* Interactive Quizzes Section */}
          <h2 className="text-[15px] font-extrabold text-[#1c4a8a] mb-2 tracking-tight">
            Interactive Quizzes for Active Recall
          </h2>
          <p className="mb-2">To guarantee long-term retention, every single story and vocabulary set is paired with <strong className="text-slate-800 font-bold">interactive fill-in-the-blank quizzes</strong>.</p>
          <ul className="space-y-1.5 mb-4 pl-1 list-none">
            <li className="flex gap-2">
              <span className="text-[#1c4a8a] font-extrabold shrink-0">▶</span>
              <span><strong className="text-slate-800 font-bold">Real Exam Simulation:</strong> Practice questions that mimic the exact pattern and difficulty level of Tier-1 and Tier-2 exams.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#1c4a8a] font-extrabold shrink-0">▶</span>
              <span><strong className="text-slate-800 font-bold">Multi-Dimensional Practice:</strong> Our quizzes reinforce correct word spellings, definitions, and contextual usage, training you to avoid common traps.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#1c4a8a] font-extrabold shrink-0">▶</span>
              <span><strong className="text-slate-800 font-bold">Bilingual Explanations:</strong> Every target word comes with its precise English meaning, Hindi translation, grammatical category, and an example sentence for complete understanding.</span>
            </li>
          </ul>

          {/* Divider */}
          <hr className="border-slate-200 mb-4" />

          {/* Daily News Section */}
          <h2 className="text-[15px] font-extrabold text-[#1c4a8a] mb-2 tracking-tight">
            Stay Ahead with Daily News Vocabulary
          </h2>
          <p className="mb-4">
            Modern competitive exams heavily test comprehension skills using editorials from prominent newspapers. Our{" "}
            <strong className="text-slate-800 font-bold">Daily News Vocabulary</strong> section extracts exam-relevant words from current news and editorials. This allows you to build massive word power while naturally staying updated with current affairs—giving you a dual advantage in both the English and General Awareness sections.
          </p>

          {/* Closing */}
          <p className="text-slate-500 text-[12px]">
            Whether you are a beginner starting your English preparation from scratch or an advanced aspirant looking to polish your skills for the final selection,{" "}
            <strong className="text-[#1c4a8a] font-extrabold">Kajubadam Vocabulary</strong> provides a structured, scientific, and absolutely free environment to achieve vocabulary mastery.
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto flex justify-center gap-8 md:gap-[80px]">
          <button
            onClick={() => setActiveTab("part1")}
            className={`font-bold text-[13px] md:text-[15px] tracking-wide py-4 px-4 md:px-6 transition-all ${activeTab === "part1"
              ? "text-[#1c4a8a] border-b-4 border-[#1c4a8a]"
              : "text-gray-400 hover:text-gray-700"
              }`}
          >
            VOCAB PART 1
          </button>
          <button
            onClick={() => setActiveTab("part2")}
            className={`font-bold text-[13px] md:text-[15px] tracking-wide py-4 px-4 md:px-6 transition-all ${activeTab === "part2"
              ? "text-[#1c4a8a] border-b-4 border-[#1c4a8a]"
              : "text-gray-400 hover:text-gray-700"
              }`}
          >
            VOCAB PART 2
          </button>
          <button
            onClick={() => setActiveTab("daily")}
            className={`font-bold text-[13px] md:text-[15px] tracking-wide py-4 px-4 md:px-6 transition-all ${activeTab === "daily"
              ? "text-[#FF7722] border-b-4 border-[#FF7722]"
              : "text-gray-400 hover:text-gray-700"
              }`}
          >
            DAILY NEWS VOCAB
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-4 lg:px-8 py-3">
        {/* ── DAILY NEWS TAB ── */}
        {activeTab === "daily" ? (
          <DailyNewsPageClient dailyNews={dailyNews} />
        ) : (
          <>
            {/* Stories title and stats */}
            <div className="mb-3 pl-2 flex flex-col md:flex-row md:items-end justify-between gap-2">
              <div>
                <h2 className="text-[22px] font-extrabold text-gray-800 tracking-tight leading-none mb-1">
                  {activeTab === "part1" ? "Vocab Part 1" : "Vocab Part 2"}
                </h2>
                <p className="text-[#1c4a8a] text-[15px] font-semibold bg-[#1c4a8a]/5 inline-block px-3 py-1 rounded-md border border-[#1c4a8a]/10">
                  {activeMasteredCount} / {activeStories.length} Stories Mastered
                </p>
              </div>
              <div className="text-right text-[13px] text-gray-400 font-medium">
                Showing {activeStories.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, activeStories.length)} of {activeStories.length} stories
              </div>
            </div>

            {/* Stories Grid */}
            {paginatedStories.length === 0 ? (
              <div className="bg-white rounded-xl p-16 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-[18px] font-bold text-gray-700 mb-1">No Stories Found</h3>
                <p className="text-gray-400 text-[14px]">No stories available in this section.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-3">
                {paginatedStories.map((story) => {
                  const isMastered = masteredSlugs.includes(story.slug);
                  return (
                    <div
                      key={story.slug}
                      className={`bg-white border rounded-xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-lg transition-all duration-300 min-h-[150px] relative ${isMastered ? "border-green-200 bg-green-50/10" : "border-gray-100"}`}
                    >
                      <button
                        onClick={() => toggleMastery(story.slug)}
                        className={`absolute top-3 right-3 p-1 rounded-full border transition-all active:scale-90 ${isMastered ? "bg-green-500 border-green-500 text-white shadow-sm" : "bg-white border-gray-200 text-gray-300 hover:text-gray-500 hover:border-gray-300"}`}
                        title={isMastered ? "Marked as Mastered" : "Mark as Mastered"}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <div>
                        <h4 className="text-[10px] font-black text-[#1c4a8a] uppercase tracking-wider mb-1 pr-6">{story.saga_id}</h4>
                        <h3 className="text-[14px] font-bold text-gray-800 leading-snug">{story.title}</h3>
                      </div>
                      <div>
                        <span className="inline-block text-[10px] font-bold text-gray-400 uppercase bg-gray-50 border border-gray-200/60 rounded px-2 py-0.5 mb-2">{story.vocabCount || 0} vocabulary words</span>
                        <div className="flex gap-2">
                          <Link href={`/stories/${story.slug}`} className="flex-1 text-center bg-gray-100/80 hover:bg-gray-200/90 text-gray-700 text-[12px] font-bold py-1.5 rounded-full transition">Read</Link>
                          <Link href={`/stories/${story.slug}/quiz`} className="flex-1 text-center bg-[#1c4a8a] hover:bg-blue-900 text-white text-[12px] font-bold py-1.5 rounded-full transition shadow-sm">Quiz</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-5 select-none">
                <button onClick={handlePrevPage} disabled={currentPage === 1}
                  className={`px-4 py-2 border rounded-lg font-bold text-[14px] flex items-center gap-1.5 transition-all active:scale-95 ${currentPage === 1 ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-200 text-[#1c4a8a] hover:bg-gray-50 hover:border-gray-300 shadow-sm"}`}>
                  &larr; Previous
                </button>
                <span className="text-[14px] font-semibold text-gray-500">
                  Page <span className="text-[#1c4a8a] font-bold bg-[#1c4a8a]/5 px-2.5 py-1 rounded border border-[#1c4a8a]/10">{currentPage}</span> of <span className="font-bold text-gray-700">{totalPages}</span>
                </span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}
                  className={`px-4 py-2 border rounded-lg font-bold text-[14px] flex items-center gap-1.5 transition-all active:scale-95 ${currentPage === totalPages ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-200 text-[#1c4a8a] hover:bg-gray-50 hover:border-gray-300 shadow-sm"}`}>
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
