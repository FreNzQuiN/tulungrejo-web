import { NextRequest, NextResponse } from "next/server";
import { requireRole, unwrapSession, getAssignedBlok } from "@/lib/auth/guards";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { prisma } from "@/lib/prisma";
import { buildFieldWhere } from "@/lib/pbb-queries";
import type { FieldView } from "@/lib/types";
import { sanitizeSearch } from "@/lib/utils";

const CURRENT_YEAR = new Date().getFullYear();
const MAX_TAKE = 500;

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["pamong_pajak", "kepala_desa"]);
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    let blok = searchParams.get("blok");
    const status = searchParams.get("status");
    const raw = searchParams.get("search");
    const search = sanitizeSearch(raw);
    const year = Number(searchParams.get("year")) || CURRENT_YEAR;

    const take = Math.min(
      Number(searchParams.get("take")) || MAX_TAKE,
      MAX_TAKE,
    );
    const skip = Number(searchParams.get("skip")) || 0;

    const session = unwrapSession(auth);
    if (session?.user?.role === "pamong_pajak") {
      const assignedBlok = await getAssignedBlok(auth);
      if (assignedBlok) blok = assignedBlok;
    }

    const baseWhere = buildFieldWhere({ blok, search });

    // Use Prisma relation filters instead of pre-fetching all paid IDs
    let fieldsWhere = baseWhere;
    let statusOverride: "lunas" | "belum_lunas" | null = null;

    if (status === "lunas") {
      fieldsWhere = {
        ...baseWhere,
        payments: { some: { year, status: "lunas" } },
      };
      statusOverride = "lunas";
    } else if (status === "belum_lunas") {
      fieldsWhere = {
        ...baseWhere,
        payments: { none: { year, status: "lunas" } },
      };
      statusOverride = "belum_lunas";
    }

    // Fetch paginated fields + total count
    const [total, fields] = await Promise.all([
      prisma.fields.count({ where: fieldsWhere }),
      prisma.fields.findMany({
        where: fieldsWhere,
        orderBy: [{ blok: "asc" }, { noBidang: "asc" }],
        take,
        skip,
      }),
    ]);

    // Determine payment status for each field
    let statusMap: Map<string, "lunas" | "belum_lunas">;
    if (statusOverride) {
      // All results share the same status (filtered via relation)
      statusMap = new Map(fields.map((f) => [f.id, statusOverride]));
    } else {
      // Query payments only for paginated field IDs (bounded by take)
      const fieldIds = fields.map((f) => f.id);
      const paidRows = await prisma.payments.findMany({
        where: { fieldId: { in: fieldIds }, year, status: "lunas" },
        select: { fieldId: true },
      });
      const paidSet = new Set(paidRows.map((r) => r.fieldId));
      statusMap = new Map(
        fields.map((f) => [f.id, paidSet.has(f.id) ? "lunas" : "belum_lunas"]),
      );
    }

    const result: FieldView[] = fields.map((f) => ({
      id: f.id,
      nop: f.nop,
      ownerName: f.ownerName,
      address: f.address,
      blok: f.blok,
      noBidang: f.noBidang,
      dusun: f.dusun,
      landArea: f.landArea ? Number(f.landArea) : null,
      buildingArea: f.buildingArea ? Number(f.buildingArea) : null,
      status: statusMap.get(f.id)!,
    }));

    return NextResponse.json({ data: result, total });
  } catch (err) {
    console.error("PBB list error:", err);
    return NextResponse.json(
      { error: "Gagal memuat daftar bidang." },
      { status: 500 },
    );
  }
}
