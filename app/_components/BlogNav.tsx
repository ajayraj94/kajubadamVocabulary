"use client";

import Link from "next/link";

const NAV_ITEMS = [
    { href: "/", label: "Home", icon: "🏠", highlight: true },
    { href: "/daily-news", label: "Daily News", icon: "📰", highlight: false },
    { href: "/blog", label: "Blog", icon: "📝", highlight: false },
    { href: "/error-detection/1", label: "Error Detection", icon: "🔍", highlight: false },
    { href: "/sentence-improvement/1", label: "Sentence Improve", icon: "✏️", highlight: false },
    { href: "/?tab=part1", label: "Vocab Part 1", icon: "📚", highlight: false, vocab: "part1" as const },
    { href: "/?tab=part2", label: "Vocab Part 2", icon: "📚", highlight: false, vocab: "part2" as const },
];

interface Props {
    /** When provided, Vocab Part 1/2 will scroll to content instead of navigating */
    onVocabClick?: (tab: "part1" | "part2") => void;
}

export default function BlogNav({ onVocabClick }: Props) {
    return (
        <nav aria-label="Main navigation" className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-[0_4px_12px_-6px_rgba(0,0,0,0.08)]">
            <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {NAV_ITEMS.map((item) =>
                    item.highlight ? (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex-none inline-flex items-center gap-2 bg-[#1c4a8a] text-white font-extrabold text-[13px] px-4 py-2 rounded-full hover:bg-blue-900 transition-all shrink-0 shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            {item.label}
                        </Link>
                    ) : item.vocab && onVocabClick ? (
                        <button
                            key={item.href}
                            onClick={() => onVocabClick(item.vocab)}
                            className="flex-none text-[13px] font-bold px-4 py-2 rounded-full transition-all shrink-0 whitespace-nowrap text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border-2 border-gray-100 hover:border-gray-300"
                        >
                            {item.icon} <span className="ml-0.5">{item.label}</span>
                        </button>
                    ) : (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex-none text-[13px] font-bold px-4 py-2 rounded-full transition-all shrink-0 whitespace-nowrap ${
                                item.label === "Blog"
                                    ? "text-[#1c4a8a] bg-[#1c4a8a]/10 border-2 border-[#1c4a8a]/30 font-extrabold shadow-sm"
                                    : "text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border-2 border-gray-100 hover:border-gray-300"
                            }`}
                        >
                            {item.icon} <span className="ml-0.5">{item.label}</span>
                        </Link>
                    )
                )}
            </div>
        </nav>
    );
}
