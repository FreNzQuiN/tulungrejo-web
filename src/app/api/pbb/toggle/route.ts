import { NextRequest, NextResponse } from "next/server";
import { requireRole, unwrapSession } from "@/lib/auth-helpers";
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

    const field = await prisma.fields.findUnique({ where: { id: fieldId } });
    if (!field) {
      return NextResponse.json(
        { error: "Bidang tidak ditemukan." },
        { status: 404 },
      );
    }

    const existing = await prisma.payments.findUnique({
      where: { fieldId_year: { fieldId, year } },
    });

    const session = unwrapSession(auth);

    if (existing) {
      const newStatus = existing.status === "lunas" ? "belum_lunas" : "lunas";
      await prisma.payments.update({
        where: { fieldId_year: { fieldId, year } },
        data: {
          status: newStatus,
          markedBy: Number(session?.user?.id) || null,
          markedAt: new Date(),
        },
      });
    } else {
      await prisma.payments.create({
        data: {
          fieldId,
          year,
          status: "lunas",
          markedBy: Number(session?.user?.id) || null,
          markedAt: new Date(),
        },
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
