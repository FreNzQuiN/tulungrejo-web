import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { prisma } from "@/lib/prisma";
import { BLOK_TO_DUSUN } from "@/lib/constants";

const BLOK_REGEX = /^(00[1-9]|01[0-3])$/;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ blok: string }> },
) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["pamong_pajak", "kepala_desa"]);
  if ("error" in auth) return auth.error;

  try {
    const { blok } = await params;

    if (!BLOK_REGEX.test(blok)) {
      return NextResponse.json(
        { error: `Blok ${blok} tidak valid. Gunakan 001-013.` },
        { status: 400 },
      );
    }

    const images = await prisma.blockImage.findMany({
      where: { blok },
      select: { subBlok: true, image: true, mimeType: true },
      orderBy: { subBlok: "asc" },
    });

    if (images.length === 0) {
      return NextResponse.json(
        { error: `Belum ada gambar untuk Blok ${blok}.` },
        { status: 404 },
      );
    }

    return NextResponse.json({
      blok,
      dusun: BLOK_TO_DUSUN[blok] ?? null,
      images,
    });
  } catch (err) {
    console.error("PBB blok image error:", err);
    return NextResponse.json(
      { error: "Gagal memuat gambar blok." },
      { status: 500 },
    );
  }
}
