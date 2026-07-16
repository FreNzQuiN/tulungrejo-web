import * as XLSX from "xlsx-js-style";
import type { FieldRecord } from "./types";
import {
  parseDate,
  buildNop,
  buildNoUrut,
  roundLandArea,
  deriveDusun,
  sanitizeBlok,
  sanitizeNoBidang,
  cellValue,
} from "./utils";

// Column mapping (0-indexed):
// 3=kode_propinsi, 4=kode_kab, 5=kode_kec, 6=kode_desa
// 7=blok, 8=no_bidang, 9=check digit (skip)
// 13=owner_name, 14-18=owner_address, 19=address
// 20=RW, 21=RT, 22=land_area, 23=znt, 24=jenis_tanah
// 26=pendataan_at

const OWNER_ADDR_COLS = [14, 15, 16, 17, 18] as const;

export function parseSpopSheet(workbook: XLSX.WorkBook): FieldRecord[] {
  const sheet = workbook.Sheets["SPOP"];
  if (!sheet) return [];

  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const records: FieldRecord[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const blok = sanitizeBlok(cellValue(row, 7));
    const noBidang = sanitizeNoBidang(cellValue(row, 8));
    if (!blok || !noBidang) continue;

    const key = `${blok}|${noBidang}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const kodeProp = String(cellValue(row, 3) ?? "").trim() || "35";
    const kodeKab = String(cellValue(row, 4) ?? "").trim() || "05";
    const kodeKec = String(cellValue(row, 5) ?? "").trim() || "050";
    const kodeDesa = String(cellValue(row, 6) ?? "").trim() || "005";

    const nop = buildNop([
      kodeProp,
      kodeKab,
      kodeKec,
      kodeDesa,
      blok,
      noBidang,
    ]);
    const noUrut = buildNoUrut(blok, noBidang);

    const ownerName = String(cellValue(row, 13) ?? "").trim();
    if (!ownerName) continue;

    const addrParts: string[] = [];
    for (const ci of OWNER_ADDR_COLS) {
      const v = cellValue(row, ci);
      if (v != null) {
        const s = String(v).trim();
        if (s) addrParts.push(s);
      }
    }
    const ownerAddress = addrParts.length > 0 ? addrParts.join(", ") : null;

    const address = String(cellValue(row, 19) ?? "").trim();
    const rw = String(cellValue(row, 20) ?? "").trim() || null;
    const rt = String(cellValue(row, 21) ?? "").trim() || null;

    const landArea = roundLandArea(cellValue(row, 22));
    const znt = String(cellValue(row, 23) ?? "").trim() || null;

    const jenisTanahRaw = cellValue(row, 24);
    const jenisTanah =
      jenisTanahRaw != null ? Number(jenisTanahRaw) || null : null;

    const pendataanAt = parseDate(cellValue(row, 26));

    records.push({
      nop,
      noUrut,
      ownerName,
      ownerAddress,
      address,
      rw,
      rt,
      blok,
      noBidang,
      dusun: deriveDusun(blok),
      landArea,
      buildingArea: null,
      buildingCount: null,
      znt,
      jenisTanah,
      pendataanAt,
    });
  }

  return records;
}
