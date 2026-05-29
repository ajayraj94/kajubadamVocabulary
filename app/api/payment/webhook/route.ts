/**
 * API Route: Razorpay Webhook
 * POST /api/payment/webhook
 *
 * Handles asynchronous payment events from Razorpay.
 * Configure this URL in Razorpay Dashboard → Settings → Webhooks.
 *
 * Security:
 *   - Webhook signature verification via HMAC-SHA256
 *   - Input validation for all incoming data
 *   - Email validation before saving purchases
 *
 * Primary event handled:
 *   - payment.captured → saves purchase to Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { PRODUCT_IDS } from '@/lib/products';
import { validateEmail } from '@/lib/email-validator';
import { sanitizeEmail } from '@/lib/input-validator';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Webhook: RAZORPAY_WEBHOOK_SECRET not set in production');
      return false;
    }
    console.warn('Webhook: Skipping signature verification in dev (WEBHOOK_SECRET not set)');
    return true;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
    return expectedSignature === signature;
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Handle payment.captured event
 */
async function handlePaymentCaptured(payload: any) {
  const payment = payload.payment?.entity || payload.payload?.payment?.entity;
  if (!payment) {
    console.warn('Webhook: No payment entity found in payload');
    return { success: false, error: 'No payment entity' };
  }

  const product = payment.notes?.product || '';
  const userEmail = payment.notes?.email || payment.email || '';

  if (!product || !PRODUCT_IDS.includes(product)) {
    console.warn(`Webhook: Invalid or missing product: "${product}"`);
    return { success: false, error: `Invalid product: ${product}` };
  }

  // Validate email before saving purchase
  const emailResult = await validateEmail(userEmail, { checkMX: false, checkDisposable: false });
  if (!emailResult.valid) {
    console.warn(`Webhook: Invalid email: "${userEmail}"`);
    return { success: false, error: `Invalid email: ${emailResult.error}` };
  }

  if (payment.status !== 'captured') {
    console.warn(`Webhook: Payment not captured. Status: ${payment.status}`);
    return { success: false, error: `Status: ${payment.status}` };
  }

  // Extract user_id from payment notes (set by client during Razorpay checkout)
  const supabaseUserId = payment.notes?.supabase_user_id || null;

  try {
    const supabase = await createServerSupabase();
    await supabase.rpc('add_purchase', {
      p_email: sanitizeEmail(userEmail),
      p_product: product,
      p_transaction_id: payment.id,
      p_payment_id: payment.id,
      p_amount: payment.amount || 0,
      p_user_id: supabaseUserId,
    });

    console.log(`Webhook: Purchase saved — ${userEmail} — ${product} — ${payment.id} (user_id: ${supabaseUserId})`);
    return { success: true };
  } catch (dbError) {
    console.error('Webhook: Failed to save purchase:', dbError);
    return { success: false, error: 'Database error' };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error('Webhook: Invalid signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the event payload
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const eventType = event.event || '';

    console.log(`Webhook: Received event — ${eventType}`);

    // Handle different event types
    switch (eventType) {
      case 'payment.captured':
        const result = await handlePaymentCaptured(event);
        if (!result.success) {
          console.warn(`Webhook: payment.captured handler failed:`, result.error);
        }
        break;

      case 'payment.failed':
        console.warn(`Webhook: Payment failed — ${event.payload?.payment?.entity?.id || 'unknown'}`);
        break;

      default:
        console.log(`Webhook: Unhandled event — ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
