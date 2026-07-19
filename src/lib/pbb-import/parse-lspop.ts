import * as XLSX from "xlsx-js-style";
import type { LspopAggregate } from "./types";
import { sanitizeBlok, sanitizeNoBidang, cellValue } from "./utils";

const COL = {
  BLOK: 9,
  NO_BIDANG: 10,
  BUILDING_AREA: 16,
} as const;

export function parseLspopSheet(
  workbook: XLSX.WorkBook,
): Map<string, LspopAggregate> {
  const sheet = workbook.Sheets["LSPOP"];
  if (!sheet) return new Map();

  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const agg = new Map<string, { area: number; count: number }>();

  for (const row of rows) {
    const blok = sanitizeBlok(cellValue(row, COL.BLOK));
    const noBidang = sanitizeNoBidang(cellValue(row, COL.NO_BIDANG));
    if (!blok || !noBidang) continue;

    const key = `${blok}|${noBidang}`;
    const areaRaw = cellValue(row, COL.BUILDING_AREA);
    if (areaRaw == null) continue;

    const area = typeof areaRaw === "number" ? areaRaw : Number(areaRaw);
    if (Number.isNaN(area)) continue;

    const existing = agg.get(key);
    if (existing) {
      existing.area += area;
      existing.count += 1;
    } else {
      agg.set(key, { area, count: 1 });
    }
  }

  const result = new Map<string, LspopAggregate>();
  for (const [key, val] of agg) {
    result.set(key, {
      buildingArea: Math.round(val.area * 100) / 100,
      buildingCount: val.count,
    });
  }

  return result;
}
