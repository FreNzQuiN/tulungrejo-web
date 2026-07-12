import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { fetchAllCitizenViews } from "@/lib/pbb-queries";

export async function GET() {
  const auth = await requireRole(["pamong_pajak"]);
  if ("error" in auth) return auth.error;

  try {
    const citizens = await fetchAllCitizenViews();
    return NextResponse.json(citizens);
  } catch (err) {
    console.error("PBB list error:", err);
    return NextResponse.json(
      { error: "Gagal memuat data warga" },
      { status: 500 },
    );
  }
}
