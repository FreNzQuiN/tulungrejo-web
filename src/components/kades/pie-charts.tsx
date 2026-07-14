"use client";

import dynamic from "next/dynamic";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";
const COLORS = ["var(--color-chart-blue)", "var(--color-chart-gold)"];

interface PieChartsProps {
  overallStats: {
    totalPaidAmount: number;
    totalUnpaidAmount: number;
    paidPlots: number;
    unpaidPlots: number;
  };
}

function PieChartsInner({ overallStats }: PieChartsProps) {
  const totalNominal =
    overallStats.totalPaidAmount + overallStats.totalUnpaidAmount;
  const totalSPPT = overallStats.paidPlots + overallStats.unpaidPlots;
  const paidNominalPercent =
    totalNominal > 0
      ? Math.round((overallStats.totalPaidAmount / totalNominal) * 100)
      : 0;
  const unpaidNominalPercent = 100 - paidNominalPercent;
  const paidSPPTPercent =
    totalSPPT > 0 ? Math.round((overallStats.paidPlots / totalSPPT) * 100) : 0;
  const unpaidSPPTPercent = 100 - paidSPPTPercent;

  const nominalData = [
    { name: "Sudah Terbayar", value: overallStats.totalPaidAmount },
    { name: "Belum Terbayar", value: overallStats.totalUnpaidAmount },
  ];

  const spptData = [
    { name: "SPPT Lunas", value: overallStats.paidPlots },
    { name: "SPPT Tertunggak", value: overallStats.unpaidPlots },
  ];

  return (
    <div className="charts-section">
      <div className="chart-card glass-panel">
        <h3>Peta Realisasi Pajak Bumi (Nominal Rupiah)</h3>
        <div className="w-full h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={nominalData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {nominalData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  value ? [formatCurrency(Number(value))] : [formatCurrency(0)]
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: COLORS[0] }}
            ></span>
            <span>Lunas PBB ({paidNominalPercent}%)</span>
          </div>
          <div className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: COLORS[1] }}
            ></span>
            <span>Belum Lunas ({unpaidNominalPercent}%)</span>
          </div>
        </div>
      </div>
      <div className="chart-card glass-panel">
        <h3>Realisasi Dokumen SPPT (Lembar Surat)</h3>
        <div className="w-full h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={spptData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {spptData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  value ? [`${Number(value)} Lembar`] : ["0 Lembar"]
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: COLORS[0] }}
            ></span>
            <span>Lunas SPPT ({paidSPPTPercent}%)</span>
          </div>
          <div className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: COLORS[1] }}
            ></span>
            <span>Tertunggak ({unpaidSPPTPercent}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const PieCharts = dynamic(
  () => Promise.resolve({ default: PieChartsInner }),
  { ssr: false },
);
