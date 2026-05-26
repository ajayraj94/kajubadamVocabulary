/**
 * API Route: Admin — List Transactions
 * GET /api/admin/transactions
 *
 * Requires admin token via x-admin-token header
 * and SUPABASE_SERVICE_ROLE_KEY configured in .env.local.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { isAuthorized, unauthorized } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return unauthorized();

  const supabase = createAdminSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Admin database not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local" },
      { status: 500 }
    );
  }

  try {
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({ success: true, transactions: transactions ?? [] });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
