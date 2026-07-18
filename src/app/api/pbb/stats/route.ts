import { NextRequest, NextResponse } from "next/server";
import { requireRole, unwrapSession, getAssignedBlok } from "@/lib/auth/guards";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["pamong_pajak", "kepala_desa"]);
  if ("error" in auth) return auth.error;

  try {
    const currentYear = new Date().getFullYear();
    const session = unwrapSession(auth);
    const assignedBlok =
      session?.user?.role === "pamong_pajak"
        ? await getAssignedBlok(auth)
        : null;

    const fieldFilter = assignedBlok ? { blok: assignedBlok } : {};
    let totalFields: number;
    let paidCount: number;

    if (assignedBlok) {
      const fieldIds = (
        await prisma.fields.findMany({
          where: { blok: assignedBlok },
          select: { id: true },
        })
      ).map((f) => f.id);

      [totalFields, paidCount] = await Promise.all([
        prisma.fields.count({ where: fieldFilter }),
        prisma.payments.count({
          where: {
            year: currentYear,
            status: "lunas",
            fieldId: { in: fieldIds },
          },
        }),
      ]);
    } else {
      [totalFields, paidCount] = await Promise.all([
        prisma.fields.count(),
        prisma.payments.count({
          where: { year: currentYear, status: "lunas" },
        }),
      ]);
    }

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
