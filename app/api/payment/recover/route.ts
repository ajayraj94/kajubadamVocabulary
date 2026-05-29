/**
 * API Route: Recover Failed Purchase DB Save
 * POST /api/payment/recover
 *
 * Called by the client-side recovery mechanism when the initial
 * payment verification succeeded but the DB save failed silently.
 *
 * This route uses the admin Supabase client (service_role key)
 * to bypass RLS, ensuring the purchase is saved to the database.
 *
 * Security:
 *   - Accepts paymentId + product + email
 *   - Fetches payment from Razorpay to verify it was actually captured
 *   - Only inserts if purchase doesn't already exist in DB
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchPaymentDetails } from '@/lib/razorpay';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { PRODUCT_IDS } from '@/lib/products';
import { sanitizeEmail } from '@/lib/input-validator';
import { limiters } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, product, email } = await request.json();

    // ── Rate limiting ──
    const ip = limiters.payment.getIdentifier(request);
    const rateCheck = limiters.payment.check(ip);
    if (rateCheck.blocked) {
      return NextResponse.json(
        { success: false, error: rateCheck.error },
        { status: 429 }
      );
    }

    // ── Input validation ──
    if (!paymentId || !product) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: paymentId, product' },
        { status: 400 }
      );
    }

    if (!PRODUCT_IDS.includes(product)) {
      return NextResponse.json(
        { success: false, error: `Invalid product: ${product}` },
        { status: 400 }
      );
    }

    // ── Verify payment actually exists and was captured ──
    const paymentResult = await fetchPaymentDetails(paymentId);
    if (!paymentResult.success || !paymentResult.payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found in Razorpay' },
        { status: 404 }
      );
    }

    const payment = paymentResult.payment;
    if (payment.status !== 'captured') {
      return NextResponse.json(
        { success: false, error: `Payment not captured. Status: ${payment.status}` },
        { status: 400 }
      );
    }

    // ── Get email + user_id from payment or from request ──
    const userEmail = email || payment.notes?.email || payment.email || '';
    const supabaseUserId = payment.notes?.supabase_user_id || null;
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'No email found for payment' },
        { status: 400 }
      );
    }

    // ── Check if purchase already exists in DB ──
    const supabase = createAdminSupabase();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Admin database not configured' },
        { status: 500 }
      );
    }

    const { data: existing } = await (supabase.from('purchases') as any)
      .select('products')
      .eq('email', sanitizeEmail(userEmail))
      .maybeSingle();

    if (existing) {
      const products: string[] = existing.products || [];
      if (products.includes(product)) {
        return NextResponse.json({
          success: true,
          message: 'Purchase already exists in database',
          alreadyExists: true,
        });
      }
    }

    // ── Save purchase to Supabase (using admin client to bypass RLS) ──
    await (supabase.rpc as any)('add_purchase', {
      p_email: sanitizeEmail(userEmail),
      p_product: product,
      p_transaction_id: paymentId,
      p_payment_id: paymentId,
      p_amount: payment.amount || 0,
      p_user_id: supabaseUserId,
    });

    console.log(`[RECOVER] Purchase saved — ${userEmail} — ${product} — ${paymentId} (user_id: ${supabaseUserId})`);

    return NextResponse.json({
      success: true,
      message: 'Purchase recovered and saved successfully',
      product,
      paymentId,
      email: sanitizeEmail(userEmail),
    });
  } catch (error: any) {
    console.error('[RECOVER] Error recovering purchase:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
