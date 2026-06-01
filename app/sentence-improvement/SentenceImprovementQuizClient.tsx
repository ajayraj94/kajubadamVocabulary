"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePurchaseAccess } from "@/hooks/usePurchaseAccess";
import type { SentenceImprovementQuestion } from "@/lib/sentence-improvement";

function renderBold(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            const word = part.slice(2, -2);
            return (
                <strong key={i} style={{ fontWeight: 'bold', color: '#CC5500' }}>
                    {word}
                </strong>
            );
        }
        return part;
    });
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

type FilterMode = "all" | "correct" | "incorrect" | "skip";

interface Props {
  questions: SentenceImprovementQuestion[];
  page: number;
  totalPages: number;
  totalQuestions: number;
  isFreePage?: boolean;
}

const markdownComponents = {
  table: ({ children, ...props }: React.ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-[13px] md:text-[14px] border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.ComponentPropsWithoutRef<"th">) => (
    <th
      className="border border-emerald-300 bg-emerald-100 px-4 py-2 font-bold text-emerald-900 text-left text-[13px] md:text-[14px]"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.ComponentPropsWithoutRef<"td">) => (
    <td
      className="border border-emerald-200 px-4 py-2 text-gray-700 text-[13px] md:text-[14px]"
      {...props}
    >
      {children}
    </td>
  ),
  strong: ({ children, ...props }: React.ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-bold text-gray-900" {...props}>
      {children}
    </strong>
  ),
  p: ({ children, ...props }: React.ComponentPropsWithoutRef<"p">) => (
    <p className="text-[14px] md:text-[15px] text-gray-700 leading-[1.7] mb-2" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="space-y-1.5 my-3 list-disc list-inside text-[14px] md:text-[15px] text-gray-700 leading-[1.75]"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="space-y-1.5 my-3 list-decimal list-inside text-[14px] md:text-[15px] text-gray-700 leading-[1.75]"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.ComponentPropsWithoutRef<"li">) => (
    <li className="text-[14px] md:text-[15px] text-gray-700 leading-[1.75]" {...props}>
      {children}
    </li>
  ),
  hr: (props: React.ComponentPropsWithoutRef<"hr">) => (
    <hr className="border-t border-emerald-200 my-5" {...props} />
  ),
  h3: ({ children, ...props }: React.ComponentPropsWithoutRef<"h3">) => (
    <h3
      className="text-[16px] md:text-[18px] font-bold text-gray-900 mt-5 mb-2 leading-tight"
      {...props}
    >
      {children}
    </h3>
  ),
};

export default function SentenceImprovementQuizClient({
  questions,
  page,
  totalPages,
  totalQuestions,
  isFreePage,
}: Props) {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const quizSectionRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  const { hasSentenceImprovement, isLoading: accessLoading } = usePurchaseAccess();
  const isLocked = !accessLoading && !hasSentenceImprovement && !isFreePage;

  const currentQuestion = questions[currentQIndex];
  const totalQ = questions.length;

  const optionLetters = currentQuestion
    ? OPTION_LETTERS.slice(0, currentQuestion.options.length)
    : [];

  useEffect(() => {
    if (window.location.hash === "#quiz") {
      setTimeout(() => {
        document
          .getElementById("quiz-section-anchor")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
  }, []);

  const scrollToQuizSection = () => {
    document
      .getElementById("quiz-section-anchor")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOptionClick = (letter: string) => {
    if (selectedAns) return;
    setSelectedAns(letter);
    setAnswers((prev) => ({ ...prev, [currentQIndex]: letter }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQIndex < totalQ - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      setSelectedAns(answers[nextIdx] || null);
      setShowExplanation(!!answers[nextIdx]);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      const prevIdx = currentQIndex - 1;
      setCurrentQIndex(prevIdx);
      setSelectedAns(answers[prevIdx] || null);
      setShowExplanation(!!answers[prevIdx]);
    }
  };

  const goToQuestion = (idx: number) => {
    setCurrentQIndex(idx);
    setSelectedAns(answers[idx] || null);
    setShowExplanation(!!answers[idx]);
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setTimeout(() => {
      quizSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  };

  const handleBackToReading = () => {
    setQuizStarted(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentQIndex(0);
    setSelectedAns(null);
    setShowExplanation(false);
  };

  const correctCount = useMemo(() => {
    return questions.filter((q, idx) => answers[idx] === q.correctAnswer)
      .length;
  }, [answers, questions]);

  const wrongCount = useMemo(() => {
    return questions.filter(
      (q, idx) => answers[idx] && answers[idx] !== q.correctAnswer
    ).length;
  }, [answers, questions]);

  const skipCount = totalQ - Object.keys(answers).length;
  const totalScore = correctCount * 1 + wrongCount * -0.25;

  const getFilterLabel = (mode: FilterMode): string => {
    switch (mode) {
      case "all": return "All Questions";
      case "correct": return "Correct Only";
      case "incorrect": return "Incorrect Only";
      case "skip": return "Skipped Only";
    }
  };

  const getFilterColor = (mode: FilterMode): string => {
    switch (mode) {
      case "all": return "bg-slate-100 text-slate-700 hover:bg-slate-200";
      case "correct": return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200";
      case "incorrect": return "bg-rose-100 text-rose-700 hover:bg-rose-200";
      case "skip": return "bg-amber-100 text-amber-700 hover:bg-amber-200";
    }
  };

  const getQuestionStatus = (idx: number) => {
    const q = questions[idx];
    if (!answers[idx]) return "skip";
    if (answers[idx] === q.correctAnswer) return "correct";
    return "incorrect";
  };

  const passesFilter = (idx: number) => {
    if (filterMode === "all") return true;
    return getQuestionStatus(idx) === filterMode;
  };

  useEffect(() => {
    if (!paletteRef.current) return;
    const btns = paletteRef.current.querySelectorAll("button");
    const activeBtn = btns[currentQIndex] as HTMLElement | undefined;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentQIndex]);

  if (accessLoading) {
    return (
      <div className="min-h-screen bg-gray-50/40 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-4 border-[#0d7a3e] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[15px] font-bold text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] font-sans flex flex-col">
        <header className="bg-[#0d7a3e] text-white px-4 py-3 flex items-center gap-3 shadow-sm">
          <Link
            href="/"
            className="hover:bg-[#0a5e2e] p-1.5 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="font-bold text-sm tracking-wide">SSC Sentence Improvement</h1>
            <p className="text-xs text-emerald-100 font-semibold">790 PYQ &mdash; Premium Content</p>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div className="text-center mb-8">
              <div className="inline-block text-[11px] font-black px-3 py-1 rounded-full mb-3 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Premium Content &mdash; &#8377;110</div>
              <h2 className="text-white text-[24px] font-black mb-2 leading-tight">SSC Sentence Improvement 790 PYQ</h2>
              <p className="text-gray-400 text-[14px] leading-relaxed">
                Master <strong className="text-white">790 Sentence Improvement questions</strong> with detailed bilingual explanations. Ek baar purchase karo, lifetime access pao.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
              <p className="text-gray-300 text-[12px] font-bold uppercase tracking-wider mb-3">Is module mein milega:</p>
              <ul className="space-y-2">
                {[
                  "790 SSC Sentence Improvement PYQs (fully solved)",
                  "Detailed bilingual explanations (Hindi + English)",
                  "Grammar rule cards with short tricks",
                  "Extra practice examples for each rule",
                  "Exam pro-tips for quick improvement",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-gray-400 text-[13px]">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/pricing" className="w-full text-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[16px] py-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/30 active:scale-[0.98]">
                &#128274; Unlock SSC Sentence Improvement &mdash; &#8377;110
              </Link>
              <Link href="/" className="w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-[14px] py-3 rounded-xl transition-colors">
                &larr; Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (totalQ === 0) {
    return (
      <div className="min-h-screen bg-gray-50/40 font-sans flex items-center justify-center">
        <p className="text-[15px] text-gray-400 font-semibold">No questions available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0faf4] font-sans flex flex-col overflow-x-hidden">
      {/* TOP HEADER */}
      <header className="bg-[#0d7a3e] text-white px-4 py-3 flex justify-between items-center shadow-sm sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <Link href="/?tab=sentence-improvement" className="hover:bg-[#0a5e2e] p-1.5 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <Link
            href="/"
            className="hover:bg-[#0a5e2e] p-1.5 rounded-full transition-colors"
            title="Home"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          <div>
            <h1 className="font-bold text-sm tracking-wide">SSC Sentence Improvement</h1>
            <p className="text-xs text-emerald-200 font-semibold truncate max-w-[200px] md:max-w-[400px]">
              Page {page} of {totalPages} &mdash; Q.{(page - 1) * 50 + 1}&ndash;{Math.min(page * 50, totalQuestions)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!quizStarted && (
            <button
              onClick={scrollToQuizSection}
              className="flex items-center gap-1.5 bg-white text-[#0d7a3e] font-black text-[11px] uppercase tracking-wider px-4 py-2 rounded-lg shadow-md hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95"
            >
              <span className="text-sm">&#128221;</span>
              <span className="hidden sm:inline">Take Quiz</span>
              <span className="sm:hidden">Quiz</span>
            </button>
          )}
          {quizStarted && Object.keys(answers).length > 0 && (
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-right leading-tight">
                <div className="font-bold tracking-wider text-xs">Score: {totalScore.toFixed(2)}</div>
                <div className="text-[10px] text-emerald-200">+{correctCount} / -{(wrongCount * 0.25).toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* READING VIEW */}
      {!quizStarted && (
        <div className="max-w-[860px] mx-auto px-5 py-8 md:py-10">
          {/* Hero Header */}
          <div className="bg-white rounded-xl border border-emerald-200/60 shadow-md overflow-hidden mb-6 md:mb-8">
            <div className="bg-gradient-to-br from-[#0a2e1a] via-[#0d7a3e] to-[#0a2e1a] px-6 md:px-8 py-6 md:py-7 relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
                <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl animate-pulse" style={{animationDuration: '6s'}}></div>
              </div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    SSC Sentence Improvement 790 PYQ
                  </span>
                </div>
                <h1 className="text-[26px] md:text-[32px] leading-tight font-black text-white tracking-tight">
                  <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
                    SSC Sentence Improvement 790 PYQ
                  </span>
                </h1>
                <div className="flex items-center gap-2 text-sm md:text-base text-emerald-200/80 mt-2 flex-wrap">
                  <span className="font-bold">Page {page} of {totalPages}</span>
                  <span className="w-1 h-1 rounded-full bg-emerald-300/50 shrink-0" />
                  <span>Q.{(page - 1) * 50 + 1} &ndash; {Math.min(page * 50, totalQuestions)}</span>
                </div>
              </div>
            </div>

                        {/* Start Quiz Action Row */}
                        <div className="px-6 md:px-8 py-3 md:py-4 flex items-center justify-between flex-wrap gap-3 border-t border-emerald-100/40">
                            <div>
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reading Passage</div>
                                <div className="text-[13px] text-gray-600 mt-0.5">Page {page} &middot; {totalQ} questions</div>
                            </div>
                            <button
                                onClick={handleStartQuiz}
                                className="bg-[#0d7a3e] hover:bg-[#0a5e2e] active:bg-[#084020] text-white font-bold text-sm md:text-base px-5 md:px-7 py-2.5 md:py-3 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                            >
                                <span className="text-lg">&#128221;</span>
                                <span>Start Quiz</span>
                                <span className="text-[10px] bg-white/20 rounded px-1.5 py-0.5">{totalQ}</span>
                            </button>
                        </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50/60 border-t border-emerald-100 px-6 md:px-8 py-3 flex items-center gap-5 text-xs md:text-sm text-emerald-700 font-medium flex-wrap">
              <span className="flex items-center gap-1.5">&#9989; +1 for correct</span>
              <span className="w-1 h-1 rounded-full bg-emerald-300 shrink-0" />
              <span className="flex items-center gap-1.5">&#10060; &minus;0.25 for wrong</span>
              <span className="w-1 h-1 rounded-full bg-emerald-300 shrink-0" />
              <span className="flex items-center gap-1.5">&#128214; Full bilingual explanations for every question</span>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-8 md:space-y-10">
            {questions.map((q, qIdx) => (
              <div
                key={q.id}
                id={`reading-q-${q.id}`}
                className="bg-white rounded-2xl border border-emerald-200/40 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Question Header */}
                <div className="relative flex items-stretch">
                  <div className="w-1.5 bg-[#0d7a3e] shrink-0" />
                  <div className="flex-1 bg-white px-4 md:px-5 pt-3 pb-1 flex items-start gap-3">
                    <div className="flex items-center justify-center w-[42px] h-[42px] md:w-[52px] md:h-[52px] rounded-xl bg-gradient-to-br from-[#0d7a3e] to-[#0a5e2e] text-white shadow-md shadow-emerald-900/20 shrink-0 mt-0.5">
                      <span className="text-[16px] md:text-[18px] font-black leading-none">{q.id}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-bold text-[#0d7a3e] uppercase tracking-wider leading-none">Q.{q.id}</span>
                        <span className="w-[3px] h-[3px] rounded-full bg-gray-300 shrink-0" />
                        <span className="text-[10px] text-gray-400 leading-none">{q.examInfo || 'SSC Sentence Improvement'}</span>
                      </div>
                      <h3 className="text-[14px] md:text-[16px] font-bold text-gray-900 leading-snug mt-0.5">{q.title}</h3>
                    </div>
                    <div className="hidden md:flex items-center gap-1 shrink-0 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1 mt-1">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[11px] font-bold text-emerald-700 leading-none">{q.correctAnswer}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 md:px-5 pb-3 md:pb-4 pt-0">
                  {/* Question Text */}
                  {q.questionText && (
                    <div className="reading-body text-[14px] md:text-[16px] text-slate-800 font-medium mb-3 leading-[1.7] bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-200/50 rounded-xl p-4 md:p-5 shadow-sm">
                      <span className="text-emerald-400 text-[16px] mr-1">&ldquo;</span>
                      {renderBold(q.questionText)}
                      <span className="text-emerald-400 text-[16px] ml-1">&rdquo;</span>
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-1.5 mb-4">
                    {q.options.map((opt, idx) => {
                      const isCorrectOpt = OPTION_LETTERS[idx] === q.correctAnswer;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 text-[14px] md:text-[15px] leading-relaxed px-3 py-2 rounded-xl ${
                            isCorrectOpt
                              ? "bg-gradient-to-r from-emerald-50/90 to-white border border-emerald-200/60"
                              : "bg-white border border-emerald-100/30"
                          }`}
                        >
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0 shadow-sm ${
                            isCorrectOpt
                              ? "bg-emerald-500 text-white shadow-emerald-200"
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}>
                            {OPTION_LETTERS[idx]}
                          </span>
                          <span className={`${isCorrectOpt ? "font-semibold text-emerald-800" : "text-gray-700"}`}>
                            {opt}
                          </span>
                          {isCorrectOpt && (
                            <div className="ml-auto flex items-center gap-1.5 shrink-0">
                              <div className="bg-emerald-500 rounded-full p-0.5">
                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Correct</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Full Explanation */}
                  {q.fullExplanation && (
                    <div className="relative bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/50 rounded-xl p-5 md:p-7 mt-4 shadow-sm">
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-r-full" />
                      <div className="pl-4">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 text-[13px] font-black text-emerald-800 uppercase tracking-wider bg-emerald-100/70 border border-emerald-200/70 px-3 py-1 rounded-full">
                            &#128161; Detailed Explanation
                          </span>
                          <span className="text-[12px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                            &#10003; Answer: {q.correctAnswer}
                          </span>
                        </div>
                        <div className="reading-body">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {q.fullExplanation}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 md:mt-14 mb-8 text-center">
            <button
              onClick={scrollToQuizSection}
              className="bg-[#0d7a3e] hover:bg-[#0a5e2e] active:bg-[#084020] text-white font-black text-[18px] md:text-[20px] px-10 md:px-16 py-4 md:py-5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-3"
            >
              <span className="text-2xl md:text-3xl">&#128221;</span>
              <span>Take Quiz &mdash; {totalQ} Questions</span>
            </button>
          </div>

          {/* Page Nav */}
          <div className="flex items-center justify-center gap-4 mt-8 pb-8">
            {page > 1 ? (
              <Link
                href={`/sentence-improvement/${page - 1}`}
                className="bg-white border border-emerald-200/60 hover:bg-[#0d7a3e] hover:text-white hover:border-[#0d7a3e] text-gray-700 font-bold text-[14px] px-6 py-3 rounded-lg shadow-sm transition-all duration-200 active:scale-95"
              >
                &larr; Previous Page
              </Link>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-emerald-100 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#0d7a3e]" />
              <span className="text-[13px] font-bold text-gray-500">Page {page} of {totalPages}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-300" />
            </div>
            {page < totalPages ? (
              <Link
                href={`/sentence-improvement/${page + 1}`}
                className="bg-white border border-emerald-200/60 hover:bg-[#0d7a3e] hover:text-white hover:border-[#0d7a3e] text-gray-700 font-bold text-[14px] px-6 py-3 rounded-lg shadow-sm transition-all duration-200 active:scale-95"
              >
                Next Page &rarr;
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      )}

      {/* Quiz Section Anchor */}
      <div id="quiz-section-anchor" className="scroll-mt-20" />

      {!quizStarted && (
        <div className="max-w-[860px] mx-auto px-5 w-full">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-dashed border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#f0faf4] px-6 py-1 text-[12px] font-black text-gray-400 uppercase tracking-widest">Quiz Section</span>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ SECTION */}
      <section ref={quizSectionRef} className={`bg-[#f0faf4] ${quizStarted ? "" : "pt-12 pb-16"}`}>
        {!quizStarted ? (
          <div className="max-w-[620px] mx-auto px-5 text-center">
            <div className="bg-white rounded-2xl border border-emerald-100/50 shadow-sm p-10 md:p-12">
              <div className="w-20 h-20 bg-[#0d7a3e]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-4xl">&#128221;</span>
              </div>
              <h2 className="text-[26px] font-black text-gray-800 mb-3 leading-tight">Ready to Test Yourself?</h2>
              <p className="text-[16px] md:text-[17px] text-gray-500 mb-8 max-w-md mx-auto leading-[1.7]">
                Attempt all {totalQ} questions from this page. Get instant feedback with detailed bilingual explanations for every question. Negative marking: &minus;0.25 for each wrong answer.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleStartQuiz}
                  className="bg-[#0d7a3e] hover:bg-[#0a5e2e] active:bg-[#084020] text-white font-black text-[18px] px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>&#9654;</span>
                  <span>Start Quiz</span>
                </button>
                <Link href="/?tab=sentence-improvement" className="text-gray-400 hover:text-gray-600 text-[14px] font-bold transition-colors">
                  &larr; Back to all pages
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-10 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <span className="block text-3xl font-black text-gray-800">{totalQ}</span>
                  <span className="text-[12px] font-semibold text-gray-400 uppercase">Questions</span>
                </div>
                <div className="text-center">
                  <span className="block text-3xl font-black text-emerald-600">+1</span>
                  <span className="text-[12px] font-semibold text-gray-400 uppercase">Per Correct</span>
                </div>
                <div className="text-center">
                  <span className="block text-3xl font-black text-rose-500">&minus;0.25</span>
                  <span className="text-[12px] font-semibold text-gray-400 uppercase">Per Wrong</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* QUIZ MODE */
          <div className="border-t border-slate-200">
            <div className="max-w-[860px] mx-auto px-5 py-4">
              <details className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <summary className="bg-gradient-to-r from-[#0a2e1a] via-[#0d7a3e] to-[#0a2e1a] px-5 md:px-6 py-3.5 cursor-pointer hover:opacity-90 transition-opacity text-[14px] font-bold text-white flex items-center gap-2 select-none">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <span>&#128214; Reading Passage &mdash; SSC Sentence Improvement PYQs (Page {page})</span>
                </summary>
                <div className="px-5 md:px-6 pb-5 md:pb-6 border-t border-gray-100">
                  <div className="space-y-4 mt-4">
                    {questions.map((q) => (
                      <div key={q.id} className="border-l-2 border-gray-200 pl-4">
                        <p className="text-[13px] font-bold text-gray-700">Q.{q.id}. {q.title}</p>
                        {q.questionText && (
                          <p className="text-[13px] text-gray-600 italic mt-1 leading-relaxed">&ldquo;{renderBold(q.questionText)}&rdquo;</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            </div>

            <div className="flex flex-col bg-slate-50" style={{ minHeight: "calc(100vh - 96px)" }}>
              <div className="bg-slate-100 border-b border-slate-200 px-2 md:px-4 py-2 flex items-center overflow-x-auto whitespace-nowrap text-[10px] md:text-xs gap-1 shrink-0">
                <span className="text-[#0d7a3e] font-black uppercase mr-2 border-r border-slate-300 pr-2 tracking-wider text-[12px]">SSC Sentence Improvement</span>
                <span className="text-slate-500 font-bold uppercase mr-2 text-[11px]">Page {page}</span>
                <button className="bg-[#0d7a3e] text-white px-4 py-1.5 rounded-t font-semibold text-xs">Quiz Mode</button>
                <button onClick={handleBackToReading} className="ml-auto text-slate-500 hover:text-slate-700 text-[11px] font-bold underline transition">&uarr; Reading</button>
              </div>

              <main className="flex-1 flex flex-col lg:flex-row p-2 md:p-4 gap-3 md:gap-4 min-h-0">
                {/* Left: Question Area */}
                <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm min-h-0">
                  <div className="flex flex-col h-full min-h-0 max-w-full">
                    {/* Question Header */}
                    <div className="shrink-0 px-5 pt-5 pb-4 border-b border-slate-100 bg-white rounded-t-lg">
                      <div className="flex items-center text-sm flex-wrap gap-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xl text-slate-800">Q.{currentQIndex + 1}</span>
                          {selectedAns && (
                            <span className={`text-[11px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                              selectedAns === currentQuestion.correctAnswer ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                            }`}>
                              {selectedAns === currentQuestion.correctAnswer ? "Correct" : "Incorrect"}
                            </span>
                          )}
                          {!selectedAns && (
                            <span className="bg-slate-200 text-slate-500 text-[11px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Unanswered</span>
                          )}
                          <span className="text-slate-400 text-xs">|</span>
                          <span className="text-slate-500 font-medium text-xs">Q.{(page - 1) * 50 + currentQIndex + 1}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-auto mr-3">
                          <button
                            onClick={handlePrev}
                            disabled={currentQIndex === 0}
                            className={`flex items-center gap-1 font-bold text-xs px-3 py-1.5 rounded-full shadow-sm transition-all duration-150 active:scale-95 ${
                              currentQIndex === 0
                                ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                                : "bg-slate-700 hover:bg-slate-800 text-white hover:shadow-md hover:scale-105"
                            }`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Prev</span>
                          </button>
                          <button
                            onClick={handleNext}
                            disabled={currentQIndex >= totalQ - 1}
                            className={`flex items-center gap-1 font-bold text-xs px-3 py-1.5 rounded-full shadow-sm transition-all duration-150 active:scale-95 ${
                              currentQIndex >= totalQ - 1
                                ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                                : "bg-[#0d7a3e] hover:bg-[#0a5e2e] text-white hover:shadow-md hover:scale-105"
                            }`}
                          >
                            <span>Next</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                        <span className="bg-[#0d7a3e] text-white font-semibold text-xs px-2.5 py-1 rounded-full">Q {currentQIndex + 1}/{totalQ}</span>
                      </div>
                    </div>

                    {/* Question Body */}
                    <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-5">
                      {currentQuestion.title && (
                        <div className="flex items-center gap-2 mt-4 mb-2">
                          <span className="bg-[#0d7a3e]/10 text-[#0d7a3e] text-[11px] font-bold px-2 py-0.5 rounded">Q.{currentQuestion.id}</span>
                          <h3 className="text-[14px] font-bold text-gray-800 leading-snug">{currentQuestion.title}</h3>
                        </div>
                      )}
                      {currentQuestion.examInfo && (
                        <p className="text-[12px] text-gray-500 mb-3 ml-1">{currentQuestion.examInfo}</p>
                      )}
                      {currentQuestion.questionText && (
                        <div className="text-[14px] md:text-[15px] text-slate-800 font-medium mb-3 leading-[1.6] bg-slate-50 border border-slate-100 rounded-lg p-3">
                          &ldquo;{renderBold(currentQuestion.questionText)}&rdquo;
                        </div>
                      )}

                      {/* Options */}
                      <div className="space-y-[3px]">
                        {currentQuestion.options.map((opt, idx) => {
                          const letter = optionLetters[idx];
                          const isSelected = selectedAns === letter;
                          const isCorrect = letter === currentQuestion.correctAnswer;

                          let borderClass = "border-slate-200";
                          let bgClass = "bg-white";
                          let textClass = "text-slate-700";
                          let ringClass = "";
                          let radioColor = "text-[#0d7a3e] border-slate-300 focus:ring-[#0d7a3e]";

                          if (selectedAns) {
                            if (isCorrect) {
                              borderClass = "border-emerald-400";
                              bgClass = "bg-emerald-50";
                              textClass = "text-emerald-800 font-bold";
                              ringClass = "ring-2 ring-emerald-200";
                              radioColor = "text-emerald-600 border-emerald-400";
                            } else if (isSelected) {
                              borderClass = "border-rose-400";
                              bgClass = "bg-rose-50";
                              textClass = "text-rose-800 font-bold";
                              ringClass = "ring-2 ring-rose-200";
                              radioColor = "text-rose-600 border-rose-400";
                            } else {
                              bgClass = "bg-white";
                              textClass = "text-slate-400";
                              borderClass = "border-slate-100";
                            }
                          }

                          return (
                            <label
                              key={letter}
                              className={`flex items-center gap-1.5 p-1.5 border rounded cursor-pointer transition-all ${borderClass} ${bgClass} ${ringClass} ${
                                !selectedAns ? "hover:bg-slate-50" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name="option"
                                checked={isSelected}
                                onChange={() => handleOptionClick(letter)}
                                disabled={!!selectedAns}
                                className={`w-3.5 h-3.5 ${radioColor}`}
                              />
                              <span className={`text-sm md:text-[15px] leading-relaxed ${textClass}`}>
                                {letter}) {opt}
                              </span>
                              {selectedAns && isCorrect && (
                                <svg className="w-5 h-5 text-emerald-600 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {selectedAns && isSelected && !isCorrect && (
                                <svg className="w-5 h-5 text-rose-600 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </label>
                          );
                        })}
                      </div>

                      {/* Mobile — Prev/Next between options and explanation */}
                      <div className="flex items-center gap-2 mt-4 lg:hidden">
                        <button
                          onClick={handlePrev}
                          disabled={currentQIndex === 0}
                          className={`flex-1 flex items-center justify-center gap-1 font-bold text-xs px-3 py-2.5 rounded-lg shadow-sm transition-all duration-150 active:scale-95 ${
                            currentQIndex === 0
                              ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                              : "bg-slate-700 hover:bg-slate-800 text-white hover:shadow-md"
                          }`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                          </svg>
                          <span>Prev</span>
                        </button>
                        <button
                          onClick={handleNext}
                          disabled={currentQIndex >= totalQ - 1}
                          className={`flex-1 flex items-center justify-center gap-1 font-bold text-xs px-3 py-2.5 rounded-lg shadow-sm transition-all duration-150 active:scale-95 ${
                            currentQIndex >= totalQ - 1
                              ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                              : "bg-[#0d7a3e] hover:bg-[#0a5e2e] text-white hover:shadow-md"
                          }`}
                        >
                          <span>Next</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      {/* Explanation */}
                      {showExplanation && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 mt-5">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[12px] font-black text-emerald-700 uppercase tracking-wider">&#128161; Explanation</span>
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              selectedAns === currentQuestion.correctAnswer ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {selectedAns === currentQuestion.correctAnswer
                                ? "&#10003; Correct!"
                                : `&#10007; Incorrect &mdash; Correct: ${currentQuestion.correctAnswer}`}
                            </span>
                            <button
                              onClick={() => setShowExplanation(false)}
                              className="ml-auto text-emerald-400 hover:text-emerald-600 transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          {currentQuestion.fullExplanation && (
                            <div className="reading-body text-[13px] md:text-[14px]">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {currentQuestion.fullExplanation}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Stats + Palette */}
                <div className="hidden lg:flex lg:w-[340px] flex-col gap-4 min-h-0">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm shrink-0">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[#0d7a3e] text-white flex items-center justify-center font-bold text-xs rounded-full">SI</div>
                        <span className="font-bold text-xs text-slate-700">Sentence Improvement</span>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                          className={`text-[11px] font-bold flex items-center gap-1 border border-slate-200 px-2 py-1 rounded transition ${getFilterColor(filterMode)}`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                          </svg>
                          <span>{getFilterLabel(filterMode)}</span>
                        </button>
                        {showFilterDropdown && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
                            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 w-40 overflow-hidden">
                              {(["all", "correct", "incorrect", "skip"] as FilterMode[]).map((mode) => (
                                <button
                                  key={mode}
                                  onClick={() => {
                                    setFilterMode(mode);
                                    setShowFilterDropdown(false);
                                    const firstIdx = questions.findIndex((_, idx) => {
                                      if (mode === "all") return true;
                                      const status = getQuestionStatus(idx);
                                      return status === mode;
                                    });
                                    if (firstIdx >= 0) goToQuestion(firstIdx);
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 text-[11px] font-bold flex items-center gap-1.5 transition hover:bg-slate-50 ${
                                    filterMode === mode ? "bg-slate-100" : ""
                                  }`}
                                >
                                  <span className={`w-2 h-2 rounded-full ${
                                    mode === "correct" ? "bg-emerald-500" : mode === "incorrect" ? "bg-rose-500" : mode === "skip" ? "bg-amber-400" : "bg-emerald-600"
                                  }`} />
                                  <span className="text-slate-700">{getFilterLabel(mode)}</span>
                                  <span className="ml-auto text-slate-400 text-[10px]">
                                    {mode === "all" ? totalQ : mode === "correct" ? correctCount : mode === "incorrect" ? wrongCount : skipCount}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-center mb-1.5">
                      <div className="border border-emerald-100 bg-emerald-50 rounded p-1">
                        <span className="block text-emerald-600 font-bold text-sm">{correctCount}</span>
                        <span className="block text-[8px] text-emerald-600 font-bold uppercase">Correct</span>
                      </div>
                      <div className="border border-rose-100 bg-rose-50 rounded p-1">
                        <span className="block text-rose-500 font-bold text-sm">{wrongCount}</span>
                        <span className="block text-[8px] text-rose-500 font-bold uppercase">Wrong</span>
                      </div>
                      <div className="border border-slate-200 bg-slate-50 rounded p-1">
                        <span className="block text-slate-600 font-bold text-sm">{skipCount}</span>
                        <span className="block text-[8px] text-slate-500 font-bold uppercase">Skip</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded p-2 text-center">
                      <span className="block text-[9px] text-emerald-700 font-bold uppercase tracking-wider">Total Score</span>
                      <span className={`block text-xl font-black my-0.5 ${totalScore >= 0 ? "text-emerald-800" : "text-red-600"}`}>
                        {totalScore.toFixed(2)}
                      </span>
                      <span className="block text-[9px] text-emerald-600">{correctCount}/{totalQ} correct</span>
                    </div>

                    <button
                      onClick={handleRestart}
                      className="mt-1.5 w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-[11px] tracking-wide px-3 py-2 rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="text-sm">&#128260;</span>
                      <span>RESTART</span>
                    </button>

                    <button
                      onClick={handleBackToReading}
                      className="mt-1.5 w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] tracking-wider px-3 py-2 rounded-lg transition flex items-center justify-center gap-1"
                    >
                      &uarr; Back to Reading
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex-1 min-h-0 flex flex-col">
                    <div ref={paletteRef} className="flex-1 overflow-y-auto min-h-0">
                      <div className="grid grid-cols-10 gap-[1px] justify-items-center">
                        {questions.map((q, idx) => {
                          const isAnswered = !!answers[idx];
                          const isCorrectQ = answers[idx] === q.correctAnswer;
                          const isActive = idx === currentQIndex;
                          const isFilteredOut = !passesFilter(idx);

                          let circleClass = "bg-slate-100 text-slate-600 hover:bg-slate-200";
                          if (isActive) {
                            circleClass = "bg-[#0d7a3e] text-white ring-[1.5px] ring-emerald-300";
                          } else if (isAnswered && isCorrectQ) {
                            circleClass = "bg-emerald-600 text-white";
                          } else if (isAnswered && !isCorrectQ) {
                            circleClass = "bg-rose-500 text-white";
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => goToQuestion(idx)}
                              className={`w-[12px] h-[12px] rounded-full flex items-center justify-center text-[7px] font-bold cursor-pointer transition-all ${circleClass} ${
                                isFilteredOut ? "opacity-20" : ""
                              }`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 mt-3 pt-3 border-t border-slate-100 shrink-0">
                      <div className="flex gap-2">
                        {page > 1 && (
                          <Link href={`/sentence-improvement/${page - 1}`} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-2 rounded text-center transition">
                            &larr; Prev Page
                          </Link>
                        )}
                        {page < totalPages && (
                          <Link href={`/sentence-improvement/${page + 1}`} className="flex-1 bg-[#0d7a3e]/10 hover:bg-[#0d7a3e]/20 text-[#0d7a3e] text-[10px] font-bold py-2 rounded text-center transition">
                            Next Page &rarr;
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
