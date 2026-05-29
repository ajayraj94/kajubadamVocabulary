/**
 * Rate Limiter Utility
 * ────────────────────
 * Simple in-memory rate limiter for Next.js API routes.
 *
 * NOTE: On Vercel serverless, each instance has its own memory.
 * For production at scale, replace with Upstash Rate Limit or Arcjet.
 *
 * Usage:
 *   import { rateLimiter } from "@/lib/rate-limiter";
 *
 *   const limiter = rateLimiter({ windowMs: 60000, maxRequests: 10 });
 *   const result = limiter.check(request);
 *   if (result.blocked) {
 *     return NextResponse.json({ error: result.error }, { status: 429 });
 *   }
 */

interface RateLimiterOptions {
  /** Time window in milliseconds (default: 60000 = 1 minute) */
  windowMs?: number;
  /** Max requests per window (default: 20) */
  maxRequests?: number;
}

interface RateLimitResult {
  blocked: boolean;
  remaining: number;
  resetIn: number;
  error?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Store per-IP counters
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
  lastCleanup = now;
}

/**
 * Create a rate limiter instance.
 */
export function rateLimiter(options: RateLimiterOptions = {}) {
  const { windowMs = 60000, maxRequests = 20 } = options;

  return {
    /**
     * Check if a request should be rate limited.
     * @param identifier - A unique identifier (IP address, email, API key, etc.)
     */
    check(identifier: string): RateLimitResult {
      if (!identifier) {
        return { blocked: false, remaining: maxRequests, resetIn: 0 };
      }

      const now = Date.now();
      const key = `${identifier}:${Math.floor(now / windowMs)}`;

      // Periodic cleanup
      cleanupStaleEntries();

      let entry = rateLimitStore.get(key);

      if (!entry || now >= entry.resetAt) {
        entry = { count: 0, resetAt: now + windowMs };
        rateLimitStore.set(key, entry);
      }

      entry.count++;

      const remaining = Math.max(0, maxRequests - entry.count);
      const resetIn = entry.resetAt - now;

      if (entry.count > maxRequests) {
        return {
          blocked: true,
          remaining: 0,
          resetIn,
          error: `Too many requests. Please try again in ${Math.ceil(resetIn / 1000)} seconds.`,
        };
      }

      return { blocked: false, remaining, resetIn };
    },

    /**
     * Get the identifier from a request (IP address).
     * Handles various proxy headers for Vercel/Cloudflare.
     */
    getIdentifier(request: Request | { headers: Headers }): string {
      const forwarded = request.headers.get("x-forwarded-for");
      const realIp = request.headers.get("x-real-ip");
      const cfConnectingIp = request.headers.get("cf-connecting-ip");

      // Try various proxy headers, then fall back to a generic identifier
      const ip =
        cfConnectingIp ||
        forwarded?.split(",")[0]?.trim() ||
        realIp ||
        "unknown";

      return ip;
    },

    /** Get current stats for monitoring */
    getStats() {
      return {
        totalEntries: rateLimitStore.size,
        windowMs,
        maxRequests,
      };
    },
  };
}

/**
 * Pre-configured limiters for different API routes.
 */
export const limiters = {
  /** Payment routes: 10 requests per minute (order creation, verification) */
  payment: rateLimiter({ windowMs: 60000, maxRequests: 10 }),

  /** Admin routes: 20 requests per minute */
  admin: rateLimiter({ windowMs: 60000, maxRequests: 20 }),

  /** General API: 30 requests per minute */
  general: rateLimiter({ windowMs: 60000, maxRequests: 30 }),

  /** Strict: 3 requests per minute (for sensitive operations) */
  strict: rateLimiter({ windowMs: 60000, maxRequests: 3 }),
};

export type RateLimiterInstance = ReturnType<typeof rateLimiter>;
