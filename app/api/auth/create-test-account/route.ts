/**
 * API Route: Create Test Account
 * POST /api/auth/create-test-account
 *
 * Creates a real Supabase Auth user with email + password
 * and grants ALL products dynamically from lib/products.ts.
 *
 * New products added to the config are automatically included!
 *
 * Requires:
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - ADMIN_PASSWORD in .env.local
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { isAuthorized, unauthorized } from "@/lib/admin-auth";
import { PRODUCT_IDS } from "@/lib/products";

const TEST_EMAIL = "test@kajubadamvocabulary.in";
const TEST_PASSWORD = "TestPass@123";

export async function POST(request: NextRequest) {
  // Production guard
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.NEXT_PUBLIC_TEST_LOGIN_ENABLED
  ) {
    return NextResponse.json(
      { success: false, error: "Test account creation is disabled in production" },
      { status: 403 }
    );
  }

  if (!isAuthorized(request)) return unauthorized();

  const supabase = createAdminSupabase();
  if (!supabase) {
    return NextResponse.json(
      {
        success: false,
        error: "Admin database not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local",
      },
      { status: 500 }
    );
  }

  try {
    const { email, password } = await request.json();
    const finalEmail = (email || TEST_EMAIL).toLowerCase().trim();
    const finalPassword = password || TEST_PASSWORD;

    const results: string[] = [];
    const errors: string[] = [];

    // Step 1: Create Supabase Auth user
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: finalEmail,
        password: finalPassword,
        email_confirm: true,
        user_metadata: { created_by: "admin_panel", is_test_account: true },
      });

      if (authError) throw authError;
      results.push(`✅ Auth user created: ${finalEmail} (UID: ${authUser.user?.id?.slice(0, 8)}...)`);
    } catch (err: any) {
      if (err.message?.includes("already exists") || err.message?.includes("duplicate")) {
        results.push(`ℹ️ Auth user already exists: ${finalEmail}`);
      } else {
        errors.push(`❌ Failed to create Auth user: ${err.message}`);
      }
    }

    // Step 2: Grant ALL products dynamically from config
    for (const product of PRODUCT_IDS) {
      try {
        const { error: rpcError } = await (supabase.rpc as any)("add_purchase", {
          p_email: finalEmail,
          p_product: product,
          p_transaction_id: `test_acct_${product}_${Date.now()}`,
          p_payment_id: "test_account",
          p_amount: 0,
        });

        if (rpcError) throw rpcError;
        results.push(`✅ ${product} access granted`);
      } catch (err: any) {
        errors.push(`❌ Failed to grant ${product}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      email: finalEmail,
      password: finalPassword,
      results,
      errors: errors.length > 0 ? errors : undefined,
      message:
        errors.length === 0
          ? "Test account created successfully with all products!"
          : "Test account created with some warnings",
    });
  } catch (error: any) {
    console.error("Error creating test account:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
