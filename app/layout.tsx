import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

const SITE_URL = process.env.SITE_URL || "https://kajubadamvocabulary.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "kajubadam Vocabulary — Master English-Hindi Vocabulary through Stories",
    template: "%s | kajubadam Vocabulary",
  },
  description:
    "Learn prepositions, homonyms, phrasal verbs, idioms, proverbs, and advanced English vocabulary with Hindi translations using immersive stories. 11,252+ vocab items across 116+ stories and daily news.",
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
    title: "kajubadam Vocabulary — Master English-Hindi Vocabulary",
    description:
      "Learn prepositions, homonyms, phrasal verbs, idioms, proverbs, and advanced English vocabulary with Hindi translations using immersive stories.",
    url: SITE_URL,
    siteName: "kajubadam Vocabulary",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "kajubadam Vocabulary — Master English-Hindi Vocabulary",
    description:
      "Learn prepositions, homonyms, phrasal verbs, idioms, proverbs, and advanced English vocabulary with Hindi translations.",
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
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png?v=3", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png?v=3", type: "image/png", sizes: "16x16" },
      { url: "/favicon.svg?v=3", type: "image/svg+xml", sizes: "any" },
      { url: "/icon-192x192.png?v=3", type: "image/png", sizes: "192x192" },
      { url: "/icon-512x512.png?v=3", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "shortcut icon", url: "/favicon-32x32.png?v=3" },
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#fbbf24" },
    ],
  },
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
        {/* Direct favicon/apple-touch-icon links — bypasses metadata API for iPad Safari reliability */}
        <link rel="icon" href="/favicon-32x32.png?v=3" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png?v=3" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" sizes="180x180" />
        <link rel="shortcut icon" href="/favicon-32x32.png?v=3" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="kajubadam" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KFLQ24ZX"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}

        {/* Subtle site-wide footer */}
        <footer className="mt-auto border-t border-gray-100 bg-white">
          <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-1 text-xs text-gray-400">
            <span>
              &copy; {new Date().getFullYear()} kajubadam Vocabulary &mdash; Free English-Hindi Vocabulary Learning
            </span>
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
