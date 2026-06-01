"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { DailyNewsMeta } from "@/lib/daily-news";

interface Props {
    dailyNews: DailyNewsMeta[];
}

export default function DailyNewsPageClient({ dailyNews }: Props) {
    const [currentPage, setCurrentPage] = useState(1);
    const [readSlugs, setReadSlugs] = useState<string[]>([]);
    const PAGE_SIZE = 10;

    // Load read progress on mount
    useEffect(() => {
        const saved = localStorage.getItem("read_news");
        if (saved) {
            try {
                setReadSlugs(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse read news progress", e);
            }
        }
    }, []);

    const totalPages = Math.max(1, Math.ceil(dailyNews.length / PAGE_SIZE));

    const paginatedDaily = dailyNews.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const handlePrevPage = () => {
        setCurrentPage((p) => Math.max(1, p - 1));
    };

    const handleNextPage = () => {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
    };

    const toggleRead = (slug: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        let newList: string[];
        if (readSlugs.includes(slug)) {
            newList = readSlugs.filter((s) => s !== slug);
        } else {
            newList = [...readSlugs, slug];
        }
        setReadSlugs(newList);
        localStorage.setItem("read_news", JSON.stringify(newList));
    };

    return (
        <>
            {/* Title and stats */}
            <div className="mb-3 pl-2 flex flex-col md:flex-row md:items-end justify-between gap-2">
                <div>
                    <h2 className="text-[22px] font-extrabold text-gray-800 tracking-tight leading-none mb-1">
                        Daily News Vocab
                    </h2>
                    <p className="text-[#FF7722] text-[15px] font-semibold bg-[#FF7722]/5 inline-block px-3 py-1 rounded-md border border-[#FF7722]/10">
                        {readSlugs.length} / {dailyNews.length} Read
                    </p>
                </div>
                <div className="text-right text-[13px] text-gray-400 font-medium">
                    Showing {paginatedDaily.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, dailyNews.length)} of {dailyNews.length} articles
                </div>
            </div>

            {/* Articles Grid */}
            {paginatedDaily.length === 0 ? (
                <div className="bg-white rounded-xl p-16 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="text-[18px] font-bold text-gray-700 mb-1">No Articles Yet</h3>
                    <p className="text-gray-400 text-[14px]">Daily news articles will appear here once added.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-3">
                    {paginatedDaily.map((item) => {
                        const isRead = readSlugs.includes(item.slug);
                        return (
                            <div key={item.slug} className="relative">
                                <button
                                    onClick={(e) => toggleRead(item.slug, e)}
                                    className={`absolute top-2 right-2 z-10 p-1 rounded-full border transition-all active:scale-90 ${isRead
                                        ? "bg-green-500 border-green-500 text-white shadow-sm"
                                        : "bg-white border-gray-200 text-gray-300 hover:text-gray-500 hover:border-gray-300"
                                        }`}
                                    title={isRead ? "Mark as Unread" : "Mark as Read"}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>
                                <Link
                                    href={`/daily-news/${item.slug}`}
                                    className={`block bg-white border rounded-xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-lg hover:border-[#FF7722]/20 transition-all duration-300 min-h-[150px] group ${isRead ? "border-green-200 bg-green-50/10" : "border-gray-100"
                                        }`}
                                >
                                    <div>
                                        <h4 className="text-[11px] font-black text-[#FF7722] uppercase tracking-wider mb-1.5">
                                            {isRead && "✅ "}{item.date}
                                        </h4>
                                        <h3 className="text-[14px] font-bold text-gray-800 leading-snug group-hover:text-[#FF7722] transition-colors">
                                            {item.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 border border-gray-200/60 rounded px-2 py-0.5">
                                            {item.source}
                                        </span>
                                        <span className="text-[10px] font-black text-[#FF7722] bg-[#FF7722]/5 border border-[#FF7722]/10 rounded px-2 py-0.5">
                                            {item.questionCount} Qs
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Bottom Pagination */}
            {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-5 select-none">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 border rounded-lg font-bold text-[14px] flex items-center gap-1.5 transition-all active:scale-95 ${currentPage === 1
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white border-gray-200 text-[#FF7722] hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                            }`}
                    >
                        &larr; Previous
                    </button>
                    <span className="text-[14px] font-semibold text-gray-500">
                        Page <span className="text-[#FF7722] font-bold bg-[#FF7722]/5 px-2.5 py-1 rounded border border-[#FF7722]/10">{currentPage}</span> of <span className="font-bold text-gray-700">{totalPages}</span>
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 border rounded-lg font-bold text-[14px] flex items-center gap-1.5 transition-all active:scale-95 ${currentPage === totalPages
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white border-gray-200 text-[#FF7722] hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                            }`}
                    >
                        Next &rarr;
                    </button>
                </div>
            )}
        </>
    );
}