/**
 * Access control utilities for Kajubadam Vocabulary paywall.
 * 
 * Now uses Google OAuth via Supabase Auth for user identity.
 * Session is managed via Supabase SSR cookies (not localStorage).
 * Purchase access is stored in localStorage for fast offline checks,
 * and verified against Supabase transactions table on app load.
 * 
 * Free stories (always accessible):
 * - Part 1: Saga 1-01 "shadows-of-the-forsaken"
 * - Part 2: Saga 2-01 "the-fall-of-a-kingdom"
 * 
 * Products are DYNAMIC — defined in lib/products.ts.
 */

import { PRODUCTS, PRODUCT_IDS, getProductStorageKey, getProductTxStorageKey } from "./products";

// ── Version check (bumps on deploy to purge stale localStorage) ──
export const KV_VERSION = "3"; // Bumped for Google auth migration
const KV_VERSION_KEY = "kv_version";

const STORAGE_KEYS = {
  userEmail: "kv_user_email",
  userName: "kv_user_name",
  userAvatar: "kv_user_avatar",
} as const;

/**
 * Purge all stored access data when version mismatch is detected.
 */
function purgeIfVersionMismatch(): void {
  if (typeof window === "undefined") return;
  const storedVersion = localStorage.getItem(KV_VERSION_KEY);
  if (storedVersion === KV_VERSION) return;

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("kv_")) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
  localStorage.setItem(KV_VERSION_KEY, KV_VERSION);
}

// Free story slugs
export const FREE_SLUGS = {
  part1: "shadows-of-the-forsaken",
  part2: "the-fall-of-a-kingdom",
} as const;

/** Returns true if the given slug is always free to access. */
export function isStoryFree(slug: string): boolean {
  return slug === FREE_SLUGS.part1 || slug === FREE_SLUGS.part2;
}

// ═══════════════════════════════════════════════
// DYNAMIC ACCESS FUNCTIONS (using product config)
// ═══════════════════════════════════════════════

/** Check if user has purchased a specific product (localStorage). */
export function hasAccess(productId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getProductStorageKey(productId)) === "true";
}

/** Set purchase status for a product. Also stores transaction ID for recovery. */
export function setAccess(productId: string, value: boolean, transactionId?: string): void {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(getProductStorageKey(productId), "true");
    if (transactionId) {
      localStorage.setItem(getProductTxStorageKey(productId), transactionId);
    }
  } else {
    localStorage.removeItem(getProductStorageKey(productId));
    localStorage.removeItem(getProductTxStorageKey(productId));
  }
}

/** Get transaction ID for a product (for recovery). */
export function getTransactionId(productId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(getProductTxStorageKey(productId));
}

/** Get all purchased product IDs. */
export function getPurchasedProducts(): string[] {
  return PRODUCT_IDS.filter((id) => hasAccess(id));
}

// ═══════════════════════════════════════════════
// LEGACY ACCESS FUNCTIONS (backward compatible)
// ═══════════════════════════════════════════════

export function hasPart1Access(): boolean { return hasAccess("part1"); }
export function hasPart2Access(): boolean { return hasAccess("part2"); }
export function hasErrorDetectionAccess(): boolean { return hasAccess("errorDetection"); }
export function hasSentenceImprovementAccess(): boolean { return hasAccess("sentenceImprovement"); }

export function getPart1TransactionId(): string | null { return getTransactionId("part1"); }
export function getPart2TransactionId(): string | null { return getTransactionId("part2"); }
export function getErrorDetectionTransactionId(): string | null { return getTransactionId("errorDetection"); }
export function getSentenceImprovementTransactionId(): string | null { return getTransactionId("sentenceImprovement"); }

export function setPart1Purchased(value: boolean, transactionId?: string): void { setAccess("part1", value, transactionId); }
export function setPart2Purchased(value: boolean, transactionId?: string): void { setAccess("part2", value, transactionId); }
export function setErrorDetectionPurchased(value: boolean, transactionId?: string): void { setAccess("errorDetection", value, transactionId); }
export function setSentenceImprovementPurchased(value: boolean, transactionId?: string): void { setAccess("sentenceImprovement", value, transactionId); }

/** Check if a user can access a story. */
export function canAccessStory(slug: string, vocabPart: string): boolean {
  if (isStoryFree(slug)) return true;
  if (vocabPart === "part 1") return hasPart1Access();
  if (vocabPart === "part 2") return hasPart2Access();
  return false;
}

/**
 * Recovery function: Check if user has valid transactions stored
 * and restore access if needed. Call on app load.
 */
export function restoreAccessFromTransactions(): void {
  if (typeof window === "undefined") return;
  purgeIfVersionMismatch();
  for (const id of PRODUCT_IDS) {
    if (!hasAccess(id)) {
      const txId = getTransactionId(id);
      if (txId) {
        localStorage.setItem(getProductStorageKey(id), "true");
      }
    }
  }
}

// ═══════════════════════════════════════════════
// PAYMENT VERIFICATION RECOVERY
// ═══════════════════════════════════════════════

const FAILED_VERIFICATION_KEY = "kv_failed_verifications";

interface FailedVerification {
  orderId: string;
  paymentId: string;
  signature: string;
  product: string;
  email: string;
  timestamp: number;
}

export function storeFailedVerification(
  orderId: string,
  paymentId: string,
  signature: string,
  product: string,
  email: string = ''
): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getFailedVerifications();
    if (existing.some((v) => v.paymentId === paymentId)) return;
    existing.push({ orderId, paymentId, signature, product, email, timestamp: Date.now() });
    localStorage.setItem(FAILED_VERIFICATION_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("Failed to store verification data:", e);
  }
}

export function getFailedVerifications(): FailedVerification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAILED_VERIFICATION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function removeFailedVerification(paymentId: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getFailedVerifications().filter((v) => v.paymentId !== paymentId);
    localStorage.setItem(FAILED_VERIFICATION_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("Failed to remove verification data:", e);
  }
}

export function clearOldFailedVerifications(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): void {
  if (typeof window === "undefined") return;
  try {
    const cutoff = Date.now() - maxAgeMs;
    const remaining = getFailedVerifications().filter((v) => v.timestamp > cutoff);
    localStorage.setItem(FAILED_VERIFICATION_KEY, JSON.stringify(remaining));
  } catch (e) {
    console.error("Failed to clear old verifications:", e);
  }
}

// ═══════════════════════════════════════════════
// GOOGLE AUTH STATE (stored in localStorage for fast UI checks)
// ═══════════════════════════════════════════════

/** Store user info after successful Google login. */
export function storeUserInfo(email: string, name?: string, avatar?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.userEmail, email);
  if (name) localStorage.setItem(STORAGE_KEYS.userName, name);
  if (avatar) localStorage.setItem(STORAGE_KEYS.userAvatar, avatar);
}

/** Get the stored user email. */
export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.userEmail);
}

/** Get the stored user display name. */
export function getUserName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.userName);
}

/** Get the stored user avatar URL. */
export function getUserAvatar(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.userAvatar);
}

/** Is the user logged in via Google? (checks localStorage) */
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(STORAGE_KEYS.userEmail);
}

/** Clear all user data including purchase access on logout. */
export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.userEmail);
  localStorage.removeItem(STORAGE_KEYS.userName);
  localStorage.removeItem(STORAGE_KEYS.userAvatar);
  // Clear all purchase data — server is the source of truth.
  // Purchases will be restored from Supabase on next login via syncPurchasesFromServer().
  for (const id of PRODUCT_IDS) {
    setAccess(id, false);
  }
}
