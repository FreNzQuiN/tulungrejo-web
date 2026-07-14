import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { fetchPlotsByBlok } from "@/lib/pbb-queries";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["pamong_pajak"]);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const blok = searchParams.get("blok");
  const limit = Number(searchParams.get("limit")) || 50;

  if (!blok) {
    return NextResponse.json(
      { error: "Parameter 'blok' wajib diisi" },
      { status: 400 },
    );
  }

  try {
    const result = await fetchPlotsByBlok({ blok, limit });
    return NextResponse.json(result);
  } catch (err) {
    console.error("PBB plots error:", err);
    return NextResponse.json(
      { error: "Gagal memuat data plot PBB" },
      { status: 500 },
    );
  }
}
