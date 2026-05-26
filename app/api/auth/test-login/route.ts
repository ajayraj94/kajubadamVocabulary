/**
 * API Route: Test Login (for testing purposes only)
 * POST /api/auth/test-login
 *
 * Bypasses OTP-based email authentication so you can test
 * the website without needing to send/receive OTP emails.
 *
 * Dynamically grants ALL products from lib/products.ts.
 * New products are automatically included!
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { PRODUCT_IDS } from "@/lib/products";

const TEST_EMAIL = "test@kajubadamvocabulary.in";

export async function POST(request: NextRequest) {
  // Production guard
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

    try {
      const body = await request.json();
      if (body.email && body.email.includes("@")) {
        email = body.email;
      }
    } catch {
      // No body — use default test email
    }

    // Try to insert records for ALL products dynamically
    try {
      const supabase = await createServerSupabase();
      for (const product of PRODUCT_IDS) {
        await supabase.rpc("add_purchase", {
          p_email: email.toLowerCase().trim(),
          p_product: product,
          p_transaction_id: `test_tx_${Date.now()}_${product}`,
          p_payment_id: "test_payment",
          p_amount: 0,
        });
      }
    } catch (dbError) {
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
        products: PRODUCT_IDS,
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
