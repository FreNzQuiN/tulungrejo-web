import { NextRequest, NextResponse } from "next/server";
import { requireRole, unwrapSession, getAssignedBlok } from "@/lib/auth/guards";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { prisma } from "@/lib/prisma";

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

    const session = unwrapSession(auth);
    const markedBy = Number(session?.user?.id) || null;
    const markedAt = new Date();

    const existing = await prisma.payments.findUnique({
      where: { fieldId_year: { fieldId, year: parsedYear } },
    });

    if (!existing) {
      try {
        await prisma.payments.create({
          data: {
            fieldId,
            year: parsedYear,
            status: "lunas",
            markedBy,
            markedAt,
          },
        });
      } catch (createErr: unknown) {
        if (
          createErr &&
          typeof createErr === "object" &&
          "code" in createErr &&
          (createErr as { code: string }).code === "P2002"
        ) {
          const current = await prisma.payments.findUniqueOrThrow({
            where: { fieldId_year: { fieldId, year: parsedYear } },
          });
          await prisma.payments.update({
            where: { fieldId_year: { fieldId, year: parsedYear } },
            data: {
              status: current.status === "lunas" ? "belum_lunas" : "lunas",
              markedBy,
              markedAt,
            },
          });
        } else {
          throw createErr;
        }
      }
    } else {
      const newStatus = existing.status === "lunas" ? "belum_lunas" : "lunas";

      await prisma.payments.update({
        where: { fieldId_year: { fieldId, year: parsedYear } },
        data: { status: newStatus, markedBy, markedAt },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PBB toggle error:", err);
    return NextResponse.json(
      { error: "Gagal mengubah status pembayaran." },
      { status: 500 },
    );
  }
}
