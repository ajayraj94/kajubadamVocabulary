/**
 * Central Product Configuration
 * ────────────────────────────
 * Add a new product here and EVERYTHING will work automatically:
 *   - Admin panel shows it in dropdown, stats, badges
 *   - API routes validate it dynamically
 *   - Test account creation grants it
 *   - Pricing picks up from NEXT_PUBLIC_{ID}_PRICE env var
 *
 * To add a new product:
 *   1. Add an entry in PRODUCTS below
 *   2. Add NEXT_PUBLIC_{ID}_PRICE to .env.local
 *   3. Create the actual content/tab for it on the homepage
 */

export interface ProductConfig {
  id: string;
  /** Display label (price is auto-filled from env) */
  label: string;
  /** Default price in INR (used if no env var set) */
  defaultPrice: number;
  /** CSS color theme */
  color: "blue" | "orange" | "red" | "green" | "purple" | "amber" | "teal" | "rose" | "indigo";
  /** Optional description */
  description?: string;
  /** Env var key for price (auto-generated from id if not set) */
  priceEnvKey?: string;
  /**
   * Optional custom localStorage key for backward compatibility.
   * If not set, auto-generated from id: `kv_{id}_purchased`.
   * Set this when renaming a product to keep existing users' access.
   */
  storageKey?: string;
  /**
   * Optional custom localStorage key for transaction ID.
   * If not set, auto-generated from id: `kv_{id}_transaction_id`.
   */
  txStorageKey?: string;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  orange: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
  red: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
  green: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  purple: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
  amber: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" },
  teal: { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-200" },
  rose: { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-200" },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
};

/**
 * All purchasable products.
 * Add new products here — the admin panel, API validation,
 * test account creation all use this list dynamically.
 */
export const PRODUCTS: Record<string, ProductConfig> = {
  part1: {
    id: "part1",
    label: "Part 1 — ₹299",
    defaultPrice: 299,
    color: "blue",
    description: "Core Vocabulary Essentials",
  },
  part2: {
    id: "part2",
    label: "Part 2 — ₹399",
    defaultPrice: 399,
    color: "orange",
    description: "Story-Based Vocabulary",
  },
  errorDetection: {
    id: "errorDetection",
    label: "Error Detection — ₹110",
    defaultPrice: 110,
    color: "red",
    description: "SSC Error Detection 716 PYQ",
    // Legacy storage key — uses underscore format (backward compatible)
    storageKey: "kv_error_detection_purchased",
    txStorageKey: "kv_error_detection_transaction_id",
  },
  sentenceImprovement: {
    id: "sentenceImprovement",
    label: "Sentence Improvement — ₹110",
    defaultPrice: 110,
    color: "teal",
    description: "SSC Sentence Improvement 790 PYQ",
    storageKey: "kv_sentence_improvement_purchased",
    txStorageKey: "kv_sentence_improvement_transaction_id",
  },
  bundle: {
    id: "bundle",
    label: "Bundle (Part 1 + Part 2) — ₹549",
    defaultPrice: 549,
    color: "purple",
    description: "Complete Bundle: Part 1 + Part 2",
  },
};

/** Array of all product IDs for iteration. */
export const PRODUCT_IDS = Object.keys(PRODUCTS);

/** Get product config by ID. */
export function getProduct(id: string): ProductConfig | undefined {
  return PRODUCTS[id];
}

/** Get product price from env var or default. */
export function getProductPrice(id: string): number {
  const product = getProduct(id);
  if (!product) return 0;
  const envKey = product.priceEnvKey || `NEXT_PUBLIC_${id.toUpperCase()}_PRICE`;
  if (typeof process !== "undefined") {
    const envPrice = process.env[envKey];
    if (envPrice) return parseInt(envPrice, 10);
  }
  return product.defaultPrice;
}

/** Get product price in paise (for Razorpay). */
export function getProductPricePaise(id: string): number {
  return getProductPrice(id) * 100;
}

/** Get product display label with current price. */
export function getProductLabel(id: string): string {
  const product = getProduct(id);
  if (!product) return id;
  const price = getProductPrice(id);
  return product.label.replace(/₹\d+/, `₹${price}`);
}

/** Get Tailwind CSS classes for a product badge. */
export function getProductBadgeClasses(id: string): string {
  const product = getProduct(id);
  if (!product) return "bg-gray-100 text-gray-800";
  return `${COLOR_MAP[product.color]?.bg || "bg-gray-100"} ${COLOR_MAP[product.color]?.text || "text-gray-800"}`;
}

/** Get product name for Razorpay receipt. */
export function getProductReceiptName(id: string): string {
  const names: Record<string, string> = {
    part1: "Kajubadam Vocabulary - Part 1 Lifetime Access",
    part2: "Kajubadam Vocabulary - Part 2 Lifetime Access",
    errorDetection: "SSC Error Detection 716 PYQ - Lifetime Access",
    sentenceImprovement: "SSC Sentence Improvement 790 PYQ - Lifetime Access",
    bundle: "Kajubadam Vocabulary - Complete Bundle (Part 1 + Part 2)",
  };
  return names[id] || `Kajubadam - ${id} Access`;
}

/** Get localStorage key for a product's purchased status. */
export function getProductStorageKey(id: string): string {
  const product = getProduct(id);
  if (product?.storageKey) return product.storageKey;
  return `kv_${id}_purchased`;
}

/** Get localStorage key for a product's transaction ID. */
export function getProductTxStorageKey(id: string): string {
  const product = getProduct(id);
  if (product?.txStorageKey) return product.txStorageKey;
  return `kv_${id}_transaction_id`;
}
