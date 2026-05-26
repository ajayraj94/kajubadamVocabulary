/**
 * Razorpay payment gateway utilities
 * Handles order creation, payment verification, and signature validation
 * NOTE: This module is server-side only. Do not import in client components.
 */

import Razorpay from 'razorpay';

// Product pricing configuration (in INR)
export const PRODUCT_PRICES = {
    part1: parseInt(process.env.NEXT_PUBLIC_PART1_PRICE || '299') * 100, // Convert to paise
    part2: parseInt(process.env.NEXT_PUBLIC_PART2_PRICE || '399') * 100, // Convert to paise
    errorDetection: parseInt(process.env.NEXT_PUBLIC_ERROR_DETECTION_PRICE || '110') * 100, // Convert to paise
} as const;

// Product names for Razorpay receipts
export const PRODUCT_NAMES = {
    part1: 'Kajubadam Vocabulary - Part 1 Lifetime Access',
    part2: 'Kajubadam Vocabulary - Part 2 Lifetime Access',
    errorDetection: 'SSC Error Detection 716 PYQ - Lifetime Access',
} as const;

// Lazy Razorpay instance — initialized only when first used (not at import/build time)
function getRazorpay() {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
}

/**
 * Create a Razorpay order for a product
 * @param product - 'part1' or 'part2' or 'errorDetection'
 * @param userEmail - User's email for the order
 * @returns Razorpay order object
 */
export async function createRazorpayOrder(product: 'part1' | 'part2' | 'errorDetection', userEmail: string) {
    const amount = PRODUCT_PRICES[product];
    const receipt = `order_${product}_${Date.now()}`;
    const notes = {
        product,
        email: userEmail,
        app: 'kajubadam-vocabulary',
    };

    try {
        const order = await getRazorpay().orders.create({
            amount,
            currency: 'INR',
            receipt,
            notes,
            partial_payment: false,
        });

        return {
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID!,
            product_name: PRODUCT_NAMES[product],
            amount: amount / 100, // Convert back to INR for display
        };
    } catch (error: any) {
        console.error('Error creating Razorpay order:', error);
        return {
            success: false,
            error: error.error?.description || 'Failed to create order',
        };
    }
}

/**
 * Verify Razorpay payment signature
 * @param orderId - Razorpay order ID
 * @param paymentId - Razorpay payment ID
 * @param signature - Razorpay signature
 * @returns Boolean indicating if signature is valid
 */
export function verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    return expectedSignature === signature;
}

/**
 * Fetch payment details from Razorpay
 * @param paymentId - Razorpay payment ID
 * @returns Payment details object
 */
export async function fetchPaymentDetails(paymentId: string) {
    try {
        const payment = await getRazorpay().payments.fetch(paymentId);
        return { success: true, payment };
    } catch (error: any) {
        console.error('Error fetching payment details:', error);
        return {
            success: false,
            error: error.error?.description || 'Failed to fetch payment details',
        };
    }
}

/**
 * Get Razorpay client-side configuration
 * @returns Configuration object for client-side Razorpay initialization
 */
export function getRazorpayConfig() {
    return {
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID!,
        currency: 'INR',
        prefill: {
            email: '',
            contact: '',
        },
        theme: {
            color: '#3b82f6', // Blue theme
        },
    };
}

/**
 * Get product price in INR (for display)
 * @param product - 'part1' or 'part2' or 'errorDetection'
 * @returns Price in INR
 */
export function getProductPriceInINR(product: 'part1' | 'part2' | 'errorDetection'): number {
    return PRODUCT_PRICES[product] / 100;
}
