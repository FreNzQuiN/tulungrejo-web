import * as XLSX from "xlsx-js-style";
import type { RealisasiRecord } from "./types";

// PBB-P2 Excel column mapping (0-indexed from parsed array):
// col 0 = kode_kec ("050")
// col 1 = kecamatan ("WATES")
// col 2 = kode_desa ("001"-"008")
// col 3 = kelurahan
// col 4 = PBB (total nominal)
// col 5 = BAYAR (total terbayar)
// col 6 = % (persentase)
// col 7 = KURANG BAYAR
// col 8 = SPPT (total wajib pajak)
// col 9 = DIBAYAR (jumlah SPPT lunas)
// col 10 = SISA SPPT

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
    const col2 = String(row[2] ?? "").trim();
    const col3 = String(row[3] ?? "").trim();
    if (col2 === "005" || col3.toUpperCase() === "TULUNGREJO") {
      dataRow = row;
      break;
    }
  }
  if (!dataRow) return null;

  const num = (idx: number): number => {
    const raw = dataRow[idx];
    if (raw == null) return 0;
    const n =
      typeof raw === "number"
        ? raw
        : Number(
            String(raw)
              .replace(/[^0-9,.-]/g, "")
              .replace(",", "."),
          );
    return Number.isNaN(n) ? 0 : n;
  };
  const big = (idx: number): bigint => BigInt(Math.round(num(idx)));

  return {
    kodeKec: String(dataRow[0] ?? "").trim() || "050",
    kecamatan: String(dataRow[1] ?? "").trim() || "WATES",
    kodeDesa: String(dataRow[2] ?? "").trim() || "005",
    desa: String(dataRow[3] ?? "").trim() || "TULUNGREJO",
    totalPbb: big(4),
    totalBayar: big(5),
    persen: Math.round(num(6) * 100) / 100,
    kurangBayar: big(7),
    totalSppt: Math.round(num(8)),
    dibayar: Math.round(num(9)),
    sisaSppt: Math.round(num(10)),
    tanggalAmbil: new Date(),
  };
}
