/**
 * API Route: Send OTP via Supabase Auth
 * POST /api/auth/send-otp
 *
 * Security:
 *   - Email validation with MX record check
 *   - Blocks disposable email addresses
 *   - Rate limited to 5 requests/minute per IP
 *   - Per-email rate limit: 1 request per 60 seconds
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { validateEmail } from "@/lib/email-validator";
import { limiters } from "@/lib/rate-limiter";
import { sanitizeEmail } from "@/lib/input-validator";

// ── Per-email OTP cooldown (prevents hitting Supabase's rate limit) ──
const EMAIL_COOLDOWN_MS = 60_000; // 60 seconds per email
const IP_COOLDOWN_MS = 30_000;     // 30 seconds per IP (any email)
const emailOtpStore = new Map<string, number>();  // email → last sent timestamp
const ipOtpStore = new Map<string, number>();      // IP → last sent timestamp
let lastCleanup = 0;

/** Lazy cleanup: delete stale entries older than 2× cooldown */
function cleanupStaleOtpEntries() {
  const now = Date.now();
  if (now - lastCleanup < EMAIL_COOLDOWN_MS * 2) return;
  for (const [key, ts] of emailOtpStore) {
    if (now - ts > EMAIL_COOLDOWN_MS * 2) emailOtpStore.delete(key);
  }
  for (const [key, ts] of ipOtpStore) {
    if (now - ts > IP_COOLDOWN_MS * 2) ipOtpStore.delete(key);
  }
  lastCleanup = now;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawEmail = body?.email || "";

    // ── IP-based rate limiting ──
    const ip = limiters.auth.getIdentifier(request);
    const rateCheck = limiters.auth.check(ip);
    if (rateCheck.blocked) {
      return NextResponse.json(
        { success: false, error: rateCheck.error },
        { status: 429 }
      );
    }

    // ── Email validation (full: format + MX + disposable check) ──
    const emailResult = await validateEmail(rawEmail);
    if (!emailResult.valid) {
      return NextResponse.json(
        { success: false, error: emailResult.error },
        { status: 400 }
      );
    }

    const email = sanitizeEmail(rawEmail);

    // ── Per-email + per-IP cooldown check (prevents Supabase rate limit) ──
    cleanupStaleOtpEntries();
    const now = Date.now();

    // Check per-email cooldown
    const lastEmailSent = emailOtpStore.get(email);
    if (lastEmailSent) {
      const elapsed = now - lastEmailSent;
      if (elapsed < EMAIL_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((EMAIL_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          { success: false, error: `OTP already sent to this email. Please wait ${waitSeconds} seconds before requesting again.` },
          { status: 429 }
        );
      }
    }

    // Check per-IP cooldown (different emails from same IP)
    const lastIpSent = ipOtpStore.get(ip);
    if (lastIpSent) {
      const elapsed = now - lastIpSent;
      if (elapsed < IP_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((IP_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          { success: false, error: `Please wait ${waitSeconds} seconds before requesting OTP again.` },
          { status: 429 }
        );
      }
    }

    const supabase = await createServerSupabase();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      // ── Log the full Supabase Auth error for debugging ──
      console.error("[send-otp] Supabase Auth signInWithOtp error:", {
        message: error.message,
        status: error.status,
        code: error.code || error.name,
        email,
      });

      // If Supabase rate limit error, give a friendlier message
      const msg = error.message.toLowerCase();
      if (msg.includes("rate limit") || msg.includes("too many") || msg.includes("try again")) {
        return NextResponse.json(
          { success: false, error: "Too many OTP requests. Please wait a minute and try again." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // ── Record successful OTP send for cooldowns ──
    const sentAt = Date.now();
    emailOtpStore.set(email, sentAt);
    ipOtpStore.set(ip, sentAt);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
