/**
 * Razorpay client-side utilities
 * Safe to import in client components
 *
 * Uses dynamic product config from lib/products.ts
 */

import { getProductPricePaise, getProductReceiptName, PRODUCT_IDS } from "./products";

// Product pricing configuration (in paise) — dynamically derived
export const PRODUCT_PRICES: Record<string, number> = {};

// Product names for Razorpay receipts
export const PRODUCT_NAMES: Record<string, string> = {};

// Populate dynamically from all configured products
for (const id of PRODUCT_IDS) {
  PRODUCT_PRICES[id] = getProductPricePaise(id);
  PRODUCT_NAMES[id] = getProductReceiptName(id);
}

/**
 * Get Razorpay client-side configuration
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
      color: '#3b82f6',
    },
  };
}

/**
 * Get product price in INR (for display)
 */
export function getProductPriceInINR(product: string): number {
  return getProductPricePaise(product) / 100;
}
