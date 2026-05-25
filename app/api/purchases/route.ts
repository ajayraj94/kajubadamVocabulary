/**
 * API Route: Get user purchases by email
 * GET /api/purchases?email=user@example.com
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
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

    // Look up purchases
    const { data: purchases } = await supabase
      .from("purchases")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    return NextResponse.json({
      success: true,
      purchases: purchases
        ? { products: purchases.products }
        : { products: [] },
    });
  } catch (error: any) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
