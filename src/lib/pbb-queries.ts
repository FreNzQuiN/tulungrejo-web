import { prisma } from "./prisma";
import type { PBBStats, BlokStats, MonthlyTrend, CitizenView } from "./types";

interface PbbStatsResult {
  overallStats: PBBStats;
  blokStats: BlokStats[];
  monthlyTrend: MonthlyTrend[];
  topBlok: BlokStats[];
  bottomBlok: BlokStats[];
}

export async function fetchPbbStats(
  year: number,
  month: number,
): Promise<PbbStatsResult> {
  const [totalPlots, paidPlots, targetAggregate] = await Promise.all([
    prisma.landPlot.count(),
    prisma.payment.groupBy({
      by: ["landPlotId"],
      where: { year, month, status: "lunas" },
    }),
    prisma.landPlot.aggregate({ _sum: { pbbAmount: true } }),
  ]);

  const totalPaid = paidPlots.length;
  const totalUnpaid = totalPlots - totalPaid;
  const percentage = totalPlots > 0 ? (totalPaid / totalPlots) * 100 : 0;

  const totalTarget = Number(targetAggregate._sum.pbbAmount ?? 0);

  const paidPlotIds = paidPlots.map((r) => r.landPlotId);
  const realizationAggregate =
    paidPlotIds.length > 0
      ? await prisma.landPlot.aggregate({
          _sum: { pbbAmount: true },
          where: { id: { in: paidPlotIds } },
        })
      : { _sum: { pbbAmount: null } };

  const totalRealization = Number(realizationAggregate._sum.pbbAmount ?? 0);

  const blokCounts = await prisma.landPlot.groupBy({
    by: ["blok"],
    _count: { id: true },
  });

  const paidPlotIdSet = new Set(paidPlotIds);

  const allPlots = await prisma.landPlot.findMany({
    select: { id: true, blok: true },
  });

  const blokPaidMap = new Map<string, number>();
  for (const plot of allPlots) {
    if (paidPlotIdSet.has(plot.id)) {
      blokPaidMap.set(plot.blok, (blokPaidMap.get(plot.blok) ?? 0) + 1);
    }
  }

  const blokStatsWithPaid: BlokStats[] = blokCounts.map((b) => {
    const paidCount = blokPaidMap.get(b.blok) ?? 0;
    return {
      blok: b.blok,
      totalPlots: b._count.id,
      paid: paidCount,
      unpaid: b._count.id - paidCount,
      percentage: b._count.id > 0 ? (paidCount / b._count.id) * 100 : 0,
    };
  });

  const monthlyAgg = await prisma.payment.groupBy({
    by: ["month"],
    where: { year, status: "lunas" },
    _count: { landPlotId: true },
  });

  const monthlyPaidMap = new Map(
    monthlyAgg.map((m) => [m.month, m._count.landPlotId]),
  );

  const monthlyTrend: MonthlyTrend[] = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const paidCount = monthlyPaidMap.get(m) ?? 0;
    return {
      month: String(m),
      paid: paidCount,
      unpaid: totalPlots - paidCount,
      percentage: totalPlots > 0 ? (paidCount / totalPlots) * 100 : 0,
    };
  });

  return {
    overallStats: {
      totalPlots,
      totalPaid,
      totalUnpaid,
      percentage,
      totalTarget,
      totalRealization,
    },
    blokStats: blokStatsWithPaid,
    monthlyTrend,
    topBlok: [...blokStatsWithPaid]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5),
    bottomBlok: [...blokStatsWithPaid]
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 5),
  };
}

interface PlotQueryOptions {
  blok: string;
  limit?: number;
}

export async function fetchPlotsByBlok({ blok, limit = 20 }: PlotQueryOptions) {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  const [plots, total] = await Promise.all([
    prisma.landPlot.findMany({
      where: { blok },
      include: {
        payments: {
          where: { year, month },
          select: { status: true },
        },
      },
      take: limit,
      orderBy: { nop: "asc" },
    }),
    prisma.landPlot.count({ where: { blok } }),
  ]);

  return {
    data: plots.map((p) => ({
      id: p.id,
      nop: p.nop,
      ownerName: p.ownerName,
      address: p.address,
      blok: p.blok,
      pbbAmount: p.pbbAmount ? Number(p.pbbAmount) : null,
      currentStatus: p.payments[0]?.status ?? "belum_lunas",
    })),
    meta: { total, page: 1, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function fetchAllCitizenViews(): Promise<CitizenView[]> {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  const plots = await prisma.landPlot.findMany({
    include: {
      payments: {
        where: { year, month },
        select: { status: true },
      },
    },
    orderBy: { blok: "asc" },
  });

  return plots.map((p) => ({
    id: p.id,
    name: p.ownerName,
    dusun: p.blok,
    lat: p.latitude ?? 0,
    lng: p.longitude ?? 0,
    nominal: p.pbbAmount ? Number(p.pbbAmount) : 0,
    sppt: p.nop,
    status: p.payments[0]?.status === "lunas" ? "Sudah Bayar" : "Belum Bayar",
  }));
}
