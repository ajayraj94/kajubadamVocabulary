import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";

const SITE_URL = process.env.SITE_URL || "https://kajubadamvocabulary.in";

// ── Self-hosted Google Fonts via next/font (zero external requests, swap display for LCP) ──
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "kajubadam Vocabulary — Master English-Hindi Vocabulary through Stories",
    template: "%s | kajubadam Vocabulary",
  },
  description:
    "Learn prepositions, homonyms, phrasal verbs, idioms, proverbs, and advanced English vocabulary with Hindi translations using immersive stories. 11,762+ vocab items across 116+ stories and daily news. Free daily news vocabulary + 2 free stories for SSC CGL, Banking, UPSC.",
  keywords: [
    "English vocabulary",
    "Hindi vocabulary",
    "learn English",
    "learn Hindi",
    "homonyms",
    "idioms",
    "phrasal verbs",
    "prepositions",
    "proverbs",
    "bilingual learning",
    "vocabulary builder",
    "English to Hindi",
    "competitive exam vocabulary",
    "SSC vocabulary",
    "SSC CGL vocabulary",
    "Bank PO vocabulary",
    "UPSC vocabulary",
    "free vocabulary course",
    "daily news vocabulary",
    "error detection SSC",
    "sentence improvement SSC",
    "English vocabulary with Hindi meaning",
    "vocabulary story learning",
  ],
  authors: [{ name: "kajubadam Vocabulary" }],
  creator: "kajubadam Vocabulary",
  publisher: "kajubadam Vocabulary",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "kajubadam Vocabulary — Master English-Hindi Vocabulary through Stories",
    description:
      "Learn 11,762+ exam-oriented English vocabulary words with Hindi translations through immersive stories. Free daily news vocabulary + 2 free stories. SSC CGL, Banking, UPSC ready.",
    url: SITE_URL,
    siteName: "kajubadam Vocabulary",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/web-app-manifest-512x512.png`,
        width: 512,
        height: 512,
        alt: "kajubadam Vocabulary — Master English-Hindi Vocabulary through Stories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "kajubadam Vocabulary — 11,762+ Free Exam Vocabulary Words",
    description:
      "Learn English vocabulary with Hindi translations through immersive stories. Free daily news vocab + 2 free stories for SSC CGL, Banking, UPSC.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en": SITE_URL,
      "hi": SITE_URL,
    },
  },
  // icon.svg, favicon.ico and apple-icon.png auto-discovered from app/
  // https://nextjs.org/docs/app/api-reference/file-conventions/metadata-files
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <Script
          id="gtm-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KFLQ24ZX');`,
          }}
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="kajubadam" />

        {/* ── Preconnect hints: eliminate connection delay for critical origins ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://*.supabase.co" />
        <link rel="preconnect" href="https://*.razorpay.com" />
        <link rel="dns-prefetch" href="https://*.supabase.co" />
        <link rel="dns-prefetch" href="https://*.razorpay.com" />
      </head>
      <body className={`${inter.variable} ${merriweather.variable} min-h-full flex flex-col font-sans`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KFLQ24ZX"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* ── JSON-LD: Organization + WebSite + Course schemas for Google rich results ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "kajubadam Vocabulary",
                  url: SITE_URL,
                  logo: `${SITE_URL}/logo.png`,
                  description: "India's most advanced bilingual (English-Hindi) vocabulary learning platform for SSC CGL, Banking, and UPSC exam aspirants. 11,762+ exam-oriented words through immersive stories.",
                  sameAs: [
                    "https://twitter.com/kajubadamvocab",
                    "https://t.me/kajubadamvocabulary",
                  ],
                },
                {
                  "@type": "WebSite",
                  name: "kajubadam Vocabulary",
                  url: SITE_URL,
                  description: "Learn English vocabulary with Hindi translations through immersive bilingual stories. 11,762+ vocab items for SSC CGL, Banking, UPSC.",
                  inLanguage: ["en", "hi"],
                  potentialAction: {
                    "@type": "SearchAction",
                    target: `${SITE_URL}/?tab={search_term_string}`,
                    queryInput: "required name=search_term_string",
                  },
                },
                {
                  "@type": "Course",
                  name: "kajubadam Vocabulary — Part 1: Core Vocabulary Essentials",
                  description: "Master 5,062+ exam-oriented English vocabulary words including 627 Homonyms, 2,300 Idioms, 1,028 Phrasal Verbs, 588 Prepositions, and 219 Proverbs through 48 bilingual story sets with Hindi translations and interactive quizzes.",
                  provider: {
                    "@type": "Organization",
                    name: "kajubadam Vocabulary",
                    url: SITE_URL,
                  },
                  educationalLevel: "Intermediate",
                  inLanguage: ["en", "hi"],
                  offers: {
                    "@type": "Offer",
                    price: "299",
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                    description: "Lifetime access — one-time payment",
                  },
                  coursePrerequisites: "Basic English knowledge",
                  hasCourseInstance: {
                    "@type": "CourseInstance",
                    courseMode: "online",
                    instructor: {
                      "@type": "Organization",
                      name: "kajubadam Vocabulary",
                    },
                  },
                },
                {
                  "@type": "Course",
                  name: "kajubadam Vocabulary — Part 2: Story-Based Advanced Vocabulary",
                  description: "Master 6,700+ advanced exam-frequency vocabulary words through 67 bilingual story batches with Hindi translations, contextual usage, and interactive fill-in-the-blank quizzes. SSC CGL, Banking, UPSC oriented.",
                  provider: {
                    "@type": "Organization",
                    name: "kajubadam Vocabulary",
                    url: SITE_URL,
                  },
                  educationalLevel: "Advanced",
                  inLanguage: ["en", "hi"],
                  offers: {
                    "@type": "Offer",
                    price: "399",
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                    description: "Lifetime access — one-time payment",
                  },
                  coursePrerequisites: "Part 1 or intermediate English vocabulary",
                  hasCourseInstance: {
                    "@type": "CourseInstance",
                    courseMode: "online",
                    instructor: {
                      "@type": "Organization",
                      name: "kajubadam Vocabulary",
                    },
                  },
                },
                {
                  "@type": "FAQPage",
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "Is kajubadam Vocabulary free?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! kajubadam Vocabulary offers free access to 2 complete bilingual vocabulary stories (Saga 1-01 and Saga 2-01) plus all daily news vocabulary articles with 40+ exam-style questions each. You can start learning immediately without any payment. Full course access (11,762+ words) requires a one-time purchase starting at ₹299.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Which exams is kajubadam Vocabulary useful for?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "kajubadam Vocabulary is designed for SSC CGL, SSC CHSL, IBPS PO, SBI PO, Railway, and UPSC exam aspirants. All 11,762+ vocabulary words are selected from the past 10 years' exam papers with Hindi translations for Hindi-medium learners.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "How does story-based vocabulary learning work?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Each story embeds exam-frequency vocabulary words in bold with Hindi translations in brackets. After reading the story, you take an interactive fill-in-the-blank quiz that reinforces word meanings, spellings, and contextual usage. This immersive approach helps you remember words 3x faster than static word lists.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "What is included in the daily news vocabulary section?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Every daily news article features 40+ bilingual vocabulary questions across 8 sections: Error Detection, Sentence Improvement, Para Jumbles, Fill in the Blanks, Synonyms, Antonyms, Collocation, and Reading Comprehension. All based on current affairs editorials with Hindi translations. Completely free.",
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />

        {children}

        {/* Subtle site-wide footer */}
        <footer className="mt-auto border-t border-gray-100 bg-white">
          <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
            <div className="flex flex-col gap-1">
              <span>
                &copy; {new Date().getFullYear()} kajubadam Vocabulary &mdash; Free English-Hindi Vocabulary Learning
              </span>
              <div className="flex items-center gap-3">
                {/* Facebook - share on FB */}
                <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fkajubadamvocabulary.in" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors" aria-label="Share on Facebook">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                {/* WhatsApp - share on WhatsApp */}
                <a href="https://api.whatsapp.com/send?text=Check%20out%20kajubadam%20Vocabulary%20-%20Free%20English-Hindi%20vocabulary%20learning%20for%20SSC%20CGL!%20https%3A%2F%2Fkajubadamvocabulary.in" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors" aria-label="Share on WhatsApp">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 2C6.577 2 2.126 6.451 2.126 11.905c0 2.089.571 4.082 1.602 5.826L2 22l4.468-1.673c1.696.987 3.642 1.578 5.563 1.578 5.454 0 9.905-4.451 9.905-9.905S17.485 2 12.031 2zm0 18.273c-1.782 0-3.531-.523-5.027-1.51l-.361-.214-2.75 1.03 1.089-2.676-.235-.39a8.65 8.65 0 01-1.361-4.609c0-4.748 3.864-8.612 8.612-8.612s8.612 3.864 8.612 8.612-3.864 8.612-8.612 8.612zm4.978-6.514c-.101-.05-.599-.295-1.012-.459-.413-.164-.767-.261-.892-.167-.125.094-.331.238-.507.386-.176.148-.242.215-.403.16-.161-.055-.656-.21-1.195-.66-.625-.522-1.058-1.177-1.187-1.383-.129-.206-.064-.335.067-.463.125-.123.267-.321.381-.49.114-.169.15-.282.201-.47.051-.188.026-.38-.013-.531-.039-.151-.472-1.14-.654-1.573-.19-.453-.388-.447-.592-.455-.167-.007-.361-.009-.559-.009s-.538.082-.826.395c-.288.313-1.131 1.105-1.131 2.694 0 1.589 1.175 3.132 1.338 3.349.163.217 2.328 3.541 5.637 3.541 3.309 0 3.309-2.082 3.309-2.34 0-.258-.124-.429-.28-.506z" /></svg>
                </a>
                {/* Telegram - share on Telegram */}
                <a href="https://t.me/share/url?url=https%3A%2F%2Fkajubadamvocabulary.in&text=kajubadam%20Vocabulary%20-%2011%2C762%2B%20Exam%20Words%20for%20SSC%20CGL%2C%20Banking%2C%20UPSC" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors" aria-label="Share on Telegram">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12.056 0zM9.18 17.28l-.36-3.6 7.2-5.04c.36-.24.12-.48-.24-.36L7.68 13.2l-3.84-1.2c-.84-.24-.84-.84.12-1.2l14.4-5.52c.72-.24 1.32.24 1.08 1.2l-2.4 14.52c-.12.84-.72 1.08-1.32.72l-3.72-2.76-1.92 1.8c-.24.24-.48.24-.84.12l.48-3.36z" /></svg>
                </a>
                {/* Twitter/X - share on Twitter */}
                <a href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fkajubadamvocabulary.in&text=kajubadam%20Vocabulary%20-%2011%2C762%2B%20Exam%20Words%20for%20SSC%20CGL%2C%20Banking%2C%20UPSC&hashtags=SSC,CGL,Vocabulary,English" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors" aria-label="Share on Twitter/X">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
              <Link href="/about" className="hover:text-gray-600 transition-colors">About</Link>
              <Link href="/contact" className="hover:text-gray-600 transition-colors">Contact</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
              <Link href="/disclaimer" className="hover:text-gray-600 transition-colors">Disclaimer</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
