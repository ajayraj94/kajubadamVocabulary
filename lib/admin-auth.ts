/**
 * Shared admin authentication utilities
 * Used by all /api/admin/* routes to verify the admin token.
 *
 * 🔐 SECURITY NOTES:
 * - ADMIN_PASSWORD MUST be set in .env.local — no fallback password in code!
 * - Token is derived from a deterministic hash of the password
 * - All failed admin authentication attempts are logged for audit
 */
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// 🚨 No fallback password in code! Must be set via environment variable.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_TOKEN_SALT = process.env.ADMIN_TOKEN_SALT || "kajubadam-admin-v1";

if (!ADMIN_PASSWORD) {
  console.warn(
    "⚠️ ADMIN_PASSWORD not set! Admin panel will be inaccessible. " +
    "Set ADMIN_PASSWORD in your .env.local file."
  );
}

/**
 * Deterministic admin token derived from password + salt.
 * This ensures the token is stable across server restarts/deploys.
 */
export const ADMIN_TOKEN = ADMIN_PASSWORD
  ? `admin_${crypto.createHash("sha256").update(ADMIN_PASSWORD + ADMIN_TOKEN_SALT).digest("hex").slice(0, 16)}`
  : "";

/** Simple in-memory store for IP-based rate limiting on admin attempts */
const adminAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 10;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check if a request's x-admin-token header matches the expected token.
 * Also tracks IP for rate limiting.
 */
export function isAuthorized(request: NextRequest): boolean {
  const token = request.headers.get("x-admin-token");
  const ip = getClientIp(request);

  // Track the attempt for rate limiting
  trackAttempt(ip, token === ADMIN_TOKEN);

  return token === ADMIN_TOKEN;
}

/** Extract client IP from request headers. */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/** Track admin login attempts for rate limiting and audit logging. */
function trackAttempt(ip: string, success: boolean): void {
  const now = Date.now();

  if (!success) {
    const attempt = adminAttempts.get(ip) || { count: 0, lastAttempt: now };

    // Reset if outside window
    if (now - attempt.lastAttempt > ATTEMPT_WINDOW_MS) {
      attempt.count = 0;
    }

    attempt.count++;
    attempt.lastAttempt = now;
    adminAttempts.set(ip, attempt);

    console.warn(
      `[ADMIN-AUTH] Failed attempt from IP: ${ip} (` +
      `${attempt.count}/${MAX_ATTEMPTS} attempts in ${ATTEMPT_WINDOW_MS / 60000}min)`
    );
  } else {
    // On success, reset counter if below threshold
    const attempt = adminAttempts.get(ip);
    if (attempt && attempt.count < MAX_ATTEMPTS) {
      adminAttempts.delete(ip);
    }
  }
}

/**
 * Check if an IP has been rate-limited due to too many failed attempts.
 */
export function isIpRateLimited(request: NextRequest): boolean {
  const ip = getClientIp(request);

  const attempt = adminAttempts.get(ip);
  if (!attempt) return false;

  const now = Date.now();
  if (now - attempt.lastAttempt > ATTEMPT_WINDOW_MS) {
    adminAttempts.delete(ip);
    return false;
  }

  return attempt.count >= MAX_ATTEMPTS;
}

/** Check if admin password is configured. */
export function isAdminConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

/** Return a standard 401 Unauthorized response. */
export function unauthorized() {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}

/** Return a 429 Too Many Requests response. */
export function tooManyRequests() {
  return NextResponse.json(
    { success: false, error: "Too many failed attempts. Access temporarily blocked." },
    { status: 429 }
  );
}
