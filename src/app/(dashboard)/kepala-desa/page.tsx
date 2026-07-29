"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import type { RealisasiView } from "@/lib/types";
import { AccessDenied } from "@/components/auth/access-denied";
import { RealisasiSummaryCard } from "@/components/kades/realisasi-summary-card";
import { StatCard } from "@/components/kades/stat-card";
import { getYearOptions, getCurrentTaxYear } from "@/lib/pbb-tax-year";
import { formatCurrency } from "@/lib/utils";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function CardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <Skeleton className="mb-2 h-6 w-56" />
        <Skeleton className="mb-5 h-8 w-44" />
        <Skeleton className="mb-1 h-2.5 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-44" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-panel p-5">
            <Skeleton className="mb-1 h-4 w-28" />
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
  );
}

export default function KadesDashboard() {
  const { user: sessionUser, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<RealisasiView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentTaxYear());
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (sessionUser?.role !== "kepala_desa") return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const url = `/api/pbb/realisasi?tahun=${selectedYear}`;

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (res.status === 404) {
          setError(null);
          setData(null);
          return null;
        }
        if (!res.ok) throw new Error("Gagal memuat data realisasi.");
        return res.json();
      })
      .then((json: RealisasiView | null) => {
        if (json) {
          setError(null);
          setData(json);
        }
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  }, [sessionUser?.id, sessionUser?.role, authLoading, selectedYear, retryKey]);

  const yearOptions = getYearOptions();

  const yearSelector = (
    <div className="flex items-center gap-3 mb-6">
      <label className="text-sm font-semibold text-[var(--color-dark-brown)]">
        Tahun:
      </label>
      <select
        value={selectedYear}
        onChange={(e) => {
          const val = e.target.value;
          if (val) setSelectedYear(Number(val));
        }}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-[var(--color-dark-brown)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-dark-brown)] focus:border-transparent"
      >
        {yearOptions.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (sessionUser?.role !== "kepala_desa") {
    return (
      <AccessDenied message="Halaman ini hanya dapat diakses oleh Kepala Desa." />
    );
  }

  const pageHeader = loading ? (
    <div className="page-header mb-8">
      <div className="container">
        <Skeleton className="mx-auto h-8 w-72" />
        <Skeleton className="mx-auto mt-2 h-4 w-96" />
      </div>
    </div>
  ) : (
    <div className="page-header mb-8">
      <div className="container">
        <h1>Dashboard Realisasi PBB</h1>
        {data && (
          <p>Ringkasan realisasi Pajak Bumi & Bangunan Desa Tulungrejo</p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div>
        {pageHeader}
        <div className="container">
          {yearSelector}
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {pageHeader}
        <div className="container">
          {yearSelector}
          <div className="glass-panel p-8 text-center">
            <p className="text-red-600 font-semibold mb-2">Gagal memuat data</p>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setRetryKey((k) => k + 1);
              }}
              className="btn btn-primary btn-sm"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        {pageHeader}
        <div className="container">
          {yearSelector}
          <div className="glass-panel p-8 text-center">
            <p className="text-muted-foreground">
              {`Belum ada data realisasi untuk tahun ${selectedYear}.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {pageHeader}

      <div className="container">
        {yearSelector}
        <div className="space-y-6">
          <RealisasiSummaryCard
            totalPbb={data.totalPbb}
            totalSppt={data.totalSppt}
            persen={data.persen}
            dibayar={data.dibayar}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              title="Nominal Terbayar"
              value={formatCurrency(data.totalBayar)}
              progressPercent={data.persen}
              progressColor="var(--color-success)"
              valueColor="var(--color-success)"
              sublabel={`${data.persen}%`}
              sublabelRight="Dari total target"
            />

            <StatCard
              title="Sisa Piutang"
              value={formatCurrency(data.kurangBayar)}
              progressPercent={100 - data.persen}
              progressColor="var(--color-danger)"
              valueColor="var(--color-danger)"
              sublabel={`${(100 - data.persen).toFixed(1)}%`}
              sublabelRight="Sisa tunggakan"
            />

            <StatCard
              title="SPPT Lunas"
              value={String(data.dibayar)}
              valueUnit="Lembar"
              progressPercent={
                data.totalSppt > 0 ? (data.dibayar / data.totalSppt) * 100 : 0
              }
              progressColor="var(--color-success)"
              valueColor="var(--color-success)"
              sublabel={`${
                data.totalSppt > 0
                  ? Math.round((data.dibayar / data.totalSppt) * 100)
                  : 0
              }%`}
              sublabelRight={`Dari ${data.totalSppt} SPPT`}
            />

            <StatCard
              title="SPPT Tertunggak"
              value={String(data.sisaSppt)}
              valueUnit="Lembar"
              progressPercent={
                data.totalSppt > 0 ? (data.sisaSppt / data.totalSppt) * 100 : 0
              }
              progressColor="var(--color-danger)"
              valueColor="var(--color-danger)"
              sublabel={`${
                data.totalSppt > 0
                  ? Math.round((data.sisaSppt / data.totalSppt) * 100)
                  : 0
              }%`}
              sublabelRight="Belum dibayar"
            />
          </div>

          <div className="glass-panel p-5 text-center text-sm text-muted-foreground">
            Data diambil pada {formatDate(data.importedAt)} — Periode{" "}
            {formatDate(data.tanggalAmbil)}
          </div>
        </div>
      </div>
    </div>
  );
}
