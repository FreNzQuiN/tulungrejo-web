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
    const latest = await prisma.realisasi.findFirst({
      orderBy: { importedAt: "desc" },
    });

    if (!latest) {
      return NextResponse.json(
        { error: "Belum ada data realisasi." },
        { status: 404 },
      );
    }

    const result: RealisasiView = {
      id: latest.id,
      totalPbb: Number(latest.totalPbb),
      totalBayar: Number(latest.totalBayar),
      persen: Number(latest.persen),
      kurangBayar: Number(latest.kurangBayar),
      totalSppt: latest.totalSppt,
      dibayar: latest.dibayar,
      sisaSppt: latest.sisaSppt,
      tanggalAmbil: latest.tanggalAmbil.toISOString(),
      importedAt: latest.importedAt.toISOString(),
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
