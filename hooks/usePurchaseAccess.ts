"use client";

import { useState, useEffect } from "react";
import {
  hasAccess,
  setAccess,
  restoreAccessFromTransactions,
  isLoggedIn,
  getUserEmail,
  setUserEmail,
  logout,
} from "@/lib/access";
import { useRazorpay } from "./useRazorpay";
import {
  getFailedVerifications,
  removeFailedVerification,
  clearOldFailedVerifications,
} from "@/lib/access";


interface PurchaseAccess {
  hasPart1: boolean;
  hasPart2: boolean;
  hasErrorDetection: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
  userEmail: string | null;
  unlockPart1: (email?: string, onSuccess?: (product: string) => void) => Promise<void>;
  unlockPart2: (email?: string, onSuccess?: (product: string) => void) => Promise<void>;
  unlockBundle: (email?: string, onSuccess?: (product: string) => void) => Promise<void>;
  unlockErrorDetection: (email?: string, onSuccess?: (product: string) => void) => Promise<void>;
  paymentError: string | null;
  clearPaymentError: () => void;
  loginAfterPurchase: (email: string, products: string[]) => void;
  logoutUser: () => void;
}

/**
 * Hook that reads purchase access state from localStorage.
 * Products are now DYNAMIC — defined in lib/products.ts.
 * New products work automatically.
 */
export function usePurchaseAccess(): PurchaseAccess {
  const [hasPart1, setHasPart1] = useState(false);
  const [hasPart2, setHasPart2] = useState(false);
  const [hasErrorDetection, setHasErrorDetection] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmailState] = useState<string | null>(null);

  const { openRazorpayCheckout, error: razorpayError } = useRazorpay();

  useEffect(() => {
    restoreAccessFromTransactions();

    setHasPart1(hasAccess("part1"));
    setHasPart2(hasAccess("part2"));
    setHasErrorDetection(hasAccess("errorDetection"));

    setLoggedIn(isLoggedIn());
    setUserEmailState(getUserEmail());
    setIsLoading(false);

    // ── Recover any failed payment verifications ──
    recoverFailedVerifications();
  }, []);

  /** Try to re-verify any payments that failed during initial verification. */
  const recoverFailedVerifications = async () => {
    const failed = getFailedVerifications();
    if (failed.length === 0) return;

    // Clear old entries (older than 7 days)
    clearOldFailedVerifications();

    for (const item of getFailedVerifications()) {
      try {
        // Use the dedicated recovery endpoint which uses admin client to save to DB
        const res = await fetch("/api/payment/recover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: item.paymentId,
            product: item.product,
            email: item.email,
          }),
        });
        const data = await res.json();
        if (data.success) {
          console.log(`Recovered DB save for ${item.product}: ${item.paymentId}`);
          removeFailedVerification(item.paymentId);
        }
      } catch (e) {
        console.warn(`Failed to recover purchase for ${item.paymentId}:`, e);
      }
    }
  };

  // Sync Razorpay errors
  useEffect(() => {
    if (razorpayError) {
      setPaymentError(razorpayError);
    }
  }, [razorpayError]);

  const unlockPart1 = async (email?: string, onSuccess?: (product: string) => void) => {
    if (!email) {
      setAccess("part1", true);
      setHasPart1(true);
      onSuccess?.('part1');
      return;
    }

    try {
      await openRazorpayCheckout('part1', email, (product, transactionId) => {
        if (product === 'part1') {
          setAccess("part1", true, transactionId);
          setHasPart1(true);
          onSuccess?.('part1');
        }
      });
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to process payment');
    }
  };

  const unlockPart2 = async (email?: string, onSuccess?: (product: string) => void) => {
    if (!email) {
      setAccess("part2", true);
      setHasPart2(true);
      onSuccess?.('part2');
      return;
    }

    try {
      await openRazorpayCheckout('part2', email, (product, transactionId) => {
        if (product === 'part2') {
          setAccess("part2", true, transactionId);
          setHasPart2(true);
          onSuccess?.('part2');
        }
      });
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to process payment');
    }
  };

  const unlockBundle = async (email?: string, onSuccess?: (product: string) => void) => {
    if (!email) {
      setAccess("part1", true);
      setAccess("part2", true);
      setHasPart1(true);
      setHasPart2(true);
      onSuccess?.('part1');
      onSuccess?.('part2');
      return;
    }

    try {
      await openRazorpayCheckout('bundle', email, (product, transactionId) => {
        if (product === 'bundle') {
          // Bundle payment successful — grant access to BOTH Part 1 and Part 2
          setAccess("part1", true, transactionId);
          setAccess("part2", true, transactionId);
          setHasPart1(true);
          setHasPart2(true);
          onSuccess?.('part1');
          onSuccess?.('part2');
        }
      });
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to process bundle payment');
    }
  };

  const unlockErrorDetection = async (email?: string, onSuccess?: (product: string) => void) => {
    if (!email) {
      setAccess("errorDetection", true);
      setHasErrorDetection(true);
      onSuccess?.('errorDetection');
      return;
    }

    try {
      await openRazorpayCheckout('errorDetection', email, (product, transactionId) => {
        if (product === 'errorDetection') {
          setAccess("errorDetection", true, transactionId);
          setHasErrorDetection(true);
          onSuccess?.('errorDetection');
        }
      });
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to process payment');
    }
  };

  const clearPaymentError = () => {
    setPaymentError(null);
  };

  /** Called after successful Supabase OTP login to restore purchases */
  const loginAfterPurchase = (email: string, products: string[]) => {
    setUserEmail(email);
    setLoggedIn(true);
    setUserEmailState(email);

    for (const id of products) {
      setAccess(id, true);
    }

    if (products.includes('part1')) setHasPart1(true);
    if (products.includes('part2')) setHasPart2(true);
    if (products.includes('errorDetection')) setHasErrorDetection(true);
  };

  const logoutUser = () => {
    logout();
    setLoggedIn(false);
    setUserEmailState(null);
  };

  return {
    hasPart1,
    hasPart2,
    hasErrorDetection,
    isLoading,
    isLoggedIn: loggedIn,
    userEmail,
    unlockPart1,
    unlockPart2,
    unlockBundle,
    unlockErrorDetection,
    paymentError,
    clearPaymentError,
    loginAfterPurchase,
    logoutUser,
  };
}
