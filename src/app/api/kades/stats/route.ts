import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { fetchPbbStats } from "@/lib/pbb-queries";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireRole(["kepala_desa"]);
  if ("error" in auth) return auth.error;

  const now = new Date();
  const year =
    Number(new URL(req.url).searchParams.get("year")) || now.getFullYear();
  const month =
    Number(new URL(req.url).searchParams.get("month")) || now.getMonth() + 1;

  try {
    const raw = await fetchPbbStats(year, month);

    // Per-blok nominal amounts
    const [blokSums, paidRecords] = await Promise.all([
      prisma.landPlot.groupBy({
        by: ["blok"],
        _sum: { pbbAmount: true },
      }),
      prisma.payment.findMany({
        where: { year, month, status: "lunas" },
        select: { landPlotId: true },
      }),
    ]);

    const paidIdSet = new Set(paidRecords.map((p) => p.landPlotId));
    const blokTotalMap = new Map(
      blokSums.map((b) => [b.blok, Number(b._sum.pbbAmount ?? 0)]),
    );

    // Paid nominal amount per blok
    const allPlotAmts = await prisma.landPlot.findMany({
      select: { id: true, blok: true, pbbAmount: true },
    });

    const blokPaidMap = new Map<string, number>();
    for (const p of allPlotAmts) {
      if (paidIdSet.has(p.id)) {
        const amt = Number(p.pbbAmount ?? 0);
        blokPaidMap.set(p.blok, (blokPaidMap.get(p.blok) ?? 0) + amt);
      }
    }

    // Transform to FE-facing field names
    const overallStats = {
      totalPlots: raw.overallStats.totalPlots,
      paidPlots: raw.overallStats.totalPaid,
      unpaidPlots: raw.overallStats.totalUnpaid,
      totalPbbAmount: raw.overallStats.totalTarget,
      totalPaidAmount: raw.overallStats.totalRealization,
      totalUnpaidAmount:
        raw.overallStats.totalTarget - raw.overallStats.totalRealization,
      realizationPercentage: raw.overallStats.percentage,
    };

    const blokStats = raw.blokStats.map((b) => {
      const totalPbb = blokTotalMap.get(b.blok) ?? 0;
      const totalPaid = blokPaidMap.get(b.blok) ?? 0;
      return {
        blok: b.blok,
        totalPlots: b.totalPlots,
        paidPlots: b.paid,
        unpaidPlots: b.unpaid,
        totalPbbAmount: totalPbb,
        totalPaidAmount: totalPaid,
        totalUnpaidAmount: totalPbb - totalPaid,
        realizationPercentage: b.percentage,
      };
    });

    return NextResponse.json({
      overallStats,
      blokStats,
      monthlyTrend: raw.monthlyTrend,
      topBlok: raw.topBlok,
      bottomBlok: raw.bottomBlok,
    });
  } catch (err) {
    console.error("Kades stats error:", err);
    return NextResponse.json(
      { error: "Gagal memuat statistik" },
      { status: 500 },
    );
  }
}
