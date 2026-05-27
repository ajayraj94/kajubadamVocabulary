/**
 * Middleware to prevent browser caching of HTML pages.
 *
 * Problem: Safari (especially on iPad) aggressively caches static HTML.
 * When the site is deployed with paywalled blocks, users who visited before
 * may see the old cached (unlocked) version.
 *
 * Solution: Set Cache-Control headers so HTML pages are NEVER cached
 * by the browser, while allowing caching of static assets (JS/CSS/images).
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow caching of static assets (they have content hashes in filenames)
  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/fonts") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/images/")
  ) {
    return NextResponse.next();
  }

  // For all HTML pages — prevent browser caching
  const response = NextResponse.next();

  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

export const config = {
  matcher: [
    // Match all request paths except static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
