import * as XLSX from "xlsx-js-style";
import type { RealisasiRecord } from "./types";
import { getTaxYearFromDate } from "@/lib/pbb-tax-year";

const COL = {
  KODE_KEC: 0,
  KECAMATAN: 1,
  KODE_DESA: 2,
  DESA: 3,
  TOTAL_PBB: 4,
  TOTAL_BAYAR: 5,
  PERSEN: 6,
  KURANG_BAYAR: 7,
  TOTAL_SPPT: 8,
  DIBAYAR: 9,
  SISA_SPPT: 10,
} as const;

export function parsePbbP2(workbook: XLSX.WorkBook): RealisasiRecord | null {
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return null;
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return null;

  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  if (rows.length < 3) return null;

  let dataRow: unknown[] | null = null;
  for (const row of rows) {
    if (!row || row.length < 4) continue;
    const col2 = String(row[COL.KODE_DESA] ?? "").trim();
    const col3 = String(row[COL.DESA] ?? "").trim();
    if (col2 === "005" || col3.toUpperCase() === "TULUNGREJO") {
      dataRow = row;
      break;
    }
  }
  if (!dataRow) return null;

  const num = (idx: number): number => {
    const raw = dataRow[idx];
    if (raw == null) return 0;
    if (typeof raw === "number") return raw;
    const s = String(raw).replace(/[^0-9,.\-]/g, "");
    if (!s) return 0;

    // Try Indonesian format (dot=thousands, comma=decimal) first
    if (s.includes(",")) {
      const id = Number(s.replace(/\./g, "").replace(/,/g, "."));
      if (!Number.isNaN(id)) return id;
    }

    if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
      const n = Number(s.replace(/\./g, ""));
      if (!Number.isNaN(n)) return n;
    }

    // Fallback: strip all commas (US/European thousands separator)
    const cleaned = s.replace(/,/g, "");
    const n = Number(cleaned);
    return Number.isNaN(n) ? 0 : n;
  };
  const big = (idx: number): bigint => BigInt(Math.round(num(idx)));

  return {
    kodeKec: String(dataRow[COL.KODE_KEC] ?? "").trim() || "050",
    kecamatan: String(dataRow[COL.KECAMATAN] ?? "").trim() || "WATES",
    kodeDesa: String(dataRow[COL.KODE_DESA] ?? "").trim() || "005",
    desa: String(dataRow[COL.DESA] ?? "").trim() || "TULUNGREJO",
    totalPbb: big(COL.TOTAL_PBB),
    totalBayar: big(COL.TOTAL_BAYAR),
    persen: Math.round(num(COL.PERSEN) * 100) / 100,
    kurangBayar: big(COL.KURANG_BAYAR),
    totalSppt: Math.round(num(COL.TOTAL_SPPT)),
    dibayar: Math.round(num(COL.DIBAYAR)),
    sisaSppt: Math.round(num(COL.SISA_SPPT)),
    tanggalAmbil: new Date(),
    tahun: getTaxYearFromDate(new Date()),
  };
}
