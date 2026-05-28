/**
 * API Route: Admin — Manage Purchases
 * GET  /api/admin/purchases          — List all purchases
 * POST /api/admin/purchases          — Add a purchase for a user
 * DELETE /api/admin/purchases        — Remove a product from a user
 *
 * Security:
 *   - Admin token verification
 *   - Email validation (format + MX + disposable check) for POST
 *   - Rate limited to 20 requests/minute per IP
 *   - Input sanitization
 *
 * Uses dynamic product validation from lib/products.ts.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { isAuthorized, unauthorized } from "@/lib/admin-auth";
import { PRODUCT_IDS } from "@/lib/products";
import { validateEmail } from "@/lib/email-validator";
import { limiters } from "@/lib/rate-limiter";
import { sanitizeEmail, sanitizeString } from "@/lib/input-validator";

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

  // ── Rate limiting ──
  const ip = limiters.admin.getIdentifier(request);
  const rateCheck = limiters.admin.check(ip);
  if (rateCheck.blocked) {
    return NextResponse.json(
      { success: false, error: rateCheck.error },
      { status: 429 }
    );
  }

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

  // ── Rate limiting ──
  const ip = limiters.admin.getIdentifier(request);
  const rateCheck = limiters.admin.check(ip);
  if (rateCheck.blocked) {
    return NextResponse.json(
      { success: false, error: rateCheck.error },
      { status: 429 }
    );
  }

  const supabase = createAdminSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Admin database not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local" },
      { status: 500 }
    );
  }

  try {
    const { email, product } = await request.json();

    // ── Email validation ──
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const emailResult = await validateEmail(email, { checkMX: false }); // Skip MX for admin operations
    if (!emailResult.valid) {
      return NextResponse.json(
        { success: false, error: emailResult.error },
        { status: 400 }
      );
    }

    // ⭐ Dynamic product validation
    if (!product || !PRODUCT_IDS.includes(product)) {
      return NextResponse.json(
        { success: false, error: `Invalid product. Valid products: ${PRODUCT_IDS.join(", ")}` },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedProduct = sanitizeString(product, 50);

    const { error } = await (supabase.rpc as any)("add_purchase", {
      p_email: sanitizedEmail,
      p_product: sanitizedProduct,
      p_transaction_id: `admin_${sanitizedProduct}_${Date.now()}`,
      p_payment_id: "admin_granted",
      p_amount: 0,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `${sanitizedProduct} access granted to ${sanitizedEmail}`,
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

  // ── Rate limiting ──
  const ip = limiters.admin.getIdentifier(request);
  const rateCheck = limiters.admin.check(ip);
  if (rateCheck.blocked) {
    return NextResponse.json(
      { success: false, error: rateCheck.error },
      { status: 429 }
    );
  }

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

    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedProduct = sanitizeString(product, 50);

    const { data: user, error: fetchError } = await (supabase.from("purchases") as any)
      .select("products")
      .eq("email", sanitizedEmail)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const updatedProducts = ((user as PurchaseRow).products || []).filter(
      (p: string) => p !== sanitizedProduct
    );

    const { error: updateError } = await (supabase.from("purchases") as any)
      .update({
        products: updatedProducts,
        updated_at: new Date().toISOString(),
      })
      .eq("email", sanitizedEmail);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: `${sanitizedProduct} removed from ${sanitizedEmail}`,
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
