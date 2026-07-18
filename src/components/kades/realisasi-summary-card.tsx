"use client";

import { Landmark } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RealisasiSummaryCardProps {
  totalPbb: number;
  totalSppt: number;
  persen: number;
  dibayar: number;
}

export function RealisasiSummaryCard({
  totalPbb,
  totalSppt,
  persen,
  dibayar,
}: RealisasiSummaryCardProps) {
  return (
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
            Total kewajiban pajak bumi & bangunan Desa Tulungrejo
          </p>
        </div>
      </div>

      <div className="flex items-baseline gap-6 mb-5">
        <div>
          <div className="text-[30px] font-extrabold text-[var(--color-dark-brown)]">
            {formatCurrency(totalPbb)}
          </div>
          <div className="text-[12px] text-[var(--color-muted)]">
            Total nominal kewajiban
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[28px] font-extrabold text-[var(--color-dark-brown)]">
            {totalSppt}
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
              width: `${persen}%`,
              backgroundColor: "var(--color-dark-brown)",
            }}
          />
        </div>
      </div>
      <div className="flex justify-between text-[12px] font-semibold">
        <span className="text-[var(--color-dark-brown)]">
          Realisasi Nominal {persen}%
        </span>
        <span className="text-[var(--color-muted)]">
          SPPT Lunas {dibayar}/{totalSppt}
        </span>
      </div>
    </div>
  );
}
