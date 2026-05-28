/**
 * API Route: Send OTP via Supabase Auth
 * POST /api/auth/send-otp
 *
 * Security:
 *   - Email validation with MX record check
 *   - Blocks disposable email addresses
 *   - Rate limited to 5 requests/minute per IP
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { validateEmail } from "@/lib/email-validator";
import { limiters } from "@/lib/rate-limiter";
import { sanitizeEmail } from "@/lib/input-validator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawEmail = body?.email || "";

    // ── Rate limiting ──
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

    const supabase = await createServerSupabase();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
