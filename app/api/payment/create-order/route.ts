/**
 * API Route: Create Razorpay Order
 * POST /api/payment/create-order
 * Creates a new Razorpay order for Part 1 or Part 2 purchase
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
    try {
        const { product, email } = await request.json();

        // Validate product type
        if (!['part1', 'part2'].includes(product)) {
            return NextResponse.json(
                { success: false, error: 'Invalid product type. Must be part1 or part2' },
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
        const result = await createRazorpayOrder(product as 'part1' | 'part2', email);

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
