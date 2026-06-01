"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";

// ── Types ──

interface EditorialParagraph {
    english: string;
    hindi: string;
}

interface QuestionItem {
    id: number;
    stem: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    sectionType: string;
    sectionName: string;
    sectionNumber: number;
    sectionContext?: string;
}

interface SectionInfo {
    number: number;
    type: string;
    typeName: string;
}

interface Props {
    title: string;
    date: string;
    source: string;
    editorialParagraphs: EditorialParagraph[];
    allQuestions: QuestionItem[];
    sections: SectionInfo[];
}

// ── Markdown text renderer: handles **bold**, *italic*, [links](url) ──
function renderInline(text: string): React.ReactNode {
    // 1. Handle markdown links: [text](url)
    const linkParts = text.split(/(\[[^\]]*\]\([^)]*\))/g);
    return linkParts.map((part, i) => {
        const linkMatch = part.match(/^\[([^\]]*)\]\(([^)]*)\)$/);
        if (linkMatch) {
            return (
                <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-[#d97706] hover:underline font-medium">
                    {linkMatch[1]}
                </a>
            );
        }
        // 2. Handle bold: **text**
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bp, j) => {
            if (bp.startsWith("**") && bp.endsWith("**")) {
                const word = bp.slice(2, -2);
                return <strong key={`${i}-${j}`} style={{ fontWeight: 'bold', color: '#CC5500' }}>{word}</strong>;
            }
            // 3. Handle italic: *text*
            const italicParts = bp.split(/(\*[^*]+\*)/g);
            return italicParts.map((ip, k) => {
                if (ip.startsWith("*") && ip.endsWith("*") && ip.length > 2) {
                    const word = ip.slice(1, -1);
                    return <em key={`${i}-${j}-${k}`} style={{ fontStyle: 'italic', color: '#6366f1' }}>{word}</em>;
                }
                return ip;
            });
        });
    });
}

// ── Editorial rendering: handles # headings, then passes to renderInline ──
function renderEditorialLine(line: string): { type: 'heading' | 'body'; level: number; content: React.ReactNode } {
    // Detect heading level from leading #
    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
        const level = headingMatch[1].length; // 1-4
        const cleanText = headingMatch[2].trim();
        return { type: 'heading', level, content: renderInline(cleanText) };
    }
    // Body text — render through renderInline
    return { type: 'body', level: 0, content: renderInline(line) };
}

// ── Detect if a line is a byline (bold-only author name) ──
function isByline(text: string): boolean {
    const trimmed = text.trim();
    // Must be exactly **text**
    if (!/^\*\*[^*]+\*\*$/.test(trimmed)) return false;
    const inner = trimmed.slice(2, -2);
    // Must look like a name — has a dot (initial) or mixed case
    return inner.includes('.') || /[a-z]/.test(inner);
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E"];

const SECTION_COLORS: Record<string, string> = {
    "error-detection": "bg-red-500",
    "sentence-improvement": "bg-blue-500",
    "para-jumbles": "bg-amber-500",
    "fill-blanks": "bg-purple-500",
    synonyms: "bg-emerald-500",
    antonyms: "bg-pink-500",
    collocation: "bg-cyan-500",
    "reading-comprehension": "bg-indigo-500",
    // New Super Mock format
    "context-vocabulary-shifts": "bg-violet-500",
    "advanced-spotting-error": "bg-rose-600",
    "triple-sentence-fillers": "bg-teal-500",
    "fragment-completion": "bg-orange-500",
    "advanced-cloze-test": "bg-sky-600",
    "advanced-para-jumbles": "bg-lime-600",
    "collocations-fixed-prepositions": "bg-fuchsia-500",
};

type FilterMode = "all" | "correct" | "incorrect" | "skip";

// ── Component ──
export default function DailyNewsVocabQuizClient({
    title,
    date,
    source,
    editorialParagraphs,
    allQuestions,
    sections,
}: Props) {
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedAns, setSelectedAns] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [filterMode, setFilterMode] = useState<FilterMode>("all");
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showMobileStats, setShowMobileStats] = useState(false);
    const quizSectionRef = useRef<HTMLDivElement>(null);
    const paletteRef = useRef<HTMLDivElement>(null);

    const currentQuestion = allQuestions[currentQIndex];
    const totalQ = allQuestions.length;

    const optionLetters = currentQuestion
        ? OPTION_LETTERS.slice(0, currentQuestion.options.length)
        : [];

    // ── Scroll to quiz & auto-start on #quiz hash (mount + click) ──
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === "#quiz") {
                handleStartQuiz();
            }
        };
        // Check on mount
        if (window.location.hash === "#quiz") {
            handleStartQuiz();
        }
        // Listen for hash changes (when user clicks vocab table link)
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    const scrollToQuizSection = () => {
        document
            .getElementById("quiz-section-anchor")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // ── Handlers ──
    const handleOptionClick = (letter: string) => {
        if (selectedAns) return;
        setSelectedAns(letter);
        setAnswers((prev) => ({ ...prev, [currentQIndex]: letter }));
        setShowExplanation(true);
    };

    const handleClearResponse = () => {
        setSelectedAns(null);
        setShowExplanation(false);
        setAnswers((prev) => {
            const updated = { ...prev };
            delete updated[currentQIndex];
            return updated;
        });
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

    // ── Stats ──
    const correctCount = useMemo(() => {
        return allQuestions.filter((q, idx) => answers[idx] === q.correctAnswer).length;
    }, [answers, allQuestions]);

    const wrongCount = useMemo(() => {
        return allQuestions.filter(
            (q, idx) => answers[idx] && answers[idx] !== q.correctAnswer
        ).length;
    }, [answers, allQuestions]);

    const skipCount = totalQ - Object.keys(answers).length;
    const totalScore = correctCount * 1 + wrongCount * -0.25;

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

    const getQuestionStatus = (idx: number) => {
        const q = allQuestions[idx];
        if (!answers[idx]) return "skip";
        if (answers[idx] === q.correctAnswer) return "correct";
        return "incorrect";
    };

    const passesFilter = (idx: number) => {
        if (filterMode === "all") return true;
        return getQuestionStatus(idx) === filterMode;
    };

    // ── Auto-scroll palette ──
    useEffect(() => {
        if (!paletteRef.current) return;
        const btns = paletteRef.current.querySelectorAll("button");
        const activeBtn = btns[currentQIndex] as HTMLElement | undefined;
        if (activeBtn) {
            activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [currentQIndex]);

    if (totalQ === 0) {
        return (
            <div className="min-h-screen bg-gray-50/40 font-sans flex items-center justify-center">
                <p className="text-[15px] text-gray-400 font-semibold">No questions available.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col overflow-x-hidden">
            {/* ═══ TOP HEADER (Amber) ═══ */}
            <header className="bg-[#d97706] text-white px-4 py-3 flex justify-between items-center shadow-sm sticky top-0 z-30">
                <div className="flex items-center space-x-2">
                    <Link
                        href="/?tab=daily"
                        className="hover:bg-[#b45309] p-1.5 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <Link
                        href="/"
                        className="hover:bg-[#b45309] p-1.5 rounded-full transition-colors"
                        title="Home"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="font-bold text-sm tracking-wide">Daily News Vocab Quiz</h1>
                        <p className="text-xs text-amber-100 font-semibold truncate max-w-[200px] md:max-w-[400px]">
                            {title.length > 60 ? title.slice(0, 60) + "..." : title}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!quizStarted && (
                        <button
                            onClick={scrollToQuizSection}
                            className="flex items-center gap-1.5 bg-white text-[#d97706] font-black text-[11px] uppercase tracking-wider px-4 py-2 rounded-lg shadow-md hover:bg-amber-50 transition-all hover:scale-105 active:scale-95"
                        >
                            <span className="text-sm">📝</span>
                            <span className="hidden sm:inline">Take Quiz</span>
                            <span className="sm:hidden">Quiz</span>
                        </button>
                    )}
                    {quizStarted && Object.keys(answers).length > 0 && (
                        <div className="flex items-center space-x-4 text-sm">
                            <div className="text-right leading-tight">
                                <div className="font-bold tracking-wider text-xs">Score: {totalScore.toFixed(2)}</div>
                                <div className="text-[10px] text-amber-200">+{correctCount} / -{(wrongCount * 0.25).toFixed(2)}</div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* ═══ READING VIEW ═══ */}
            {!quizStarted && (
                <div className="max-w-[860px] mx-auto px-5 py-8 md:py-10">
                    {/* Hero Header */}
                    <div className="bg-white rounded-xl border border-amber-200/60 shadow-md overflow-hidden mb-6 md:mb-8">
                        <div className="bg-gradient-to-br from-[#0f172a] via-[#d97706] to-[#0f172a] px-6 md:px-8 py-6 md:py-7 relative overflow-hidden">
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
                                <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-orange-500/10 blur-3xl animate-pulse" style={{animationDuration: '6s'}}></div>
                            </div>
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                        Daily News Vocab
                                    </span>
                                </div>
                                <h1 className="text-[26px] md:text-[32px] leading-tight font-black text-white tracking-tight">
                                    <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
                                        {title}
                                    </span>
                                </h1>
                                <div className="flex items-center gap-2 text-sm md:text-base text-amber-100/80 mt-2 flex-wrap">
                                    <span className="font-bold">{date}</span>
                                    <span className="w-1 h-1 rounded-full bg-amber-300/50 shrink-0" />
                                    <span>{source}</span>
                                </div>
                            </div>
                        </div>

                        {/* Start Quiz Action Row */}
                        <div className="px-6 md:px-8 py-3 md:py-4 flex items-center justify-between flex-wrap gap-3 border-t border-amber-100/40">
                            <div>
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reading Passage</div>
                                <div className="text-[13px] text-gray-600 mt-0.5">{editorialParagraphs.length} paragraphs &middot; {totalQ} questions</div>
                            </div>
                            <button
                                onClick={handleStartQuiz}
                                className="bg-[#d97706] hover:bg-[#b45309] active:bg-[#92400e] text-white font-bold text-sm md:text-base px-5 md:px-7 py-2.5 md:py-3 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                            >
                                <span className="text-lg">📝</span>
                                <span>Start Quiz</span>
                                <span className="text-[10px] bg-white/20 rounded px-1.5 py-0.5">{totalQ}</span>
                            </button>
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 border-t border-amber-100 px-6 md:px-8 py-3 flex items-center gap-5 text-xs md:text-sm text-amber-700 font-medium flex-wrap">
                            <span className="flex items-center gap-1.5">✅ +1 for correct</span>
                            <span className="w-1 h-1 rounded-full bg-amber-300 shrink-0" />
                            <span className="flex items-center gap-1.5">❌ &minus;0.25 for wrong</span>
                            <span className="w-1 h-1 rounded-full bg-amber-300 shrink-0" />
                            <span className="flex items-center gap-1.5">📖 Full bilingual explanations for every question</span>
                        </div>
                    </div>

                    {/* Editorial Passage */}
                    <div id="editorial-content" className="bg-white rounded-xl border border-amber-200/40 shadow-sm overflow-hidden mb-8 md:mb-10">
                        <div className="bg-gradient-to-r from-amber-50 to-amber-100/30 px-5 md:px-6 py-3 border-b border-amber-100">
                            <h2 className="text-[14px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-2">
                                <span>📰</span>
                                <span>Editorial Passage</span>
                            </h2>
                        </div>
                        <div className="px-5 md:px-6 py-4 md:py-5 space-y-4">
                            {editorialParagraphs.map((para, idx) => {
                                const eng = renderEditorialLine(para.english || '');
                                const hin = para.hindi ? renderEditorialLine(para.hindi) : null;
                                return (
                                    <div key={idx} className={idx > 0 ? "pt-3 border-t border-gray-100" : ""}>                                            {eng.type === 'heading' ? (
                                            <>
                                                {eng.level === 1 && (
                                                    <h1 className="text-[22px] md:text-[26px] font-black text-[#0f172a] leading-tight mb-1">{eng.content}</h1>
                                                )}
                                                {eng.level === 2 && (
                                                    <h2 className="text-[18px] md:text-[20px] font-extrabold text-[#0f172a] leading-snug mb-1">{eng.content}</h2>
                                                )}
                                                {eng.level === 3 && (
                                                    <h3 className="text-[15px] md:text-[17px] font-bold text-[#d97706] leading-snug italic">{eng.content}</h3>
                                                )}
                                                {eng.level === 4 && (
                                                    <h4 className="text-[14px] md:text-[16px] font-extrabold text-[#0f172a] uppercase tracking-wider leading-snug mt-4 mb-1">{eng.content}</h4>
                                                )}
                                                {hin && hin.type === 'heading' && (
                                                    <>
                                                        {hin.level === 1 && <h1 className="text-[18px] md:text-[22px] font-black text-gray-700 leading-tight mt-1">{hin.content}</h1>}
                                                        {hin.level === 2 && <h2 className="text-[16px] md:text-[18px] font-extrabold text-gray-700 leading-snug mt-1">{hin.content}</h2>}
                                                        {hin.level === 3 && <h3 className="text-[14px] md:text-[15px] font-bold text-gray-500 leading-snug italic mt-1">{hin.content}</h3>}
                                                        {hin.level === 4 && <h4 className="text-[13px] md:text-[14px] font-extrabold text-gray-500 uppercase tracking-wider mt-1">{hin.content}</h4>}
                                                    </>
                                                )}
                                            </>
                                        ) : para.english && isByline(para.english) ? (
                                                <div className="text-right mt-1 mb-2">
                                                    <p className="text-[11px] md:text-[12px] text-gray-400 font-medium tracking-wide">
                                                        — {renderInline(para.english)}
                                                    </p>
                                                    {para.hindi && isByline(para.hindi) && (
                                                        <p className="text-[10px] md:text-[11px] text-gray-400 mt-0.5">
                                                            — {renderInline(para.hindi)}
                                                        </p>
                                                    )}
                                                </div>
                                        ) : (
                                            <>
                                                {para.english && (
                                                    <p className="text-[14px] md:text-[15px] text-gray-800 leading-[1.7] mb-2">
                                                        {eng.content}
                                                    </p>
                                                )}
                                                {para.hindi && (
                                                    <p className="text-[14px] md:text-[15px] text-gray-500 leading-[1.7] border-l-2 border-amber-300 pl-3 italic">
                                                        {hin?.content}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* All Questions List — Gemini-style readability */}
                    <div className="space-y-8 md:space-y-10">
                        {allQuestions.map((q, qIdx) => (
                            <div
                                key={qIdx}
                                id={`reading-q-${q.sectionNumber}-${q.id}`}
                                className="bg-white rounded-2xl border border-amber-200/40 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                            >
                                {/* Question Header */}
                                <div className="relative flex items-stretch">
                                    <div className="w-1.5 bg-[#d97706] shrink-0" />
                                    <div className="flex-1 bg-white px-4 md:px-5 pt-3 pb-1 flex items-start gap-3">
                                        <div className="flex items-center justify-center w-[42px] h-[42px] md:w-[52px] md:h-[52px] rounded-xl bg-gradient-to-br from-[#d97706] to-[#b45309] text-white shadow-md shadow-amber-900/20 shrink-0 mt-0.5">
                                            <span className="text-[16px] md:text-[18px] font-black leading-none">{q.id}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[9px] font-bold text-[#d97706] uppercase tracking-wider leading-none">Q.{q.id}</span>
                                                <span className="w-[3px] h-[3px] rounded-full bg-gray-300 shrink-0" />
                                                <span className="flex items-center gap-1 text-[10px] text-gray-400 leading-none">
                                                    <span className={`w-2 h-2 rounded-full ${SECTION_COLORS[q.sectionType] || "bg-gray-400"}`} />
                                                    {q.sectionName}
                                                </span>
                                            </div>
                                            <h3 className="text-[14px] md:text-[16px] font-bold text-gray-900 leading-snug mt-0.5">{renderInline(q.stem)}</h3>
                                            {q.sectionContext && (
                                                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 leading-relaxed space-y-1">
                                                    {q.sectionContext.split('\n').filter(Boolean).map((line, i) => (
                                                        <p key={i}>{renderInline(line)}</p>
                                                    ))}
                                                </div>
                                            )}
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
                                    {/* Options */}
                                    <div className="space-y-1.5 mb-4 mt-3">
                                        {q.options.map((opt, idx) => {
                                            const isCorrectOpt = OPTION_LETTERS[idx] === q.correctAnswer;
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex items-center gap-2 text-[14px] md:text-[15px] leading-relaxed px-3 py-2 rounded-xl ${
                                                        isCorrectOpt
                                                            ? "bg-gradient-to-r from-emerald-50/90 to-white border border-emerald-200/60"
                                                            : "bg-white border border-amber-100/30"
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

                                    {/* Explanation */}
                                    {q.explanation && (
                                        <div className="relative bg-gradient-to-br from-amber-50 to-white border border-amber-200/50 rounded-xl p-5 md:p-7 mt-4 shadow-sm">
                                            <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-amber-400 to-orange-400 rounded-r-full" />
                                            <div className="pl-4">
                                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                    <span className="inline-flex items-center gap-1.5 text-[13px] font-black text-amber-800 uppercase tracking-wider bg-amber-100/70 border border-amber-200/70 px-3 py-1 rounded-full">
                                                        💡 Explanation
                                                    </span>
                                                    <span className="text-[12px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                                                        ✓ Answer: {q.correctAnswer}
                                                    </span>
                                                </div>
                                                <div className="text-[13px] md:text-[14px] text-amber-900 leading-relaxed space-y-2">
                                                    {q.explanation.split('\n').filter(Boolean).map((para, i) => (
                                                        <p key={i}>{renderInline(para)}</p>
                                                    ))}
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
                            className="bg-[#d97706] hover:bg-[#b45309] active:bg-[#92400e] text-white font-black text-[18px] md:text-[20px] px-10 md:px-16 py-4 md:py-5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-3"
                        >
                            <span className="text-2xl md:text-3xl">📝</span>
                            <span>Take Quiz &mdash; {totalQ} Questions</span>
                        </button>
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
                            <span className="bg-gray-50 px-6 py-1 text-[12px] font-black text-gray-400 uppercase tracking-widest">Quiz Section</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ QUIZ SECTION ═══ */}
            <section ref={quizSectionRef} className={`bg-gray-50 ${quizStarted ? "" : "pt-12 pb-16"}`}>
                {!quizStarted ? (
                    <div className="max-w-[620px] mx-auto px-5 text-center">
                        <div className="bg-white rounded-2xl border border-amber-100/50 shadow-sm p-10 md:p-12">
                            <div className="w-20 h-20 bg-[#d97706]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                                <span className="text-4xl">📝</span>
                            </div>
                            <h2 className="text-[26px] font-black text-gray-800 mb-3 leading-tight">Ready to Test Yourself?</h2>
                            <p className="text-[16px] md:text-[17px] text-gray-500 mb-8 max-w-md mx-auto leading-[1.7]">
                                Attempt all {totalQ} questions from this page. Get instant feedback with detailed bilingual explanations for every question. Negative marking: &minus;0.25 for each wrong answer.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={handleStartQuiz}
                                    className="bg-[#d97706] hover:bg-[#b45309] active:bg-[#92400e] text-white font-black text-[18px] px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                >
                                    <span>▶</span>
                                    <span>Start Quiz</span>
                                </button>
                                <Link href="/?tab=daily" className="text-gray-400 hover:text-gray-600 text-[14px] font-bold transition-colors">
                                    &larr; Back to daily news
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
                    /* ═══ QUIZ MODE ═══ */
                    <div className="border-t border-slate-200">
                        {/* Split Layout — fixed viewport height for independent scrolling */}
                        <div className="flex flex-col bg-slate-50" style={{ height: "calc(100vh - 56px)" }}>
                            {/* Sub Header */}
                            <div className="bg-slate-100 border-b border-slate-200 px-2 md:px-4 py-2 flex items-center overflow-x-auto whitespace-nowrap text-[10px] md:text-xs gap-1 shrink-0">
                                <span className="text-[#d97706] font-black uppercase mr-1 border-r border-slate-300 pr-2 tracking-wider text-[12px]">Daily News Vocab</span>
                                <span className="text-slate-500 font-bold uppercase mr-1 text-[11px]">{date}</span>
                                <button className="bg-[#d97706] text-white px-4 py-1.5 rounded-t font-semibold text-xs">Quiz Mode</button>
                                <button
                                    onClick={handleBackToReading}
                                    className="bg-white text-slate-700 hover:text-slate-900 border border-slate-300 border-b-0 px-3 py-1.5 rounded-t font-semibold text-[11px] transition shadow-sm"
                                >
                                    &uarr; Reading
                                </button>
                                <Link
                                    href="/"
                                    className="ml-auto flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#d97706] border border-slate-300 hover:border-[#d97706]/30 px-2.5 py-1.5 rounded-md font-semibold text-[11px] transition shadow-sm shrink-0"
                                    title="Home"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span>Home</span>
                                </Link>
                            </div>

                            {/* ════════════════════════════════════════════
                               DEFAULT LAYOUT — used for ALL question types;
                               RC questions get the left panel split into
                               passage (top) + question (bottom)
                               ════════════════════════════════════════════ */}
                                <main className="flex-1 flex flex-row p-2 md:p-4 gap-3 md:gap-4 min-h-0">
                                    {/* ── LEFT: Passage / Sentences Column (desktop) — RC or Para Jumbles ── */}
                                    {((currentQuestion.sectionType === "reading-comprehension" && editorialParagraphs.length > 0) ||
                                       (currentQuestion.sectionType === "advanced-para-jumbles" || currentQuestion.sectionType === "para-jumbles") && currentQuestion.sectionContext) && (
                                        <div className="flex w-1/3 lg:w-[340px] flex-col bg-white border border-slate-200 rounded-lg shadow-sm min-h-0 overflow-hidden">
                                            <div className="px-4 py-[11px] bg-gray-50 border-b border-gray-200 shrink-0">
                                                {currentQuestion.sectionType === "reading-comprehension" ? (
                                                    <>
                                                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em]">Reading Passage</span>
                                                        <span className="ml-2 text-[9px] text-gray-400">— {editorialParagraphs.length} paragraphs</span>
                                                    </>
                                                ) : (
                                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em]">📋 Sentences A&ndash;F</span>
                                                )}
                                            </div>
                                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 font-serif text-[14px] text-gray-700 leading-[1.8]">
                                                {currentQuestion.sectionType === "reading-comprehension" ? (
                                                    editorialParagraphs
                                                        .filter(para => para.english && !/^(title|metaDescription|keywords|aeoDefinition):/i.test(para.english.trim()))
                                                        .map((para, idx) => (
                                                            para.english ? (
                                                                <p key={idx}>{renderInline(para.english)}</p>
                                                            ) : null
                                                        ))
                                                ) : (
                                                    currentQuestion.sectionContext!
                                                        .split('\n')
                                                        .filter(line => {
                                                            const content = line.trim().replace(/^\*\s*/, '');
                                                            return /^\([A-F]\)/.test(content) || /^\*\*\([A-F]\)\*\*/.test(content) || /^\*{0,2}Directions/i.test(content);
                                                        })
                                                        .map((line, i) => {
                                                            const trimmed = line.trim();
                                                            if (!trimmed) return null;
                                                            return <p key={i}>{renderInline(trimmed)}</p>;
                                                        })
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── MIDDLE: Question Area ── */}
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
                                                        <span className="text-slate-500 font-medium text-xs">
                                                            Sec {currentQuestion.sectionNumber} | {currentQuestion.sectionName}
                                                        </span>
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
                                                                    : "bg-[#d97706] hover:bg-[#b45309] text-white hover:shadow-md hover:scale-105"
                                                            }`}
                                                        >
                                                            <span>Next</span>
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <span className="bg-[#d97706] text-white font-semibold text-xs px-2.5 py-1 rounded-full">Q {currentQIndex + 1}/{totalQ}</span>
                                                </div>
                                            </div>

                                            {/* Question Body */}
                                            <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-5">
                                                {/* Question Stem */}
                                                <div className="flex items-center gap-2 mt-4 mb-2">
                                                    <span className={`w-2 h-2 rounded-full ${SECTION_COLORS[currentQuestion.sectionType] || "bg-gray-400"}`} />
                                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{currentQuestion.sectionName}</span>
                                                </div>
                                                <div className="text-[14px] md:text-[15px] text-slate-800 font-medium mb-3 leading-[1.6] bg-slate-50 border border-slate-100 rounded-lg p-3">
                                                    {renderInline(currentQuestion.stem)}
                                                </div>

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
                                                        let radioColor = "text-[#d97706] border-slate-300 focus:ring-[#d97706]";

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

                                                {/* Mobile — Prev/Next */}
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
                                                                : "bg-[#d97706] hover:bg-[#b45309] text-white hover:shadow-md"
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
                                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mt-5">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="text-[12px] font-black text-amber-700 uppercase tracking-wider">💡 Explanation</span>
                                                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                                                selectedAns === currentQuestion.correctAnswer ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                            }`}>
                                                                {selectedAns === currentQuestion.correctAnswer
                                                                    ? "✓ Correct!"
                                                                    : `✗ Incorrect — Correct: ${currentQuestion.correctAnswer}`}
                                                            </span>
                                                            <button
                                                                onClick={() => setShowExplanation(false)}
                                                                className="ml-auto text-amber-400 hover:text-amber-600 transition"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <div className="text-[13px] md:text-[14px] text-amber-900 leading-relaxed space-y-2">
                                                            {currentQuestion.explanation.split('\n').filter(Boolean).map((para, i) => (
                                                                <p key={i}>{renderInline(para)}</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── RIGHT: Stats Sidebar (desktop always, mobile collapsible) ── */}
                                    <div className="hidden lg:flex lg:w-[340px] flex-col gap-4 min-h-0">
                                        {/* Stats Panel */}
                                        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm shrink-0">
                                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 bg-[#d97706] text-white flex items-center justify-center font-bold text-xs rounded-full">DN</div>
                                                    <span className="font-bold text-xs text-slate-700">Daily News</span>
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
                                                                            const firstIdx = allQuestions.findIndex((_, idx) => {
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
                                                                            mode === "correct" ? "bg-emerald-500" : mode === "incorrect" ? "bg-rose-500" : mode === "skip" ? "bg-amber-400" : "bg-[#d97706]"
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

                                            <div className="bg-amber-50 border border-amber-100 rounded p-2 text-center">
                                                <span className="block text-[9px] text-amber-700 font-bold uppercase tracking-wider">Total Score</span>
                                                <span className={`block text-xl font-black my-0.5 ${totalScore >= 0 ? "text-amber-800" : "text-red-600"}`}>
                                                    {totalScore.toFixed(2)}
                                                </span>
                                                <span className="block text-[9px] text-amber-600">{correctCount}/{totalQ} correct</span>
                                            </div>

                                            <button
                                                onClick={handleRestart}
                                                className="mt-1.5 w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-[11px] tracking-wide px-3 py-2 rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                <span className="text-sm">🔄</span>
                                                <span>RESTART</span>
                                            </button>

                                            <button
                                                onClick={handleBackToReading}
                                                className="mt-1.5 w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] tracking-wider px-3 py-2 rounded-lg transition flex items-center justify-center gap-1"
                                            >
                                                &uarr; Back to Reading
                                            </button>
                                        </div>

                                        {/* Palette — shown for ALL question types (passage is in left column for RC) */}
                                        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex-1 min-h-0 flex flex-col">
                                            <div ref={paletteRef} className="flex-1 overflow-y-auto min-h-0">
                                                <div className="grid grid-cols-10 gap-[1px] justify-items-center">
                                                    {allQuestions.map((q, idx) => {
                                                        const isAnswered = !!answers[idx];
                                                        const isCorrectQ = answers[idx] === q.correctAnswer;
                                                        const isActive = idx === currentQIndex;
                                                        const isFilteredOut = !passesFilter(idx);

                                                        let circleClass = "bg-slate-100 text-slate-600 hover:bg-slate-200";
                                                        if (isActive) {
                                                            circleClass = "bg-[#d97706] text-white ring-[1.5px] ring-amber-300";
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
                                                <button
                                                    onClick={handleBackToReading}
                                                    className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold py-2 rounded text-center transition"
                                                >
                                                    &uarr; Back to Reading
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Mobile: Floating Stats Toggle ── */}
                                    <div className="lg:hidden fixed bottom-5 right-5 z-50">
                                        <button
                                            onClick={() => setShowMobileStats(true)}
                                            className="bg-[#d97706] text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-[#b45309] transition-all active:scale-90"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* ── Mobile: Stats Overlay Panel ── */}
                                    {showMobileStats && (
                                        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
                                            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileStats(false)} />
                                            <div className="relative w-[280px] bg-white shadow-xl overflow-y-auto p-4 animate-in slide-in-from-right">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="font-bold text-sm text-slate-700">📊 Stats & Navigation</span>
                                                    <button
                                                        onClick={() => setShowMobileStats(false)}
                                                        className="text-slate-400 hover:text-slate-600 p-1"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                {/* Stats */}
                                                <div className="grid grid-cols-3 gap-1 text-center mb-3">
                                                    <div className="border border-emerald-100 bg-emerald-50 rounded p-2">
                                                        <span className="block text-emerald-600 font-bold text-sm">{correctCount}</span>
                                                        <span className="block text-[8px] text-emerald-600 font-bold uppercase">Correct</span>
                                                    </div>
                                                    <div className="border border-rose-100 bg-rose-50 rounded p-2">
                                                        <span className="block text-rose-500 font-bold text-sm">{wrongCount}</span>
                                                        <span className="block text-[8px] text-rose-500 font-bold uppercase">Wrong</span>
                                                    </div>
                                                    <div className="border border-slate-200 bg-slate-50 rounded p-2">
                                                        <span className="block text-slate-600 font-bold text-sm">{skipCount}</span>
                                                        <span className="block text-[8px] text-slate-500 font-bold uppercase">Skip</span>
                                                    </div>
                                                </div>
                                                <div className="bg-amber-50 border border-amber-100 rounded p-2 text-center mb-4">
                                                    <span className="block text-[9px] text-amber-700 font-bold uppercase tracking-wider">Score</span>
                                                    <span className={`block text-xl font-black my-0.5 ${totalScore >= 0 ? "text-amber-800" : "text-red-600"}`}>
                                                        {totalScore.toFixed(2)}
                                                    </span>
                                                    <span className="block text-[9px] text-amber-600">{correctCount}/{totalQ} correct</span>
                                                </div>
                                                {/* Palette */}
                                                <div className="grid grid-cols-10 gap-[2px] justify-items-center mb-4">
                                                    {allQuestions.map((q, idx) => {
                                                        const isAnswered = !!answers[idx];
                                                        const isCorrectQ = answers[idx] === q.correctAnswer;
                                                        const isActive = idx === currentQIndex;
                                                        let circleClass = "bg-slate-100 text-slate-600";
                                                        if (isActive) {
                                                            circleClass = "bg-[#d97706] text-white ring-2 ring-amber-300";
                                                        } else if (isAnswered && isCorrectQ) {
                                                            circleClass = "bg-emerald-600 text-white";
                                                        } else if (isAnswered && !isCorrectQ) {
                                                            circleClass = "bg-rose-500 text-white";
                                                        }
                                                        return (
                                                            <button
                                                                key={idx}
                                                                onClick={() => { goToQuestion(idx); setShowMobileStats(false); }}
                                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${circleClass}`}
                                                            >
                                                                {idx + 1}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <button
                                                    onClick={() => { handleRestart(); setShowMobileStats(false); }}
                                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] px-3 py-2 rounded-lg mb-2"
                                                >
                                                    🔄 Restart Quiz
                                                </button>
                                                <button
                                                    onClick={() => { handleBackToReading(); setShowMobileStats(false); }}
                                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] px-3 py-2 rounded-lg"
                                                >
                                                    &uarr; Back to Reading
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </main>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}