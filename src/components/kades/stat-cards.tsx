"use client";

import {
  Landmark,
  TrendingUp,
  AlertCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";
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
      ? Math.round(overallStats.realizationPercentage)
      : 0;
  const unpaidPercent = 100 - paidPercent;

  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: Nominal cards */}
      <div className="kades-dashboard-grid">
        <div className="kades-stat-card">
          <h4>Target PBB Total (1 Desa)</h4>
          <div className="kades-stat-value">
            {formatCurrency(overallStats.totalPbbAmount)}
          </div>
          <div className="kades-stat-sub text-muted flex items-center gap-1.5">
            <Landmark size={14} />
            <span>
              Total kewajiban dari {overallStats.totalPlots} SPPT terdaftar
            </span>
          </div>
        </div>

        <div
          className="kades-stat-card"
          style={{ borderLeft: "4px solid var(--color-secondary-tan)" }}
        >
          <h4>Nominal Pajak Terbayar</h4>
          <div
            className="kades-stat-value"
            style={{ color: "var(--color-success)" }}
          >
            {formatCurrency(overallStats.totalPaidAmount)}
          </div>
          <div
            className="kades-stat-sub font-semibold flex items-center gap-1.5"
            style={{ color: "var(--color-success)" }}
          >
            <TrendingUp size={14} />
            <span>Sudah terealisasi ({paidPercent}%)</span>
          </div>
        </div>

        <div
          className="kades-stat-card"
          style={{ borderLeft: "4px solid var(--color-dark-brown)" }}
        >
          <h4>Sisa Piutang PBB</h4>
          <div
            className="kades-stat-value"
            style={{ color: "var(--color-danger)" }}
          >
            {formatCurrency(overallStats.totalUnpaidAmount)}
          </div>
          <div
            className="kades-stat-sub font-semibold flex items-center gap-1.5"
            style={{ color: "var(--color-danger)" }}
          >
            <AlertCircle size={14} />
            <span>Sisa tunggakan ({unpaidPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Row 2: SPPT cards */}
      <div className="kades-dashboard-grid">
        <div className="kades-stat-card flex items-center gap-4 px-6 py-4">
          <div className="inline-flex p-2 rounded-full bg-[rgba(229,210,131,0.08)] text-[#062c30] m-0">
            <FileText size={18} />
          </div>
          <div>
            <span className="text-muted text-[11px] block uppercase font-bold">
              Total Target SPPT
            </span>
            <strong className="text-[18px] text-dark-brown">
              {overallStats.totalPlots} Lembar
            </strong>
          </div>
        </div>

        <div className="kades-stat-card flex items-center gap-4 px-6 py-4">
          <div
            className="inline-flex p-2 rounded-full m-0"
            style={{
              color: "var(--color-success)",
              backgroundColor: "var(--color-success-bg)",
            }}
          >
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="text-muted text-[11px] block uppercase font-bold">
              SPPT Lunas Bayar
            </span>
            <strong
              className="text-[18px]"
              style={{ color: "var(--color-success)" }}
            >
              {overallStats.paidPlots} Lembar (
              {Math.round(
                (overallStats.paidPlots / overallStats.totalPlots) * 100,
              )}
              %)
            </strong>
          </div>
        </div>

        <div className="kades-stat-card flex items-center gap-4 px-6 py-4">
          <div
            className="inline-flex p-2 rounded-full m-0"
            style={{
              color: "var(--color-danger)",
              backgroundColor: "var(--color-danger-bg)",
            }}
          >
            <AlertCircle size={18} />
          </div>
          <div>
            <span className="text-muted text-[11px] block uppercase font-bold">
              SPPT Tertunggak
            </span>
            <strong
              className="text-[18px]"
              style={{ color: "var(--color-danger)" }}
            >
              {overallStats.unpaidPlots} Lembar (
              {Math.round(
                (overallStats.unpaidPlots / overallStats.totalPlots) * 100,
              )}
              %)
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
