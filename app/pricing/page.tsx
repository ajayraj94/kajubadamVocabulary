"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePurchaseAccess } from "@/hooks/usePurchaseAccess";
import { getProductPrice } from "@/lib/products";
import { createClient, signInWithGoogle } from "@/lib/supabase";

const PART1_FEATURES = [
  "48 bilingual story sets",
  "627 Homonyms & Confused Words",
  "2,300 Idioms & Phrases",
  "1,028 Phrasal Verbs",
  "588 Fixed Prepositions",
  "219 Proverbs",
  "300 Story-based vocab words",
  "Interactive fill-in-the-blank quizzes",
  "Hindi translations for every sentence",
];

const PART2_FEATURES = [
  "67 bilingual story sets (batch-wise)",
  "6,700 story-based vocabulary words",
  "High-frequency exam words",
  "Bilingual sentence context (EN + HI)",
  "Interactive fill-in-the-blank quizzes",
  "SSC, Banking, UPSC oriented vocab",
  "New stories added regularly",
];

const ERROR_DETECTION_FEATURES = [
  "716 SSC Error Detection PYQs",
  "Fully solved with detailed explanations",
  "Bilingual explanations (Hindi + English)",
  "Grammar rule cards with short tricks",
  "Extra practice examples for each rule",
  "Exam pro-tips for quick error spotting",
  "10×5 question palette per page",
];

export default function PricingPage() {
  const {
    hasPart1,
    hasPart2,
    hasErrorDetection,
    isLoading,
    unlockPart1,
    unlockPart2,
    unlockErrorDetection,
    unlockBundle,
    paymentError,
    clearPaymentError,
    isLoggedIn,
    userEmail,
    userName,
  } = usePurchaseAccess();
  const [part1Clicked, setPart1Clicked] = useState(false);
  const [part2Clicked, setPart2Clicked] = useState(false);
  const [errorDetectionClicked, setErrorDetectionClicked] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<'part1' | 'part2' | 'bundle' | 'errorDetection' | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleUnlock = async (product: 'part1' | 'part2' | 'bundle' | 'errorDetection') => {
    setSelectedProduct(product);

    // If not logged in, show Google login first
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    // User is logged in — proceed directly to payment
    await proceedToPayment(product, userEmail!);
  };

  const handleGoogleLoginBeforePurchase = async () => {
    try {
      await signInWithGoogle();
      // OAuth redirect happens, user comes back logged in
      // Then they need to click Buy again
    } catch (err: any) {
      console.error("Google login failed:", err);
    }
  };

  const proceedToPayment = async (product: string, email: string) => {
    setProcessingPayment(true);

    const onSuccess = (prod: string) => {
      if (prod === 'part1') setPart1Clicked(true);
      else if (prod === 'part2') setPart2Clicked(true);
      else if (prod === 'errorDetection') setErrorDetectionClicked(true);
    };

    try {
      if (product === 'part1') await unlockPart1(email, onSuccess);
      else if (product === 'part2') await unlockPart2(email, onSuccess);
      else if (product === 'bundle') await unlockBundle(email, onSuccess);
      else if (product === 'errorDetection') await unlockErrorDetection(email, onSuccess);
    } catch (err) {
      // Error handled by hook
    } finally {
      setProcessingPayment(false);
    }
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setSelectedProduct(null);
    clearPaymentError();
  };

  const getButton = (product: 'part1' | 'part2' | 'errorDetection', hasAccess: boolean, clicked: boolean, priceText: string, gradientClass: string, label: string, href?: string) => {
    if (isLoading || processingPayment) return <div className="h-12 bg-white/5 rounded-xl animate-pulse" />;

    if (hasAccess || clicked) {
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="w-full flex items-center justify-center gap-2 bg-green-500/15 border border-green-500/30 text-green-400 font-bold text-[15px] py-3.5 rounded-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            Unlocked!
          </div>
          {href && (
            <Link href={href} className="text-blue-400 hover:text-blue-300 text-[13px] font-medium underline underline-offset-2 transition-colors">
              Go to {label} →
            </Link>
          )}
        </div>
      );
    }

    return (
      <button onClick={() => handleUnlock(product)}
        className={`w-full ${gradientClass} text-white font-bold text-[15px] py-3.5 rounded-xl transition-all duration-200 shadow-lg active:scale-[0.98]`}>
        🔓 Unlock {label} — {priceText}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] font-sans">
      {/* Background gradient decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-[14px] font-medium transition-colors mb-10">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-300 text-[12px] font-bold tracking-wider uppercase">Lifetime Access — Pay Once</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
            Unlock{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Full Vocabulary</span>
            <br />Access
          </h1>
          <p className="text-gray-400 text-[16px] max-w-xl mx-auto leading-relaxed">
            Master 11,762+ exam-oriented words through bilingual stories, quizzes, and error detection exercises.
            One-time purchase. Lifetime access.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Part 1 Card */}
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 flex flex-col hover:border-blue-500/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.08)]">
            <div className="absolute -top-3 left-6">
              <span className="bg-blue-600 text-white text-[11px] font-black px-3 py-1 rounded-full tracking-wider uppercase shadow-lg">Part 1</span>
            </div>
            <div className="mt-2 mb-5">
              <h2 className="text-white text-[22px] font-black mb-1 leading-tight">Core Vocabulary Essentials</h2>
              <p className="text-gray-400 text-[13px]">Homonyms, Idioms, Phrasal Verbs, Prepositions & Proverbs</p>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-white text-[42px] font-black leading-none">₹{getProductPrice('part1')}</span>
              <span className="text-gray-400 text-[14px]">one-time</span>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {PART1_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300 text-[13px]">{f}</span>
                </li>
              ))}
            </ul>
            {getButton('part1', hasPart1, part1Clicked, `₹${getProductPrice('part1')}`, 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-blue-900/30 hover:shadow-blue-800/40', 'Part 1', '/?tab=part1')}
          </div>

          {/* Part 2 Card */}
          <div className="relative bg-white/5 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-7 flex flex-col hover:border-orange-500/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(249,115,22,0.08)]">
            <div className="absolute -top-3 left-6">
              <span className="bg-orange-500 text-white text-[11px] font-black px-3 py-1 rounded-full tracking-wider uppercase shadow-lg">Part 2</span>
            </div>
            <div className="absolute -top-3 right-6">
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-[#3d1a00] text-[10px] font-black px-3 py-1 rounded-full tracking-wider uppercase shadow-lg">⭐ Most Popular</span>
            </div>
            <div className="mt-2 mb-5">
              <h2 className="text-white text-[22px] font-black mb-1 leading-tight">Story-Based Vocabulary</h2>
              <p className="text-gray-400 text-[13px]">67 bilingual story sets with 6,700 high-yield exam words</p>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-white text-[42px] font-black leading-none">₹{getProductPrice('part2')}</span>
              <span className="text-gray-400 text-[14px]">one-time</span>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {PART2_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300 text-[13px]">{f}</span>
                </li>
              ))}
            </ul>
            {getButton('part2', hasPart2, part2Clicked, `₹${getProductPrice('part2')}`, 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 shadow-orange-900/30 hover:shadow-orange-800/40', 'Part 2', '/?tab=part2')}
          </div>

          {/* SSC Error Detection Card */}
          <div className="relative bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-7 flex flex-col hover:border-red-500/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(239,68,68,0.08)]">
            <div className="absolute -top-3 left-6">
              <span className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-full tracking-wider uppercase shadow-lg">SSC PYQ</span>
            </div>
            <div className="mt-2 mb-5">
              <h2 className="text-white text-[22px] font-black mb-1 leading-tight">SSC Error Detection</h2>
              <p className="text-gray-400 text-[13px]">716 previous year questions with detailed bilingual explanations</p>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-white text-[42px] font-black leading-none">₹{getProductPrice('errorDetection')}</span>
              <span className="text-gray-400 text-[14px]">one-time</span>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {ERROR_DETECTION_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300 text-[13px]">{f}</span>
                </li>
              ))}
            </ul>
            {getButton('errorDetection', hasErrorDetection, errorDetectionClicked, `₹${getProductPrice('errorDetection')}`, 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-900/30 hover:shadow-red-800/40', 'SSC Error Detection', '/?tab=error-detection')}
          </div>
        </div>

        {/* Bundle Banner */}
        <div className="relative bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-orange-500/15 border border-white/10 rounded-2xl p-6 text-center mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-orange-500/5 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-white font-black text-[18px] mb-1">🎯 Complete Bundle: Part 1 + Part 2</p>
            <p className="text-gray-300 text-[14px] mb-3">Full 11,762+ word curriculum • All 115 stories • Lifetime access</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-gray-400 text-[14px] line-through">₹{getProductPrice('part1') + getProductPrice('part2')}</span>
              <span className="text-white text-[28px] font-black">₹{getProductPrice('bundle')}</span>
              <span className="bg-green-500/20 border border-green-500/30 text-green-400 text-[11px] font-bold px-2.5 py-1 rounded-full">Save ₹{getProductPrice('part1') + getProductPrice('part2') - getProductPrice('bundle')}</span>
            </div>
            {isLoading || processingPayment ? (
              <div className="mt-4 h-12 max-w-xs mx-auto bg-white/5 rounded-xl animate-pulse" />
            ) : hasPart1 && hasPart2 ? (
              <div className="mt-4 inline-flex items-center gap-2 bg-green-500/15 border border-green-500/30 text-green-400 font-bold text-[15px] px-8 py-3 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Full Access Unlocked!
              </div>
            ) : (
              <button onClick={() => handleUnlock('bundle')}
                className="mt-4 inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white font-bold text-[15px] px-10 py-3.5 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-xl">
                🚀 Get Full Bundle — ₹{getProductPrice('bundle')}
              </button>
            )}
          </div>
        </div>

        {/* Trust signals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: "🔐", text: "Secure & Lifetime Access" },
            { icon: "📱", text: "Works on All Devices" },
            { icon: "🚫", text: "No Subscription" },
            { icon: "💯", text: "100% Free Preview" },
          ].map(({ icon, text }) => (
            <div key={text} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1.5">{icon}</div>
              <p className="text-gray-300 text-[12px] font-semibold">{text}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
          <h3 className="text-white font-black text-[18px] mb-5">Frequently Asked Questions</h3>
          <div className="space-y-5">
            {[
              { q: "Free mein kya milega?", a: "Dono parts ki pehli story bilkul free hai — Saga 1-01 (Part 1) aur Saga 2-01 (Part 2). Daily News Vocabulary section aur kuch bhi aane wale content hamesha free rahega." },
              { q: "Kya yeh lifetime access hai?", a: "Haan! Ek baar purchase karo, hamesha ke liye access pao. Koi monthly subscription nahi." },
              { q: "Kya main Part 1 aur Part 2 alag alag khareed sakta hoon?", a: "Bilkul! Dono plans alag hain. Pehle Part 1 kharido, baad mein Part 2 add kar sakte ho." },
              { q: "SSC Error Detection bhi alag se khareedna hoga?", a: `Haan, Error Detection module alag hai (₹${getProductPrice('errorDetection')}). Isme 716 fully solved SSC PYQs hain jo exam-oriented hain.` },
              { q: "Payment ke baad access kaise milega?", a: "Payment successful hone ke turant baad aapka account unlock ho jaayega. Page refresh karne ki zaroorat nahi." },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-white/5 pb-5 last:border-0 last:pb-0">
                <p className="text-white font-bold text-[14px] mb-1.5">{q}</p>
                <p className="text-gray-400 text-[13px] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Google Auth Modal (shown when user tries to buy without being logged in) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700/30 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-black text-lg">Sign in to Purchase</h3>
              <button onClick={closeAuthModal}
                className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              Sign in with Google to purchase access. Your purchase will be linked to your Google account so you can restore it anytime.
            </p>

            <button
              onClick={handleGoogleLoginBeforePurchase}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg border border-gray-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            <p className="text-gray-500 text-xs mt-6">
              ⚡ After signing in, click the Buy button again to complete your purchase.
            </p>
          </div>
        </div>
      )}

      {/* Payment Error Toast */}
      {paymentError && !showAuthModal && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500/15 border border-red-500/30 text-red-400 px-6 py-3 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{paymentError}</span>
          <button onClick={clearPaymentError} className="hover:text-red-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
