import { NextRequest, NextResponse } from "next/server";
import { requireRole, getAssignedBlok } from "@/lib/auth/guards";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { prisma } from "@/lib/prisma";
import { BLOK_TO_DUSUN } from "@/lib/constants";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ blok: string }> },
) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["pamong_pajak", "kepala_desa"]);
  if ("error" in auth) return auth.error;

  try {
    const { blok } = await params;

    if (!(blok in BLOK_TO_DUSUN)) {
      return NextResponse.json(
        { error: `Blok ${blok} tidak valid. Gunakan 001-013.` },
        { status: 400 },
      );
    }

    const assignedBlok = getAssignedBlok(auth);
    if (assignedBlok && blok !== assignedBlok) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke blok ini." },
        { status: 403 },
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

    return NextResponse.json(
      {
        blok,
        dusun: BLOK_TO_DUSUN[blok] ?? null,
        images,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=3600",
        },
      },
    );
  } catch (err) {
    console.error("PBB blok image error:", err);
    return NextResponse.json(
      { error: "Gagal memuat gambar blok." },
      { status: 500 },
    );
  }
}
