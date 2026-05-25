/**
 * Access control utilities for the Kajubadam Vocabulary paywall.
 *
 * Free stories (always accessible):
 *   - Part 1: Saga 1-01 "shadows-of-the-forsaken"
 *   - Part 2: Saga 2-01 "the-fall-of-a-kingdom"
 *
 * Purchase status is stored in localStorage (UI-only lock for now).
 * Payment gateway will be integrated later.
 */

export const FREE_SLUGS = {
  part1: "shadows-of-the-forsaken",
  part2: "the-fall-of-a-kingdom",
} as const;

export const STORAGE_KEYS = {
  part1: "kv_part1_purchased",
  part2: "kv_part2_purchased",
} as const;

/** Returns true if the given slug is always free to access. */
export function isStoryFree(slug: string): boolean {
  return slug === FREE_SLUGS.part1 || slug === FREE_SLUGS.part2;
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

/** Simulate Part 1 purchase (UI-only). Call this after real payment success later. */
export function setPart1Purchased(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(STORAGE_KEYS.part1, "true");
  } else {
    localStorage.removeItem(STORAGE_KEYS.part1);
  }
}

/** Simulate Part 2 purchase (UI-only). Call this after real payment success later. */
export function setPart2Purchased(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(STORAGE_KEYS.part2, "true");
  } else {
    localStorage.removeItem(STORAGE_KEYS.part2);
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
