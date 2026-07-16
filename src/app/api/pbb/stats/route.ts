import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { prisma } from "@/lib/prisma";

const CURRENT_YEAR = new Date().getFullYear();

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["pamong_pajak", "kepala_desa"]);
  if ("error" in auth) return auth.error;

  try {
    const [totalFields, paidCount] = await Promise.all([
      prisma.fields.count(),
      prisma.payments.count({
        where: { year: CURRENT_YEAR, status: "lunas" },
      }),
    ]);

    const unpaidCount = totalFields - paidCount;
    const percentage =
      totalFields > 0 ? Math.round((paidCount / totalFields) * 10000) / 100 : 0;

    return NextResponse.json({
      totalFields,
      paid: paidCount,
      unpaid: unpaidCount,
      percentage,
    });
  } catch (err) {
    console.error("PBB stats error:", err);
    return NextResponse.json(
      { error: "Gagal memuat statistik." },
      { status: 500 },
    );
  }
}
