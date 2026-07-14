import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { fetchAllCitizenViews } from "@/lib/pbb-queries";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["pamong_pajak"]);
  if ("error" in auth) return auth.error;

  try {
    const citizens = await fetchAllCitizenViews();
    return NextResponse.json(citizens);
  } catch (err) {
    console.error("PBB list error:", err);
    return NextResponse.json(
      { error: "Gagal memuat data warga" },
      { status: 500 },
    );
  }
}
