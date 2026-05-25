import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "404 — Page Not Found | kajubadam Vocabulary",
    description: "The page you are looking for does not exist.",
    robots: { index: false, follow: false },
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50/40 flex items-center justify-center font-sans">
            <div className="text-center px-4">
                <div className="text-8xl font-black text-[#1c4a8a]/20 mb-4">404</div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                    Page Not Found
                </h1>
                <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back to learning vocabulary!
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-[#1c4a8a] text-white font-bold px-6 py-3 rounded-lg hover:bg-[#1c4a8a]/90 transition-colors shadow-md"
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}