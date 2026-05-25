/**
 * Access control utilities for the Kajubadam Vocabulary paywall.
 * 
 * Free stories (always accessible):
 * - Part 1: Saga 1-01 "shadows-of-the-forsaken"
 * - Part 2: Saga 2-01 "the-fall-of-a-kingdom"
 * 
 * Purchase status is stored in localStorage (UI-only lock for now).
 * For production, implement database-backed storage.
 * 
 * Recovery mechanism: If user clears cache, they lose access.
 * Solution: Store purchase data in database with user identification.
 */

// Storage keys for access status
const STORAGE_KEYS = {
  part1: "kv_part1_purchased",
  part2: "kv_part2_purchased",
  userId: "kv_user_id",
  userEmail: "kv_user_email",
  supabaseSession: "kv_supabase_session",
  part1Transaction: "kv_part1_transaction_id",
  part2Transaction: "kv_part2_transaction_id",
} as const;

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

/** Check if user has purchased Part 1 access (localStorage). */
export function hasPart1Access(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.part1) === "true";
}

/** Check if user has purchased Part 2 access (localStorage). */
export function hasPart2Access(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.part2) === "true";
}

/**
 * Get transaction ID for Part 1 purchase
 * Can be used to verify with Razorpay API if access is lost
 */
export function getPart1TransactionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.part1Transaction);
}

/**
 * Get transaction ID for Part 2 purchase
 * Can be used to verify with Razorpay API if access is lost
 */
export function getPart2TransactionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.part2Transaction);
}

/**
 * Simulate Part 1 purchase (UI-only). Call this after real payment success.
 * Also stores transaction ID for recovery.
 */
export function setPart1Purchased(value: boolean, transactionId?: string): void {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(STORAGE_KEYS.part1, "true");
    if (transactionId) {
      localStorage.setItem(STORAGE_KEYS.part1Transaction, transactionId);
    }
  } else {
    localStorage.removeItem(STORAGE_KEYS.part1);
    localStorage.removeItem(STORAGE_KEYS.part1Transaction);
  }
}

/**
 * Simulate Part 2 purchase (UI-only). Call this after real payment success.
 * Also stores transaction ID for recovery.
 */
export function setPart2Purchased(value: boolean, transactionId?: string): void {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(STORAGE_KEYS.part2, "true");
    if (transactionId) {
      localStorage.setItem(STORAGE_KEYS.part2Transaction, transactionId);
    }
  } else {
    localStorage.removeItem(STORAGE_KEYS.part2);
    localStorage.removeItem(STORAGE_KEYS.part2Transaction);
  }
}

/**
 * Check if a user can access a story.
 * @param slug - The story's slug
 * @param vocabPart - "part 1" or "part 2"
 */
export function canAccessStory(slug: string, vocabPart: string): boolean {
  if (isStoryFree(slug)) return true;
  if (vocabPart === "part 1") return hasPart1Access();
  if (vocabPart === "part 2") return hasPart2Access();
  return false;
}

/**
 * Recovery function: Check if user has valid transactions stored
 * and restore access if needed. This should be called on app load.
 */
export function restoreAccessFromTransactions(): void {
  if (typeof window === "undefined") return;

  // If access is already set, no need to restore
  if (hasPart1Access() && hasPart2Access()) return;

  // Check for transaction IDs and restore access
  const part1Tx = localStorage.getItem(STORAGE_KEYS.part1Transaction);
  const part2Tx = localStorage.getItem(STORAGE_KEYS.part2Transaction);

  if (part1Tx && !hasPart1Access()) {
    // User had Part 1 access before, restore it
    localStorage.setItem(STORAGE_KEYS.part1, "true");
  }

  if (part2Tx && !hasPart2Access()) {
    // User had Part 2 access before, restore it
    localStorage.setItem(STORAGE_KEYS.part2, "true");
  }
}

/**
 * Supabase-based access functions
 */

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

/**
 * Is the user logged in via Supabase?
 * Checks for stored session token and user email.
 */
export function isLoggedIn(): boolean {
  return hasSupabaseSession() && !!getUserEmail();
}

/**
 * Logout: clear Supabase session and user data.
 * Note: localStorage purchase data is preserved so user doesn't lose
 * access in the current browser until they clear data.
 */
export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.supabaseSession);
  localStorage.removeItem(STORAGE_KEYS.userEmail);
}

/**
 * Export storage keys for reference
 */
export { STORAGE_KEYS };
