"use client";

import { useState, useEffect, useCallback } from "react";
import {
  hasAccess,
  setAccess,
  restoreAccessFromTransactions,
  isLoggedIn,
  getUserEmail,
  logout,
} from "@/lib/access";
import {
  createClient,
  signInWithGoogle,
  signOut,
  getSession,
  syncUserInfo,
} from "@/lib/supabase";
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
  hasSentenceImprovement: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
  userEmail: string | null;
  userName: string | null;
  userAvatar: string | null;
  unlockPart1: (email?: string, onSuccess?: (product: string) => void) => Promise<void>;
  unlockPart2: (email?: string, onSuccess?: (product: string) => void) => Promise<void>;
  unlockBundle: (email?: string, onSuccess?: (product: string) => void) => Promise<void>;
  unlockErrorDetection: (email?: string, onSuccess?: (product: string) => void) => Promise<void>;
  unlockSentenceImprovement: (email?: string, onSuccess?: (product: string) => void) => Promise<void>;
  paymentError: string | null;
  clearPaymentError: () => void;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
  syncPurchasesFromServer: () => Promise<void>;
}

export function usePurchaseAccess(): PurchaseAccess {
  const [hasPart1, setHasPart1] = useState(false);
  const [hasPart2, setHasPart2] = useState(false);
  const [hasErrorDetection, setHasErrorDetection] = useState(false);
  const [hasSentenceImprovement, setHasSentenceImprovement] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmailState] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const { openRazorpayCheckout, error: razorpayError } = useRazorpay();

  /** Fetch purchases from Supabase by user_id and sync to localStorage */
  const syncPurchasesFromServer = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const user = session.user;
      syncUserInfo(session);
      setLoggedIn(true);
      setUserEmailState(user.email || null);
      setUserName(user.user_metadata?.full_name || user.user_metadata?.name || null);
      setUserAvatar(user.user_metadata?.avatar_url || user.user_metadata?.picture || null);

      // Fetch transactions for this user
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "captured");

      if (transactions && transactions.length > 0) {
        for (const tx of transactions) {
          if (tx.product === "bundle") {
            setAccess("part1", true, tx.transaction_id);
            setAccess("part2", true, tx.transaction_id);
          } else {
            setAccess(tx.product, true, tx.transaction_id);
          }
        }
      }
    } catch (e) {
      console.error("Failed to sync purchases from server:", e);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      restoreAccessFromTransactions();

      // Check local state first
      setHasPart1(hasAccess("part1"));
      setHasPart2(hasAccess("part2"));
      setHasErrorDetection(hasAccess("errorDetection"));
      setHasSentenceImprovement(hasAccess("sentenceImprovement"));
      setLoggedIn(isLoggedIn());
      setUserEmailState(getUserEmail());

      // Try to sync from server (Google auth)
      await syncPurchasesFromServer();

      // Re-read after server sync
      setHasPart1(hasAccess("part1"));
      setHasPart2(hasAccess("part2"));
      setHasErrorDetection(hasAccess("errorDetection"));
      setHasSentenceImprovement(hasAccess("sentenceImprovement"));

      // Recover any failed payment verifications
      recoverFailedVerifications();
      setIsLoading(false);
    };
    init();
  }, [syncPurchasesFromServer]);

  /** Try to re-verify any payments that failed during initial verification. */
  const recoverFailedVerifications = async () => {
    const failed = getFailedVerifications();
    if (failed.length === 0) return;
    clearOldFailedVerifications();
    for (const item of getFailedVerifications()) {
      try {
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

  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
      // OAuth redirects user away, then back to the page
    } catch (err: any) {
      setPaymentError(err.message || "Failed to sign in");
    }
  };

  const logoutUser = async () => {
    await signOut();
    setLoggedIn(false);
    setUserEmailState(null);
    setUserName(null);
    setUserAvatar(null);
  };

  const unlockPart1 = async (email?: string, onSuccess?: (product: string) => void) => {
    if (!email) {
      setAccess("part1", true);
      setHasPart1(true);
      onSuccess?.("part1");
      return;
    }
    try {
      await openRazorpayCheckout("part1", email, (product, transactionId) => {
        if (product === "part1") {
          setAccess("part1", true, transactionId);
          setHasPart1(true);
          onSuccess?.("part1");
          // Sync to server
          syncPurchasesFromServer();
        }
      });
    } catch (err: any) {
      setPaymentError(err.message || "Failed to process payment");
    }
  };

  const unlockPart2 = async (email?: string, onSuccess?: (product: string) => void) => {
    if (!email) {
      setAccess("part2", true);
      setHasPart2(true);
      onSuccess?.("part2");
      return;
    }
    try {
      await openRazorpayCheckout("part2", email, (product, transactionId) => {
        if (product === "part2") {
          setAccess("part2", true, transactionId);
          setHasPart2(true);
          onSuccess?.("part2");
          syncPurchasesFromServer();
        }
      });
    } catch (err: any) {
      setPaymentError(err.message || "Failed to process payment");
    }
  };

  const unlockBundle = async (email?: string, onSuccess?: (product: string) => void) => {
    if (!email) {
      setAccess("part1", true);
      setAccess("part2", true);
      setHasPart1(true);
      setHasPart2(true);
      onSuccess?.("part1");
      onSuccess?.("part2");
      return;
    }
    try {
      await openRazorpayCheckout("bundle", email, (product, transactionId) => {
        if (product === "bundle") {
          setAccess("part1", true, transactionId);
          setAccess("part2", true, transactionId);
          setHasPart1(true);
          setHasPart2(true);
          onSuccess?.("part1");
          onSuccess?.("part2");
          syncPurchasesFromServer();
        }
      });
    } catch (err: any) {
      setPaymentError(err.message || "Failed to process bundle payment");
    }
  };

  const unlockErrorDetection = async (email?: string, onSuccess?: (product: string) => void) => {
    if (!email) {
      setAccess("errorDetection", true);
      setHasErrorDetection(true);
      onSuccess?.("errorDetection");
      return;
    }
    try {
      await openRazorpayCheckout("errorDetection", email, (product, transactionId) => {
        if (product === "errorDetection") {
          setAccess("errorDetection", true, transactionId);
          setHasErrorDetection(true);
          onSuccess?.("errorDetection");
          syncPurchasesFromServer();
        }
      });
    } catch (err: any) {
      setPaymentError(err.message || "Failed to process payment");
    }
  };

  const unlockSentenceImprovement = async (email?: string, onSuccess?: (product: string) => void) => {
    if (!email) {
      setAccess("sentenceImprovement", true);
      setHasSentenceImprovement(true);
      onSuccess?.("sentenceImprovement");
      return;
    }
    try {
      await openRazorpayCheckout("sentenceImprovement", email, (product, transactionId) => {
        if (product === "sentenceImprovement") {
          setAccess("sentenceImprovement", true, transactionId);
          setHasSentenceImprovement(true);
          onSuccess?.("sentenceImprovement");
          syncPurchasesFromServer();
        }
      });
    } catch (err: any) {
      setPaymentError(err.message || "Failed to process payment");
    }
  };

  const clearPaymentError = () => setPaymentError(null);

  return {
    hasPart1,
    hasPart2,
    hasErrorDetection,
    hasSentenceImprovement,
    isLoading,
    isLoggedIn: loggedIn,
    userEmail,
    userName,
    userAvatar,
    unlockPart1,
    unlockPart2,
    unlockBundle,
    unlockErrorDetection,
    unlockSentenceImprovement,
    paymentError,
    clearPaymentError,
    loginWithGoogle,
    logoutUser,
    syncPurchasesFromServer,
  };
}
