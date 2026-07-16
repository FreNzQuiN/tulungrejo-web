import type * as XLSX from "xlsx";

export interface FieldRecord {
  nop: string;
  noUrut: string;
  ownerName: string;
  ownerAddress: string | null;
  address: string;
  rw: string | null;
  rt: string | null;
  blok: string;
  noBidang: string;
  dusun: string;
  landArea: number | null;
  buildingArea: number | null;
  buildingCount: number | null;
  znt: string | null;
  jenisTanah: number | null;
  pendataanAt: Date | null;
}

export interface LspopAggregate {
  buildingArea: number;
  buildingCount: number;
}

export interface RealisasiRecord {
  kodeKec: string;
  kecamatan: string;
  kodeDesa: string;
  desa: string;
  totalPbb: bigint;
  totalBayar: bigint;
  persen: number;
  kurangBayar: bigint;
  totalSppt: number;
  dibayar: number;
  sisaSppt: number;
  tanggalAmbil: Date;
}

export interface ImportSummary {
  fields: { inserted: number; updated: number };
  realisasi: { inserted: number };
  errors: string[];
}

export type FileType = "spop" | "pbbp2" | "unknown";

export function detectFileType(
  workbook: XLSX.WorkBook,
  fileName: string,
): FileType {
  const names = workbook.SheetNames.map((n) => n.toLowerCase());
  if (names.includes("spop") || names.includes("lspop")) return "spop";
  if (fileName.endsWith(".csv")) return "pbbp2";
  const sn = names[0] ?? "";
  if (sn.includes("realisasi") || sn.includes("pbb")) return "pbbp2";
  return "unknown";
}
