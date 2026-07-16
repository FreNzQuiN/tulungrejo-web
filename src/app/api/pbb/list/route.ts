import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { prisma } from "@/lib/prisma";
import type { FieldView } from "@/lib/types";
import { sanitizeSearch } from "@/lib/utils";

const CURRENT_YEAR = new Date().getFullYear();

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["pamong_pajak", "kepala_desa"]);
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const blok = searchParams.get("blok");
    const status = searchParams.get("status");
    const raw = searchParams.get("search");
    const search = sanitizeSearch(raw);
    const year = Number(searchParams.get("year")) || CURRENT_YEAR;

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

    const payments = await prisma.payments.findMany({
      where: {
        fieldId: { in: fields.map((f) => f.id) },
        year,
      },
      select: { fieldId: true, status: true },
    });

    const paymentMap = new Map(payments.map((p) => [p.fieldId, p.status]));

    let result: FieldView[] = fields.map((f) => ({
      id: f.id,
      nop: f.nop,
      ownerName: f.ownerName,
      address: f.address,
      blok: f.blok,
      noBidang: f.noBidang,
      dusun: f.dusun,
      landArea: f.landArea ? Number(f.landArea) : null,
      buildingArea: f.buildingArea ? Number(f.buildingArea) : null,
      status:
        (paymentMap.get(f.id) as "lunas" | "belum_lunas") ?? "belum_lunas",
    }));

    if (status === "lunas" || status === "belum_lunas") {
      result = result.filter((r) => r.status === status);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("PBB list error:", err);
    return NextResponse.json(
      { error: "Gagal memuat daftar bidang." },
      { status: 500 },
    );
  }
}
