"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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

  if (status === "loading") {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );

  if (error)
    return (
      <div className="glass-panel p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );

  if (!data) return null;

  return (
    <div className="space-y-8">
      <div className="page-header mb-8">
        <h1>Dashboard Analitik & Realisasi PBB</h1>
        <p>
          Otoritas Kepala Desa: Analisis real-time penerimaan Pajak Bumi &
          Bangunan serta penyelesaian surat ketetapan pajak
        </p>
      </div>

      <StatCards overallStats={data.overallStats} />
      <PieCharts overallStats={data.overallStats} />
      <DusunTable blokStats={data.blokStats} />
    </div>
  );
}
