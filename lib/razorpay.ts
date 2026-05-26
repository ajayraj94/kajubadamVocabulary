/**
 * Razorpay payment gateway utilities
 * Handles order creation, payment verification, and signature validation
 * NOTE: This module is server-side only. Do not import in client components.
 *
 * Uses dynamic product config from lib/products.ts
 */

import Razorpay from 'razorpay';
import { getProductPricePaise, getProductReceiptName, PRODUCT_IDS } from './products';

// Product pricing configuration (in paise) — dynamically derived
export const PRODUCT_PRICES: Record<string, number> = {};
export const PRODUCT_NAMES: Record<string, string> = {};

// Populate dynamically from all configured products
for (const id of PRODUCT_IDS) {
  PRODUCT_PRICES[id] = getProductPricePaise(id);
  PRODUCT_NAMES[id] = getProductReceiptName(id);
}

// Lazy Razorpay instance
function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

/**
 * Create a Razorpay order for a product
 * @param product - product ID (from lib/products.ts)
 * @param userEmail - User's email for the order
 */
export async function createRazorpayOrder(product: string, userEmail: string) {
  const amount = PRODUCT_PRICES[product];
  if (!amount) {
    return { success: false, error: `Invalid product: ${product}` };
  }

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
      amount: amount / 100,
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
