/**
 * API Route: Verify OTP and return user purchases
 * POST /api/auth/verify-otp
 *
 * Security:
 *   - Rate limited to 5 requests/minute per IP
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { limiters } from "@/lib/rate-limiter";
import { sanitizeEmail } from "@/lib/input-validator";

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { success: false, error: "Email and token are required" },
        { status: 400 }
      );
    }

    // ── Rate limiting ──
    const ip = limiters.auth.getIdentifier(request);
    const rateCheck = limiters.auth.check(ip);
    if (rateCheck.blocked) {
      return NextResponse.json(
        { success: false, error: rateCheck.error },
        { status: 429 }
      );
    }

    const sanitizedEmail = sanitizeEmail(email);

    const supabase = await createServerSupabase();

    // Verify OTP
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      email: sanitizedEmail,
      token,
      type: "email",
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: authError?.message || "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Look up purchases for this email
    const { data: purchases } = await supabase
      .from("purchases")
      .select("*")
      .eq("email", sanitizedEmail)
      .maybeSingle();

    // Get user session
    const { data: sessionData } = await supabase.auth.getSession();

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      session: sessionData?.session
        ? { access_token: sessionData.session.access_token }
        : null,
      purchases: purchases
        ? {
            products: purchases.products,
          }
        : { products: [] },
    });
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
