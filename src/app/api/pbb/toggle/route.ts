import { NextRequest, NextResponse } from "next/server";
import { requireRole, unwrapSession, getAssignedBlok } from "@/lib/auth/guards";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { prisma } from "@/lib/prisma";
import { PAYMENT_STATUS, type PaymentStatus } from "@/lib/types";
import { getCurrentTaxYear } from "@/lib/pbb-tax-year";

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

    let actualStatus: PaymentStatus = PAYMENT_STATUS.BELUM_LUNAS;

    await prisma.$transaction(async (tx) => {
      const field = await tx.fields.findUnique({ where: { id: fieldId } });
      if (!field) {
        throw new Error("Bidang tidak ditemukan.");
      }

      const assignedBlok = await getAssignedBlok(auth);
      if (assignedBlok && field.blok !== assignedBlok) {
        throw new Error("Anda tidak memiliki akses ke bidang ini.");
      }

      const existing = await tx.payments.findUnique({
        where: { fieldId_year: { fieldId, year: parsedYear } },
      });

      if (!existing) {
        try {
          await tx.payments.create({
            data: {
              fieldId,
              year: parsedYear,
              status: PAYMENT_STATUS.LUNAS,
              markedBy,
              markedAt,
            },
          });
          actualStatus = PAYMENT_STATUS.LUNAS;
        } catch (createErr: any) {
          // P2002 = concurrent create won the race; toggle existing record
          if (createErr?.code === "P2002") {
            const concurrent = await tx.payments.findUnique({
              where: { fieldId_year: { fieldId, year: parsedYear } },
            });
            if (concurrent) {
              const toggled =
                concurrent.status === PAYMENT_STATUS.LUNAS
                  ? PAYMENT_STATUS.BELUM_LUNAS
                  : PAYMENT_STATUS.LUNAS;
              await tx.payments.update({
                where: { fieldId_year: { fieldId, year: parsedYear } },
                data: { status: toggled, markedBy, markedAt },
              });
              actualStatus = toggled;
            }
          } else {
            throw createErr;
          }
        }
      } else {
        actualStatus =
          existing.status === PAYMENT_STATUS.LUNAS
            ? PAYMENT_STATUS.BELUM_LUNAS
            : PAYMENT_STATUS.LUNAS;
        await tx.payments.update({
          where: { fieldId_year: { fieldId, year: parsedYear } },
          data: { status: actualStatus, markedBy, markedAt },
        });
      }
    });

    return NextResponse.json({ success: true, status: actualStatus });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "Bidang tidak ditemukan.") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message === "Anda tidak memiliki akses ke bidang ini.") {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    console.error("PBB toggle error:", err);
    return NextResponse.json(
      { error: "Gagal mengubah status pembayaran." },
      { status: 500 },
    );
  }
}
