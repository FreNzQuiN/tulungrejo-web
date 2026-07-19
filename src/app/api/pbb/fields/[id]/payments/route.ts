import { NextRequest, NextResponse } from "next/server";
import { requireRole, unwrapSession, getAssignedBlok } from "@/lib/auth/guards";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { prisma } from "@/lib/prisma";
import type { PaymentRecord } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["pamong_pajak", "kepala_desa"]);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;

    const field = await prisma.fields.findUnique({ where: { id } });
    if (!field) {
      return NextResponse.json(
        { error: "Bidang tidak ditemukan." },
        { status: 404 },
      );
    }

    const session = unwrapSession(auth);
    if (session?.user?.role === "pamong_pajak") {
      const assignedBlok = await getAssignedBlok(auth);
      if (assignedBlok && field.blok !== assignedBlok) {
        return NextResponse.json(
          { error: "Anda tidak memiliki akses ke bidang ini." },
          { status: 403 },
        );
      }
    }

    const payments = await prisma.payments.findMany({
      where: { fieldId: id },
      orderBy: { year: "desc" },
      include: {
        marker: { select: { name: true } },
      },
    });

    const result: PaymentRecord[] = payments.map((p) => ({
      id: p.id,
      fieldId: p.fieldId,
      year: p.year,
      status: p.status,
      markedAt: p.markedAt?.toISOString() ?? null,
      notes: p.notes,
      markerName: p.marker?.name ?? null,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("Payment history error:", err);
    return NextResponse.json(
      { error: "Gagal memuat riwayat pembayaran." },
      { status: 500 },
    );
  }
}
