import * as XLSX from "xlsx-js-style";
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
  assignedBlok?: string | null,
): Promise<ImportSummary> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const fileType = detectFileType(workbook, fileName);
  const summary: ImportSummary = {
    fields: { inserted: 0, updated: 0 },
    realisasi: { inserted: 0 },
    errors: [],
    warnings: [],
  };

  if (fileType === "spop") {
    await importSpop(workbook, summary, assignedBlok);
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
  assignedBlok?: string | null,
): Promise<void> {
  try {
    const fields = parseSpopSheet(workbook);
    if (fields.length === 0) {
      summary.errors.push("Sheet SPOP kosong atau tidak ditemukan.");
      return;
    }

    const scopedFields = assignedBlok
      ? fields.filter((f) => f.blok === assignedBlok)
      : fields;
    if (assignedBlok && scopedFields.length !== fields.length) {
      summary.warnings.push(
        `Beberapa baris di luar blok ${assignedBlok} diabaikan.`,
      );
    }

    const lspopAgg = parseLspopSheet(workbook);
    for (const field of scopedFields) {
      const agg = lspopAgg.get(`${field.blok}|${field.noBidang}`);
      if (agg) {
        field.buildingArea = agg.buildingArea;
        field.buildingCount = agg.buildingCount;
      }
    }

    let totalAffected = 0;
    let totalRows = 0;

    for (let i = 0; i < scopedFields.length; i += BATCH_SIZE) {
      const batch = scopedFields.slice(i, i + BATCH_SIZE);
      try {
        const { sql, params } = buildBatchSql(batch);
        const affected = await prisma.$executeRawUnsafe(sql, ...params);
        totalAffected += affected;
        totalRows += batch.length;
      } catch (err) {
        console.error("Import SPOP batch error:", err);
        summary.errors.push(`Gagal import batch ${i / BATCH_SIZE + 1}.`);
      }
    }

    function computeInserted(rows: number, affected: number) {
      // MySQL: ON DUPLICATE KEY UPDATE returns 1 per insert, 2 per update
      return Math.max(0, 2 * rows - affected);
    }
    function computeUpdated(rows: number, affected: number) {
      return Math.max(0, affected - rows);
    }
    summary.fields.inserted = computeInserted(totalRows, totalAffected);
    summary.fields.updated = computeUpdated(totalRows, totalAffected);
    console.info("Import SPOP selesai:", {
      totalRows,
      totalAffected,
      inserted: summary.fields.inserted,
      updated: summary.fields.updated,
    });
  } catch (err) {
    console.error("Import SPOP error:", err);
    summary.errors.push("Gagal memproses file SPOP.");
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

    await prisma.realisasi.upsert({
      where: {
        kodeDesa_tahun: {
          kodeDesa: record.kodeDesa,
          tahun: record.tahun,
        },
      },
      create: record,
      update: {
        kodeKec: record.kodeKec,
        kecamatan: record.kecamatan,
        desa: record.desa,
        totalPbb: record.totalPbb,
        totalBayar: record.totalBayar,
        persen: record.persen,
        kurangBayar: record.kurangBayar,
        totalSppt: record.totalSppt,
        dibayar: record.dibayar,
        sisaSppt: record.sisaSppt,
        tanggalAmbil: record.tanggalAmbil,
      },
    });
    summary.realisasi.inserted++;
    console.info("Import PBB-P2 selesai: realisasi tersimpan");
  } catch (err) {
    console.error("Import PBB-P2 error:", err);
    summary.errors.push("Gagal memproses file PBB-P2.");
  }
}
