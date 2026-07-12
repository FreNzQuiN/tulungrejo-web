"use client";

import { formatCurrency } from "@/lib/utils";

interface BlokStatRow {
  blok: string;
  totalPlots: number;
  paidPlots: number;
  unpaidPlots: number;
  totalPbbAmount: number;
  totalPaidAmount: number;
  totalUnpaidAmount: number;
  realizationPercentage: number;
}

interface DusunTableProps {
  blokStats: BlokStatRow[];
}

export function DusunTable({ blokStats }: DusunTableProps) {
  return (
    <div className="glass-panel p-6">
      <h3
        className="text-[18px] mb-5"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Laporan Detail Tingkat Dusun
      </h3>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Wilayah</th>
              <th>Ketetapan SPPT</th>
              <th>Realisasi SPPT</th>
              <th>Ketetapan Nominal</th>
              <th>Realisasi Nominal</th>
              <th>Persentase Lunas</th>
            </tr>
          </thead>
          <tbody>
            {blokStats.map((row) => (
              <tr key={row.blok}>
                <td className="font-semibold">{row.blok}</td>
                <td>{row.totalPlots}</td>
                <td>{row.paidPlots}</td>
                <td>{formatCurrency(row.totalPbbAmount)}</td>
                <td>{formatCurrency(row.totalPaidAmount)}</td>
                <td>
                  <span
                    className={
                      `inline-block px-[10px] py-[4px] text-[11px] font-bold uppercase tracking-wider rounded-full ` +
                      (row.realizationPercentage >= 50
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700")
                    }
                  >
                    {row.realizationPercentage.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
