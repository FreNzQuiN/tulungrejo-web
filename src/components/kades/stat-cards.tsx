"use client";

import { Landmark, FileText, CheckCircle2, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StatCardsProps {
  overallStats: {
    totalPlots: number;
    paidPlots: number;
    unpaidPlots: number;
    totalPbbAmount: number;
    totalPaidAmount: number;
    totalUnpaidAmount: number;
    realizationPercentage: number;
  };
}

export function StatCards({ overallStats }: StatCardsProps) {
  const paidPercent =
    overallStats.totalPbbAmount > 0
      ? Math.round(
          (overallStats.totalPaidAmount / overallStats.totalPbbAmount) * 100,
        )
      : 0;
  const unpaidPercent = 100 - paidPercent;

  const spptPaidPercent =
    overallStats.totalPlots > 0
      ? Math.round((overallStats.paidPlots / overallStats.totalPlots) * 100)
      : 0;
  const spptUnpaidPercent = 100 - spptPaidPercent;

  return (
    <div className="space-y-6">
      {/* ───── Hero Card: Target PBB ───── */}
      <div className="glass-panel p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Landmark size={20} className="text-[var(--color-dark-brown)]" />
              <h3 className="text-lg font-bold text-[var(--color-dark-brown)] font-[family-name:var(--font-heading)]">
                Target PBB Desa
              </h3>
            </div>
            <p className="text-[13px] text-[var(--color-muted)]">
              Total kewajiban pajak bumi & bangunan desa Tulungrejo
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-[var(--color-dark-brown)] text-white">
            <FileText size={12} />
            SPPT
          </span>
        </div>

        <div className="flex items-baseline gap-6 mb-5">
          <div>
            <div className="text-[30px] font-extrabold text-[var(--color-dark-brown)]">
              {formatCurrency(overallStats.totalPbbAmount)}
            </div>
            <div className="text-[12px] text-[var(--color-muted)]">
              Total nominal kewajiban
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[28px] font-extrabold text-[var(--color-dark-brown)]">
              {overallStats.totalPlots}
            </span>
            <span className="text-[12px] text-[var(--color-muted)] font-medium">
              lbr
            </span>
          </div>
        </div>

        {/* Progress bar — nominal */}
        <div className="mb-2">
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${paidPercent}%`,
                backgroundColor: "var(--color-dark-brown)",
              }}
            />
          </div>
        </div>
        <div className="flex justify-between text-[12px] font-semibold">
          <span className="text-[var(--color-dark-brown)]">
            Realisasi Nominal {paidPercent}%
          </span>
          <span className="text-[var(--color-muted)]">
            SPPT Lunas {overallStats.paidPlots}/{overallStats.totalPlots} (
            {spptPaidPercent}%)
          </span>
        </div>
      </div>

      {/* ───── 2×2 Mini Cards ───── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nominal Terbayar */}
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} />
            <h4 className="text-[13px] font-bold uppercase text-[var(--color-muted)] tracking-wide">
              Nominal Terbayar
            </h4>
          </div>
          <div
            className="text-[22px] font-extrabold mb-3"
            style={{ color: "var(--color-success)" }}
          >
            {formatCurrency(overallStats.totalPaidAmount)}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${paidPercent}%`,
                backgroundColor: "var(--color-success)",
              }}
            />
          </div>
          <div className="flex justify-between text-[11px]">
            <span
              style={{ color: "var(--color-success)" }}
              className="font-semibold"
            >
              {paidPercent}%
            </span>
            <span className="text-[var(--color-muted)]">Dari total target</span>
          </div>
        </div>

        {/* Sisa Piutang */}
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} style={{ color: "var(--color-danger)" }} />
            <h4 className="text-[13px] font-bold uppercase text-[var(--color-muted)] tracking-wide">
              Sisa Piutang
            </h4>
          </div>
          <div
            className="text-[22px] font-extrabold mb-3"
            style={{ color: "var(--color-danger)" }}
          >
            {formatCurrency(overallStats.totalUnpaidAmount)}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${unpaidPercent}%`,
                backgroundColor: "var(--color-danger)",
              }}
            />
          </div>
          <div className="flex justify-between text-[11px]">
            <span
              style={{ color: "var(--color-danger)" }}
              className="font-semibold"
            >
              {unpaidPercent}%
            </span>
            <span className="text-[var(--color-muted)]">Sisa tunggakan</span>
          </div>
        </div>

        {/* SPPT Lunas */}
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} />
            <h4 className="text-[13px] font-bold uppercase text-[var(--color-muted)] tracking-wide">
              SPPT Lunas
            </h4>
          </div>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span
              className="text-[22px] font-extrabold"
              style={{ color: "var(--color-success)" }}
            >
              {overallStats.paidPlots}
            </span>
            <span className="text-[12px] text-[var(--color-muted)] font-medium">
              Lembar
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${spptPaidPercent}%`,
                backgroundColor: "var(--color-success)",
              }}
            />
          </div>
          <div className="flex justify-between text-[11px]">
            <span
              style={{ color: "var(--color-success)" }}
              className="font-semibold"
            >
              {spptPaidPercent}%
            </span>
            <span className="text-[var(--color-muted)]">
              Dari {overallStats.totalPlots} SPPT
            </span>
          </div>
        </div>

        {/* SPPT Tertunggak */}
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} style={{ color: "var(--color-danger)" }} />
            <h4 className="text-[13px] font-bold uppercase text-[var(--color-muted)] tracking-wide">
              SPPT Tertunggak
            </h4>
          </div>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span
              className="text-[22px] font-extrabold"
              style={{ color: "var(--color-danger)" }}
            >
              {overallStats.unpaidPlots}
            </span>
            <span className="text-[12px] text-[var(--color-muted)] font-medium">
              Lembar
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${spptUnpaidPercent}%`,
                backgroundColor: "var(--color-danger)",
              }}
            />
          </div>
          <div className="flex justify-between text-[11px]">
            <span
              style={{ color: "var(--color-danger)" }}
              className="font-semibold"
            >
              {spptUnpaidPercent}%
            </span>
            <span className="text-[var(--color-muted)]">Belum dibayar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
