"use client";

import { useState } from "react";

interface ShareButtonsProps {
    url: string;
    title: string;
    description?: string;
    className?: string;
    size?: "sm" | "md";
    variant?: "horizontal" | "vertical" | "compact";
}

/**
 * Social share buttons for Indian audience.
 * WhatsApp, Telegram, Facebook, Instagram, X (Twitter), Copy Link
 */
export default function ShareButtons({
    url,
    title,
    description = "",
    className = "",
    size = "sm",
    variant = "horizontal",
}: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const [copiedInsta, setCopiedInsta] = useState(false);

    const encodedUrl = encodeURIComponent(url);
    const shareText = description ? `${title} — ${description}` : title;
    const shareTextEncoded = encodeURIComponent(shareText);

    const shareLinks = {
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n" + url)}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${shareTextEncoded}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${shareTextEncoded}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareTextEncoded}&hashtags=SSC,CGL,Vocabulary,English`,
        copylink: url,
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const textArea = document.createElement("textarea");
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleInstagramShare = async () => {
        // Instagram doesn't have a web share URL API.
        // Copy the link so user can paste it in the Instagram app.
        try {
            await navigator.clipboard.writeText(
                `${shareText}\n\n${url}\n\n---\nDownload the kajubadam app to learn more vocabulary!`
            );
            setCopiedInsta(true);
            setTimeout(() => setCopiedInsta(false), 2000);
        } catch {
            const textArea = document.createElement("textarea");
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopiedInsta(true);
            setTimeout(() => setCopiedInsta(false), 2000);
        }
    };

    const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    const buttonSize = size === "sm" ? "p-2" : "p-2.5";
    const textSize = size === "sm" ? "text-[10px]" : "text-xs";

    const layoutClass =
        variant === "vertical"
            ? "flex flex-col items-center gap-1"
            : variant === "compact"
                ? "flex items-center gap-1"
                : "flex items-center gap-2";

    return (
        <div className={`${layoutClass} ${className}`}>
            {/* WhatsApp — #1 in India */}
            <button
                onClick={() => window.open(shareLinks.whatsapp, "_blank", "noopener")}
                className={`${buttonSize} rounded-full bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md transition-all duration-200 active:scale-95`}
                title="WhatsApp par share karein"
                aria-label="Share on WhatsApp"
            >
                <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 2C6.577 2 2.126 6.451 2.126 11.905c0 2.089.571 4.082 1.602 5.826L2 22l4.468-1.673c1.696.987 3.642 1.578 5.563 1.578 5.454 0 9.905-4.451 9.905-9.905S17.485 2 12.031 2zm0 18.273c-1.782 0-3.531-.523-5.027-1.51l-.361-.214-2.75 1.03 1.089-2.676-.235-.39a8.65 8.65 0 01-1.361-4.609c0-4.748 3.864-8.612 8.612-8.612s8.612 3.864 8.612 8.612-3.864 8.612-8.612 8.612zm4.978-6.514c-.101-.05-.599-.295-1.012-.459-.413-.164-.767-.261-.892-.167-.125.094-.331.238-.507.386-.176.148-.242.215-.403.16-.161-.055-.656-.21-1.195-.66-.625-.522-1.058-1.177-1.187-1.383-.129-.206-.064-.335.067-.463.125-.123.267-.321.381-.49.114-.169.15-.282.201-.47.051-.188.026-.38-.013-.531-.039-.151-.472-1.14-.654-1.573-.19-.453-.388-.447-.592-.455-.167-.007-.361-.009-.559-.009s-.538.082-.826.395c-.288.313-1.131 1.105-1.131 2.694 0 1.589 1.175 3.132 1.338 3.349.163.217 2.328 3.541 5.637 3.541 3.309 0 3.309-2.082 3.309-2.34 0-.258-.124-.429-.28-.506z" />
                </svg>
            </button>
            {variant !== "compact" && <span className={`${textSize} text-green-600 font-medium`}>WhatsApp</span>}

            {/* Telegram */}
            <button
                onClick={() => window.open(shareLinks.telegram, "_blank", "noopener")}
                className={`${buttonSize} rounded-full bg-[#0088cc] hover:bg-[#0077b5] text-white shadow-sm hover:shadow-md transition-all duration-200 active:scale-95`}
                title="Telegram par share karein"
                aria-label="Share on Telegram"
            >
                <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12.056 0zM9.18 17.28l-.36-3.6 7.2-5.04c.36-.24.12-.48-.24-.36L7.68 13.2l-3.84-1.2c-.84-.24-.84-.84.12-1.2l14.4-5.52c.72-.24 1.32.24 1.08 1.2l-2.4 14.52c-.12.84-.72 1.08-1.32.72l-3.72-2.76-1.92 1.8c-.24.24-.48.24-.84.12l.48-3.36z" />
                </svg>
            </button>
            {variant !== "compact" && <span className={`${textSize} text-[#0088cc] font-medium`}>Telegram</span>}

            {/* Facebook */}
            <button
                onClick={() => window.open(shareLinks.facebook, "_blank", "noopener")}
                className={`${buttonSize} rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-sm hover:shadow-md transition-all duration-200 active:scale-95`}
                title="Facebook par share karein"
                aria-label="Share on Facebook"
            >
                <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            </button>
            {variant !== "compact" && <span className={`${textSize} text-[#1877F2] font-medium`}>Facebook</span>}

            {/* Instagram — copies link since no web share API */}
            <button
                onClick={handleInstagramShare}
                className={`${buttonSize} rounded-full bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] hover:opacity-90 text-white shadow-sm hover:shadow-md transition-all duration-200 active:scale-95`}
                title={copiedInsta ? "Link copy ho gaya! Instagram mein paste karein" : "Instagram ke liye copy karein"}
                aria-label="Share on Instagram"
            >
                <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
            </button>
            {variant !== "compact" && (
                <span className={`${textSize} ${copiedInsta ? "text-pink-600" : "text-pink-500"} font-medium`}>
                    {copiedInsta ? "Copied!" : "Instagram"}
                </span>
            )}

            {/* X (Twitter) */}
            <button
                onClick={() => window.open(shareLinks.twitter, "_blank", "noopener")}
                className={`${buttonSize} rounded-full bg-gray-800 hover:bg-gray-900 text-white shadow-sm hover:shadow-md transition-all duration-200 active:scale-95`}
                title="X (Twitter) par share karein"
                aria-label="Share on Twitter/X"
            >
                <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            </button>
            {variant !== "compact" && <span className={`${textSize} text-gray-700 font-medium`}>X</span>}

            {/* Copy Link */}
            <button
                onClick={handleCopyLink}
                className={`${buttonSize} rounded-full ${copied
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                } shadow-sm hover:shadow-md transition-all duration-200 active:scale-95`}
                title={copied ? "Link copy ho gaya!" : "Link copy karein"}
                aria-label="Copy link"
            >
                {copied ? (
                    <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-3.254a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                )}
            </button>
            {variant !== "compact" && (
                <span className={`${textSize} ${copied ? "text-emerald-600" : "text-gray-500"} font-medium`}>
                    {copied ? "Copied!" : "Copy"}
                </span>
            )}
        </div>
    );
}