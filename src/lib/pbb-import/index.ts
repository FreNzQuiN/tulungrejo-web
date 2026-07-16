import * as XLSX from "xlsx";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { parseSpopSheet } from "./parse-spop";
import { parseLspopSheet } from "./parse-lspop";
import { parsePbbP2 } from "./parse-pbb-p2";
import type { ImportSummary } from "./types";
import { detectFileType } from "./types";

const BATCH_SIZE = 500;

export async function importExcel(
  buffer: Buffer,
  fileName: string,
): Promise<ImportSummary> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const fileType = detectFileType(workbook, fileName);
  const summary: ImportSummary = {
    fields: { inserted: 0, updated: 0 },
    realisasi: { inserted: 0 },
    errors: [],
  };

  if (fileType === "spop") {
    await importSpop(workbook, summary);
  } else if (fileType === "pbbp2") {
    await importPbbP2(workbook, summary);
  } else {
    summary.errors.push(
      "Format file tidak dikenali. Gunakan file SPOP/LSPOP Excel atau CSV PBB-P2.",
    );
  }

  return summary;
}

const COLS = [
  "id",
  "nop",
  "no_urut",
  "blok",
  "no_bidang",
  "owner_name",
  "owner_address",
  "address",
  "rw",
  "rt",
  "dusun",
  "land_area",
  "building_area",
  "building_count",
  "znt",
  "jenis_tanah",
  "pendataan_at",
  "created_at",
  "updated_at",
] as const;

const UPDATE_COLS = COLS.filter(
  (c) => c !== "id" && c !== "blok" && c !== "no_bidang",
);

function toVal(f: ReturnType<typeof parseSpopSheet>[number], now: Date) {
  return [
    randomUUID(),
    f.nop,
    f.noUrut,
    f.blok,
    f.noBidang,
    f.ownerName,
    f.ownerAddress,
    f.address,
    f.rw,
    f.rt,
    f.dusun,
    f.landArea,
    f.buildingArea,
    f.buildingCount,
    f.znt,
    f.jenisTanah,
    f.pendataanAt ?? now,
    now,
    now,
  ];
}

function buildBatchSql(fields: ReturnType<typeof parseSpopSheet>[number][]): {
  sql: string;
  params: unknown[];
} {
  const now = new Date();
  const valueRows: string[] = [];
  const params: unknown[] = [];

  for (const f of fields) {
    const vals = toVal(f, now);
    const placeholders = vals.map(() => "?");
    valueRows.push(`(${placeholders.join(",")})`);
    params.push(...vals);
  }

  const setClause = UPDATE_COLS.map((c) => `\`${c}\`=VALUES(\`${c}\`)`).join(
    ",",
  );
  const sql = `INSERT INTO \`fields\` (${COLS.map((c) => `\`${c}\``).join(",")}) VALUES ${valueRows.join(",")} ON DUPLICATE KEY UPDATE ${setClause}`;
  return { sql, params };
}

async function importSpop(
  workbook: XLSX.WorkBook,
  summary: ImportSummary,
): Promise<void> {
  try {
    const fields = parseSpopSheet(workbook);
    if (fields.length === 0) {
      summary.errors.push("Sheet SPOP kosong atau tidak ditemukan.");
      return;
    }

    const lspopAgg = parseLspopSheet(workbook);
    for (const field of fields) {
      const agg = lspopAgg.get(`${field.blok}|${field.noBidang}`);
      if (agg) {
        field.buildingArea = agg.buildingArea;
        field.buildingCount = agg.buildingCount;
      }
    }

    const countBefore = await prisma.fields.count();
    let totalProcessed = 0;

    for (let i = 0; i < fields.length; i += BATCH_SIZE) {
      const batch = fields.slice(i, i + BATCH_SIZE);
      try {
        const { sql, params } = buildBatchSql(batch);
        await prisma.$executeRawUnsafe(sql, ...params);
        totalProcessed += batch.length;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown";
        summary.errors.push(`Gagal import batch ${i / BATCH_SIZE + 1}: ${msg}`);
      }
    }

    const countAfter = await prisma.fields.count();
    summary.fields.inserted = countAfter - countBefore;
    summary.fields.updated = totalProcessed - (countAfter - countBefore);
  } catch (err) {
    summary.errors.push(
      `Gagal memproses file SPOP: ${err instanceof Error ? err.message : "Unknown error"}`,
    );
  }
}

async function importPbbP2(
  workbook: XLSX.WorkBook,
  summary: ImportSummary,
): Promise<void> {
  try {
    const record = parsePbbP2(workbook);
    if (!record) {
      summary.errors.push(
        "Data PBB-P2 untuk Desa Tulungrejo tidak ditemukan dalam file.",
      );
      return;
    }

    await prisma.realisasi.create({ data: record });
    summary.realisasi.inserted++;
  } catch (err) {
    summary.errors.push(
      `Gagal memproses file PBB-P2: ${err instanceof Error ? err.message : "Unknown error"}`,
    );
  }
}
