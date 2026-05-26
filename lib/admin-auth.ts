/**
 * Shared admin authentication utilities
 * Used by all /api/admin/* routes to verify the admin token.
 */
import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

/**
 * The admin token is derived from the password.
 * It's sent by the client in the x-admin-token header.
 */
export const ADMIN_TOKEN = `admin_${Buffer.from(ADMIN_PASSWORD).toString("base64").slice(0, 16)}`;

/** Check if a request's x-admin-token header matches the expected token. */
export function isAuthorized(request: NextRequest): boolean {
  const token = request.headers.get("x-admin-token");
  return token === ADMIN_TOKEN;
}

/** Return a standard 401 Unauthorized response. */
export function unauthorized() {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}
