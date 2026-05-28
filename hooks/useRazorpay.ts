/**
 * Hook for Razorpay payment integration
 * Handles loading Razorpay script, creating orders, and processing payments
 */

import { useState, useEffect, useCallback } from 'react';
import { PRODUCT_PRICES, PRODUCT_NAMES, getRazorpayConfig } from '@/lib/razorpay-client';
import { PRODUCT_IDS } from '@/lib/products';
import { storeFailedVerification } from '@/lib/access';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export type ProductType = (typeof PRODUCT_IDS)[number];

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => setError('Failed to load Razorpay script');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  /**
   * Create an order via API
   */
  const createOrder = useCallback(async (product: ProductType, email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product, email }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      setIsLoading(false);
      return data;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Failed to create order');
      throw err;
    }
  }, []);

  /**
   * Verify payment via API
   */
  const verifyPayment = useCallback(async (
    orderId: string,
    paymentId: string,
    signature: string,
    product: ProductType
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, paymentId, signature, product }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Payment verification failed');
      }

      setIsLoading(false);
      return data;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Payment verification failed');
      throw err;
    }
  }, []);

  /**
   * Open Razorpay checkout popup
   */
  const openRazorpayCheckout = useCallback(
    async (product: ProductType, email: string, onSuccess: (product: string, transactionId: string) => void) => {
      if (!razorpayLoaded) {
        setError('Razorpay is still loading. Please wait...');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const orderData = await createOrder(product, email);

        const options = {
          key: orderData.key_id,
          amount: orderData.order.amount,
          currency: 'INR',
          name: PRODUCT_NAMES[product],
          description: `Purchase ${product.toUpperCase()} Access`,
          order_id: orderData.order.id,
          handler: async function (response: any) {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;

            // Retry verification up to 3 times with exponential backoff
            let verification = null;
            for (let attempt = 0; attempt < 3; attempt++) {
              try {
                verification = await verifyPayment(
                  razorpay_order_id,
                  razorpay_payment_id,
                  razorpay_signature,
                  product
                );
                if (verification?.success) break;
              } catch (e) {
                if (attempt < 2) {
                  await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
                }
              }
            }

            if (verification?.success) {
              // Verification successful — grant access
              onSuccess(product, razorpay_payment_id);
            } else {
              // Payment was captured by Razorpay but verify API failed.
              // Still grant access locally so user isn't blocked.
              // Store payment info for recovery via webhook.
              storeFailedVerification(
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                product
              );
              onSuccess(product, razorpay_payment_id);
            }
          },
          prefill: {
            email: email,
          },
          notes: {
            product: product,
            app: 'kajubadam-vocabulary',
          },
          theme: {
            color: '#3b82f6',
          },
          modal: {
            ondismiss: function () {
              setIsLoading(false);
              setError('Payment was cancelled');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || 'Failed to open payment popup');
      }
    },
    [razorpayLoaded, createOrder, verifyPayment]
  );

  return {
    isLoading,
    error,
    razorpayLoaded,
    createOrder,
    verifyPayment,
    openRazorpayCheckout,
    clearError: () => setError(null),
  };
}
