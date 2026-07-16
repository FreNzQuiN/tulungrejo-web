import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { prisma } from "@/lib/prisma";
import { sanitizeSearch } from "@/lib/utils";

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["pamong_pajak"]);
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const blok = searchParams.get("blok");
    const raw = searchParams.get("search");
    const search = sanitizeSearch(raw);

    const where: Record<string, unknown> = {};
    if (blok) where.blok = blok;
    if (search) {
      where.OR = [
        { ownerName: { contains: search } },
        { nop: { contains: search } },
        { noBidang: { contains: search } },
      ];
    }

    const fields = await prisma.fields.findMany({
      where: where as any,
      orderBy: [{ blok: "asc" }, { noBidang: "asc" }],
    });

    return NextResponse.json(
      fields.map((f) => ({
        id: f.id,
        nop: f.nop,
        noUrut: f.noUrut,
        ownerName: f.ownerName,
        ownerAddress: f.ownerAddress,
        address: f.address,
        rw: f.rw,
        rt: f.rt,
        blok: f.blok,
        noBidang: f.noBidang,
        dusun: f.dusun,
        landArea: f.landArea ? Number(f.landArea) : null,
        buildingArea: f.buildingArea ? Number(f.buildingArea) : null,
        buildingCount: f.buildingCount,
        znt: f.znt,
        jenisTanah: f.jenisTanah,
        pendataanAt: f.pendataanAt?.toISOString() ?? null,
      })),
    );
  } catch (err) {
    console.error("PBB plots error:", err);
    return NextResponse.json(
      { error: "Gagal memuat data bidang." },
      { status: 500 },
    );
  }
}
