import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { prisma } from "@/lib/prisma";
import type { RealisasiView } from "@/lib/types";

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["pamong_pajak", "kepala_desa"]);
  if ("error" in auth) return auth.error;

  try {
    const tahunParam = req.nextUrl.searchParams.get("tahun");
    const parsedTahun = parseInt(tahunParam ?? "", 10);
    if (
      tahunParam &&
      (Number.isNaN(parsedTahun) || parsedTahun < 2000 || parsedTahun > 2099)
    ) {
      return NextResponse.json(
        { error: "Tahun tidak valid. Gunakan angka antara 2000 dan 2099." },
        { status: 400 },
      );
    }
    const where = tahunParam ? { tahun: parsedTahun } : undefined;

    const record = await prisma.realisasi.findFirst({
      where,
      orderBy: { importedAt: "desc" },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Belum ada data realisasi." },
        { status: 404 },
      );
    }

    const result: RealisasiView = {
      id: record.id,
      totalPbb: Number(record.totalPbb),
      totalBayar: Number(record.totalBayar),
      persen: Number(record.persen),
      kurangBayar: Number(record.kurangBayar),
      totalSppt: record.totalSppt,
      dibayar: record.dibayar,
      sisaSppt: record.sisaSppt,
      tanggalAmbil: record.tanggalAmbil.toISOString(),
      importedAt: record.importedAt.toISOString(),
      tahun: record.tahun,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("PBB realisasi error:", err);
    return NextResponse.json(
      { error: "Gagal memuat data realisasi." },
      { status: 500 },
    );
  }
}
