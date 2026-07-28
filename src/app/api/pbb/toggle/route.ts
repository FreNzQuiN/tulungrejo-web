import { NextRequest, NextResponse } from "next/server";
import { requireRole, unwrapSession, getAssignedBlok } from "@/lib/auth/guards";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { prisma } from "@/lib/prisma";
import { PAYMENT_STATUS, type PaymentStatus } from "@/lib/types";
import { getCurrentTaxYear } from "@/lib/pbb-tax-year";

const TOGGLE_MAX_RETRIES = 3;

async function togglePayment(
  fieldId: string,
  year: number,
  markedBy: number | null,
  markedAt: Date,
): Promise<PaymentStatus> {
  for (let attempt = 0; attempt < TOGGLE_MAX_RETRIES; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const existing = await tx.payments.findUnique({
          where: { fieldId_year: { fieldId, year } },
        });

        if (!existing) {
          try {
            await tx.payments.create({
              data: {
                fieldId,
                year,
                status: PAYMENT_STATUS.LUNAS,
                markedBy,
                markedAt,
              },
            });
            return PAYMENT_STATUS.LUNAS;
          } catch (createErr: unknown) {
            const err = createErr as Record<string, unknown>;
            if (err?.code === "P2002") {
              // Raced with another create — retry fresh read
              throw err; // caught by outer try, retried
            }
            throw createErr;
          }
        }

        const toggled =
          existing.status === PAYMENT_STATUS.LUNAS
            ? PAYMENT_STATUS.BELUM_LUNAS
            : PAYMENT_STATUS.LUNAS;
        await tx.payments.update({
          where: { fieldId_year: { fieldId, year }, status: existing.status },
          data: { status: toggled, markedBy, markedAt },
        });
        return toggled;
      });
    } catch (createErr: unknown) {
      const err = createErr as Record<string, unknown>;
      if (
        (err?.code === "P2002" || err?.code === "P2025") &&
        attempt < TOGGLE_MAX_RETRIES - 1
      ) {
        continue;
      }
      throw createErr;
    }
  }
  throw new Error("togglePayment: unreachable");
}

export async function POST(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["pamong_pajak"]);
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const { fieldId, year } = body;

    if (!fieldId || !year) {
      return NextResponse.json(
        { error: "fieldId dan year wajib diisi." },
        { status: 400 },
      );
    }

    const parsedYear = Number(year);
    if (
      !Number.isInteger(parsedYear) ||
      parsedYear < 2000 ||
      parsedYear > 2099
    ) {
      return NextResponse.json(
        { error: "Tahun harus berupa angka antara 2000 dan 2099." },
        { status: 400 },
      );
    }

    if (parsedYear !== getCurrentTaxYear()) {
      return NextResponse.json(
        {
          error: "Hanya tahun pajak berjalan yang bisa diubah.",
        },
        { status: 400 },
      );
    }

    const session = unwrapSession(auth);
    const markedBy = session?.user?.id ?? null;
    const markedAt = new Date();

    // Check field and blok access outside the toggle retry loop
    const field = await prisma.fields.findUnique({ where: { id: fieldId } });
    if (!field) {
      return NextResponse.json(
        { error: "Bidang tidak ditemukan." },
        { status: 404 },
      );
    }

    const assignedBlok = await getAssignedBlok(auth);
    if (assignedBlok && field.blok !== assignedBlok) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke bidang ini." },
        { status: 403 },
      );
    }

    const actualStatus = await togglePayment(
      fieldId,
      parsedYear,
      markedBy,
      markedAt,
    );

    return NextResponse.json({ success: true, status: actualStatus });
  } catch (err) {
    console.error("PBB toggle error:", err);
    return NextResponse.json(
      { error: "Gagal mengubah status pembayaran." },
      { status: 500 },
    );
  }
}
