/**
 * API Route: Create Razorpay Order
 * POST /api/payment/create-order
 * Creates a new Razorpay order for product purchase
 *
 * Security:
 *   - Dynamic product validation from lib/products.ts
 *   - Full email validation with MX record + disposable check
 *   - Rate limited to 10 requests/minute per IP
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';
import { PRODUCT_IDS } from '@/lib/products';
import { validateEmail } from '@/lib/email-validator';
import { limiters } from '@/lib/rate-limiter';
import { sanitizeEmail } from '@/lib/input-validator';

export async function POST(request: NextRequest) {
    try {
        const { product, email } = await request.json();

        // ── Rate limiting ──
        const ip = limiters.payment.getIdentifier(request);
        const rateCheck = limiters.payment.check(ip);
        if (rateCheck.blocked) {
            return NextResponse.json(
                { success: false, error: rateCheck.error },
                { status: 429 }
            );
        }

        // ⭐ Dynamic product validation
        if (!PRODUCT_IDS.includes(product)) {
            return NextResponse.json(
                { success: false, error: `Invalid product type. Valid: ${PRODUCT_IDS.join(", ")}` },
                { status: 400 }
            );
        }

        // ── Full email validation (format + MX + disposable check) ──
        const emailResult = await validateEmail(email);
        if (!emailResult.valid) {
            return NextResponse.json(
                { success: false, error: emailResult.error },
                { status: 400 }
            );
        }

        const sanitizedEmail = sanitizeEmail(email);

        // Create Razorpay order
        const result = await createRazorpayOrder(product, sanitizedEmail);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            order: result.order,
            key_id: result.key_id,
            product_name: result.product_name,
            amount: result.amount,
        });
    } catch (error: any) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
