"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCards } from "@/components/kades/stat-cards";
import { PieCharts } from "@/components/kades/pie-charts";
import { DusunTable } from "@/components/kades/dusun-table";
import type { MonthlyTrend, BlokStats } from "@/lib/types";

interface KadesStatsResponse {
  overallStats: {
    totalPlots: number;
    paidPlots: number;
    unpaidPlots: number;
    totalPbbAmount: number;
    totalPaidAmount: number;
    totalUnpaidAmount: number;
    realizationPercentage: number;
  };
  blokStats: Array<{
    blok: string;
    totalPlots: number;
    paidPlots: number;
    unpaidPlots: number;
    totalPbbAmount: number;
    totalPaidAmount: number;
    totalUnpaidAmount: number;
    realizationPercentage: number;
  }>;
  monthlyTrend: MonthlyTrend[];
  topBlok: BlokStats[];
  bottomBlok: BlokStats[];
}

function KadesSkeleton() {
  return (
    <div>
      <div className="page-header mb-8">
        <div className="container">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
      </div>
      <div className="container">
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="glass-panel p-6">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-40" />
              </div>
              <Skeleton className="mb-2 h-8 w-44" />
              <Skeleton className="mb-5 h-2.5 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-44" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-panel p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="mb-3 h-6 w-32" />
                  <Skeleton className="mb-1 h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="charts-section">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="chart-card">
                <Skeleton className="mb-5 h-5 w-48 self-start" />
                <Skeleton className="h-[180px] w-[180px] rounded-full" />
                <div className="flex justify-center gap-5 mt-[15px]">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
          <div className="glass-panel p-6">
            <Skeleton className="mb-5 h-5 w-56" />
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    {[
                      "Wilayah",
                      "SPPT",
                      "Realisasi",
                      "Nominal",
                      "T nominal",
                      "Lunas",
                    ].map((_, i) => (
                      <th key={i}>
                        <Skeleton className="h-4 w-16" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j}>
                          <Skeleton className="h-4 w-14" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KadesDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<KadesStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (session?.user?.role !== "kepala_desa") return;

    fetch("/api/kades/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat data");
        return res.json();
      })
      .then((json: KadesStatsResponse) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session, status]);

  if (status === "loading" || loading) {
    return <KadesSkeleton />;
  }

  if (error)
    return (
      <div className="glass-panel p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );

  if (!data) return null;

  return (
    <div>
      <div className="page-header mb-8">
        <div className="container">
          <h1>Dashboard Analitik & Realisasi PBB</h1>
          <p>
            Otoritas Kepala Desa: Analisis real-time penerimaan Pajak Bumi &
            Bangunan serta penyelesaian surat ketetapan pajak
          </p>
        </div>
      </div>

      <div className="container">
        <div className="space-y-8">
          <StatCards overallStats={data.overallStats} />
          <PieCharts overallStats={data.overallStats} />
          <DusunTable blokStats={data.blokStats} />
        </div>
      </div>
    </div>
  );
}
