/**
 * Hook for Razorpay payment integration
 * Handles loading Razorpay script, creating orders, and processing payments
 */

import { useState, useEffect, useCallback } from 'react';
import { PRODUCT_PRICES, PRODUCT_NAMES, getRazorpayConfig } from '@/lib/razorpay-client';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    status: string;
}

interface PaymentResult {
    success: boolean;
    paymentId?: string;
    orderId?: string;
    signature?: string;
    error?: string;
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
    const createOrder = useCallback(async (product: 'part1' | 'part2', email: string) => {
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
        product: 'part1' | 'part2'
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
        async (product: 'part1' | 'part2', email: string, onSuccess: (product: string, transactionId: string) => void) => {
            if (!razorpayLoaded) {
                setError('Razorpay is still loading. Please wait...');
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Create order
                const orderData = await createOrder(product, email);

                const options = {
                    key: orderData.key_id,
                    amount: orderData.order.amount,
                    currency: 'INR',
                    name: PRODUCT_NAMES[product],
                    description: `Purchase ${product.toUpperCase()} Access`,
                    order_id: orderData.order.id,
                    handler: async function (response: any) {
                        try {
                            // Verify payment
                            const verification = await verifyPayment(
                                response.razorpay_order_id,
                                response.razorpay_payment_id,
                                response.razorpay_signature,
                                product
                            );

                            if (verification.success) {
                                // Pass transaction ID to callback for persistent storage
                                onSuccess(product, response.razorpay_payment_id);
                            }
                        } catch (err) {
                            setError('Payment verification failed');
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
