import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  try {
    const stats = await prisma.villageStats.findFirst({
      orderBy: { id: "asc" },
    });
    if (!stats) {
      return NextResponse.json(
        { error: "Statistik tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      {
        jumlahKK: stats.jumlahKK,
        jumlahPenduduk: stats.jumlahPenduduk,
        lakiLaki: stats.lakiLaki,
        perempuan: stats.perempuan,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (err) {
    console.error("Stats fetch error:", err);
    return NextResponse.json(
      { error: "Gagal memuat statistik desa" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["jurnalis"]);
  if ("error" in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  const { jumlahKK, jumlahPenduduk, lakiLaki, perempuan } = body;

  if (
    jumlahKK === undefined ||
    jumlahPenduduk === undefined ||
    lakiLaki === undefined ||
    perempuan === undefined
  ) {
    return NextResponse.json(
      { error: "Semua field harus diisi" },
      { status: 400 },
    );
  }
  if (
    typeof jumlahKK !== "number" ||
    !Number.isFinite(jumlahKK) ||
    jumlahKK < 0 ||
    typeof jumlahPenduduk !== "number" ||
    !Number.isFinite(jumlahPenduduk) ||
    jumlahPenduduk < 0 ||
    typeof lakiLaki !== "number" ||
    !Number.isFinite(lakiLaki) ||
    lakiLaki < 0 ||
    typeof perempuan !== "number" ||
    !Number.isFinite(perempuan) ||
    perempuan < 0
  ) {
    return NextResponse.json(
      { error: "Semua field harus berupa angka valid" },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.villageStats.findFirst({
      orderBy: { id: "asc" },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Statistik tidak ditemukan" },
        { status: 404 },
      );
    }

    const updated = await prisma.villageStats.update({
      where: { id: existing.id },
      data: { jumlahKK, jumlahPenduduk, lakiLaki, perempuan },
    });

    revalidateTag("village-stats", "max");

    return NextResponse.json({
      jumlahKK: updated.jumlahKK,
      jumlahPenduduk: updated.jumlahPenduduk,
      lakiLaki: updated.lakiLaki,
      perempuan: updated.perempuan,
    });
  } catch (err) {
    console.error("Stats update error:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui statistik" },
      { status: 500 },
    );
  }
}
