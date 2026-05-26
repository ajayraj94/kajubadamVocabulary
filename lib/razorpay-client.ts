/**
 * Razorpay client-side utilities
 * Safe to import in client components
 */

// Product pricing configuration (in INR) - using public env vars
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

/**
 * Get Razorpay client-side configuration
 * @returns Configuration object for client-side Razorpay initialization
 */
export function getRazorpayConfig() {
    return {
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
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
