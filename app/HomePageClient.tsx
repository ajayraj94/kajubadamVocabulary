"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { DailyNewsMeta } from "@/lib/daily-news";
import DailyNewsPageClient from "./DailyNewsPageClient";
import { usePurchaseAccess } from "@/hooks/usePurchaseAccess";
import { FREE_SLUGS } from "@/lib/access";
import { getProductPrice } from "@/lib/products";
import ShareButtons from "@/components/ShareButtons";
import BlogNav from "@/app/_components/BlogNav";

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
  totalErrorDetectionQuestions: number;
  errorDetectionTotalPages: number;
  totalSentenceImprovementQuestions: number;
  sentenceImprovementTotalPages: number;
}

export default function HomePageClient({ part1Stories, part2Stories, dailyNews, totalErrorDetectionQuestions, errorDetectionTotalPages, totalSentenceImprovementQuestions, sentenceImprovementTotalPages }: Props) {
  const TABS = [
    { id: 'daily', label: 'DAILY NEWS VOCAB', shortLabel: 'News', icon: '📰', activeColor: '#FF7722' },
    { id: 'blog', label: 'BLOG', shortLabel: 'Blog', icon: '📝', activeColor: '#1c4a8a', external: true },
    { id: 'error-detection', label: 'ERROR DETECTION', shortLabel: 'Error', icon: '🔍', activeColor: '#8B0000' },
    { id: 'sentence-improvement', label: 'SENTENCE IMPROVEMENT', shortLabel: 'Improve', icon: '✏️', activeColor: '#0d7a3e' },
    { id: 'part1', label: 'VOCAB PART 1', shortLabel: 'P1', icon: '📚', activeColor: '#1c4a8a' },
    { id: 'part2', label: 'VOCAB PART 2', shortLabel: 'P2', icon: '📚', activeColor: '#1c4a8a' },
  ] as const;
  type TabId = typeof TABS[number]['id'];

  const [activeTab, setActiveTab] = useState<TabId>("part1");
  const [currentPage, setCurrentPage] = useState(1);
  const [masteredSlugs, setMasteredSlugs] = useState<string[]>([]);
  const { hasPart1, hasPart2, hasErrorDetection, hasSentenceImprovement, isLoading: accessLoading, isLoggedIn, userEmail, userName, userAvatar, loginWithGoogle, logoutUser } = usePurchaseAccess();

  // Init tab from URL param / sessionStorage and load progress on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    const savedTab = sessionStorage.getItem("activeTab");

    const TABS_IDS = TABS.map(t => t.id) as TabId[];
    if (TABS_IDS.includes(tabParam as TabId)) {
      setActiveTab(tabParam as TabId);
      sessionStorage.setItem("activeTab", tabParam);
      // Scroll to content section when coming from another page (e.g. /blog)
      requestAnimationFrame(() => {
        const contentEl = document.getElementById("content");
        if (contentEl) {
          contentEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    } else if (TABS_IDS.includes(savedTab as TabId)) {
      setActiveTab(savedTab as TabId);
    }

    const saved = localStorage.getItem("mastered_stories");
    if (saved) {
      try {
        setMasteredSlugs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse mastered stories progress", e);
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

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
  const dailyItems = activeTab === "daily" ? dailyNews : [];
  const errorDetectionPages = errorDetectionTotalPages;

  const PAGE_SIZE = 10;
  const totalPages = activeTab === "daily"
    ? Math.max(1, Math.ceil(dailyItems.length / PAGE_SIZE))
    : activeTab === "error-detection"
      ? 1
      : Math.max(1, Math.ceil(activeStories.length / PAGE_SIZE));

  const errorDetectionBlocks = Array.from({ length: errorDetectionPages }, (_, i) => ({
    page: i + 1,
    startQ: i * 50 + 1,
    endQ: Math.min((i + 1) * 50, totalErrorDetectionQuestions),
  }));

  const sentenceImprovementBlocks = Array.from({ length: sentenceImprovementTotalPages }, (_, i) => ({
    page: i + 1,
    startQ: i * 50 + 1,
    endQ: Math.min((i + 1) * 50, totalSentenceImprovementQuestions),
  }));

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const paginatedDaily = dailyItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const paginatedStories = activeStories.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const totalVocabCount =
    part1Stories.reduce((acc, s) => acc + (s.vocabCount || 0), 0) +
    part2Stories.reduce((acc, s) => acc + (s.vocabCount || 0), 0);

  const activeMasteredCount = activeStories.filter((s) => masteredSlugs.includes(s.slug)).length;

  const handleLoginClick = () => {
    if (isLoggedIn) {
      logoutUser();
    } else {
      loginWithGoogle();
    }
  };

  const handleVocabNavClick = (tab: "part1" | "part2") => {
    setActiveTab(tab);
    // Update URL without page reload so tab is preserved on refresh
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
    // Smooth scroll to the content section
    const contentEl = document.getElementById("content");
    if (contentEl) {
      contentEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/40 font-sans relative">
      {/* ── BLOG NAV — 7 toggle navigation items ── */}
      <BlogNav onVocabClick={handleVocabNavClick} />

      {/* ── HEADER ── */}
      <header className="bg-white pt-3 pb-0 border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Top row: Logo + Total + Auth */}
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 flex items-center justify-between gap-2 md:gap-4 mb-1 flex-wrap">
          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            <h1 className="text-lg md:text-xl lg:text-2xl font-black text-[#1c4a8a] tracking-tight leading-tight">
              kajubadam<br />Vocabulary
            </h1>
            <span className="bg-[#1c4a8a] text-white text-[9px] md:text-xs font-extrabold px-2.5 md:px-5 py-1.5 rounded-full shadow-sm whitespace-nowrap">
              Total: {totalVocabCount.toLocaleString()} Vocab
            </span>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-[#0f172a] font-extrabold text-[9px] md:text-xs px-2.5 md:px-4 py-1.5 rounded-full shadow-[0_2px_8px_-2px_rgba(251,191,36,0.5)] hover:shadow-[0_4px_12px_-2px_rgba(251,191,36,0.7)] hover:scale-105 transition-all duration-200 active:scale-95 whitespace-nowrap"
            >
              <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              <span>📝 Blog</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isLoggedIn ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt=""
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#1c4a8a] text-white flex items-center justify-center text-[10px] sm:text-[11px] font-bold shrink-0">
                    {(userName || userEmail || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-[11px] text-gray-500 font-medium max-w-[80px] sm:max-w-[150px] truncate">{userName || userEmail}</span>
                <button onClick={handleLoginClick} className="text-[11px] font-bold text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-2 sm:px-3 py-1 rounded-full transition-all whitespace-nowrap">Logout</button>
              </div>
            ) : (
              <button onClick={handleLoginClick} className="text-[11px] font-bold text-[#1c4a8a] bg-[#1c4a8a]/5 hover:bg-[#1c4a8a]/10 border border-[#1c4a8a]/20 px-3 py-1 rounded-full transition-all whitespace-nowrap">🔑 Sign in with Google</button>
            )}
          </div>
        </div>

        {/* ═══ STATS: Part 1 & Part 2 — premium single-frame ═══ */}
        <div className="pb-2 pt-0.5">
          <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
            <div className="relative bg-gradient-to-br from-white via-blue-50/20 to-orange-50/20 rounded-2xl p-[1px] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-200/40 via-indigo-200/20 to-orange-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-2.5 md:p-3">

                {/* ── PART 1 row ── */}
                <div className="flex items-center gap-x-1.5 gap-y-0.5 flex-wrap">
                  <span className="relative inline-flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-2 py-0.5 rounded-lg text-[9px] md:text-[10px] shrink-0 shadow-[0_2px_8px_-2px_rgba(37,99,235,0.4)]">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    PART 1
                  </span>
                  {['627 Homonyms', '2,300 Idioms', '1,028 Phrasal', '588 Prep', '219 Proverbs', '300 Stories'].map((t, i) => (
                    <span key={t} className="inline-flex items-center gap-x-1 px-1 py-0.5 rounded-md transition-all duration-200 hover:bg-white/80 hover:shadow-sm">
                      {i > 0 && <span className="text-gray-200 text-[9px]">•</span>}
                      <span className={`font-bold text-[12px] md:text-[13px] ${i === 0 ? 'text-blue-600' : i === 1 ? 'text-emerald-600' : i === 2 ? 'text-violet-600' : i === 3 ? 'text-rose-600' : i === 4 ? 'text-amber-600' : 'text-cyan-600'
                        }`}>{t}</span>
                    </span>
                  ))}
                  <span className="text-gray-400 text-[9px] font-medium ml-auto hidden sm:inline-flex items-center gap-1 bg-blue-50/50 px-1.5 py-0.5 rounded-full border border-blue-100/50">
                    <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                    5,062 words
                  </span>
                </div>

                {/* Gradient divider */}
                <div className="my-1.5 flex items-center gap-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-200/60 via-indigo-200/30 to-transparent"></div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200/30 to-orange-200/60"></div>
                </div>

                {/* ── PART 2 row ── */}
                <div className="flex items-center gap-x-1.5 gap-y-0.5 flex-wrap">
                  <span className="relative inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black px-2 py-0.5 rounded-lg text-[9px] md:text-[10px] shrink-0 shadow-[0_2px_8px_-2px_rgba(249,115,22,0.4)]">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    PART 2
                  </span>
                  <span className="inline-flex items-center gap-x-1 px-1 py-0.5 rounded-md transition-all duration-200 hover:bg-white/80 hover:shadow-sm">
                    <span className="font-bold text-orange-600 text-[12px] md:text-[13px]">67 Batches</span>
                  </span>
                  <span className="text-gray-200 text-[9px]">•</span>
                  <span className="inline-flex items-center gap-x-1 px-1 py-0.5 rounded-md transition-all duration-200 hover:bg-white/80 hover:shadow-sm">
                    <span className="font-bold text-orange-600 text-[12px] md:text-[13px]">6,700 Vocab</span>
                  </span>
                  <span className="text-gray-400 text-[9px] font-medium ml-auto hidden sm:inline-flex items-center gap-1 bg-orange-50/50 px-1.5 py-0.5 rounded-full border border-orange-100/50">
                    <span className="w-1 h-1 rounded-full bg-orange-400"></span>
                    6,700 words
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── ORIGINAL HERO BANNER: FOMO + Trust + Urgency ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1c4a8a] to-[#0f172a] border-b border-blue-500/20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl"></div>
        </div>

        <div className="relative max-w-[1200px] mx-auto px-4 lg:px-8 py-10 md:py-16">
          {/* Top badge */}
          <div className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-300 text-[11px] md:text-[12px] font-bold px-4 py-1.5 rounded-full border border-emerald-400/20 backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span>India&apos;s Most Advanced Vocabulary Platform for SSC &amp; Banking</span>
            </span>
          </div>

          {/* Main headline — Fear + Trust */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-[24px] md:text-[36px] lg:text-[44px] font-black text-white leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
                आपकी प्रतियोगिता पहले से बहुत तेज़ है!
              </span>
              <br />
              <span className="text-white">उनसे आगे निकलने का यही मौका है — अभी शुरू करो</span>
            </h1>

            <p className="text-[14px] md:text-[16px] text-blue-100/80 mt-4 max-w-2xl mx-auto leading-relaxed">
              <strong className="text-white font-bold">11,762+ exam-oriented words</strong> — हर शब्द SSC CGL, CHSL, IBPS, SBI PO, Railway, UPSC के पिछले 10 साल के पेपर से चुना गया।
              जो आज खरीदेगा, वह कल अपने प्रतिद्वंद्वी से <strong className="text-amber-300 font-bold">एक कदम आगे</strong> होगा।
            </p>
          </div>

          {/* Stats row — Social Proof */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-4xl mx-auto mt-8 md:mt-10">
            {[
              { value: '11,762+', label: 'Exam Words', sub: 'SSC • Banking • Railway', color: 'from-blue-400 to-blue-600' },
              { value: '716', label: 'Error Detection PYQ', sub: 'Bilingual Solutions', color: 'from-rose-400 to-rose-600' },
              { value: '67', label: 'Story Batches', sub: '6,700 Contextual Words', color: 'from-amber-400 to-orange-500' },
              { value: '₹0', label: 'Start Free', sub: '2 Free Stories + Daily News', color: 'from-emerald-400 to-emerald-600' },
            ].map((stat, i) => (
              <div key={stat.label} className={`bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-white/10 text-center hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 group ${i === 1 ? 'md:mt-3' : i === 3 ? 'md:mt-3' : ''}`}>
                <div className={`inline-flex text-[22px] md:text-[28px] font-black bg-gradient-to-br ${stat.color} bg-clip-text text-transparent leading-none`}>
                  {stat.value}
                </div>
                <p className="text-[12px] md:text-[13px] font-bold text-white mt-1.5">{stat.label}</p>
                <p className="text-[10px] text-blue-200/60 mt-0.5 hidden md:block">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Trust signals + CTA */}
          <div className="flex flex-col items-center mt-8 md:mt-10 gap-4">
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <Link
                href="/pricing"
                className="relative group inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-[#0f172a] font-black text-[14px] md:text-[16px] px-8 py-3.5 rounded-full shadow-[0_0_30px_-5px_rgba(251,191,36,0.5)] hover:shadow-[0_0_40px_-5px_rgba(251,191,36,0.7)] transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span>🚀 अभी Full Access लें</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-[13px] md:text-[14px] px-6 py-3.5 rounded-full border border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Free Content Explore करें
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] md:text-[12px] text-blue-200/70">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Lifetime Access — एक बार भुगतान
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure Payment
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                100% SSC Exam-Focused
              </span>
            </div>

            {/* Share with friends — Free viral distribution */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <span className="text-[11px] md:text-[12px] text-blue-200/60 font-medium">📢 Share with friends — Free vocabulary for everyone!</span>
              <ShareButtons
                url="https://kajubadamvocabulary.in"
                title="kajubadam Vocabulary — 11,762+ Free Exam Words (SSC CGL, Banking, UPSC)"
                description="Learn English-Hindi vocabulary through immersive stories. 2 free stories + daily news vocab — completely free!"
                variant="compact"
                size="sm"
              />
            </div>
          </div>

          {/* Scrolling marquee — Urgency */}
          <div className="mt-8 md:mt-10 overflow-hidden">
            <div className="flex gap-8 animate-marquee whitespace-nowrap">
              <span className="text-[11px] md:text-[12px] text-blue-200/40 font-medium">• 500+ Students Already Learning • New Daily News Vocab Added • SSC CGL 2025 Ready • 2 Free Stories + Daily News • Bilingual Explanations •</span>
              <span className="text-[11px] md:text-[12px] text-blue-200/40 font-medium">• 500+ Students Already Learning • New Daily News Vocab Added • SSC CGL 2025 Ready • 2 Free Stories + Daily News • Bilingual Explanations •</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#f8fafc] to-transparent"></div>
      </section>

      {/* ── INTRO SECTION (reduced padding) ── */}
      <div className="bg-[#f8fafc] border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-1 text-[13px] text-slate-600 leading-relaxed">
          <h2 className="text-[17px] font-extrabold text-[#1c4a8a] mb-2 tracking-tight">Welcome to Kajubadam Vocabulary – Your Ultimate Exam Prep Partner</h2>
          <p className="mb-2">
            <strong className="text-slate-800 font-bold">Kajubadam Vocabulary</strong> is a comprehensive, 100% free vocabulary-building platform purpose-built for aspirants preparing for various competitive exams across India. We specifically cater to students targeting{" "}
            <strong className="text-slate-800 font-bold">SSC (CGL, CHSL, MTS, CPO), Banking (IBPS PO/Clerk, SBI PO), UPSC (CDS, NDA, CAPF), Railway, State PSCs</strong>, and other government recruitment exams.
          </p>
          <p className="mb-2">
            Our core philosophy is to simplify English preparation. We help you master high-yield English words systematically through real-world context, completely eliminating the need for old-school, boring rote memorization. With no registration or signup required, you can start your vocabulary learning and preparation journey instantly.
          </p>

          <hr className="border-slate-200 mb-2" />

          <h2 className="text-[15px] font-extrabold text-[#1c4a8a] mb-1 tracking-tight">Our Curriculum: 11,762+ Exam-Oriented Words</h2>
          <p className="mb-2">
            To ensure you are fully prepared for any question type—be it synonyms, antonyms, cloze tests, spelling errors, or reading comprehension—our syllabus is organized across two highly structured parts:
          </p>
          <ul className="space-y-1 mb-3 pl-1">
            <li className="flex gap-2">
              <span className="text-[#1c4a8a] font-extrabold shrink-0">Part 1:</span>
              <span><strong className="text-slate-800 font-bold">Core Vocabulary Essentials (5,062 Words)</strong> — Master the absolute building blocks of competitive English. This section covers{" "}
                <strong className="text-slate-800 font-bold">627 Homonyms/Confused Words</strong>,{" "}
                <strong className="text-slate-800 font-bold">2,300 Idioms & Phrases</strong>,{" "}
                <strong className="text-slate-800 font-bold">1,028 Phrasal Verbs</strong>,{" "}
                <strong className="text-slate-800 font-bold">588 Fixed Prepositions</strong>, and{" "}
                <strong className="text-slate-800 font-bold">219 Proverbs</strong>. These are the high-frequency patterns that regularly appear in exam papers.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#1c4a8a] font-extrabold shrink-0">Part 2:</span>
              <span><strong className="text-slate-800 font-bold">Story-Based Vocabulary (6,700 Words)</strong> — Learn through our unique method consisting of{" "}
                <strong className="text-slate-800 font-bold">67 batch-wise bilingual story sets</strong>. Each story naturally weaves high-yield target words into an engaging English narrative accompanied by precise Hindi translations.
              </span>
            </li>
          </ul>

          <hr className="border-slate-200 mb-2" />

          <h2 className="text-[15px] font-extrabold text-[#1c4a8a] mb-1 tracking-tight">Why Contextual & Story-Based Learning Works?</h2>
          <p className="mb-2">Scientific research in language acquisition proves that the human brain retains words much better when they are learned in a sentence or story rather than in isolation. When you read a 100-word story on our platform, you do not just memorize a definition; you understand how that word interacts with other parts of speech, its tone (positive or negative), and its exact application in sentences.</p>

          <hr className="border-slate-200 mb-2" />

          <h2 className="text-[15px] font-extrabold text-[#1c4a8a] mb-1 tracking-tight">Interactive Quizzes for Active Recall</h2>
          <p className="mb-1">To guarantee long-term retention, every single story and vocabulary set is paired with <strong className="text-slate-800 font-bold">interactive fill-in-the-blank quizzes</strong>.</p>
          <ul className="space-y-1 mb-3 pl-1 list-none">
            <li className="flex gap-2"><span className="text-[#1c4a8a] font-extrabold shrink-0">▶</span><span><strong className="text-slate-800 font-bold">Real Exam Simulation:</strong> Practice questions that mimic the exact pattern and difficulty level of Tier-1 and Tier-2 exams.</span></li>
            <li className="flex gap-2"><span className="text-[#1c4a8a] font-extrabold shrink-0">▶</span><span><strong className="text-slate-800 font-bold">Multi-Dimensional Practice:</strong> Our quizzes reinforce correct word spellings, definitions, and contextual usage, training you to avoid common traps.</span></li>
            <li className="flex gap-2"><span className="text-[#1c4a8a] font-extrabold shrink-0">▶</span><span><strong className="text-slate-800 font-bold">Bilingual Explanations:</strong> Every target word comes with its precise English meaning, Hindi translation, grammatical category, and an example sentence for complete understanding.</span></li>
          </ul>

          <hr className="border-slate-200 mb-2" />

          <h2 className="text-[15px] font-extrabold text-[#1c4a8a] mb-1 tracking-tight">Stay Ahead with Daily News Vocabulary</h2>
          <p className="mb-2">Modern competitive exams heavily test comprehension skills using editorials from prominent newspapers. Our{" "}
            <strong className="text-slate-800 font-bold">Daily News Vocabulary</strong> section extracts exam-relevant words from current news and editorials. This allows you to build massive word power while naturally staying updated with current affairs—giving you a dual advantage in both the English and General Awareness sections.
          </p>

          <p className="text-slate-500 text-[12px] pb-1">
            Whether you are a beginner starting your English preparation from scratch or an advanced aspirant looking to polish your skills for the final selection,{" "}
            <strong className="text-[#1c4a8a] font-extrabold">Kajubadam Vocabulary</strong> provides a structured, scientific, and absolutely free environment to achieve vocabulary mastery.
          </p>
        </div>
      </div>

      {/* ── TABS: Horizontal scroll on mobile, centered on desktop ── */}
      <div id="content" className="bg-white border-b-2 border-amber-400/50 sticky top-0 z-40 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.06)]">
        <div className="max-w-[1600px] mx-auto relative">
          {/* Gradient fade edges (mobile only) to hint at scrollability */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none md:hidden"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/90 to-transparent z-10 pointer-events-none md:hidden"></div>

          {/* Scrollable tab strip */}            <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-1.5 md:gap-2 px-4 md:px-8 md:justify-center py-2.5 md:py-2 mx-4 md:mx-8">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const isExternal = 'external' in tab && tab.external;
              const TabWrapper = isExternal ? Link : 'button';
              const wrapperProps = isExternal
                ? { href: '/blog', className: `flex-none transition-all duration-200 select-none hover:-translate-y-0.5 active:scale-95` }
                : { onClick: () => setActiveTab(tab.id), className: `flex-none transition-all duration-200 select-none ${isActive ? 'shadow-md shadow-black/5' : 'hover:-translate-y-0.5 active:scale-95'}` };

              return (
                <TabWrapper key={tab.id} {...wrapperProps}>
                  {/* Mobile: stacked icon + label pill */}
                  <div
                    className={`md:hidden flex flex-col items-center justify-center rounded-2xl px-3.5 py-2 min-w-[60px] transition-all duration-200 border ${isActive && !isExternal
                      ? 'border-amber-400/50'
                      : 'border-amber-400/50 hover:border-amber-500/70'
                      }`}
                    style={{
                      backgroundColor: isActive && !isExternal ? `${tab.activeColor}0d` : 'transparent',
                      boxShadow: isActive && !isExternal ? `inset 0 0 0 1.5px ${tab.activeColor}25, 0 4px 12px ${tab.activeColor}15` : undefined,
                    }}
                  >
                    <span className="text-xl leading-none mb-1" style={{
                      filter: isActive && !isExternal ? 'none' : 'grayscale(1) opacity(0.5)',
                      transition: 'filter 0.2s',
                    }}>{tab.icon}</span>
                    <span
                      className="text-[10px] font-black tracking-tight leading-tight"
                      style={{ color: isActive && !isExternal ? tab.activeColor : '#9ca3af' }}
                    >
                      {tab.shortLabel}
                    </span>
                    {/* Active dot indicator */}
                    {isActive && !isExternal && (
                      <span
                        className="mt-1 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: tab.activeColor }}
                      />
                    )}
                  </div>

                  {/* Desktop: inline icon + label */}
                  <div
                    className={`hidden md:inline-flex items-center gap-2 font-bold tracking-wide transition-all duration-200 rounded-xl px-4 py-2 border ${isActive && !isExternal
                      ? 'shadow-sm border-amber-400/50'
                      : 'text-gray-500 border-amber-400/50 hover:text-gray-800 hover:border-amber-500/70 hover:bg-amber-50/60'
                      }`}
                    style={{
                      color: isActive && !isExternal ? tab.activeColor : undefined,
                      backgroundColor: isActive && !isExternal ? `${tab.activeColor}0d` : 'transparent',
                      boxShadow: isActive && !isExternal ? `0 0 0 1.5px ${tab.activeColor}25` : undefined,
                    }}
                  >
                    <span className="text-[15px] leading-none">{tab.icon}</span>
                    <span className="text-[13px]">{tab.label}</span>
                  </div>
                </TabWrapper>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT (reduced padding) ── */}
      <main className="max-w-[1600px] mx-auto px-4 lg:px-8 py-1">
        {/* ── SSC ERROR DETECTION TAB ── */}
        {activeTab === "error-detection" ? (            <div className="py-1">
            <div className="mb-2">
              <div className="flex items-center gap-3 mb-1">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-white text-amber-700 text-[12px] font-bold rounded-lg border-2 border-amber-500 shadow-sm">3</span>
                <div className="bg-[#8B0000] text-white w-8 h-8 rounded-xl flex items-center justify-center text-base font-black shadow-md">ED</div>
                <div>
                  <h2 className="text-[18px] font-extrabold text-gray-800 tracking-tight leading-none">SSC Error Detection 716 PYQ</h2>
                  <p className="text-[12px] text-gray-500 mt-0.5">{totalErrorDetectionQuestions} previous year questions with detailed bilingual explanations</p>
                </div>
              </div>
            </div>

            {!accessLoading && !hasErrorDetection && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 mb-1 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <div>
                    <p className="text-[12px] font-bold text-amber-800">Premium Content — ₹{getProductPrice('errorDetection')}</p>
                    <p className="text-[11px] text-amber-600">Ek baar purchase karo, lifetime access pao.</p>
                  </div>
                </div>
                <Link href="/pricing" className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-[12px] px-4 py-1.5 rounded-lg transition-all active:scale-95 shadow-md">🔓 Unlock for ₹{getProductPrice('errorDetection')}</Link>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-1.5">
              {errorDetectionBlocks.map((block) => {
                const isUnlocked = hasErrorDetection || block.page === 1;
                return isUnlocked ? (
                  <div key={block.page} className="bg-white border border-gray-100 rounded-xl p-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-[#8B0000] text-white text-[9px] font-bold px-2 py-0.5 rounded">Page {block.page}</span>
                      <span className="text-[9px] font-semibold text-gray-400">{errorDetectionPages} pages</span>
                    </div>
                    <h3 className="text-[13px] font-bold text-gray-800">
                      Q.{block.startQ} – Q.{block.endQ}
                      {block.page === 1 && <span className="ml-1 text-[8px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded-full font-bold align-middle">FREE</span>}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{block.endQ - block.startQ + 1} questions</p>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/error-detection/${block.page}`} className="flex-1 text-center bg-[#8B0000] hover:bg-[#6B0000] text-white text-[13px] font-bold py-1.5 rounded-full transition shadow-sm">📖 Read</Link>
                      <Link href={`/error-detection/${block.page}#quiz`} className="flex-1 text-center bg-[#8B0000] hover:bg-[#6B0000] text-white text-[13px] font-bold py-1.5 rounded-full transition shadow-sm">📝 Quiz</Link>
                    </div>
                  </div>
                ) : (
                  <div key={block.page} className="bg-white border border-rose-200/40 rounded-xl p-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] bg-gradient-to-br from-white to-rose-50/50 relative overflow-hidden pointer-events-none select-none">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-[#8B0000]/20 text-[#8B0000] text-[9px] font-bold px-2 py-0.5 rounded border border-[#8B0000]/10">Page {block.page}</span>
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-rose-200/60 shadow-sm ml-auto">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Premium Content
                      </span>
                    </div>
                    <h3 className="text-[13px] font-bold text-gray-700">Q.{block.startQ} – Q.{block.endQ}</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">{block.endQ - block.startQ + 1} questions</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === "sentence-improvement" ? (
          <div className="py-1">
            <div className="mb-2">
              <div className="flex items-center gap-3 mb-1">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-white text-amber-700 text-[12px] font-bold rounded-lg border-2 border-amber-500 shadow-sm">4</span>
                <div className="bg-[#0d7a3e] text-white w-8 h-8 rounded-xl flex items-center justify-center text-base font-black shadow-md">SI</div>
                <div>
                  <h2 className="text-[18px] font-extrabold text-gray-800 tracking-tight leading-none">SSC Sentence Improvement 790 PYQ</h2>
                  <p className="text-[12px] text-gray-500 mt-0.5">{totalSentenceImprovementQuestions} previous year questions with detailed bilingual explanations</p>
                </div>
              </div>
            </div>

            {!accessLoading && !hasSentenceImprovement && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 mb-1 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <div>
                    <p className="text-[12px] font-bold text-amber-800">Premium Content — ₹{getProductPrice('sentenceImprovement')}</p>
                    <p className="text-[11px] text-amber-600">Ek baar purchase karo, lifetime access pao.</p>
                  </div>
                </div>
                <Link href="/pricing" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[12px] px-4 py-1.5 rounded-lg transition-all active:scale-95 shadow-md">🔓 Unlock for ₹{getProductPrice('sentenceImprovement')}</Link>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-1.5">
              {sentenceImprovementBlocks.map((block) => {
                const isUnlocked = hasSentenceImprovement || block.page === 1;
                return isUnlocked ? (
                  <div key={block.page} className="bg-white border border-gray-100 rounded-xl p-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-[#0d7a3e] text-white text-[9px] font-bold px-2 py-0.5 rounded">Page {block.page}</span>
                      <span className="text-[9px] font-semibold text-gray-400">{sentenceImprovementTotalPages} pages</span>
                    </div>
                    <h3 className="text-[13px] font-bold text-gray-800">
                      Q.{block.startQ} – Q.{block.endQ}
                      {block.page === 1 && <span className="ml-1 text-[8px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded-full font-bold align-middle">FREE</span>}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{block.endQ - block.startQ + 1} questions</p>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/sentence-improvement/${block.page}`} className="flex-1 text-center bg-[#0d7a3e] hover:bg-[#0a5e2e] text-white text-[13px] font-bold py-1.5 rounded-full transition shadow-sm">📖 Read</Link>
                      <Link href={`/sentence-improvement/${block.page}#quiz`} className="flex-1 text-center bg-[#0d7a3e] hover:bg-[#0a5e2e] text-white text-[13px] font-bold py-1.5 rounded-full transition shadow-sm">📝 Quiz</Link>
                    </div>
                  </div>
                ) : (
                  <div key={block.page} className="bg-white border border-emerald-200/40 rounded-xl p-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] bg-gradient-to-br from-white to-emerald-50/50 relative overflow-hidden pointer-events-none select-none">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-[#0d7a3e]/20 text-[#0d7a3e] text-[9px] font-bold px-2 py-0.5 rounded border border-[#0d7a3e]/10">Page {block.page}</span>
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-emerald-200/60 shadow-sm ml-auto">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Premium Content
                      </span>
                    </div>
                    <h3 className="text-[13px] font-bold text-gray-700">Q.{block.startQ} – Q.{block.endQ}</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">{block.endQ - block.startQ + 1} questions</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === "daily" ? (
          <DailyNewsPageClient dailyNews={dailyNews} />
        ) : (
          <>
            {/* Stories title */}
            <div className="mb-0.5 pl-1 flex flex-col md:flex-row md:items-end justify-between gap-0.5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="inline-flex items-center justify-center w-7 h-7 bg-white text-amber-700 text-[12px] font-bold rounded-lg border-2 border-amber-500 shadow-sm">{activeTab === "part1" ? "5" : "6"}</span>
                  <h2 className="text-[18px] font-extrabold text-gray-800 tracking-tight leading-none">{activeTab === "part1" ? "Vocab Part 1" : "Vocab Part 2"}</h2>
                </div>
                <p className="text-[#1c4a8a] text-[13px] font-semibold bg-[#1c4a8a]/5 inline-block px-2 py-0.5 rounded-md border border-[#1c4a8a]/10">{activeMasteredCount} / {activeStories.length} Stories Mastered</p>
              </div>
              <div className="text-right text-[12px] text-gray-400 font-medium">
                Showing {activeStories.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, activeStories.length)} of {activeStories.length} stories
              </div>
            </div>

            {/* Premium banner */}
            {!accessLoading && !(activeTab === "part1" ? hasPart1 : hasPart2) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 mb-1 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <div>
                    <p className="text-[12px] font-bold text-amber-800">Premium Content — {activeTab === "part1" ? `₹${getProductPrice('part1')}` : `₹${getProductPrice('part2')}`}</p>
                    <p className="text-[11px] text-amber-600">Ek baar {activeTab === "part1" ? "Part 1" : "Part 2"} unlock karo, lifetime access pao.</p>
                  </div>
                </div>
                <Link href="/pricing"
                  className={`bg-gradient-to-r ${activeTab === "part1" ? "from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500" : "from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400"} text-white font-bold text-[12px] px-4 py-1.5 rounded-lg transition-all active:scale-95 shadow-md`}>
                  🔓 Unlock {activeTab === "part1" ? "Part 1" : "Part 2"} — {activeTab === "part1" ? `₹${getProductPrice('part1')}` : `₹${getProductPrice('part2')}`}
                </Link>
              </div>
            )}

            {/* Stories Grid */}
            {paginatedStories.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm max-w-md mx-auto">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-[16px] font-bold text-gray-700 mb-1">No Stories Found</h3>
                <p className="text-gray-400 text-[13px]">No stories available in this section.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-1.5">
                {paginatedStories.map((story) => {
                  const isMastered = masteredSlugs.includes(story.slug);
                  const isFree = story.slug === FREE_SLUGS.part1 || story.slug === FREE_SLUGS.part2;
                  const hasPartAccess = activeTab === "part1" ? hasPart1 : hasPart2;
                  const isLocked = !accessLoading && !isFree && !hasPartAccess;

                  return (
                    <div key={story.slug}
                      className={`bg-white border rounded-xl p-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[110px] relative overflow-hidden ${isLocked ? "border-amber-200/40 bg-gradient-to-br from-white to-amber-50/50 select-none pointer-events-none" : isMastered ? "border-green-200 bg-green-50/10" : "border-gray-100"
                        }`}>
                      {!isLocked && !accessLoading && (
                        <button onClick={() => toggleMastery(story.slug)}
                          className={`absolute top-2 right-2 p-0.5 rounded-full border transition-all active:scale-90 ${isMastered ? "bg-green-500 border-green-500 text-white shadow-sm" : "bg-white border-gray-200 text-gray-300 hover:text-gray-500 hover:border-gray-300"}`}
                          title={isMastered ? "Marked as Mastered" : "Mark as Mastered"}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <div>
                        <div>
                          <h4 className="text-[9px] font-black text-[#1c4a8a] uppercase tracking-wider mb-0.5 pr-6">{story.saga_id}</h4>
                          <h3 className="text-[13px] font-bold text-gray-800 leading-snug">{story.title}</h3>
                        </div>
                        <div className="mt-2">
                          <span className="inline-block text-[9px] font-bold text-gray-400 uppercase bg-gray-50 border border-gray-200/60 rounded px-1.5 py-0.5">{story.vocabCount || 0} vocabulary words</span>
                        </div>
                      </div>
                      {isLocked && (
                        <div className="mt-2 flex items-end justify-end">
                          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-amber-200/60 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Premium Content
                          </span>
                        </div>
                      )}
                      {!isLocked && !accessLoading && (
                        <div className="flex gap-2 mt-3">
                          <Link href={`/stories/${story.slug}`} className="flex-1 text-center bg-[#1c4a8a] hover:bg-blue-900 text-white text-[13px] font-bold py-1.5 rounded-full transition shadow-sm">Read</Link>
                          <Link href={`/stories/${story.slug}/quiz`} className="flex-1 text-center bg-[#1c4a8a] hover:bg-blue-900 text-white text-[13px] font-bold py-1.5 rounded-full transition shadow-sm">Quiz</Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Pagination */}
            {totalPages > 1 && (
              <div className="mt-1 md:mt-2 flex items-center justify-center gap-3 select-none">
                <button onClick={handlePrevPage} disabled={currentPage === 1}
                  className={`px-3 py-1.5 border rounded-lg font-bold text-[13px] flex items-center gap-1 transition-all active:scale-95 ${currentPage === 1 ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-200 text-[#1c4a8a] hover:bg-gray-50 hover:border-gray-300 shadow-sm"}`}>
                  &larr; Previous
                </button>
                <span className="text-[13px] font-semibold text-gray-500">
                  Page <span className="text-[#1c4a8a] font-bold bg-[#1c4a8a]/5 px-2 py-0.5 rounded border border-[#1c4a8a]/10">{currentPage}</span> of <span className="font-bold text-gray-700">{totalPages}</span>
                </span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 border rounded-lg font-bold text-[13px] flex items-center gap-1 transition-all active:scale-95 ${currentPage === totalPages ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-200 text-[#1c4a8a] hover:bg-gray-50 hover:border-gray-300 shadow-sm"}`}>
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
