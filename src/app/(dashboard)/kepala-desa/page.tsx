"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { Skeleton } from "@/components/ui/skeleton";
import { Landmark, Loader2 } from "lucide-react";
import type { RealisasiView } from "@/lib/types";
import { AccessDenied } from "@/components/auth/access-denied";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

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

  useEffect(() => {
    if (authLoading) return;
    if (sessionUser?.role !== "kepala_desa") return;

    fetch("/api/pbb/realisasi")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat data realisasi.");
        return res.json();
      })
      .then((json: RealisasiView) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionUser, authLoading]);

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

  if (loading) {
    return (
      <div>
        <div className="page-header mb-8">
          <div className="container">
            <Skeleton className="mx-auto h-8 w-72" />
            <Skeleton className="mx-auto mt-2 h-4 w-96" />
          </div>
        </div>
        <div className="container">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header mb-8">
          <div className="container">
            <h1>Dashboard Realisasi PBB</h1>
          </div>
        </div>
        <div className="container">
          <div className="glass-panel p-8 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <div className="page-header mb-8">
          <div className="container">
            <h1>Dashboard Realisasi PBB</h1>
          </div>
        </div>
        <div className="container">
          <div className="glass-panel p-8 text-center">
            <p className="text-muted-foreground">
              Belum ada data realisasi PBB. Silakan impor data terlebih dahulu.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header mb-8">
        <div className="container">
          <h1>Dashboard Realisasi PBB</h1>
          <p>Ringkasan realisasi Pajak Bumi & Bangunan Desa Tulungrejo</p>
        </div>
      </div>

      <div className="container">
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Landmark
                    size={20}
                    className="text-[var(--color-dark-brown)]"
                  />
                  <h3 className="text-lg font-bold text-[var(--color-dark-brown)] font-[family-name:var(--font-heading)]">
                    Target PBB Desa
                  </h3>
                </div>
                <p className="text-[13px] text-[var(--color-muted)]">
                  Total kewajiban pajak bumi & bangunan Desa Tulungrejo
                </p>
              </div>
            </div>

            <div className="flex items-baseline gap-6 mb-5">
              <div>
                <div className="text-[30px] font-extrabold text-[var(--color-dark-brown)]">
                  {formatCurrency(data.totalPbb)}
                </div>
                <div className="text-[12px] text-[var(--color-muted)]">
                  Total nominal kewajiban
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[28px] font-extrabold text-[var(--color-dark-brown)]">
                  {data.totalSppt}
                </span>
                <span className="text-[12px] text-[var(--color-muted)] font-medium">
                  lbr SPPT
                </span>
              </div>
            </div>

            <div className="mb-2">
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${data.persen}%`,
                    backgroundColor: "var(--color-dark-brown)",
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between text-[12px] font-semibold">
              <span className="text-[var(--color-dark-brown)]">
                Realisasi Nominal {data.persen}%
              </span>
              <span className="text-[var(--color-muted)]">
                SPPT Lunas {data.dibayar}/{data.totalSppt}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel p-5">
              <h4 className="text-[13px] font-bold uppercase text-[var(--color-muted)] tracking-wide mb-1">
                Nominal Terbayar
              </h4>
              <div
                className="text-[22px] font-extrabold mb-3"
                style={{ color: "var(--color-success)" }}
              >
                {formatCurrency(data.totalBayar)}
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${data.persen}%`,
                    backgroundColor: "var(--color-success)",
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px]">
                <span
                  className="font-semibold"
                  style={{ color: "var(--color-success)" }}
                >
                  {data.persen}%
                </span>
                <span className="text-[var(--color-muted)]">
                  Dari total target
                </span>
              </div>
            </div>

            <div className="glass-panel p-5">
              <h4 className="text-[13px] font-bold uppercase text-[var(--color-muted)] tracking-wide mb-1">
                Sisa Piutang
              </h4>
              <div
                className="text-[22px] font-extrabold mb-3"
                style={{ color: "var(--color-danger)" }}
              >
                {formatCurrency(data.kurangBayar)}
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${100 - data.persen}%`,
                    backgroundColor: "var(--color-danger)",
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px]">
                <span
                  className="font-semibold"
                  style={{ color: "var(--color-danger)" }}
                >
                  {(100 - data.persen).toFixed(1)}%
                </span>
                <span className="text-[var(--color-muted)]">
                  Sisa tunggakan
                </span>
              </div>
            </div>

            <div className="glass-panel p-5">
              <h4 className="text-[13px] font-bold uppercase text-[var(--color-muted)] tracking-wide mb-1">
                SPPT Lunas
              </h4>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span
                  className="text-[22px] font-extrabold"
                  style={{ color: "var(--color-success)" }}
                >
                  {data.dibayar}
                </span>
                <span className="text-[12px] text-[var(--color-muted)] font-medium">
                  Lembar
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${data.totalSppt > 0 ? (data.dibayar / data.totalSppt) * 100 : 0}%`,
                    backgroundColor: "var(--color-success)",
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px]">
                <span
                  className="font-semibold"
                  style={{ color: "var(--color-success)" }}
                >
                  {data.totalSppt > 0
                    ? Math.round((data.dibayar / data.totalSppt) * 100)
                    : 0}
                  %
                </span>
                <span className="text-[var(--color-muted)]">
                  Dari {data.totalSppt} SPPT
                </span>
              </div>
            </div>

            <div className="glass-panel p-5">
              <h4 className="text-[13px] font-bold uppercase text-[var(--color-muted)] tracking-wide mb-1">
                SPPT Tertunggak
              </h4>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span
                  className="text-[22px] font-extrabold"
                  style={{ color: "var(--color-danger)" }}
                >
                  {data.sisaSppt}
                </span>
                <span className="text-[12px] text-[var(--color-muted)] font-medium">
                  Lembar
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${data.totalSppt > 0 ? (data.sisaSppt / data.totalSppt) * 100 : 0}%`,
                    backgroundColor: "var(--color-danger)",
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px]">
                <span
                  className="font-semibold"
                  style={{ color: "var(--color-danger)" }}
                >
                  {data.totalSppt > 0
                    ? Math.round((data.sisaSppt / data.totalSppt) * 100)
                    : 0}
                  %
                </span>
                <span className="text-[var(--color-muted)]">Belum dibayar</span>
              </div>
            </div>
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
