/**
 * Access control utilities for the Kajubadam Vocabulary paywall.
 * 
 * Free stories (always accessible):
 * - Part 1: Saga 1-01 "shadows-of-the-forsaken"
 * - Part 2: Saga 2-01 "the-fall-of-a-kingdom"
 * 
 * Products are now DYNAMIC — defined in lib/products.ts.
 * New products work automatically without code changes.
 */

import { PRODUCTS, PRODUCT_IDS, getProductStorageKey, getProductTxStorageKey } from "./products";

// ── Version check (bumps on deploy to purge stale localStorage) ──
export const KV_VERSION = "2"; // Increment this when paywall/lock logic changes
const KV_VERSION_KEY = "kv_version";

// Storage keys
const STORAGE_KEYS = {
  userId: "kv_user_id",
  userEmail: "kv_user_email",
  supabaseSession: "kv_supabase_session",
} as const;

/**
 * Purge all stored access data when version mismatch is detected.
 * This ensures anyone who visited BEFORE the paywall was locked
 * doesn't retain stale unlocked state in localStorage.
 */
function purgeIfVersionMismatch(): void {
  if (typeof window === "undefined") return;

  const storedVersion = localStorage.getItem(KV_VERSION_KEY);
  if (storedVersion === KV_VERSION) return; // Same version, nothing to do

  // Version mismatch — clear ALL kv_* keys
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

  // Set new version
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

/**
 * Generate a simple user identifier based on browser fingerprint
 * This helps recover access if localStorage is cleared but cookies remain
 */
function getUserId(): string {
  if (typeof window === "undefined") return "";

  // Try to get existing user ID
  const existingId = localStorage.getItem(STORAGE_KEYS.userId);
  if (existingId) return existingId;

  // Generate new user ID based on browser fingerprint
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
  ].join("|");

  // Create hash of fingerprint
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const userId = `user_${Math.abs(hash).toString(36)}`;
  localStorage.setItem(STORAGE_KEYS.userId, userId);
  return userId;
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
// These still work — but new code should use hasAccess()/setAccess()
// ═══════════════════════════════════════════════

/** Check if user has purchased Part 1 access. */
export function hasPart1Access(): boolean {
  return hasAccess("part1");
}

/** Check if user has purchased Part 2 access. */
export function hasPart2Access(): boolean {
  return hasAccess("part2");
}

/** Check if user has purchased Error Detection access. */
export function hasErrorDetectionAccess(): boolean {
  return hasAccess("errorDetection");
}

/** Get transaction ID for Part 1. */
export function getPart1TransactionId(): string | null {
  return getTransactionId("part1");
}

/** Get transaction ID for Part 2. */
export function getPart2TransactionId(): string | null {
  return getTransactionId("part2");
}

/** Get transaction ID for Error Detection. */
export function getErrorDetectionTransactionId(): string | null {
  return getTransactionId("errorDetection");
}

/** Set Part 1 purchase status. */
export function setPart1Purchased(value: boolean, transactionId?: string): void {
  setAccess("part1", value, transactionId);
}

/** Set Part 2 purchase status. */
export function setPart2Purchased(value: boolean, transactionId?: string): void {
  setAccess("part2", value, transactionId);
}

/** Set Error Detection purchase status. */
export function setErrorDetectionPurchased(value: boolean, transactionId?: string): void {
  setAccess("errorDetection", value, transactionId);
}

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

  // On every app load, check version and purge stale data if needed
  purgeIfVersionMismatch();

  // Restore access from stored transaction IDs
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
// SUPABASE SESSION FUNCTIONS
// ═══════════════════════════════════════════════

/** Check if user has a valid Supabase session stored. */
export function hasSupabaseSession(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(STORAGE_KEYS.supabaseSession);
}

/** Get the stored user email (set after login). */
export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.userEmail);
}

/** Store user email after successful login. */
export function setUserEmail(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.userEmail, email);
}

/** Is the user logged in via Supabase? */
export function isLoggedIn(): boolean {
  return hasSupabaseSession() && !!getUserEmail();
}

/** Logout: clear session and user data. */
export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.supabaseSession);
  localStorage.removeItem(STORAGE_KEYS.userEmail);
}
