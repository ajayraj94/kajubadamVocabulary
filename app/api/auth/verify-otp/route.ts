/**
 * API Route: Verify OTP and return user purchases
 * POST /api/auth/verify-otp
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { success: false, error: "Email and token are required" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabase();

    // Verify OTP
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      email,
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
      .eq("email", email.toLowerCase().trim())
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
