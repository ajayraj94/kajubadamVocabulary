"use client";

import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, products: string[]) => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to send OTP");
        return;
      }

      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setTestLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/test-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@kajubadamvocabulary.in" }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Test login failed");
        return;
      }

      // Store session token
      if (data.session?.access_token) {
        localStorage.setItem("kv_supabase_session", data.session.access_token);
      }

      // Store user email
      localStorage.setItem("kv_user_email", data.user.email);

      // Grant all access
      const products = data.purchases?.products || [];
      if (products.includes("part1")) {
        localStorage.setItem("kv_part1_purchased", "true");
      }
      if (products.includes("part2")) {
        localStorage.setItem("kv_part2_purchased", "true");
      }
      if (products.includes("errorDetection")) {
        localStorage.setItem("kv_error_detection_purchased", "true");
      }

      // Callback with full access
      onLoginSuccess(data.user.email, products);

      // Reset & close
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setTestLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: otp }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Invalid OTP");
        return;
      }

      // Store session token in localStorage for persistence
      if (data.session?.access_token) {
        localStorage.setItem("kv_supabase_session", data.session.access_token);
      }

      // Store user email for recovery
      localStorage.setItem("kv_user_email", email);

      // Restore purchases to localStorage
      const products = data.purchases?.products || [];
      if (products.includes("part1")) {
        localStorage.setItem("kv_part1_purchased", "true");
      }
      if (products.includes("part2")) {
        localStorage.setItem("kv_part2_purchased", "true");
      }

      // Callback to parent with email
      onLoginSuccess(email, products);

      // Reset & close
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep("email");
    setEmail("");
    setOtp("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black text-lg">
            {step === "email" ? "Restore Your Access" : "Enter OTP"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          {step === "email"
            ? "Enter the email you used during purchase. We'll send a one-time code."
            : `Enter the 6-digit code sent to ${email}`}
        </p>

        {/* Step 1: Email */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-blue-500 transition-colors"
              required
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Restore Access"}
            </button>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Change email
            </button>
          </form>
        )}

        {/* ── Divider ── */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700/30"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-900/95 px-3 text-[11px] text-gray-500 font-medium">OR</span>
          </div>
        </div>

        {/* ── Test Login Button (development only) ── */}
        <button
          onClick={handleTestLogin}
          disabled={testLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
        >
          {testLoading ? (
            "Logging in..."
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              🧪 Test Login (Quick Access)
            </>
          )}
        </button>
        <p className="text-[11px] text-gray-500/70 text-center mt-1.5">
          Bypasses OTP — grants full access for testing
        </p>
      </div>
    </div>
  );
}
