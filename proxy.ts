/**
 * Security & Caching Proxy
 * ─────────────────────────
 * 1. Prevents browser caching of HTML pages (Safari cache fix)
 * 2. Adds security headers: CSP, HSTS, X-Frame-Options, etc.
 * 3. Blocks access to old /admin route (moved to /iswebkaram)
 *
 * Replaces the deprecated middleware.ts convention.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Security headers applied to ALL responses ──
const SECURITY_HEADERS: Record<string, string> = {
  // HSTS — force HTTPS for 1 year (preload ready)
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

  // Block rendering in iframes (clickjacking protection)
  "X-Frame-Options": "DENY",

  // Prevent MIME-type sniffing
  "X-Content-Type-Options": "nosniff",

  // Enable browser XSS filter (legacy, but good defense-in-depth)
  "X-XSS-Protection": "1; mode=block",

  // Referrer policy — never send full URL to other origins
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions Policy — restrict browser features
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=(), " +
    "payment=(self), clipboard-write=(self), clipboard-read=()",

  // Content Security Policy
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.razorpay.com https://capi-automation.s3.us-east-2.amazonaws.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://accounts.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.razorpay.com",
    "img-src 'self' data: blob: https: https://*.razorpay.com https://connect.facebook.net https://*.googleusercontent.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.razorpay.com https://*.supabase.co https://www.google-analytics.com https://accounts.google.com",
    "frame-src 'self' https://*.razorpay.com https://*.supabase.co https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Block old /admin route — moved to /iswebkaram ──
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // Return 404 to hide admin path existence
    return new NextResponse(null, { status: 404, statusText: "Not Found" });
  }

  // ── Allow caching of static assets (they have content hashes) ──
  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/fonts") ||
    pathname === "/favicon.ico" ||
    pathname === "/favicon.svg" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/images/")
  ) {
    const response = NextResponse.next();
    // Apply security headers to static assets too
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(key, value);
    }
    return response;
  }

  // ── For all HTML pages & API routes — prevent caching + security headers ──
  const response = NextResponse.next();

  // Cache-Control: no cache for HTML pages, allow for API (with revalidation)
  if (pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  } else {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
  }
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  // Apply all security headers
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    // Match all request paths except static files with _next/static, _next/image, etc.
    "/((?!_next/static|_next/image|favicon.ico|favicon.svg|sitemap.xml|robots.txt).*)",
  ],
};
