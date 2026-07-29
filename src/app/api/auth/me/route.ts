import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Cross-check DB role + tokenVersion to avoid ghost sessions
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, tokenVersion: true },
    });
    if (
      !dbUser ||
      dbUser.role !== session.user.role ||
      (dbUser.tokenVersion ?? 0) !== (session.user.tokenVersion ?? 0)
    ) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user: session.user });
  } catch (err) {
    console.error("Session fetch error:", err);
    return NextResponse.json(
      { error: "Gagal memuat sesi pengguna" },
      { status: 500 },
    );
  }
}
