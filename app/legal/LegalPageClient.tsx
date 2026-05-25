"use client";

import Link from "next/link";

interface Props {
    title: string;
    children: React.ReactNode;
}

export default function LegalPageClient({ title, children }: Props) {
    return (
        <div className="min-h-screen bg-gray-50/40 font-sans">
            {/* Minimal top bar */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link
                        href="/"
                        className="text-sm font-semibold text-[#1c4a8a] hover:text-[#1c4a8a]/70 transition-colors flex items-center gap-1"
                    >
                        ← Home
                    </Link>
                    <span className="text-gray-300">|</span>
                    <h1 className="text-lg font-bold text-gray-800">{title}</h1>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
                <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10">
                    <div className="prose prose-gray max-w-none prose-headings:text-[#1c4a8a] prose-a:text-[#1c4a8a] prose-strong:text-gray-800">
                        {children}
                    </div>
                </article>
            </main>

            {/* Subtle footer */}
            <footer className="border-t border-gray-100 bg-white mt-auto">
                <div className="max-w-3xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                    <span>© {new Date().getFullYear()} kajubadam Vocabulary</span>
                    <div className="flex gap-4">
                        <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
                        <Link href="/about" className="hover:text-gray-600 transition-colors">About</Link>
                        <Link href="/contact" className="hover:text-gray-600 transition-colors">Contact</Link>
                        <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
                        <Link href="/disclaimer" className="hover:text-gray-600 transition-colors">Disclaimer</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}