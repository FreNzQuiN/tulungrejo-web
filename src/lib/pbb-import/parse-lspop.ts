import * as XLSX from "xlsx-js-style";
import type { LspopAggregate } from "./types";
import { sanitizeBlok, sanitizeNoBidang, cellValue } from "./utils";

// LSPOP col 9=blok, 10=no_bidang, 16=building_area

export function parseLspopSheet(
  workbook: XLSX.WorkBook,
): Map<string, LspopAggregate> {
  const sheet = workbook.Sheets["LSPOP"];
  if (!sheet) return new Map();

  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const agg = new Map<string, { area: number; count: number }>();

  for (const row of rows) {
    const blok = sanitizeBlok(cellValue(row, 9));
    const noBidang = sanitizeNoBidang(cellValue(row, 10));
    if (!blok || !noBidang) continue;

    const key = `${blok}|${noBidang}`;
    const areaRaw = cellValue(row, 16);
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
