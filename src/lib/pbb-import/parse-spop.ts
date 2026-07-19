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

const COL = {
  KODE_PROP: 3,
  KODE_KAB: 4,
  KODE_KEC: 5,
  KODE_DESA: 6,
  BLOK: 7,
  NO_BIDANG: 8,
  OWNER_NAME: 13,
  OWNER_ADDR: [14, 15, 16, 17, 18] as const,
  ADDRESS: 19,
  RW: 20,
  RT: 21,
  LAND_AREA: 22,
  ZNT: 23,
  JENIS_TANAH: 24,
  PENDATAAN_AT: 26,
} as const;

export function parseSpopSheet(workbook: XLSX.WorkBook): FieldRecord[] {
  const sheet = workbook.Sheets["SPOP"];
  if (!sheet) return [];

  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const records: FieldRecord[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const blok = sanitizeBlok(cellValue(row, COL.BLOK));
    const noBidang = sanitizeNoBidang(cellValue(row, COL.NO_BIDANG));
    if (!blok || !noBidang) continue;

    const key = `${blok}|${noBidang}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const kodeProp = String(cellValue(row, COL.KODE_PROP) ?? "").trim() || "35";
    const kodeKab = String(cellValue(row, COL.KODE_KAB) ?? "").trim() || "05";
    const kodeKec = String(cellValue(row, COL.KODE_KEC) ?? "").trim() || "050";
    const kodeDesa =
      String(cellValue(row, COL.KODE_DESA) ?? "").trim() || "005";

    const nop = buildNop([
      kodeProp,
      kodeKab,
      kodeKec,
      kodeDesa,
      blok,
      noBidang,
    ]);
    const noUrut = buildNoUrut(blok, noBidang);

    const ownerName = String(cellValue(row, COL.OWNER_NAME) ?? "").trim();
    if (!ownerName) continue;

    const addrParts: string[] = [];
    for (const ci of COL.OWNER_ADDR) {
      const v = cellValue(row, ci);
      if (v != null) {
        const s = String(v).trim();
        if (s) addrParts.push(s);
      }
    }
    const ownerAddress = addrParts.length > 0 ? addrParts.join(", ") : null;

    const address = String(cellValue(row, COL.ADDRESS) ?? "").trim();
    const rw = String(cellValue(row, COL.RW) ?? "").trim() || null;
    const rt = String(cellValue(row, COL.RT) ?? "").trim() || null;

    const landArea = roundLandArea(cellValue(row, COL.LAND_AREA));
    const znt = String(cellValue(row, COL.ZNT) ?? "").trim() || null;

    const jenisTanahRaw = cellValue(row, COL.JENIS_TANAH);
    const jenisTanah: number | null = (() => {
      if (jenisTanahRaw == null) return null;
      const n = Number(jenisTanahRaw);
      return Number.isNaN(n) ? null : n;
    })();

    const pendataanAt = parseDate(cellValue(row, COL.PENDATAAN_AT));

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
