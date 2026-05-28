/**
 * API Route: Verify admin password
 * POST /api/admin/verify
 *
 * Simple password-based admin authentication.
 * The password is stored in the ADMIN_PASSWORD env var.
 *
 * Security:
 *   - Rate limited to 20 requests/minute per IP
 *   - IP blocked after 10 failed attempts within 15 minutes
 *   - No hardcoded password fallback
 */
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TOKEN, isIpRateLimited, tooManyRequests } from "@/lib/admin-auth";
import { limiters } from "@/lib/rate-limiter";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.warn(
    "⚠️ ADMIN_PASSWORD not set! Admin verify route will reject all requests. " +
    "Set ADMIN_PASSWORD in your .env.local file."
  );
}

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting per IP ──
    const ip = limiters.strict.getIdentifier(request);
    const rateCheck = limiters.strict.check(ip);
    if (rateCheck.blocked) {
      return NextResponse.json(
        { success: false, error: rateCheck.error },
        { status: 429 }
      );
    }

    // ── IP rate limiting (failed attempts) ──
    if (isIpRateLimited(request)) {
      return tooManyRequests();
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      token: ADMIN_TOKEN,
    });
  } catch (error: any) {
    console.error("Error verifying admin password:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
