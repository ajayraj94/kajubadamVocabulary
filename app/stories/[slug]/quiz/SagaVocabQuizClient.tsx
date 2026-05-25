"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ContentProtection from "@/app/_components/ContentProtection";

// ── Types ──

interface VocabQuestion {
    english: string;
    englishMeaning: string;
    hindi: string;
    hindiMeaning: string;
    sentence: string;
    hindiSentence: string;
}

interface QuestionItem {
    id: number;
    stem: string;
    hindiSentence: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

interface Props {
    slug: string;
    title: string;
    sagaId: string;
    vocabPart: string;
    rawQuestions: VocabQuestion[];
    contentHtml: string;
}

// ── Option letter helper ──
const OPTION_LETTERS = ["A", "B", "C", "D", "E"];

// ── Filter Mode type ──
type FilterMode = "all" | "correct" | "incorrect" | "skip";


// ── Component ──

export default function SagaVocabQuizClient({
    slug,
    title,
    sagaId,
    vocabPart,
    rawQuestions,
    contentHtml,
}: Props) {
    const [loading, setLoading] = useState(true);
    const [quizQuestions, setQuizQuestions] = useState<QuestionItem[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedAns, setSelectedAns] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [skipped, setSkipped] = useState<Set<number>>(new Set());
    const [restartKey, setRestartKey] = useState(0);
    const [filterMode, setFilterMode] = useState<FilterMode>("all");
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const quizSectionRef = useRef<HTMLDivElement>(null);
    const paletteRef = useRef<HTMLDivElement>(null);
    const PALETTE_COLS = 10;

    const currentQuestion = quizQuestions[currentQIndex];
    const totalQuestions = quizQuestions.length;

    // Get option letters for current question
    const optionLetters = currentQuestion
        ? OPTION_LETTERS.slice(0, currentQuestion.options.length)
        : [];

    // ── Build quiz questions from raw data ──
    const buildQuiz = () => {
        if (!rawQuestions || rawQuestions.length === 0) {
            setQuizQuestions([]);
            setLoading(false);
            return;
        }

        const shuffled = [...rawQuestions].sort(() => 0.5 - Math.random());
        const allWords = shuffled.map((q) => q.english);

        const items: QuestionItem[] = shuffled.map((q, idx) => {
            const pool = allWords.filter((w) => w !== q.english);
            const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
            const distractors: string[] = [];
            for (const w of shuffledPool) {
                if (distractors.length >= 4) break;
                if (!distractors.includes(w)) distractors.push(w);
            }
            while (distractors.length < 4) {
                distractors.push(
                    ["GLAD ABOUT", "ABLE TO", "PROUD OF", "FOND OF"][
                    distractors.length
                    ]
                );
            }

            const allOpts = [q.english, ...distractors].sort(
                () => 0.5 - Math.random()
            );
            const correctLetter =
                OPTION_LETTERS[allOpts.indexOf(q.english)];

            const explanation = `Correct Answer: "${q.english}" — ${q.englishMeaning}${q.hindi
                ? ` | हिंदी: "${q.hindi}" (${q.hindiMeaning})`
                : ""
                }`;

            return {
                id: idx,
                stem: q.sentence,
                hindiSentence: q.hindiSentence,
                options: allOpts,
                correctAnswer: correctLetter,
                explanation,
            };
        });

        setQuizQuestions(items);
        setCurrentQIndex(0);
        setSelectedAns(null);
        setShowExplanation(false);
        setAnswers({});
        setSkipped(new Set());
        setFilterMode("all");
        setShowFilterDropdown(false);
        setLoading(false);
    };

    // ── Build quiz on mount & on restart ──
    useEffect(() => {
        buildQuiz();
    }, [rawQuestions, restartKey]);

    // ── Restart ──
    const handleRestart = () => {
        setLoading(true);
        setRestartKey((prev) => prev + 1);
    };

    // ── Start quiz and scroll to it ──
    const handleStartQuiz = () => {
        setShowQuiz(true);
        setTimeout(() => {
            quizSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
    };

    // ── Scroll back to passage ──
    const scrollToPassage = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ── Option click ──
    const handleOptionClick = (letter: string) => {
        if (selectedAns) return;
        setSelectedAns(letter);
        setAnswers((prev) => ({ ...prev, [currentQIndex]: letter }));
        setShowExplanation(true);
        // Remove from skipped if was skipped
        if (skipped.has(currentQIndex)) {
            const newSkipped = new Set(skipped);
            newSkipped.delete(currentQIndex);
            setSkipped(newSkipped);
        }
    };

    // ── Skip ──
    const handleSkip = () => {
        if (selectedAns) return;
        const newSkipped = new Set(skipped);
        newSkipped.add(currentQIndex);
        setSkipped(newSkipped);
        // Auto move to next
        if (currentQIndex < totalQuestions - 1) {
            const nextIdx = currentQIndex + 1;
            setCurrentQIndex(nextIdx);
            setSelectedAns(null);
            setShowExplanation(false);
        }
    };

    // ── Previous / Next ──
    const handlePrev = () => {
        if (currentQIndex <= 0) return;
        const prevIdx = currentQIndex - 1;
        setCurrentQIndex(prevIdx);
        setSelectedAns(answers[prevIdx] || null);
        setShowExplanation(!!answers[prevIdx]);
    };

    const handleNext = () => {
        if (currentQIndex >= totalQuestions - 1) return;
        const nextIdx = currentQIndex + 1;
        setCurrentQIndex(nextIdx);
        setSelectedAns(answers[nextIdx] || null);
        setShowExplanation(!!answers[nextIdx]);
    };

    // ── Question jump ──
    const goToQuestion = (idx: number) => {
        setCurrentQIndex(idx);
        setSelectedAns(answers[idx] || null);
        setShowExplanation(!!answers[idx]);
    };

    // ── Auto-scroll palette to keep active question visible ──
    useEffect(() => {
        if (!paletteRef.current) return;
        const activeBtn = paletteRef.current.querySelector(
            `button:nth-child(${currentQIndex + 1})`
        ) as HTMLElement | null;
        if (activeBtn) {
            activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [currentQIndex]);

    // ── Score calculations ──
    const correctCount = useMemo(() => {
        return quizQuestions.filter(
            (q, idx) => answers[idx] === q.correctAnswer
        ).length;
    }, [answers, quizQuestions]);

    const wrongCount = Object.keys(answers).length - correctCount;
    const skipCount = skipped.size;
    const netScore = correctCount * 1 + wrongCount * -0.25;
    const allAnswered =
        Object.keys(answers).length + skipped.size === totalQuestions;

    // ── Filter helpers ──
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

    const passesFilter = useCallback((idx: number) => {
        if (filterMode === "all") return true;
        const isAnswered = answers[idx] !== undefined;
        if (filterMode === "correct") {
            return isAnswered && answers[idx] === quizQuestions[idx]?.correctAnswer;
        }
        if (filterMode === "incorrect") {
            return isAnswered && answers[idx] !== quizQuestions[idx]?.correctAnswer;
        }
        if (filterMode === "skip") {
            return skipped.has(idx);
        }
        return true;
    }, [filterMode, answers, quizQuestions, skipped]);

    // ── Loading ──
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/40 font-sans flex items-center justify-center">
                <div className="text-center">
                    <div className="w-6 h-6 border-4 border-[#008080] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[15px] font-bold text-gray-500">
                        Loading quiz...
                    </p>
                </div>
            </div>
        );
    }

    // ── No questions ──
    if (totalQuestions === 0) {
        return (
            <div className="min-h-screen bg-gray-50/40 font-sans flex items-center justify-center">
                <p className="text-[15px] text-gray-400 font-semibold">
                    Quiz questions not available for this story yet.
                </p>
            </div>
        );
    }

    // ── Render ──
    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">

            {/* ═══ TOP HEADER (Teal) ═══ */}
            <header className="bg-[#008080] text-white px-4 py-3 flex justify-between items-center shadow-sm sticky top-0 z-30">
                <div className="flex items-center space-x-3">
                    <Link
                        href="/"
                        className="hover:bg-[#006666] p-1.5 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="font-bold text-sm tracking-wide">Saga Vocab Quiz</h1>
                        <p className="text-xs text-teal-100 font-semibold truncate max-w-[300px] md:max-w-[500px]">
                            {title.length > 60 ? title.slice(0, 60) + "..." : title}
                        </p>
                    </div>
                </div>
                {showQuiz && Object.keys(answers).length > 0 && (
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="text-right leading-tight">
                            <div className="font-bold tracking-wider text-xs">
                                Score: {netScore.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-teal-200">
                                +{correctCount} / -{(wrongCount * 0.25).toFixed(2)}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* ═══ PASSAGE + QUIZ SECTIONS ═══ */}
            {!showQuiz ? (
                /* ═══ PASSAGE ONLY (before quiz starts) ═══ */
                <div className="max-w-[800px] mx-auto px-4 py-8 md:py-10">
                    {/* Passage Header with inline Start Quiz */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                        {/* Title Banner */}
                        <div className="bg-gradient-to-r from-[#008080] to-[#006666] px-5 md:px-6 py-4 md:py-5">
                            <h1 className="text-[20px] md:text-[24px] leading-tight font-bold text-white">
                                {title}
                            </h1>
                            <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-teal-100 mt-2 flex-wrap">
                                <span className="font-semibold">{sagaId}</span>
                                {vocabPart && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-teal-300/50 shrink-0" />
                                        <span>{vocabPart.charAt(0).toUpperCase() + vocabPart.slice(1)}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Start Quiz Action Row */}
                        <div className="px-5 md:px-6 py-3 md:py-4 flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reading Passage</div>
                                <div className="text-[13px] text-gray-600 mt-0.5">{totalQuestions} vocabulary questions</div>
                            </div>
                            <button
                                onClick={handleStartQuiz}
                                className="bg-[#008080] hover:bg-[#006666] active:bg-[#004d4d] text-white font-bold text-sm md:text-base px-5 md:px-7 py-2.5 md:py-3 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                            >
                                <span className="text-lg">📝</span>
                                <span>Start Quiz</span>
                                <span className="text-[10px] bg-white/20 rounded px-1.5 py-0.5">{totalQuestions}</span>
                            </button>
                        </div>

                        {/* Scoring Info Bar */}
                        <div className="bg-amber-50 border-t border-amber-100 px-5 md:px-6 py-2 flex items-center gap-4 text-[11px] md:text-xs text-amber-700 font-medium">
                            <span className="flex items-center gap-1">✅ +1 for correct</span>
                            <span className="w-1 h-1 rounded-full bg-amber-300 shrink-0" />
                            <span className="flex items-center gap-1">❌ −0.25 for wrong</span>
                            <span className="w-1 h-1 rounded-full bg-amber-300 shrink-0" />
                            <span className="flex items-center gap-1">⚡ Instant results</span>
                        </div>
                    </div>

                    {/* Story Content */}
                    <ContentProtection mode="full">
                        <div
                            className="bg-white rounded-lg p-5 md:p-6 border border-gray-100 shadow-sm prose prose-slate max-w-none"
                            dangerouslySetInnerHTML={{ __html: contentHtml }}
                        />
                    </ContentProtection>

                    {/* Bottom Start Quiz CTA */}
                    <div className="text-center mt-6">
                        <button
                            onClick={handleStartQuiz}
                            className="bg-[#008080] hover:bg-[#006666] active:bg-[#004d4d] text-white font-black text-base md:text-lg px-8 md:px-14 py-3 md:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-3"
                        >
                            <span className="text-xl md:text-2xl">📝</span>
                            <span>Start Quiz — {totalQuestions} Questions</span>
                        </button>
                    </div>
                </div>
            ) : (
                /* ═══ QUIZ MODE ═══ */
                <>
                    {/* Compact Story Content (above quiz, collapsible) */}
                    <div className="max-w-[800px] mx-auto px-4 py-4 md:py-6">
                        <details className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                            <summary className="px-4 md:px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors text-sm font-bold text-[#008080] flex items-center gap-2 select-none">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                                <span>📖 Reading Passage — {title.length > 50 ? title.slice(0, 50) + "..." : title}</span>
                            </summary>
                            <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-gray-100">
                                <ContentProtection mode="full">
                                    <div
                                        className="prose prose-slate max-w-none text-[14px] leading-relaxed mt-3"
                                        dangerouslySetInnerHTML={{ __html: contentHtml }}
                                    />
                                </ContentProtection>
                            </div>
                        </details>
                    </div>

                    {/* ═══ QUIZ SECTION ═══ */}
                    <section
                        ref={quizSectionRef}
                        id="quiz-section"
                        className="flex flex-col bg-slate-50 border-t border-slate-200"
                        style={{ height: "calc(100vh - 96px)" }}
                    >
                        {/* ── Top Section Bar ── */}
                        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center overflow-x-auto whitespace-nowrap text-xs gap-1 shrink-0">
                            <span className="text-[#008080] font-black uppercase mr-2 border-r border-slate-300 pr-2 tracking-wider text-[11px]">
                                Saga Vocab Quiz
                            </span>
                            <span className="text-slate-500 font-bold uppercase mr-2">
                                Sections
                            </span>
                            <button className="bg-[#008080] text-white px-4 py-1.5 rounded-t font-semibold">
                                Fill Blnk
                            </button>
                        </div>

                        {/* ── Main Workspace: 75% Left | 25% Right ── */}
                        <main className="flex-1 flex flex-col lg:flex-row p-4 gap-4 min-h-0">
                            {/* ═══ Left Side: Question Area (75%) — sticky question, scrollable body ═══ */}
                            <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm min-h-0">
                                <div className="flex flex-col h-full min-h-0">
                                    {/* Question Header Info — sticky */}
                                    <div className="shrink-0 px-5 pt-5 pb-4 border-b border-slate-100 bg-white rounded-t-lg">
                                        <div className="flex items-center text-sm flex-wrap gap-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-lg text-slate-800">
                                                    Q.{currentQIndex + 1}
                                                </span>
                                                <button
                                                    onClick={handleSkip}
                                                    disabled={!!selectedAns}
                                                    className={`bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold transition ${selectedAns
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                        }`}
                                                >
                                                    SKIP
                                                </button>
                                                <span className="text-slate-400 text-xs">|</span>
                                                <span className="text-slate-500 font-medium text-xs">
                                                    Sec 1 | Fill in the Blanks
                                                </span>
                                            </div>

                                            {/* Prev / Next */}
                                            <div className="flex items-center gap-2 ml-auto mr-3">
                                                <button
                                                    onClick={handlePrev}
                                                    disabled={currentQIndex === 0}
                                                    className={`flex items-center gap-1 font-bold text-xs px-3 py-1.5 rounded-full shadow-sm transition-all duration-150 active:scale-95 ${currentQIndex === 0
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
                                                    disabled={currentQIndex >= totalQuestions - 1}
                                                    className={`flex items-center gap-1 font-bold text-xs px-3 py-1.5 rounded-full shadow-sm transition-all duration-150 active:scale-95 ${currentQIndex >= totalQuestions - 1
                                                        ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                                                        : "bg-[#008080] hover:bg-[#006666] text-white hover:shadow-md hover:scale-105"
                                                        }`}
                                                >
                                                    <span>Next</span>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <span className="bg-[#00a884] text-white font-semibold text-xs px-2.5 py-1 rounded-full">
                                                Q {currentQIndex + 1}/{totalQuestions}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Question Body — scrollable if content overflows */}
                                    <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-5">
                                        {/* Question Text */}
                                        <div className="text-slate-800 font-medium mb-[6px] leading-relaxed text-sm md:text-base pt-3">
                                            &ldquo;{currentQuestion?.stem}&rdquo;
                                        </div>

                                        {currentQuestion?.hindiSentence && (
                                            <div className="text-[12px] text-[#008080] mb-[6px] font-medium leading-relaxed">
                                                &ldquo;{currentQuestion.hindiSentence}&rdquo;
                                            </div>
                                        )}

                                        {/* Options */}
                                        <div className="space-y-[3px]">
                                            {currentQuestion?.options.map((opt, idx) => {
                                                const letter = optionLetters[idx];
                                                const isSelected = selectedAns === letter;
                                                const isCorrect =
                                                    letter === currentQuestion.correctAnswer;

                                                let borderClass = "border-slate-200";
                                                let bgClass = "bg-white";
                                                let textClass = "text-slate-700";
                                                let ringClass = "";
                                                let radioColor =
                                                    "text-[#008080] border-slate-300 focus:ring-[#008080]";

                                                if (selectedAns) {
                                                    if (isCorrect) {
                                                        borderClass = "border-emerald-400";
                                                        bgClass = "bg-emerald-50";
                                                        textClass = "text-emerald-800 font-bold";
                                                        ringClass = "ring-2 ring-emerald-200";
                                                        radioColor =
                                                            "text-emerald-600 border-emerald-400";
                                                    } else if (isSelected) {
                                                        borderClass = "border-rose-400";
                                                        bgClass = "bg-rose-50";
                                                        textClass = "text-rose-800 font-bold";
                                                        ringClass = "ring-2 ring-rose-200";
                                                        radioColor =
                                                            "text-rose-600 border-rose-400";
                                                    } else {
                                                        bgClass = "bg-white";
                                                        textClass = "text-slate-400";
                                                        borderClass = "border-slate-100";
                                                    }
                                                }

                                                return (
                                                    <label
                                                        key={letter}
                                                        className={`flex items-center gap-1.5 p-1.5 border rounded cursor-pointer transition-all ${borderClass} ${bgClass} ${ringClass} ${!selectedAns
                                                            ? "hover:bg-slate-50"
                                                            : ""
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="option"
                                                            checked={isSelected}
                                                            onChange={() =>
                                                                handleOptionClick(letter)
                                                            }
                                                            disabled={!!selectedAns}
                                                            className={`w-3 h-3 ${radioColor}`}
                                                        />
                                                        <span
                                                            className={`text-sm md:text-base ${textClass}`}
                                                        >
                                                            {letter}) {opt}
                                                        </span>
                                                        {selectedAns && isCorrect && (
                                                            <svg
                                                                className="w-5 h-5 text-emerald-600 ml-auto shrink-0"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="3"
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        )}
                                                        {selectedAns &&
                                                            isSelected &&
                                                            !isCorrect && (
                                                                <svg
                                                                    className="w-5 h-5 text-rose-600 ml-auto shrink-0"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="3"
                                                                        d="M6 18L18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            )}
                                                    </label>
                                                );
                                            })}
                                        </div>

                                        {/* ── Explanation ── */}
                                        {showExplanation && (
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider">
                                                        💡 Explanation
                                                    </span>
                                                    <span
                                                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${selectedAns ===
                                                            currentQuestion?.correctAnswer
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {selectedAns ===
                                                            currentQuestion?.correctAnswer
                                                            ? "✓ Correct!"
                                                            : `✗ Incorrect — Correct: ${currentQuestion?.correctAnswer}`}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            setShowExplanation(false)
                                                        }
                                                        className="ml-auto text-amber-400 hover:text-amber-600 transition"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2.5"
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <p className="text-[13px] md:text-[14px] text-gray-700 leading-relaxed">
                                                    {currentQuestion?.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ═══ Right Side: Stats + Palette (25%) ═══ */}
                            <div className="w-full lg:w-[320px] flex flex-col gap-4 min-h-0">
                                {/* Stats Container */}
                                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm shrink-0">
                                    {/* User Profile Header */}
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-[#008080] text-white flex items-center justify-center font-bold text-xs rounded-full">
                                                {sagaId.split("-")[1] || "ST"}
                                            </div>
                                            <span className="font-bold text-xs text-slate-700">
                                                {vocabPart
                                                    ? vocabPart.charAt(0).toUpperCase() +
                                                    vocabPart.slice(1)
                                                    : "Story"}
                                            </span>
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
                                                                    const firstIdx = quizQuestions.findIndex((_, idx) => {
                                                                        if (mode === "all") return true;
                                                                        const isAnswered = answers[idx] !== undefined;
                                                                        if (mode === "correct") return isAnswered && answers[idx] === quizQuestions[idx]?.correctAnswer;
                                                                        if (mode === "incorrect") return isAnswered && answers[idx] !== quizQuestions[idx]?.correctAnswer;
                                                                        if (mode === "skip") return skipped.has(idx);
                                                                        return true;
                                                                    });
                                                                    if (firstIdx >= 0) goToQuestion(firstIdx);
                                                                }}
                                                                className={`w-full text-left px-2.5 py-1.5 text-[11px] font-bold flex items-center gap-1.5 transition hover:bg-slate-50 ${filterMode === mode ? "bg-slate-100" : ""}`}
                                                            >
                                                                <span className={`w-2 h-2 rounded-full ${mode === "correct" ? "bg-emerald-500" : mode === "incorrect" ? "bg-rose-500" : mode === "skip" ? "bg-amber-400" : "bg-teal-600"}`} />
                                                                <span className="text-slate-700">{getFilterLabel(mode)}</span>
                                                                <span className="ml-auto text-slate-400 text-[10px]">{mode === "all" ? totalQuestions : mode === "correct" ? correctCount : mode === "incorrect" ? wrongCount : skipCount}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Score Grid */}
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

                                    {/* Total Score Display */}
                                    <div className="bg-[#eef5fa] rounded border border-sky-100 p-2 text-center">
                                        <span className="block text-[9px] text-sky-700 font-bold uppercase tracking-wider">Total Score</span>
                                        <span className={`block text-xl font-black my-0.5 ${netScore >= 0 ? "text-sky-800" : "text-red-600"}`}>{netScore.toFixed(2)}</span>
                                        <span className="block text-[9px] text-sky-600">{correctCount}/{totalQuestions} correct</span>
                                    </div>

                                    {/* Restart Quiz — always visible */}
                                    <button
                                        onClick={handleRestart}
                                        className="mt-1.5 w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-[11px] tracking-wide px-3 py-2 rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <span className="text-sm">🔄</span>
                                        <span>RESTART</span>
                                    </button>
                                </div>

                                {/* Question Palette — scrollable internally */}
                                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex-1 min-h-0 flex flex-col">
                                    {/* Scrollable palette grid */}
                                    <div ref={paletteRef} className="flex-1 overflow-y-auto min-h-0">
                                        <div className="grid grid-cols-10 gap-[1px] justify-items-center">
                                            {quizQuestions.map((q, idx) => {
                                                const isAnswered = !!answers[idx];
                                                const isCorrectQ =
                                                    answers[idx] === q.correctAnswer;
                                                const isSkipped = skipped.has(idx);
                                                const isFilteredOut = !passesFilter(idx);

                                                let circleClass =
                                                    "bg-slate-100 text-slate-600 hover:bg-slate-200";
                                                if (idx === currentQIndex) {
                                                    circleClass =
                                                        "bg-[#008080] text-white ring-[1.5px] ring-teal-300";
                                                } else if (isAnswered && isCorrectQ) {
                                                    circleClass =
                                                        "bg-emerald-600 text-white";
                                                } else if (isAnswered && !isCorrectQ) {
                                                    circleClass =
                                                        "bg-rose-500 text-white";
                                                } else if (isSkipped) {
                                                    circleClass =
                                                        "bg-amber-400 text-white";
                                                }

                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() =>
                                                            goToQuestion(idx)
                                                        }
                                                        className={`w-[12px] h-[12px] rounded-full flex items-center justify-center text-[7px] font-bold cursor-pointer transition-all ${circleClass} ${isFilteredOut ? "opacity-20" : ""}`}
                                                    >
                                                        {idx + 1}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Sidebar Footer Buttons */}
                                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 shrink-0">
                                        <button
                                            onClick={scrollToPassage}
                                            className="bg-[#d2e2f9] hover:bg-sky-200 text-[#0d3b66] text-xs font-bold py-2 px-1 rounded flex justify-center items-center gap-1 transition"
                                        >
                                            <span>↑ Reading Passage</span>
                                        </button>
                                        <Link
                                            href="/"
                                            className="bg-[#d2e2f9] hover:bg-sky-200 text-[#0d3b66] text-xs font-bold py-2 px-1 rounded flex justify-center items-center gap-1 transition"
                                        >
                                            <span>Home</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </section>
                </>
            )}
        </div>
    );
}