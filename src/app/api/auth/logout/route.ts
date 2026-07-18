import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

export async function POST(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  await clearSession();
  return NextResponse.json({ success: true });
}
