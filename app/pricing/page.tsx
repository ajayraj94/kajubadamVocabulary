"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePurchaseAccess } from "@/hooks/usePurchaseAccess";
import { useRazorpay } from "@/hooks/useRazorpay";

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
    clearPaymentError
  } = usePurchaseAccess();
  const [part1Clicked, setPart1Clicked] = useState(false);
  const [part2Clicked, setPart2Clicked] = useState(false);
  const [errorDetectionClicked, setErrorDetectionClicked] = useState(false);
  const [part1Success, setPart1Success] = useState(false);
  const [part2Success, setPart2Success] = useState(false);
  const [errorDetectionSuccess, setErrorDetectionSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<'part1' | 'part2' | 'bundle' | 'errorDetection' | null>(null);
  // OTP verification state
  const [otpStep, setOtpStep] = useState<'email' | 'otp'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // If payment fails after OTP was verified, reset to email step so user can retry
  useEffect(() => {
    if (paymentError && otpStep === 'otp') {
      setOtpStep('email');
      setOtpCode('');
    }
  }, [paymentError]);

  const handleUnlock = (product: 'part1' | 'part2' | 'bundle' | 'errorDetection') => {
    setSelectedProduct(product);
    setShowEmailModal(true);
    setOtpStep('email');
    setOtpCode('');
    setOtpError(null);
    setEmail('');
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setOtpLoading(true);
    setOtpError(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        setOtpError(data.error || 'Failed to send OTP');
        return;
      }

      setOtpStep('otp');
    } catch (err: any) {
      setOtpError(err.message || 'Something went wrong');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Verify OTP, then proceed to payment
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) return;

    setOtpLoading(true);
    setOtpError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otpCode }),
      });

      const data = await res.json();

      if (!data.success) {
        setOtpError(data.error || 'Invalid OTP');
        return;
      }

      // OTP verified — proceed to payment
      proceedToPayment(email);
    } catch (err: any) {
      setOtpError(err.message || 'Something went wrong');
    } finally {
      setOtpLoading(false);
    }
  };

  // Proceed to Razorpay payment with verified email
  const proceedToPayment = async (verifiedEmail: string) => {
    const onSuccess = (product: string) => {
      if (product === 'part1') {
        setPart1Success(true);
        setPart1Clicked(true);
      } else if (product === 'part2') {
        setPart2Success(true);
        setPart2Clicked(true);
      } else if (product === 'errorDetection') {
        setErrorDetectionSuccess(true);
        setErrorDetectionClicked(true);
      }
    };

    try {
      if (selectedProduct === 'part1') {
        await unlockPart1(verifiedEmail, onSuccess);
      } else if (selectedProduct === 'part2') {
        await unlockPart2(verifiedEmail, onSuccess);
      } else if (selectedProduct === 'bundle') {
        await unlockBundle(verifiedEmail, onSuccess);
      } else if (selectedProduct === 'errorDetection') {
        await unlockErrorDetection(verifiedEmail, onSuccess);
      }

      // Only close modal if there's no payment error
      if (!paymentError) {
        closeModal();
      }
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const closeModal = () => {
    setShowEmailModal(false);
    setEmail('');
    setOtpCode('');
    setOtpStep('email');
    setOtpError(null);
    setSelectedProduct(null);
    clearPaymentError();
  };

  const getButton = (product: 'part1' | 'part2' | 'errorDetection', hasAccess: boolean, clicked: boolean, priceText: string, gradientClass: string, label: string, href?: string) => {
    if (isLoading) return <div className="h-12 bg-white/5 rounded-xl animate-pulse" />;

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

        {/* Pricing Cards — responsive grid */}
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
              <span className="text-white text-[42px] font-black leading-none">₹299</span>
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
            {getButton('part1', hasPart1, part1Clicked, '₹299', 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-blue-900/30 hover:shadow-blue-800/40', 'Part 1', '/?tab=part1')}
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
              <span className="text-white text-[42px] font-black leading-none">₹399</span>
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
            {getButton('part2', hasPart2, part2Clicked, '₹399', 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 shadow-orange-900/30 hover:shadow-orange-800/40', 'Part 2', '/?tab=part2')}
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
              <span className="text-white text-[42px] font-black leading-none">₹110</span>
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
            {getButton('errorDetection', hasErrorDetection, errorDetectionClicked, '₹110', 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-900/30 hover:shadow-red-800/40', 'SSC Error Detection', '/?tab=error-detection')}
          </div>
        </div>

        {/* Bundle Banner */}
        <div className="relative bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-orange-500/15 border border-white/10 rounded-2xl p-6 text-center mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-orange-500/5 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-white font-black text-[18px] mb-1">🎯 Complete Bundle: Part 1 + Part 2</p>
            <p className="text-gray-300 text-[14px] mb-3">Full 11,762+ word curriculum • All 115 stories • Lifetime access</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-gray-400 text-[14px] line-through">₹698</span>
              <span className="text-white text-[28px] font-black">₹549</span>
              <span className="bg-green-500/20 border border-green-500/30 text-green-400 text-[11px] font-bold px-2.5 py-1 rounded-full">Save ₹149</span>
            </div>
            {isLoading ? (
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
                🚀 Get Full Bundle — ₹549
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
              { q: "SSC Error Detection bhi alag se khareedna hoga?", a: "Haan, Error Detection module alag hai (₹110). Isme 716 fully solved SSC PYQs hain jo exam-oriented hain." },
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

      {/* Email Modal with OTP Verification */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black text-lg">
                {otpStep === 'email' ? 'Enter Your Gmail' : 'Verify OTP'}
              </h3>
              <button onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Step 1: Email Input */}
            {otpStep === 'email' && (
              <>
                <p className="text-gray-400 text-sm mb-4">
                  {selectedProduct === 'bundle'
                    ? 'Enter your Gmail to purchase the complete bundle (Part 1 + Part 2) at a discounted price.'
                    : selectedProduct === 'errorDetection'
                    ? 'Enter your Gmail to purchase SSC Error Detection 716 PYQ access for ₹110.'
                    : `Enter your Gmail to purchase ${selectedProduct === 'part1' ? 'Part 1' : 'Part 2'} access.`}
                </p>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setOtpError(null); }}
                    placeholder="your.email@gmail.com"
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors" required autoFocus />
                  {otpError && <p className="text-red-400 text-sm">{otpError}</p>}
                  {paymentError && otpStep === 'email' && (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      {paymentError}
                    </p>
                  )}
                  <button type="submit" disabled={otpLoading || !email}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition-all duration-200 disabled:opacity-50">
                    {otpLoading ? 'Sending OTP...' : 'Send OTP to this Email'}
                  </button>
                </form>
              </>
            )}

            {/* Step 2: OTP Verification */}
            {otpStep === 'otp' && (
              <>
                <p className="text-gray-400 text-sm mb-4">
                  Enter the 6-digit code sent to <span className="text-white font-medium">{email}</span>
                </p>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP" maxLength={6}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-blue-500 transition-colors" required autoFocus />
                  {otpError && <p className="text-red-400 text-sm">{otpError}</p>}
                  <button type="submit" disabled={otpLoading || otpCode.length < 4}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-3 rounded-xl transition-all duration-200 disabled:opacity-50">
                    {otpLoading ? 'Verifying...' : '✓ Verify & Proceed to Payment'}
                  </button>
                  <button type="button" onClick={() => { setOtpStep('email'); setOtpCode(''); setOtpError(null); }}
                    className="w-full text-gray-400 hover:text-white text-sm transition-colors">
                    ← Change email
                  </button>
                </form>
              </>
            )}

            <p className="text-gray-400 text-xs text-center mt-4">🔒 Secure payment via Razorpay</p>
          </div>
        </div>
      )}

      {/* Payment Error Toast */}
      {paymentError && !showEmailModal && (
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
