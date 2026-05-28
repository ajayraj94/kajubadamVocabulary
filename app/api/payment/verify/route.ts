/**
 * API Route: Verify Razorpay Payment
 * POST /api/payment/verify
 * Verifies payment signature and updates access status
 *
 * Security:
 *   - Dynamic product validation from lib/products.ts
 *   - Payment signature verification
 *   - Rate limited to 10 requests/minute per IP
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature, fetchPaymentDetails } from '@/lib/razorpay';
import { createServerSupabase } from '@/lib/supabase-server';
import { PRODUCT_IDS } from '@/lib/products';
import { limiters } from '@/lib/rate-limiter';
import { sanitizeEmail, isValidPaymentId, isValidOrderId } from '@/lib/input-validator';

export async function POST(request: NextRequest) {
    try {
        const { orderId, paymentId, signature, product } = await request.json();

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
        if (!orderId || !paymentId || !signature || !product) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: orderId, paymentId, signature, product' },
                { status: 400 }
            );
        }

        // Validate ID formats
        if (!isValidOrderId(orderId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid order ID format' },
                { status: 400 }
            );
        }

        if (!isValidPaymentId(paymentId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid payment ID format' },
                { status: 400 }
            );
        }

        // ⭐ Dynamic product validation
        if (!PRODUCT_IDS.includes(product)) {
            return NextResponse.json(
                { success: false, error: `Invalid product type. Valid: ${PRODUCT_IDS.join(", ")}` },
                { status: 400 }
            );
        }

        // Verify payment signature
        const isValidSignature = verifyPaymentSignature(orderId, paymentId, signature);

        if (!isValidSignature) {
            return NextResponse.json(
                { success: false, error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Fetch payment details for additional validation
        const paymentResult = await fetchPaymentDetails(paymentId);

        if (!paymentResult.success || !paymentResult.payment) {
            return NextResponse.json(
                { success: false, error: 'Failed to verify payment details' },
                { status: 500 }
            );
        }

        const payment = paymentResult.payment;

        // Check if payment was successful
        if (payment.status !== 'captured') {
            return NextResponse.json(
                { success: false, error: `Payment not captured. Status: ${payment.status}` },
                { status: 400 }
            );
        }

        // Save purchase to Supabase
        try {
            const supabase = await createServerSupabase();
            const userEmail = payment.notes?.email || payment.email || '';

            if (userEmail) {
                await supabase.rpc('add_purchase', {
                    p_email: sanitizeEmail(userEmail),
                    p_product: product,
                    p_transaction_id: paymentId,
                    p_payment_id: paymentId,
                    p_amount: payment.amount || 0,
                });

                console.log(`Purchase saved to Supabase: ${userEmail} - ${product}`);
            }
        } catch (dbError) {
            // Log but don't fail — localStorage fallback still works
            console.error('Failed to save purchase to Supabase:', dbError);
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
            product,
            paymentId,
            orderId,
            transactionId: paymentId,
        });
    } catch (error: any) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
