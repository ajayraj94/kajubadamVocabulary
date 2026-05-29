/**
 * API Route: Get user purchases by email
 * GET /api/purchases?email=user@example.com
 *
 * Security:
 *   - Requires Supabase authentication session
 *   - Rate limited to 30 requests/minute per IP
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { limiters } from "@/lib/rate-limiter";
import { sanitizeEmail } from "@/lib/input-validator";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    // ── Rate limiting ──
    const ip = limiters.general.getIdentifier(request);
    const rateCheck = limiters.general.check(ip);
    if (rateCheck.blocked) {
      return NextResponse.json(
        { success: false, error: rateCheck.error },
        { status: 429 }
      );
    }

    const supabase = await createServerSupabase();

    // Verify user is authenticated (check session)
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = sessionData.session.user;
    const sanitizedEmail = sanitizeEmail(email);

    // Look up purchases by email (RLS allows users to read their own row)
    const { data: purchases } = await supabase
      .from("purchases")
      .select("*")
      .eq("email", sanitizedEmail)
      .maybeSingle();

    // Also fetch transactions for this user by user_id (more reliable with Google auth)
    const { data: transactions } = await supabase
      .from("transactions")
      .select("product")
      .eq("user_id", user.id)
      .eq("status", "captured");

    // Merge products from both sources
    const purchaseProducts: string[] = purchases?.products || [];
    const transactionProducts: string[] = (transactions || []).map((tx: any) => tx.product).filter(Boolean);

    // If user has bundle in transactions, also return part1 and part2
    if (transactionProducts.includes("bundle")) {
      if (!transactionProducts.includes("part1")) transactionProducts.push("part1");
      if (!transactionProducts.includes("part2")) transactionProducts.push("part2");
    }

    const allProducts = Array.from(new Set([...purchaseProducts, ...transactionProducts]));

    return NextResponse.json({
      success: true,
      purchases: { products: allProducts },
      transactions: transactions || [],
    });
  } catch (error: any) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
