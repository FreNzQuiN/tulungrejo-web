import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { fetchPbbStats } from "@/lib/pbb-queries";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["pamong_pajak", "kepala_desa"]);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const year = Number(searchParams.get("year")) || now.getFullYear();
  const month = Number(searchParams.get("month")) || now.getMonth() + 1;

  try {
    const result = await fetchPbbStats(year, month);
    return NextResponse.json(result);
  } catch (err) {
    console.error("PBB stats error:", err);
    return NextResponse.json(
      { error: "Gagal memuat statistik PBB" },
      { status: 500 },
    );
  }
}
