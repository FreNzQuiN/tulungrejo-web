import { NextRequest, NextResponse } from "next/server";
import { requireRole, unwrapSession, getAssignedBlok } from "@/lib/auth/guards";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { prisma } from "@/lib/prisma";
import { buildFieldWhere } from "@/lib/pbb-queries";
import {
  PAYMENT_STATUS,
  type FieldView,
  type PaymentStatus,
} from "@/lib/types";
import { sanitizeSearch } from "@/lib/utils";
import { getCurrentTaxYear } from "@/lib/pbb-tax-year";
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
    const defaultYear = getCurrentTaxYear();
    const year =
      Number(searchParams.get("tahun")) ||
      Number(searchParams.get("year")) ||
      defaultYear;

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

    let fieldsWhere = baseWhere;
    let statusOverride: PaymentStatus | null = null;

    if (status === PAYMENT_STATUS.LUNAS) {
      fieldsWhere = {
        ...baseWhere,
        payments: { some: { year, status: PAYMENT_STATUS.LUNAS } },
      };
      statusOverride = PAYMENT_STATUS.LUNAS;
    } else if (status === PAYMENT_STATUS.BELUM_LUNAS) {
      fieldsWhere = {
        ...baseWhere,
        payments: { none: { year, status: PAYMENT_STATUS.LUNAS } },
      };
      statusOverride = PAYMENT_STATUS.BELUM_LUNAS;
    }

    if (
      status &&
      status !== PAYMENT_STATUS.LUNAS &&
      status !== PAYMENT_STATUS.BELUM_LUNAS
    ) {
      return NextResponse.json(
        {
          error: `Status tidak valid. Gunakan "${PAYMENT_STATUS.LUNAS}" atau "${PAYMENT_STATUS.BELUM_LUNAS}".`,
        },
        { status: 400 },
      );
    }

    const [total, fields] = await Promise.all([
      prisma.fields.count({ where: fieldsWhere }),
      prisma.fields.findMany({
        where: fieldsWhere,
        orderBy: [{ blok: "asc" }, { noBidang: "asc" }],
        take,
        skip,
      }),
    ]);

    let statusMap: Map<string, PaymentStatus>;
    if (statusOverride) {
      statusMap = new Map(fields.map((f) => [f.id, statusOverride]));
    } else {
      const fieldIds = fields.map((f) => f.id);
      const paidRows = await prisma.payments.findMany({
        where: {
          fieldId: { in: fieldIds },
          year,
          status: PAYMENT_STATUS.LUNAS,
        },
        select: { fieldId: true },
      });
      const paidSet = new Set(paidRows.map((r) => r.fieldId));
      statusMap = new Map(
        fields.map((f) => [
          f.id,
          paidSet.has(f.id) ? PAYMENT_STATUS.LUNAS : PAYMENT_STATUS.BELUM_LUNAS,
        ]),
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
      status: statusMap.get(f.id) ?? PAYMENT_STATUS.BELUM_LUNAS,
    }));

    return NextResponse.json({ data: result, total, tahun: year });
  } catch (err) {
    console.error("PBB list error:", err);
    return NextResponse.json(
      { error: "Gagal memuat daftar bidang." },
      { status: 500 },
    );
  }
}
