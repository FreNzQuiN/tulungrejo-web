import { NextRequest, NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/auth/session";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

export async function POST(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  // Only clear session if one exists — prevents CSRF-based logout
  const session = await getSession();
  if (session) {
    await clearSession();
  }
  return NextResponse.json({ success: true });
}
