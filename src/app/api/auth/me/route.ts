import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  try {
    const session = await getSession();
    if (!session) {
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
