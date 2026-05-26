/**
 * API Route: Create Razorpay Order
 * POST /api/payment/create-order
 * Creates a new Razorpay order for product purchase
 *
 * Uses dynamic product validation from lib/products.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';
import { PRODUCT_IDS } from '@/lib/products';

export async function POST(request: NextRequest) {
    try {
        const { product, email } = await request.json();

        // ⭐ Dynamic product validation — works with any product in lib/products.ts!
        if (!PRODUCT_IDS.includes(product)) {
            return NextResponse.json(
                { success: false, error: `Invalid product type. Valid: ${PRODUCT_IDS.join(", ")}` },
                { status: 400 }
            );
        }

        // Validate email
        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { success: false, error: 'Valid email is required' },
                { status: 400 }
            );
        }

        // Create Razorpay order
        const result = await createRazorpayOrder(product, email);

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
