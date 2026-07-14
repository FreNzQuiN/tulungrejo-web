import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

export async function POST(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["pamong_pajak"]);
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const { landPlotId, year, month } = body;

    if (!landPlotId || !year || !month) {
      return NextResponse.json(
        { error: "Parameter landPlotId, year, dan month wajib diisi" },
        { status: 400 },
      );
    }

    const existing = await prisma.payment.findUnique({
      where: {
        landPlotId_year_month: { landPlotId, year, month },
      },
    });

    if (existing) {
      const newStatus = existing.status === "lunas" ? "belum_lunas" : "lunas";
      const updated = await prisma.payment.update({
        where: { id: existing.id },
        data: {
          status: newStatus,
          paymentDate: newStatus === "lunas" ? new Date() : null,
        },
      });
      return NextResponse.json(updated);
    }

    const created = await prisma.payment.create({
      data: {
        landPlotId,
        year,
        month,
        status: "lunas",
        paymentDate: new Date(),
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("PBB toggle error:", err);
    return NextResponse.json(
      { error: "Gagal mengubah status pembayaran" },
      { status: 500 },
    );
  }
}
