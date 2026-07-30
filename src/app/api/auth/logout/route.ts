import { NextRequest, NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

export async function POST(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const session = await getSession();
  if (session) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { tokenVersion: { increment: 1 } },
    });
    await clearSession();
  }
  return NextResponse.json({ success: true });
}
