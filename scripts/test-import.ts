import "dotenv/config";
import { readFileSync } from "node:fs";
import { importExcel } from "../src/lib/pbb-import";

async function main() {
  const spopFile = ".secret/ENTRY SPOP LSPOP DESA TULUNGREJO.xlsx";
  const pbbFile = ".secret/PBB-P2 KELURAHAN-WATES.xlsx";

  const { prisma } = await import("../src/lib/prisma");

  console.log("=== TEST 1: Import SPOP/LSPOP ===");
  console.time("spop");
  const spopBuf = readFileSync(spopFile);
  const spopResult = await importExcel(spopBuf, spopFile);
  console.timeEnd("spop");
  console.log(JSON.stringify(spopResult, null, 2));

  console.log("\n=== TEST 2: Import PBB-P2 ===");
  const pbbBuf = readFileSync(pbbFile);
  const pbbResult = await importExcel(pbbBuf, pbbFile);
  console.log(JSON.stringify(pbbResult, null, 2));

  console.log("\n=== VERIFICATION ===");
  const fieldCount = await prisma.fields.count();
  const realisasiCount = await prisma.realisasi.count();
  console.log(`Fields: ${fieldCount} rows`);
  console.log(`Realisasi: ${realisasiCount} rows`);

  const sample = await prisma.fields.findFirst({
    select: {
      nop: true,
      ownerName: true,
      blok: true,
      noBidang: true,
      landArea: true,
      buildingArea: true,
      buildingCount: true,
      dusun: true,
    },
  });
  console.log("Sample field:", JSON.stringify(sample));

  const realisasi = await prisma.realisasi.findFirst();
  if (realisasi) {
    const { importedAt, tanggalAmbil, ...rest } = realisasi;
    const serialized = JSON.stringify(rest, (_, v) =>
      typeof v === "bigint" ? Number(v) : v,
    );
    console.log("Realisasi:", JSON.parse(serialized), {
      importedAt: importedAt.toISOString(),
      tanggalAmbil: tanggalAmbil.toISOString(),
    });
  } else {
    console.log("Realisasi:", "none");
  }

  // Blok distribution
  const dist = await prisma.fields.groupBy({
    by: ["blok"],
    _count: { blok: true },
  });
  console.log("Per blok:", JSON.stringify(dist));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
