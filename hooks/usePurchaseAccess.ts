"use client";

import { useState, useEffect } from "react";
import {
  hasPart1Access,
  hasPart2Access,
  setPart1Purchased,
  setPart2Purchased,
  restoreAccessFromTransactions,
  isLoggedIn,
  getUserEmail,
  setUserEmail,
  logout,
} from "@/lib/access";
import { useRazorpay } from "./useRazorpay";

interface PurchaseAccess {
  hasPart1: boolean;
  hasPart2: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
  userEmail: string | null;
  unlockPart1: (email?: string) => Promise<void>;
  unlockPart2: (email?: string) => Promise<void>;
  unlockBundle: (email?: string) => Promise<void>;
  paymentError: string | null;
  clearPaymentError: () => void;
  loginAfterPurchase: (email: string, products: string[]) => void;
  logoutUser: () => void;
}

/**
 * Hook that reads purchase access state from localStorage.
 * isLoading = true during SSR/hydration (localStorage not available server-side).
 * Now integrated with Razorpay for real payments.
 *
 * Access Recovery: If user clears cache, transaction IDs are stored separately
 * and can be used to restore access via restoreAccessFromTransactions().
 */
export function usePurchaseAccess(): PurchaseAccess {
  const [hasPart1, setHasPart1] = useState(false);
  const [hasPart2, setHasPart2] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmailState] = useState<string | null>(null);

  const { openRazorpayCheckout, error: razorpayError } = useRazorpay();

  useEffect(() => {
    // Try to restore access from transaction IDs first
    restoreAccessFromTransactions();

    // Then set the state from localStorage
    setHasPart1(hasPart1Access());
    setHasPart2(hasPart2Access());
    setLoggedIn(isLoggedIn());
    setUserEmailState(getUserEmail());
    setIsLoading(false);
  }, []);

  // Sync Razorpay errors
  useEffect(() => {
    if (razorpayError) {
      setPaymentError(razorpayError);
    }
  }, [razorpayError]);

  const unlockPart1 = async (email?: string) => {
    if (!email) {
      // For backward compatibility, simulate purchase
      setPart1Purchased(true);
      setHasPart1(true);
      return;
    }

    try {
      await openRazorpayCheckout('part1', email, (product, transactionId) => {
        if (product === 'part1') {
          // Store with transaction ID for recovery
          setPart1Purchased(true, transactionId);
          setHasPart1(true);
        }
      });
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to process payment');
    }
  };

  const unlockPart2 = async (email?: string) => {
    if (!email) {
      // For backward compatibility, simulate purchase
      setPart2Purchased(true);
      setHasPart2(true);
      return;
    }

    try {
      await openRazorpayCheckout('part2', email, (product, transactionId) => {
        if (product === 'part2') {
          // Store with transaction ID for recovery
          setPart2Purchased(true, transactionId);
          setHasPart2(true);
        }
      });
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to process payment');
    }
  };

  const unlockBundle = async (email?: string) => {
    if (!email) {
      // For backward compatibility, simulate purchase
      setPart1Purchased(true);
      setPart2Purchased(true);
      setHasPart1(true);
      setHasPart2(true);
      return;
    }

    try {
      // Process Part 1 payment first
      await openRazorpayCheckout('part1', email, (product, transactionId) => {
        if (product === 'part1') {
          setPart1Purchased(true, transactionId);
          setHasPart1(true);
          // Then process Part 2 payment
          openRazorpayCheckout('part2', email, (product, transactionId) => {
            if (product === 'part2') {
              setPart2Purchased(true, transactionId);
              setHasPart2(true);
            }
          });
        }
      });
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to process bundle payment');
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

    if (products.includes('part1')) {
      setPart1Purchased(true);
      setHasPart1(true);
    }
    if (products.includes('part2')) {
      setPart2Purchased(true);
      setHasPart2(true);
    }
  };

  const logoutUser = () => {
    logout();
    setLoggedIn(false);
    setUserEmailState(null);
  };

  return {
    hasPart1,
    hasPart2,
    isLoading,
    isLoggedIn: loggedIn,
    userEmail,
    unlockPart1,
    unlockPart2,
    unlockBundle,
    paymentError,
    clearPaymentError,
    loginAfterPurchase,
    logoutUser,
  };
}
