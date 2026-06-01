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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-4">
                    {paginatedDaily.map((item) => {
                        const isRead = readSlugs.includes(item.slug);
                        return (
                            <div key={item.slug}
                              className={`group relative rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between min-h-[170px] ${
                                isRead
                                  ? "bg-gradient-to-br from-emerald-50/40 to-white ring-1 ring-emerald-200/50"
                                  : "bg-white shadow-[0_2px_12px_-3px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_-8px_rgba(217,119,6,0.15)] hover:-translate-y-0.5"
                              }`}>
                                {/* Top row: date + Qs + read toggle */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-[13px] font-bold text-[#d97706] tracking-tight">
                                            {item.date}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                          isRead ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-700"
                                        }`}>
                                            {item.questionCount} Qs
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => toggleRead(item.slug, e)}
                                        type="button"
                                        className={`p-1 rounded-full transition-all duration-200 active:scale-90 ${
                                          isRead
                                            ? "text-emerald-500 hover:text-emerald-600"
                                            : "text-gray-300 hover:text-amber-500 md:opacity-0 md:group-hover:opacity-100"
                                        }`}
                                        title={isRead ? "Mark as Unread" : "Mark as Read"}
                                    >
                                        <svg className="w-4 h-4" fill={isRead ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Title */}
                                <div className="flex-1">
                                    <h3 className="text-[15px] font-bold text-gray-800 leading-snug group-hover:text-[#d97706] transition-colors duration-200">
                                        {item.title.length > 80 ? item.title.slice(0, 80) + "..." : item.title}
                                    </h3>
                                    <p className="text-[11px] text-gray-400 mt-1.5">{item.source} &middot; Daily Editorial</p>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-2 mt-4">
                                    <Link
                                      href={`/daily-news/${item.slug}`}
                                      className="flex-1 text-center bg-[#d97706] hover:bg-[#b45309] text-white text-[12px] font-bold py-2 rounded-xl transition-all duration-200 active:scale-[0.97]"
                                    >
                                        📖 Read
                                    </Link>
                                    <Link
                                      href={`/daily-news/${item.slug}#quiz`}
                                      className="flex-1 text-center bg-white hover:bg-amber-50 text-[#d97706] border border-[#d97706] text-[12px] font-bold py-2 rounded-xl transition-all duration-200 active:scale-[0.97]"
                                    >
                                        📝 Quiz
                                    </Link>
                                </div>
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