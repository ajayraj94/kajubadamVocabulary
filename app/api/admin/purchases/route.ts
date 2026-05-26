/**
 * API Route: Admin — Manage Purchases
 * GET  /api/admin/purchases          — List all purchases
 * POST /api/admin/purchases          — Add a purchase for a user
 * DELETE /api/admin/purchases        — Remove a product from a user
 *
 * Uses dynamic product validation from lib/products.ts.
 * New products work automatically — no code changes needed!
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { isAuthorized, unauthorized } from "@/lib/admin-auth";
import { PRODUCT_IDS } from "@/lib/products";

interface PurchaseRow {
  id: string;
  email: string;
  products: string[];
  created_at: string;
  updated_at: string;
}

/** GET — list all purchases */
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
    const { data, error } = await (supabase.from("purchases") as any)
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, purchases: (data as PurchaseRow[]) ?? [] });
  } catch (error: any) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}

/** POST — add a purchase for a user (creates user if not exists) */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return unauthorized();

  const supabase = createAdminSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Admin database not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local" },
      { status: 500 }
    );
  }

  try {
    const { email, product } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    // ⭐ Dynamic product validation — works with any product in lib/products.ts!
    if (!PRODUCT_IDS.includes(product)) {
      return NextResponse.json(
        { success: false, error: `Invalid product. Valid products: ${PRODUCT_IDS.join(", ")}` },
        { status: 400 }
      );
    }

    const { error } = await (supabase.rpc as any)("add_purchase", {
      p_email: email.toLowerCase().trim(),
      p_product: product,
      p_transaction_id: `admin_${product}_${Date.now()}`,
      p_payment_id: "admin_granted",
      p_amount: 0,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `${product} access granted to ${email.toLowerCase().trim()}`,
    });
  } catch (error: any) {
    console.error("Error adding purchase:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add purchase" },
      { status: 500 }
    );
  }
}

/** DELETE — remove a product from a user */
export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) return unauthorized();

  const supabase = createAdminSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Admin database not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local" },
      { status: 500 }
    );
  }

  try {
    const { email, product } = await request.json();

    if (!email || !product) {
      return NextResponse.json(
        { success: false, error: "Email and product are required" },
        { status: 400 }
      );
    }

    const { data: user, error: fetchError } = await (supabase.from("purchases") as any)
      .select("products")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const updatedProducts = ((user as PurchaseRow).products || []).filter(
      (p: string) => p !== product
    );

    const { error: updateError } = await (supabase.from("purchases") as any)
      .update({
        products: updatedProducts,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email.toLowerCase().trim());

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: `${product} removed from ${email.toLowerCase().trim()}`,
      products: updatedProducts,
    });
  } catch (error: any) {
    console.error("Error removing purchase:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove purchase" },
      { status: 500 }
    );
  }
}
