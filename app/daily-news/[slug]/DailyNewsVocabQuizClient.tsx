"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import ContentProtection from "@/app/_components/ContentProtection";

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

// ── Bold text helper ──
function renderBold(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            const word = part.slice(2, -2);
            return (
                <strong key={i} className="font-bold text-[#CC5500]">
                    {word}
                </strong>
            );
        }
        return part;
    });
}

// ── Option letter helper ──
const OPTION_LETTERS = ["A", "B", "C", "D", "E"];

// ── Section Name to short label ──
const SECTION_SHORT: Record<string, string> = {
    "error-detection": "Err Det",
    "sentence-improvement": "Sent Imp",
    "para-jumbles": "Para Jum",
    "fill-blanks": "Fill Blnk",
    synonyms: "Synonym",
    antonyms: "Antonym",
    collocation: "Collocat",
    "reading-comprehension": "Rd Comp",
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
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedAns, setSelectedAns] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showSolution, setShowSolution] = useState(false);
    const [reattemptMode, setReattemptMode] = useState(false);
    const [filterMode, setFilterMode] = useState<FilterMode>("all");
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const paletteRef = useRef<HTMLDivElement>(null);
    const quizSectionRef = useRef<HTMLDivElement>(null);

    const currentQuestion = allQuestions[currentQIndex];
    const totalQuestions = allQuestions.length;

    const optionLetters = currentQuestion
        ? OPTION_LETTERS.slice(0, currentQuestion.options.length)
        : [];

    // ── Handlers ──
    const handleOptionClick = (letter: string) => {
        if (selectedAns) return;
        setSelectedAns(letter);
        setAnswers((prev) => ({ ...prev, [currentQIndex]: letter }));
        setShowExplanation(true);
        setShowSolution(true);
    };

    const handleNext = () => {
        if (currentQIndex < totalQuestions - 1) {
            const nextIdx = currentQIndex + 1;
            setCurrentQIndex(nextIdx);
            setSelectedAns(answers[nextIdx] || null);
            setShowExplanation(!!answers[nextIdx]);
            setShowSolution(!!answers[nextIdx]);
        }
    };

    const handlePrev = () => {
        if (currentQIndex > 0) {
            const prevIdx = currentQIndex - 1;
            setCurrentQIndex(prevIdx);
            setSelectedAns(answers[prevIdx] || null);
            setShowExplanation(!!answers[prevIdx]);
            setShowSolution(!!answers[prevIdx]);
        }
    };

    const goToQuestion = (idx: number) => {
        setCurrentQIndex(idx);
        setSelectedAns(answers[idx] || null);
        setShowExplanation(!!answers[idx]);
        setShowSolution(!!answers[idx]);
    };

    // ── Reset quiz for reattempt ──
    const handleReattempt = () => {
        setAnswers({});
        setCurrentQIndex(0);
        setSelectedAns(null);
        setShowExplanation(false);
        setShowSolution(false);
        setReattemptMode(false);
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

    // ── Stats ──
    const correctCount = useMemo(() => {
        return allQuestions.filter((q, idx) => answers[idx] === q.correctAnswer).length;
    }, [answers, allQuestions]);

    const incorrectCount = useMemo(() => {
        return allQuestions.filter((q, idx) => answers[idx] && answers[idx] !== q.correctAnswer).length;
    }, [answers, allQuestions]);

    const skipCount = totalQuestions - Object.keys(answers).length;

    // Score: +1 for correct, -0.25 for wrong
    const totalScore = useMemo(() => {
        return correctCount * 1 + incorrectCount * (-0.25);
    }, [correctCount, incorrectCount]);

    // ── Question palette by section ──
    const questionsBySection = useMemo(() => {
        const map: Record<number, QuestionItem[]> = {};
        for (const q of allQuestions) {
            if (!map[q.sectionNumber]) map[q.sectionNumber] = [];
            map[q.sectionNumber].push(q);
        }
        return map;
    }, [allQuestions]);

    // ── Filter logic ──
    const filteredSections = useMemo(() => {
        if (filterMode === "all") return sections;

        return sections.filter((sec) => {
            const sectionQs = questionsBySection[sec.number] || [];
            return sectionQs.some((q) => {
                const globalIdx = allQuestions.indexOf(q);
                if (filterMode === "correct") return answers[globalIdx] === q.correctAnswer;
                if (filterMode === "incorrect") return answers[globalIdx] && answers[globalIdx] !== q.correctAnswer;
                if (filterMode === "skip") return !answers[globalIdx];
                return true;
            });
        });
    }, [filterMode, sections, questionsBySection, allQuestions, answers]);

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
            case "all": return "bg-gray-100 text-gray-700";
            case "correct": return "bg-emerald-100 text-emerald-700";
            case "incorrect": return "bg-red-100 text-red-700";
            case "skip": return "bg-gray-200 text-gray-500";
        }
    };

    // Get question status
    const getQuestionStatus = (globalIdx: number) => {
        const q = allQuestions[globalIdx];
        if (!answers[globalIdx]) return "skip";
        if (answers[globalIdx] === q.correctAnswer) return "correct";
        return "incorrect";
    };

    // Check if a question passes the current filter
    const passesFilter = (globalIdx: number) => {
        if (filterMode === "all") return true;
        return getQuestionStatus(globalIdx) === filterMode;
    };

    // ── Auto-scroll palette to active question ──
    useEffect(() => {
        if (!paletteRef.current) return;
        const activeBtn = paletteRef.current.querySelector(`[data-qidx="${currentQIndex}"]`) as HTMLElement | null;
        if (activeBtn) {
            activeBtn.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
    }, [currentQIndex]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">

            {/* ═══ TOP HEADER (Blue) ═══ */}
            <header className="bg-[#0b849e] text-white px-4 py-3 flex justify-between items-center shadow-sm sticky top-0 z-30">
                <div className="flex items-center space-x-3">
                    <Link
                        href="/?tab=daily"
                        className="hover:bg-[#097188] p-1.5 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="font-bold text-sm tracking-wide">Daily News Vocab Quiz</h1>
                        <p className="text-xs text-cyan-100 font-semibold truncate max-w-[300px] md:max-w-[500px]">
                            {title.length > 60 ? title.slice(0, 60) + "..." : title}
                        </p>
                    </div>
                </div>
                {showQuiz && Object.keys(answers).length > 0 && (
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="text-right leading-tight">
                            <div className="font-bold tracking-wider text-xs">
                                Score: {totalScore.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-cyan-200">
                                +{correctCount} / -{(incorrectCount * 0.25).toFixed(2)}
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
                        <div className="bg-gradient-to-r from-[#0b849e] to-[#097188] px-5 md:px-6 py-4 md:py-5">
                            <h1 className="text-[20px] md:text-[24px] leading-tight font-bold text-white">
                                {title}
                            </h1>
                            <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-cyan-100 mt-2 flex-wrap">
                                <span className="font-semibold">{date}</span>
                                <span className="w-1 h-1 rounded-full bg-cyan-300/50 shrink-0" />
                                <span>{source}</span>
                            </div>
                        </div>

                        {/* Start Quiz Action Row */}
                        <div className="px-5 md:px-6 py-3 md:py-4 flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reading Passage</div>
                                <div className="text-[13px] text-gray-600 mt-0.5">{editorialParagraphs.length} paragraphs · {totalQuestions} questions</div>
                            </div>
                            <button
                                onClick={handleStartQuiz}
                                className="bg-[#0b849e] hover:bg-[#097188] active:bg-[#066d7a] text-white font-bold text-sm md:text-base px-5 md:px-7 py-2.5 md:py-3 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
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

                    {/* Passage Body */}
                    <ContentProtection mode="full">
                        <div className="bg-gray-50 rounded-lg p-4 md:p-5 border border-gray-100">
                            {editorialParagraphs.map((para, idx) => (
                                <div key={idx} className={idx > 0 ? "mt-3 pt-3 border-t border-gray-200/60" : ""}>
                                    {para.english && (
                                        <p className="text-[14px] md:text-[16px] text-gray-800 leading-[1.8] md:leading-[1.9]">
                                            {renderBold(para.english)}
                                        </p>
                                    )}
                                    {para.hindi && (
                                        <p className="text-[14px] md:text-[15px] text-gray-800 leading-[1.8] md:leading-[1.9]">
                                            {renderBold(para.hindi)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ContentProtection>

                    {/* Bottom Start Quiz CTA */}
                    <div className="text-center mt-6">
                        <button
                            onClick={handleStartQuiz}
                            className="bg-[#0b849e] hover:bg-[#097188] active:bg-[#066d7a] text-white font-black text-base md:text-lg px-8 md:px-14 py-3 md:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-3"
                        >
                            <span className="text-xl md:text-2xl">📝</span>
                            <span>Start Quiz — {totalQuestions} Questions</span>
                        </button>
                    </div>
                </div>
            ) : (
                /* ═══ QUIZ MODE — full-width layout ═══ */
                <>
                    {/* Passage Body (compact, above quiz) */}
                    <ContentProtection mode="full">
                        <div className="max-w-[800px] mx-auto px-4 py-6 md:py-8">
                            <div className="bg-gray-50 rounded-lg p-4 md:p-5 border border-gray-100">
                                {editorialParagraphs.map((para, idx) => (
                                    <div key={idx} className={idx > 0 ? "mt-3 pt-3 border-t border-gray-200/60" : ""}>
                                        {para.english && (
                                            <p className="text-[14px] md:text-[16px] text-gray-800 leading-[1.8] md:leading-[1.9]">
                                                {renderBold(para.english)}
                                            </p>
                                        )}
                                        {para.hindi && (
                                            <p className="text-[14px] md:text-[15px] text-gray-800 leading-[1.8] md:leading-[1.9]">
                                                {renderBold(para.hindi)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ContentProtection>

                    {/* ═══ QUIZ SECTION ═══ */}
                    <section
                        ref={quizSectionRef}
                        id="quiz-section"
                        className="flex flex-col bg-gray-50 border-t border-gray-200"
                        style={{ height: "calc(100vh - 96px)" }}
                    >
                        {/* ─── SUB HEADER (Sections) ─── */}
                        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center text-xs text-gray-600 font-semibold shrink-0 overflow-x-auto sticky top-12 z-20">
                            <div className="flex items-center space-x-2">
                                <span className="uppercase text-gray-400 mr-1 shrink-0">Sections</span>
                                {sections.map((sec) => {
                                    const isActive = currentQuestion?.sectionNumber === sec.number;
                                    return (
                                        <button
                                            key={sec.number}
                                            onClick={() => {
                                                const idx = allQuestions.findIndex((q) => q.sectionNumber === sec.number);
                                                if (idx >= 0) goToQuestion(idx);
                                            }}
                                            className={`shrink-0 px-2.5 py-1.5 rounded-sm text-[10px] font-bold transition ${isActive
                                                ? "bg-[#0b849e] text-white"
                                                : "hover:bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {SECTION_SHORT[sec.type] || sec.typeName}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ─── SPLIT LAYOUT ─── */}
                        <div className="flex flex-1 overflow-hidden">
                            {/* ─── LEFT COLUMN: Question Area (75%) ─── */}
                            <main className="w-full md:w-3/4 bg-white flex flex-col overflow-hidden">
                                {currentQuestion && (
                                    <div className="flex flex-col h-full min-h-0">
                                        {/* Question Header Info — sticky, includes stats + prev/next */}
                                        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-slate-100 bg-white">
                                            <div className="flex items-center text-sm flex-wrap gap-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-lg text-slate-800">
                                                        Q.{currentQIndex + 1}
                                                    </span>
                                                    {selectedAns && (
                                                        <span className={`text-[10px] md:text-xs px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${selectedAns === currentQuestion.correctAnswer
                                                            ? "bg-emerald-500 text-white"
                                                            : "bg-red-500 text-white"
                                                            }`}>
                                                            {selectedAns === currentQuestion.correctAnswer ? "Correct" : "Incorrect"}
                                                        </span>
                                                    )}
                                                    {!selectedAns && (
                                                        <span className="bg-gray-200 text-gray-500 text-[10px] md:text-xs px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                                            Skip
                                                        </span>
                                                    )}
                                                    <span className="text-slate-400 text-xs">|</span>
                                                    <span className="text-slate-500 font-medium text-xs">
                                                        Sec {currentQuestion.sectionNumber} | {currentQuestion.sectionName}
                                                    </span>
                                                </div>

                                                {/* Prev / Next — moved up from bottom */}
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
                                                            : "bg-[#0b849e] hover:bg-[#096b80] text-white hover:shadow-md hover:scale-105"
                                                            }`}
                                                    >
                                                        <span>Next</span>
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <span className="bg-[#0b849e] text-white font-semibold text-xs px-2.5 py-1 rounded-full">
                                                    Q {currentQIndex + 1}/{totalQuestions}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Question Body — scrollable if content overflows */}
                                        <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-5">
                                            {/* Question Stem */}
                                            <div className="text-gray-800 font-medium mb-4 leading-relaxed text-[14px] md:text-[15px] pt-3">
                                                {renderBold(currentQuestion.stem)}
                                            </div>

                                            {/* Options */}
                                            <div className="space-y-2 max-w-xl mb-3">
                                                {currentQuestion.options.map((opt, idx) => {
                                                    const letter = optionLetters[idx];
                                                    const isSelected = selectedAns === letter;
                                                    const isCorrect = letter === currentQuestion.correctAnswer;

                                                    let labelClass = "border-gray-200 hover:bg-gray-50";
                                                    let radioClass = "text-[#0b849e] focus:ring-[#0b849e]";

                                                    if (selectedAns) {
                                                        if (isCorrect) {
                                                            labelClass = "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200";
                                                            radioClass = "text-emerald-500";
                                                        } else if (isSelected) {
                                                            labelClass = "border-red-500 bg-red-50 ring-2 ring-red-200";
                                                            radioClass = "text-red-500";
                                                        } else {
                                                            labelClass = "border-gray-100 bg-gray-50 opacity-60";
                                                        }
                                                    }

                                                    return (
                                                        <label
                                                            key={letter}
                                                            onClick={() => handleOptionClick(letter)}
                                                            className={`flex items-center space-x-2 p-2 md:p-3 border rounded-lg cursor-pointer transition-colors ${labelClass} ${!selectedAns || reattemptMode ? "cursor-pointer" : "cursor-default"
                                                                }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="question-options"
                                                                checked={isSelected}
                                                                readOnly
                                                                className={`w-3.5 h-3.5 md:w-4 md:h-4 ${radioClass}`}
                                                            />
                                                            <span className={`text-[13px] md:text-[14px] font-medium ${selectedAns && isCorrect
                                                                ? "text-emerald-700 font-bold"
                                                                : selectedAns && isSelected && !isCorrect
                                                                    ? "text-red-700 font-bold"
                                                                    : "text-gray-700"
                                                                }`}>
                                                                <span className="font-bold mr-1.5">{letter})</span>
                                                                {opt}
                                                            </span>
                                                            {selectedAns && isCorrect && (
                                                                <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                            {selectedAns && isSelected && !isCorrect && (
                                                                <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                            </div>

                                            {/* Solution Panel (auto-shown after answer) */}
                                            {selectedAns && showSolution && (
                                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4 max-w-xl mb-2">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <h4 className="text-amber-800 font-bold text-xs md:text-sm flex items-center gap-1.5">
                                                            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                            </svg>
                                                            Explanation
                                                        </h4>
                                                        <span className={`text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full ${selectedAns === currentQuestion.correctAnswer
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                            }`}>
                                                            {selectedAns === currentQuestion.correctAnswer
                                                                ? "✓ Correct"
                                                                : `✗ Correct answer: ${currentQuestion.correctAnswer}`}
                                                        </span>
                                                    </div>
                                                    <p className="text-amber-900 text-xs md:text-sm leading-relaxed">
                                                        {currentQuestion.explanation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </main>

                            {/* ─── RIGHT COLUMN: Sidebar (25%) ─── */}
                            <aside className="hidden md:flex md:w-1/4 bg-[#f3f7f9] border-l border-gray-200 flex-col">
                                {/* User / Title Row with Filter — compact */}
                                <div className="flex justify-between items-center px-2 py-1.5 border-b border-gray-200 bg-white shrink-0 relative">
                                    <div className="flex items-center space-x-1.5">
                                        <div className="w-6 h-6 rounded-full bg-[#0b849e] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                                            DN
                                        </div>
                                        <span className="font-bold text-gray-700 text-[11px] leading-none">Daily News</span>
                                    </div>

                                    {/* Filter Button with Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                            className={`text-[10px] font-semibold flex items-center space-x-1 px-1.5 py-0.5 rounded transition ${getFilterColor(filterMode)}`}
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                            </svg>
                                            <span>{getFilterLabel(filterMode)}</span>
                                        </button>

                                        {showFilterDropdown && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
                                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-40 overflow-hidden">
                                                    {(["all", "correct", "incorrect", "skip"] as FilterMode[]).map((mode) => (
                                                        <button
                                                            key={mode}
                                                            onClick={() => {
                                                                setFilterMode(mode);
                                                                setShowFilterDropdown(false);
                                                                const firstIdx = allQuestions.findIndex((_, idx) => passesFilter(idx));
                                                                if (firstIdx >= 0) goToQuestion(firstIdx);
                                                            }}
                                                            className={`w-full text-left px-2.5 py-1.5 text-[10px] font-semibold flex items-center space-x-1.5 transition hover:bg-gray-50 ${filterMode === mode ? "bg-gray-50" : ""}`}
                                                        >
                                                            <span className={`w-2 h-2 rounded-full ${mode === "correct" ? "bg-emerald-500" : mode === "incorrect" ? "bg-red-500" : mode === "skip" ? "bg-gray-300" : "bg-blue-500"}`} />
                                                            <span>{getFilterLabel(mode)}</span>
                                                            <span className="ml-auto text-gray-400 text-[9px]">{mode === "all" ? totalQuestions : mode === "correct" ? correctCount : mode === "incorrect" ? incorrectCount : skipCount}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Score Card — Correct/Incorrect/Skip badges + Score */}
                                <div className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-200 bg-white shrink-0">
                                    {/* Badge Row */}
                                    <div className="grid grid-cols-3 gap-1 mb-1.5">
                                        <div className="bg-emerald-50 border border-emerald-200 rounded p-1 text-center">
                                            <div className="text-sm font-black text-emerald-600 leading-none">{correctCount}</div>
                                            <div className="text-[8px] font-bold text-emerald-500 uppercase leading-tight">Correct</div>
                                        </div>
                                        <div className="bg-red-50 border border-red-200 rounded p-1 text-center">
                                            <div className="text-sm font-black text-red-600 leading-none">{incorrectCount}</div>
                                            <div className="text-[8px] font-bold text-red-500 uppercase leading-tight">Wrong</div>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-200 rounded p-1 text-center">
                                            <div className="text-sm font-black text-gray-500 leading-none">{skipCount}</div>
                                            <div className="text-[8px] font-bold text-gray-400 uppercase leading-tight">Skip</div>
                                        </div>
                                    </div>
                                    {/* Total Score */}
                                    <div className="bg-[#0b849e]/5 border border-[#0b849e]/20 rounded p-1.5 text-center">
                                        <div className="text-[9px] font-bold text-[#0b849e] uppercase tracking-wider leading-tight">Total Score</div>
                                        <div className="text-lg font-black text-[#0b849e] leading-none mt-0.5">{totalScore.toFixed(2)}</div>
                                        <div className="text-[8px] text-[#0b849e]/70 leading-tight mt-0.5">{correctCount}/{totalQuestions} correct</div>
                                    </div>
                                    {/* Restart Quiz — always visible */}
                                    <button
                                        onClick={handleReattempt}
                                        className="mt-1.5 w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-[11px] tracking-wide px-3 py-2 rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <span className="text-sm">🔄</span>
                                        <span>RESTART</span>
                                    </button>
                                </div>

                                {/* Question Palette — compact horizontal rows */}
                                <div ref={paletteRef} className="flex-1 overflow-y-auto px-2 py-1.5 space-y-1">
                                    {filteredSections.map((sec) => {
                                        const sectionQs = questionsBySection[sec.number] || [];
                                        const secColors: Record<string, string> = {
                                            "error-detection": "bg-red-400",
                                            "sentence-improvement": "bg-blue-400",
                                            "para-jumbles": "bg-amber-400",
                                            "fill-blanks": "bg-purple-400",
                                            synonyms: "bg-emerald-400",
                                            antonyms: "bg-pink-400",
                                            collocation: "bg-cyan-400",
                                            "reading-comprehension": "bg-indigo-400",
                                        };
                                        const badgeColor = secColors[sec.type] || "bg-gray-400";
                                        return (
                                            <div key={sec.number} className="flex items-center gap-0.5">
                                                <span className={`w-4 h-4 rounded-full ${badgeColor} text-white flex items-center justify-center text-[7px] font-black shrink-0`}>
                                                    {sec.number}
                                                </span>
                                                <span className="text-[7px] font-bold text-gray-400 uppercase tracking-wider w-[34px] shrink-0 leading-tight text-left ml-0.5">
                                                    {SECTION_SHORT[sec.type]}
                                                </span>
                                                <div className="flex items-center gap-0.5">
                                                    {sectionQs.map((q) => {
                                                        const globalIdx = allQuestions.indexOf(q);
                                                        const isAnswered = !!answers[globalIdx];
                                                        const isCorrect = answers[globalIdx] === q.correctAnswer;
                                                        const isActive = globalIdx === currentQIndex;
                                                        const isFilteredOut = !passesFilter(globalIdx);

                                                        let circleClass = "border border-gray-300 bg-white text-gray-500";
                                                        if (isActive) {
                                                            circleClass = "bg-[#0b849e] text-white border-[#0b849e] ring-1 ring-cyan-200";
                                                        } else if (isAnswered) {
                                                            if (isCorrect) {
                                                                circleClass = "bg-emerald-500 text-white border-emerald-500";
                                                            } else {
                                                                circleClass = "bg-red-500 text-white border-red-500";
                                                            }
                                                        }

                                                        return (
                                                            <button
                                                                key={globalIdx}
                                                                data-qidx={globalIdx}
                                                                onClick={() => goToQuestion(globalIdx)}
                                                                className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[7px] font-bold cursor-pointer hover:opacity-80 transition-all ${circleClass} ${isFilteredOut ? "opacity-20" : ""}`}
                                                                title={`Q${globalIdx + 1} - ${getQuestionStatus(globalIdx)}`}
                                                            >
                                                                {globalIdx + 1}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {filteredSections.length === 0 && (
                                        <div className="text-center py-3 text-gray-400">
                                            <p className="text-[10px] font-semibold">No {filterMode} questions found</p>
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar Footer Buttons */}
                                <div className="p-2 bg-white border-t border-gray-200 grid grid-cols-2 gap-1.5 shrink-0">
                                    <button
                                        onClick={scrollToPassage}
                                        className="bg-sky-100 hover:bg-sky-200 text-sky-800 text-[10px] font-bold py-2.5 rounded text-center transition-colors"
                                    >
                                        ↑ Reading Passage
                                    </button>
                                    <Link
                                        href="/?tab=daily"
                                        className="bg-sky-100 hover:bg-sky-200 text-sky-800 text-[10px] font-bold py-2.5 rounded text-center transition-colors"
                                    >
                                        Home
                                    </Link>
                                </div>
                            </aside>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}