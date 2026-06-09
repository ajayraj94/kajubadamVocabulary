"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ── Types ──

interface Section {
    type: "intro" | "story" | "vocabulary" | "grammar" | "questions" | "faq" | "keep-learning" | "other";
    heading: string;
    content: string;
}

// ── Section Detection ──

function detectSectionType(heading: string): Section["type"] {
    const h = heading.toLowerCase();
    if (h.includes("learn through") || h.includes("bilingual") || heading.includes("💡")) return "story";
    if (h.includes("vocabulary") || h.includes("masterclass") || heading.includes("📝") && h.includes("core")) return "vocabulary";
    if (h.includes("grammar") || h.includes("spotlight") || heading.includes("🔍")) return "grammar";
    if (h.includes("practice set") || h.includes("questions") || heading.includes("📝") && h.includes("practice")) return "questions";
    if (h.includes("faq") || h.includes("frequently asked") || heading.includes("❓")) return "faq";
    if (h.includes("keep learning") || heading.includes("🎓")) return "keep-learning";
    return "other";
}

// ── Parse Sections ──

function parseSections(markdown: string): Section[] {
    const lines = markdown.split("\n");
    const sections: Section[] = [];

    let currentHeading = "";
    let currentContentLines: string[] = [];
    let inFrontmatter = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip frontmatter
        if (i === 0 && line.trim() === "---") {
            inFrontmatter = true;
            continue;
        }
        if (inFrontmatter && line.trim() === "---") {
            inFrontmatter = false;
            continue;
        }
        if (inFrontmatter) continue;

        // H1 heading — treat as intro heading
        if (line.startsWith("# ") && !line.startsWith("## ")) {
            if (!currentHeading && currentContentLines.length === 0) {
                currentContentLines.push(line);
            } else {
                currentContentLines.push(line);
            }
            continue;
        }

        // H2 heading → new section
        if (line.startsWith("## ")) {
            if (currentHeading || currentContentLines.length > 0) {
                sections.push({
                    type: detectSectionType(currentHeading),
                    heading: currentHeading,
                    content: currentContentLines.join("\n"),
                });
            }
            currentHeading = line.replace(/^##\s+/, "").trim();
            currentContentLines = [];
            continue;
        }

        currentContentLines.push(line);
    }

    // Last section
    sections.push({
        type: detectSectionType(currentHeading),
        heading: currentHeading,
        content: currentContentLines.join("\n"),
    });

    return sections;
}

// ── Parse Questions ──

interface ParsedQuestion {
    id: number;
    stem: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

function parseQuestions(content: string): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];
    const qRegex = /^####\s+Q(\d+)\.\s*(.*)$/gm;
    let match: RegExpExecArray | null;

    const qStarts: { index: number; id: number; stem: string }[] = [];
    while ((match = qRegex.exec(content)) !== null) {
        qStarts.push({
            index: match.index,
            id: parseInt(match[1]),
            stem: match[2].trim(),
        });
    }

    for (let i = 0; i < qStarts.length; i++) {
        const start = qStarts[i];
        const end = i + 1 < qStarts.length ? qStarts[i + 1].index : content.length;
        const block = content.substring(start.index, end);

        const options: string[] = [];
        const optRegex = /^\(([A-E])\)\s*(.*)$/gm;
        let optMatch: RegExpExecArray | null;
        while ((optMatch = optRegex.exec(block)) !== null) {
            options.push(optMatch[2].trim());
        }

        // Also try A) format
        if (options.length === 0) {
            const oldOptRegex = /^([A-E]\))\s*(.*)$/gm;
            while ((optMatch = oldOptRegex.exec(block)) !== null) {
                options.push(optMatch[2].trim());
            }
        }

        let correctAnswer = "";
        // Use RegExp constructor to avoid Tailwind misinterpreting Unicode dashes as CSS arbitrary value
        const ansRegex = new RegExp(
            "(?:\\*{0,2}Correct\\s*(?:Answer)?\\s*[-:" + "\u2013\u2014" + "]\\s*\\*{0,2}\\s*)\\(?([A-E])\\)?", "i"
        );
        const ansMatch = block.match(ansRegex);
        if (ansMatch) {
            correctAnswer = ansMatch[1];
        }

        // Extract explanation
        let explanation = "";
        const explMatch = block.match(
            /(?:\*{0,2}Detailed\s*Explanation\s*\*{0,2}:\s*)([\s\S]*?)(?=---|#### Q|$)/
        );
        if (explMatch) {
            explanation = explMatch[1].trim();
        } else {
            // Fallback: after answer marker
            const ansLineSearch = new RegExp(
                "(?:\\*{0,2}Correct\\s*(?:Answer)?\\s*[-:" + "\u2013\u2014" + "][^\\n]*)", "i"
            );
            const ansLineIdx = block.search(ansLineSearch);
            if (ansLineIdx >= 0) {
                const lineEnd = block.indexOf("\n", ansLineIdx);
                const afterAns = lineEnd >= 0 ? block.substring(lineEnd + 1) : "";
                explanation = afterAns
                    .replace(/^[\s\-—=*]+/, "")
                    .replace(/\n{3,}/g, "\n\n")
                    .trim();
                // Stop at next --- or Q heading
                const stopMatch = explanation.match(/^(---|#### Q)/m);
                if (stopMatch) {
                    explanation = explanation.substring(0, stopMatch.index).trim();
                }
            }
        }

        // Extract question text after **Question:**
        let questionText = "";
        const qtMatch = block.match(
            /\*\*Question:\*\*\s*([\s\S]*?)(?=\*\*Options:\*\*|---|#### Q|$)/
        );
        if (qtMatch) {
            questionText = qtMatch[1].replace(/^\n+|\n+$/g, "").trim();
        }

        questions.push({
            id: start.id,
            stem: start.stem || `Question ${start.id}`,
            questionText,
            options,
            correctAnswer,
            explanation,
        });
    }

    return questions;
}

// ── (parseFaqItems removed — FAQ renders raw markdown directly) ──

// ── Inline text renderer: handles **bold**, *italic*, [links](url) ──

function renderInline(text: string): React.ReactNode {
    const linkParts = text.split(/(\[[^\]]*\]\([^)]*\))/g);
    return linkParts.map((part, i) => {
        const linkMatch = part.match(/^\[([^\]]*)\]\(([^)]*)\)$/);
        if (linkMatch) {
            return (
                <a
                    key={i}
                    href={linkMatch[2]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1c4a8a] hover:text-blue-700 underline font-semibold"
                >
                    {linkMatch[1]}
                </a>
            );
        }
        // Handle **bold**
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bp, j) => {
            if (bp.startsWith("**") && bp.endsWith("**")) {
                return (
                    <strong key={`${i}-${j}`} className="font-bold text-gray-800">
                        {bp.slice(2, -2)}
                    </strong>
                );
            }
            // Handle *italic*
            const italicParts = bp.split(/(\*[^*]+\*)/g);
            return italicParts.map((ip, k) => {
                if (ip.startsWith("*") && ip.endsWith("*") && ip.length > 2) {
                    return (
                        <em key={`${i}-${j}-${k}`} className="italic text-gray-500">
                            {ip.slice(1, -1)}
                        </em>
                    );
                }
                return ip;
            });
        });
    });
}

// ── SECTION RENDERERS ──

function StorySection({ heading, content }: { heading: string; content: string }) {
    return (
        <div className="bg-[#faf8ff] border border-purple-100 rounded-xl p-6 md:p-8 mb-8">
            <SectionHeader icon="💡" title={heading} color="purple" />
            <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        p: ({ children }) => (
                            <p className="text-[14px] md:text-[15px] leading-[1.8] mb-4">
                                {children}
                            </p>
                        ),
                        strong: ({ children }) => (
                            <strong className="font-bold text-gray-800">{children}</strong>
                        ),
                        hr: () => (
                            <hr className="border-t border-purple-100 my-4" />
                        ),
                        em: ({ children }) => (
                            <em className="italic text-gray-600">{children}</em>
                        ),
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}

function VocabularySection({ heading, content }: { heading: string; content: string }) {
    return (
        <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50/40 border border-amber-200/60 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
            <SectionHeader icon="📚" title={heading} color="amber" />

            <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        table: ({ children }) => (
                            <div className="overflow-x-auto rounded-xl border border-amber-200/60 bg-white shadow-sm">
                                <table className="w-full text-[13px] md:text-[14px] border-collapse">
                                    {children}
                                </table>
                            </div>
                        ),
                        thead: ({ children }) => (
                            <thead className="bg-gradient-to-r from-amber-100 to-orange-100 border-b-2 border-amber-200">
                                {children}
                            </thead>
                        ),
                        th: ({ children }) => (
                            <th className="px-4 md:px-5 py-3 text-left text-[12px] font-black text-amber-900 uppercase tracking-wider border-r border-amber-200/50 last:border-r-0">
                                {children}
                            </th>
                        ),
                        td: ({ children }) => (
                            <td className="px-4 md:px-5 py-2.5 text-[13px] text-gray-700 border-b border-amber-100/50 border-r border-amber-100/30 last:border-r-0">
                                {children}
                            </td>
                        ),
                        tr: ({ children }) => (
                            <tr className="even:bg-amber-50/40 hover:bg-amber-50/80 transition-colors">
                                {children}
                            </tr>
                        ),
                        p: ({ children }) => (
                            <p className="text-[14px] text-gray-600 leading-relaxed mb-4">
                                {children}
                            </p>
                        ),
                        strong: ({ children }) => (
                            <strong className="font-bold text-gray-800">{children}</strong>
                        ),
                        ul: ({ children }) => (
                            <ul className="space-y-1.5 mb-4 pl-5">{children}</ul>
                        ),
                        li: ({ children }) => (
                            <li className="text-[14px] text-gray-600 leading-relaxed">{children}</li>
                        ),
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}

function GrammarSection({ heading, content }: { heading: string; content: string }) {
    // Split by grammar spotlights (### )
    const spotlights = content.split(/\n(?=### )/);

    return (
        <div className="bg-gradient-to-br from-blue-50 via-white to-sky-50/40 border border-blue-200/60 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
            <SectionHeader icon="🔍" title={heading} color="blue" />

            <div className="space-y-6">
                {spotlights.map((spotlight, idx) => {
                    const trimmed = spotlight.trim();
                    if (!trimmed) return null;

                    // Extract heading if present
                    const headMatch = trimmed.match(/^###\s+(.*)$/m);
                    const headText = headMatch ? headMatch[1].trim() : "";
                    const body = headMatch
                        ? trimmed.replace(/^###\s+.*$/m, "").trim()
                        : trimmed;

                    return (
                        <div
                            key={idx}
                            className="bg-white border border-blue-100/80 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            {headText && (
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
                                    <h4 className="text-[15px] md:text-[16px] font-bold text-blue-800">
                                        {renderInline(headText)}
                                    </h4>
                                </div>
                            )}

                            {/* Render grammar rules with ✅/❌ highlighting */}
                            <div className="space-y-3">
                                {body.split("\n").map((line, li) => {
                                    const t = line.trim();
                                    if (!t) return null;

                                    // Correct examples
                                    if (t.startsWith("✅") || t.startsWith("✔") || t.startsWith("✓")) {
                                        return (
                                            <div
                                                key={li}
                                                className="flex items-start gap-2 bg-emerald-50 border border-emerald-200/60 rounded-lg px-4 py-2.5"
                                            >
                                                <span className="text-emerald-600 text-sm mt-0.5 shrink-0">✅</span>
                                                <span className="text-[14px] text-emerald-800 leading-relaxed">
                                                    {renderInline(t.replace(/^[✅✔✓]\s*/, ""))}
                                                </span>
                                            </div>
                                        );
                                    }

                                    // Incorrect examples
                                    if (t.startsWith("❌") || t.startsWith("✗")) {
                                        return (
                                            <div
                                                key={li}
                                                className="flex items-start gap-2 bg-rose-50 border border-rose-200/60 rounded-lg px-4 py-2.5"
                                            >
                                                <span className="text-rose-600 text-sm mt-0.5 shrink-0">❌</span>
                                                <span className="text-[14px] text-rose-700 leading-relaxed">
                                                    {renderInline(t.replace(/^[❌✗]\s*/, ""))}
                                                </span>
                                            </div>
                                        );
                                    }

                                    // Bold labels like **Incorrect:** or **Correct:**
                                    const labelMatch = t.match(/^\*\*(.*?):\*\*\s*(.*)$/);
                                    if (labelMatch) {
                                        const label = labelMatch[1].toLowerCase();
                                        if (label.includes("incorrect") || label.includes("wrong")) {
                                            return (
                                                <div key={li} className="flex items-start gap-2 bg-rose-50 border border-rose-200/60 rounded-lg px-4 py-2.5">
                                                    <span className="text-rose-600 text-sm mt-0.5 shrink-0">❌</span>
                                                    <span className="text-[14px] text-rose-700 leading-relaxed">
                                                        <strong className="text-rose-800">{labelMatch[1]}:</strong>{" "}
                                                        {renderInline(labelMatch[2])}
                                                    </span>
                                                </div>
                                            );
                                        }
                                        if (label.includes("correct") || label.includes("right")) {
                                            return (
                                                <div key={li} className="flex items-start gap-2 bg-emerald-50 border border-emerald-200/60 rounded-lg px-4 py-2.5">
                                                    <span className="text-emerald-600 text-sm mt-0.5 shrink-0">✅</span>
                                                    <span className="text-[14px] text-emerald-800 leading-relaxed">
                                                        <strong className="text-emerald-800">{labelMatch[1]}:</strong>{" "}
                                                        {renderInline(labelMatch[2])}
                                                    </span>
                                                </div>
                                            );
                                        }
                                    }

                                    // *Example:* lines
                                    if (t.startsWith("*") && t.includes("**")) {
                                        return (
                                            <p key={li} className="text-[14px] text-gray-600 italic leading-relaxed pl-4 border-l-2 border-blue-200">
                                                {renderInline(t)}
                                            </p>
                                        );
                                    }

                                    // Regular lines
                                    return (
                                        <p key={li} className="text-[14px] text-gray-600 leading-relaxed">
                                            {renderInline(t)}
                                        </p>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function QuestionsSection({ heading, content }: { heading: string; content: string }) {
    const questions = parseQuestions(content);
    const [expandedQ, setExpandedQ] = useState<number | null>(null);

    if (questions.length === 0) {
        return (
            <div className="bg-gradient-to-br from-emerald-50 via-white to-green-50/40 border border-emerald-200/60 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
                <SectionHeader icon="📝" title={heading} color="emerald" />
                <div className="prose prose-sm max-w-none text-gray-600">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
            </div>
        );
    }

    const OPTION_LETTERS = ["A", "B", "C", "D", "E"];

    return (
        <div className="bg-gradient-to-br from-emerald-50 via-white to-green-50/40 border border-emerald-200/60 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
            <SectionHeader icon="📝" title={heading} color="emerald" />

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-3 mb-6 text-[12px]">
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full">
                    📝 {questions.length} questions
                </span>
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">
                    ⏱️ Exam-style
                </span>
            </div>

            {/* Questions */}
            <div className="space-y-5">
                {questions.map((q) => (
                    <div
                        key={q.id}
                        className="bg-white border border-emerald-100/80 rounded-xl overflow-hidden transition-all hover:shadow-md"
                    >
                        {/* Question header */}
                        <div className="flex items-stretch">
                            <div className="w-1.5 bg-gradient-to-b from-emerald-400 to-green-500 shrink-0" />
                            <div className="flex-1 px-4 md:px-5 py-3 md:py-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-200">
                                        <span className="text-[15px] md:text-[16px] font-black">
                                            {q.id}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                                            Question {q.id}
                                        </span>
                                        <p className="text-[14px] md:text-[15px] font-semibold text-gray-800 mt-0.5 leading-relaxed">
                                            {renderInline(q.stem)}
                                        </p>
                                        {q.questionText && (
                                            <div className="mt-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg px-3.5 py-2.5">
                                                <p className="text-[14px] md:text-[15px] text-gray-700 leading-relaxed">
                                                    {renderInline(q.questionText)}
                                                </p>
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* Options */}
                            <div className="mt-3 space-y-1.5">
                                    {q.options.map((opt, idx) => {
                                        const letter = OPTION_LETTERS[idx];
                                        const isCorrect = letter === q.correctAnswer;
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-[14px] leading-relaxed ${
                                                    isCorrect
                                                        ? "bg-emerald-50/80 border-emerald-200/80"
                                                        : "bg-gray-50/50 border-gray-100/80"
                                                }`}
                                            >
                                                <span
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 shadow-sm ${
                                                        isCorrect
                                                            ? "bg-emerald-500 text-white shadow-emerald-200"
                                                            : "bg-gray-200 text-gray-500"
                                                    }`}
                                                >
                                                    {letter}
                                                </span>
                                                <span
                                                    className={`${
                                                        isCorrect ? "font-semibold text-emerald-800" : "text-gray-700"
                                                    }`}
                                                >
                                                    {renderInline(opt)}
                                                </span>
                                                {isCorrect && (
                                                    <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                                        ✓ Correct
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Show explanation button */}
                                {q.explanation && (
                                    <div className="mt-3">
                                        <button
                                            onClick={() =>
                                                setExpandedQ(expandedQ === q.id ? null : q.id)
                                            }
                                            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                        >
                                            <svg
                                                className={`w-3.5 h-3.5 transition-transform ${
                                                    expandedQ === q.id ? "rotate-90" : ""
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2.5"
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                            {expandedQ === q.id ? "Hide Explanation" : "Show Explanation"}
                                        </button>

                                        {expandedQ === q.id && (
                                            <div className="mt-3 bg-gradient-to-br from-amber-50 to-white border border-amber-200/60 rounded-xl p-4 md:p-5 shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider bg-amber-100/70 px-2 py-0.5 rounded-full">
                                                        💡 Explanation
                                                    </span>
                                                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                        ✓ Answer: {q.correctAnswer}
                                                    </span>
                                                </div>
                                                <div className="prose prose-sm max-w-none text-amber-900">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            p: ({ children }) => (
                                                                <p className="text-[13px] md:text-[14px] leading-relaxed mb-2 last:mb-0">
                                                                    {children}
                                                                </p>
                                                            ),
                                                            strong: ({ children }) => (
                                                                <strong className="font-bold text-gray-800">{children}</strong>
                                                            ),
                                                            em: ({ children }) => (
                                                                <em className="italic text-gray-500">{children}</em>
                                                            ),
                                                            ul: ({ children }) => (
                                                                <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>
                                                            ),
                                                            li: ({ children }) => (
                                                                <li className="text-[13px] md:text-[14px] leading-relaxed">{children}</li>
                                                            ),
                                                        }}
                                                    >
                                                        {q.explanation}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FaqSection({ heading, content }: { heading: string; content: string }) {
    // Strip trailing separator line so it doesn't render as <hr>
    const cleanContent = content.replace(/\n---\s*$/, "");

    return (
        <div className="bg-[#fafafa] border border-gray-200/70 rounded-xl p-6 md:p-8 mb-8">
            <SectionHeader icon="❓" title={heading} color="indigo" />

            <div className="space-y-6">
                <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h3: ({ children }) => (
                                <div className="bg-indigo-50/80 border-l-4 border-indigo-500 rounded-r-xl px-4 py-3 mt-6 mb-3 first:mt-0">
                                    <h3 className="text-[16px] md:text-[17px] font-extrabold text-gray-900 leading-relaxed">
                                        {children}
                                    </h3>
                                </div>
                            ),
                            p: ({ children }) => (
                                <p className="text-[14px] text-gray-600 leading-[1.75] mb-3 last:mb-0">
                                    {children}
                                </p>
                            ),
                            strong: ({ children }) => {
                                const text = Array.isArray(children) ? children.join('') : String(children || '');
                                const isKeyTerm = text.includes(':') && text.length < 60;
                                if (isKeyTerm) {
                                    return (
                                        <strong className="font-bold text-indigo-700 bg-indigo-50/60 px-1.5 py-0.5 rounded">
                                            {children}
                                        </strong>
                                    );
                                }
                                return (
                                    <strong className="font-bold text-gray-800">{children}</strong>
                                );
                            },
                            em: ({ children }) => (
                                <em className="italic text-gray-500">{children}</em>
                            ),
                            ol: ({ children }) => (
                                <ol className="list-decimal pl-5 mb-3 space-y-2 last:mb-0">{children}</ol>
                            ),
                            ul: ({ children }) => (
                                <ul className="list-disc pl-5 mb-3 space-y-2 last:mb-0">{children}</ul>
                            ),
                            li: ({ children }) => (
                                <li className="text-[14px] text-gray-600 leading-relaxed marker:text-indigo-400">{children}</li>
                            ),
                            a: ({ href, children }) => (
                                <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-semibold hover:text-indigo-800 transition-colors">
                                    {children}
                                </a>
                            ),
                            hr: () => null,
                        }}
                    >
                        {cleanContent}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

function KeepLearningSection({ heading, content }: { heading: string; content: string }) {
    return (
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 border border-emerald-200/60 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
            <SectionHeader icon="🎓" title={heading} color="emerald" />
            <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        p: ({ children }) => (
                            <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed mb-3">
                                {children}
                            </p>
                        ),
                        strong: ({ children }) => (
                            <strong className="font-bold text-gray-800">{children}</strong>
                        ),
                        a: ({ href, children }) => (
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#1c4a8a] font-semibold hover:text-blue-700 underline"
                            >
                                {children}
                            </a>
                        ),
                        ul: ({ children }) => (
                            <ul className="space-y-1 mb-3 pl-5">{children}</ul>
                        ),
                        li: ({ children }) => (
                            <li className="text-[14px] text-gray-600 leading-relaxed">{children}</li>
                        ),
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}

function OtherSection({ content }: { content: string }) {
    if (!content.trim()) return null;

    return (
        <div className="mb-8">
            <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        h1: ({ children }) => (
                            <h1 className="text-[24px] md:text-[30px] font-black text-gray-900 tracking-tight leading-tight mt-0 mb-4">
                                {children}
                            </h1>
                        ),
                        h2: ({ children }) => (
                            <h2 className="text-[18px] md:text-[22px] font-extrabold text-gray-800 tracking-tight mt-8 mb-3 pb-1 border-b border-gray-100">
                                {children}
                            </h2>
                        ),
                        h3: ({ children }) => (
                            <h3 className="text-[16px] md:text-[18px] font-bold text-gray-700 mt-6 mb-2">
                                {children}
                            </h3>
                        ),
                        h4: ({ children }) => (
                            <h4 className="text-[15px] font-extrabold text-gray-700 mt-5 mb-2">
                                {children}
                            </h4>
                        ),
                        p: ({ children }) => (
                            <p className="text-[14px] md:text-[15px] text-gray-600 leading-[1.8] mb-4">
                                {children}
                            </p>
                        ),
                        ul: ({ children }) => (
                            <ul className="space-y-1.5 mb-4 pl-5 list-disc">{children}</ul>
                        ),
                        ol: ({ children }) => (
                            <ol className="space-y-1.5 mb-4 pl-5 list-decimal">{children}</ol>
                        ),
                        li: ({ children }) => (
                            <li className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed">
                                {children}
                            </li>
                        ),
                        strong: ({ children }) => (
                            <strong className="font-bold text-gray-800">{children}</strong>
                        ),
                        a: ({ href, children }) => {
                            const isInternal = href && (href.startsWith("/") || href.startsWith(process.env.NEXT_PUBLIC_SITE_URL || "https://kajubadamvocabulary.in"));
                            return (
                                <a
                                    href={href}
                                    target={isInternal ? undefined : "_blank"}
                                    rel={isInternal ? undefined : "noopener noreferrer"}
                                    className="text-[#1c4a8a] font-semibold hover:text-blue-700 underline decoration-[#1c4a8a]/30 hover:decoration-[#1c4a8a]/60 transition-all"
                                >
                                    {children}
                                </a>
                            );
                        },
                        blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-[#1c4a8a]/20 bg-[#1c4a8a]/5 rounded-r-xl px-4 py-3 my-4 text-[14px] text-gray-600 italic">
                                {children}
                            </blockquote>
                        ),
                        code: ({ children }) => (
                            <code className="bg-gray-100 text-[13px] font-mono px-1.5 py-0.5 rounded text-gray-800">
                                {children}
                            </code>
                        ),
                        pre: ({ children }) => (
                            <pre className="bg-[#f8fafc] border border-gray-100 rounded-xl p-4 md:p-5 overflow-x-auto text-[13px] leading-relaxed mb-4">
                                {children}
                            </pre>
                        ),
                        em: ({ children }) => (
                            <em className="italic text-gray-500">{children}</em>
                        ),
                        hr: () => <hr className="border-gray-100 my-6 opacity-40" />,
                        table: ({ children }) => (
                            <div className="overflow-x-auto mb-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                                <table className="w-full text-[13px] md:text-[14px] border-collapse">
                                    {children}
                                </table>
                            </div>
                        ),
                        th: ({ children }) => (
                            <th className="bg-gray-50 border border-gray-200 px-3 py-2 text-left font-bold text-gray-700 text-[12px]">
                                {children}
                            </th>
                        ),
                        td: ({ children }) => (
                            <td className="border border-gray-200 px-3 py-2 text-gray-600">
                                {children}
                            </td>
                        ),
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}

// ── Section Header ──

function SectionHeader({
    icon,
    title,
    color,
}: {
    icon: string;
    title: string;
    color: "purple" | "amber" | "blue" | "emerald" | "indigo";
}) {
    const colorMap = {
        purple: {
            badge: "bg-purple-100 text-purple-700 border-purple-200/60",
            text: "text-purple-900",
        },
        amber: {
            badge: "bg-amber-100 text-amber-700 border-amber-200/60",
            text: "text-amber-900",
        },
        blue: {
            badge: "bg-blue-100 text-blue-700 border-blue-200/60",
            text: "text-blue-900",
        },
        emerald: {
            badge: "bg-emerald-100 text-emerald-700 border-emerald-200/60",
            text: "text-emerald-900",
        },
        indigo: {
            badge: "bg-indigo-100 text-indigo-700 border-indigo-200/60",
            text: "text-indigo-900",
        },
    };

    const c = colorMap[color];

    return (
        <div className="flex items-center gap-3 mb-5">
            <span
                className={`inline-flex items-center gap-2 ${c.badge} text-[15px] md:text-[16px] font-black px-4 py-2 rounded-full border tracking-wide`}
            >
                <span className="text-[20px] md:text-[22px]">{icon}</span>
                <span className={c.text}>{title}</span>
            </span>
        </div>
    );
}

// ── TOC Sidebar ──

function TocSidebar({
    sections,
    onSectionClick,
}: {
    sections: { heading: string; type: Section["type"]; originalIndex: number }[];
    onSectionClick: (originalIdx: number) => void;
}) {
    const typeIcon: Record<string, string> = {
        story: "💡",
        vocabulary: "📚",
        grammar: "🔍",
        questions: "📝",
        faq: "❓",
        "keep-learning": "🎓",
        other: "📄",
        intro: "📖",
    };

    return (
        <nav className="space-y-1">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">
                On this page
            </div>
            {sections.map((s) => (
                <button
                    key={s.originalIndex}
                    onClick={() => onSectionClick(s.originalIndex)}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                    <span className="text-[14px]">{typeIcon[s.type] || "📄"}</span>
                    <span className="truncate">{s.heading}</span>
                </button>
            ))}
        </nav>
    );
}

// ── MAIN EXPORT ──

export default function BlogPostRenderer({ content }: { content: string }) {
    const sections = parseSections(content);
    const toc = sections
        .map((s, i) => ({ ...s, originalIndex: i }))
        .filter((s) => s.heading && s.type !== "intro" && s.type !== "keep-learning");

    // Scroll to a section by generating a section id from heading
    const scrollToSection = (originalIdx: number) => {
        const s = sections[originalIdx];
        if (!s || !s.heading) return;
        const id = s.heading
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };



    return (
        <div className="relative">
            {/* Mobile TOC */}
            <details className="md:hidden mb-6 bg-white border border-gray-200 rounded-xl overflow-hidden">
                <summary className="px-4 py-3 text-[12px] font-bold text-gray-600 cursor-pointer hover:bg-gray-50 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    On this page
                </summary>
                <div className="px-4 pb-3 border-t border-gray-100 pt-2">
                    <TocSidebar
                        sections={toc}
                        onSectionClick={scrollToSection}
                    />
                </div>
            </details>

            {/* Desktop layout */}
            <div className="flex gap-8">
                {/* Desktop TOC sidebar */}
                <div className="hidden md:block w-56 shrink-0">
                    <div className="sticky top-24">
                        <TocSidebar
                            sections={toc}
                            onSectionClick={scrollToSection}
                        />
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {sections.map((section, idx) => {
                        const sectionId = section.heading
                            ? section.heading
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-|-$/g, "")
                            : undefined;

                        const sectionProps = sectionId ? { id: sectionId } : {};

                        switch (section.type) {
                            case "story":
                                return (
                                    <div key={idx} {...sectionProps}>
                                        <StorySection
                                            heading={section.heading}
                                            content={section.content}
                                        />
                                    </div>
                                );
                            case "vocabulary":
                                return (
                                    <div key={idx} {...sectionProps}>
                                        <VocabularySection
                                            heading={section.heading}
                                            content={section.content}
                                        />
                                    </div>
                                );
                            case "grammar":
                                return (
                                    <div key={idx} {...sectionProps}>
                                        <GrammarSection
                                            heading={section.heading}
                                            content={section.content}
                                        />
                                    </div>
                                );
                            case "questions":
                                return (
                                    <div key={idx} {...sectionProps}>
                                        <QuestionsSection
                                            heading={section.heading}
                                            content={section.content}
                                        />
                                    </div>
                                );
                            case "faq":
                                return (
                                    <div key={idx} {...sectionProps}>
                                        <FaqSection
                                            heading={section.heading}
                                            content={section.content}
                                        />
                                    </div>
                                );
                            case "keep-learning":
                                return (
                                    <div key={idx} {...sectionProps}>
                                        <KeepLearningSection
                                            heading={section.heading}
                                            content={section.content}
                                        />
                                    </div>
                                );
                            default:
                                return (
                                    <div key={idx} {...sectionProps}>
                                        <OtherSection content={section.content} />
                                    </div>
                                );
                        }
                    })}
                </div>
            </div>
        </div>
    );
}
