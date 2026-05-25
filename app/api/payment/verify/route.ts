/**
 * API Route: Verify Razorpay Payment
 * POST /api/payment/verify
 * Verifies payment signature and updates access status
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature, fetchPaymentDetails } from '@/lib/razorpay';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const { orderId, paymentId, signature, product } = await request.json();

        // Validate required fields
        if (!orderId || !paymentId || !signature || !product) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: orderId, paymentId, signature, product' },
                { status: 400 }
            );
        }

        // Validate product type
        if (!['part1', 'part2'].includes(product)) {
            return NextResponse.json(
                { success: false, error: 'Invalid product type' },
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
                // Call the add_purchase function via RPC
                await supabase.rpc('add_purchase', {
                    p_email: userEmail.toLowerCase().trim(),
                    p_product: product,
                    p_transaction_id: paymentId,
                    p_payment_id: paymentId,
                    p_amount: payment.amount || 0,
                });

                console.log(`Purchase saved to Supabase: ${userEmail} - ${product}`);
            }
        } catch (dbError) {
            // Log but don't fail the request — localStorage fallback still works
            console.error('Failed to save purchase to Supabase:', dbError);
        }

        // Return success with transaction details
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
