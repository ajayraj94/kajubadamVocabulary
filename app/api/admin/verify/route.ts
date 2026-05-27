/**
 * API Route: Verify admin password
 * POST /api/admin/verify
 *
 * Simple password-based admin authentication.
 * The password is stored in the ADMIN_PASSWORD env var.
 * On success, returns a session token (stored in sessionStorage).
 */
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TOKEN } from "@/lib/admin-auth";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1om@13494";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
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
