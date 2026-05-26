/**
 * API Route: Test Login (for testing purposes only)
 * POST /api/auth/test-login
 *
 * Bypasses OTP-based email authentication so you can test
 * the website without needing to send/receive OTP emails.
 *
 * This endpoint:
 * 1. Returns all products as purchased (part1, part2, errorDetection)
 * 2. Tries to insert a test record in the purchases table if possible
 * 3. Does NOT create a real Supabase Auth session
 *
 * 🚨 Remove or disable this endpoint before going to production!
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

const TEST_EMAIL = "test@kajubadamvocabulary.in";

export async function POST(request: NextRequest) {
  // 🚨 Production guard — disable test login unless explicitly enabled
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.NEXT_PUBLIC_TEST_LOGIN_ENABLED
  ) {
    return NextResponse.json(
      { success: false, error: "Test login is disabled in production" },
      { status: 403 }
    );
  }

  try {
    let email = TEST_EMAIL;

    // Allow overriding the test email from the request body
    try {
      const body = await request.json();
      if (body.email && body.email.includes("@")) {
        email = body.email;
      }
    } catch {
      // No body — use default test email
    }

    // Try to insert a record in the purchases table
    // (may fail if RLS blocks anon key inserts — that's OK for testing)
    try {
      const supabase = await createServerSupabase();
      await supabase.rpc("add_purchase", {
        p_email: email.toLowerCase().trim(),
        p_product: "part1",
        p_transaction_id: `test_tx_${Date.now()}_part1`,
        p_payment_id: "test_payment",
        p_amount: 0,
      });
      await supabase.rpc("add_purchase", {
        p_email: email.toLowerCase().trim(),
        p_product: "part2",
        p_transaction_id: `test_tx_${Date.now()}_part2`,
        p_payment_id: "test_payment",
        p_amount: 0,
      });
      await supabase.rpc("add_purchase", {
        p_email: email.toLowerCase().trim(),
        p_product: "errorDetection",
        p_transaction_id: `test_tx_${Date.now()}_ed`,
        p_payment_id: "test_payment",
        p_amount: 0,
      });
    } catch (dbError) {
      // Silently ignore — test access works via localStorage anyway
      console.warn("Test login: Could not insert into purchases table (expected if no service_role key)");
    }

    return NextResponse.json({
      success: true,
      user: {
        id: "test-user-id",
        email: email,
      },
      session: {
        access_token: "test-session-token",
      },
      purchases: {
        products: ["part1", "part2", "errorDetection"],
      },
    });
  } catch (error: any) {
    console.error("Error in test login:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
