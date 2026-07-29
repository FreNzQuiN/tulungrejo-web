import { NextRequest, NextResponse } from "next/server";
import { requireRole, getAssignedBlok } from "@/lib/auth/guards";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { findFields } from "@/lib/pbb-queries";
import { sanitizeSearch } from "@/lib/utils";

const MAX_TAKE = 500;

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["pamong_pajak", "kepala_desa"]);
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    let blok = searchParams.get("blok");
    const raw = searchParams.get("search");
    const search = sanitizeSearch(raw);
    const take = Math.min(
      Number(searchParams.get("take")) || MAX_TAKE,
      MAX_TAKE,
    );
    const skip = Math.max(0, Number(searchParams.get("skip")) || 0);

    const assignedBlok = await getAssignedBlok(auth);
    if (assignedBlok) blok = assignedBlok;

    const fields = await findFields({ blok, search, take, skip });

    return NextResponse.json(
      fields.map((f) => ({
        id: f.id,
        nop: f.nop,
        noUrut: f.noUrut,
        ownerName: f.ownerName,
        ownerAddress: f.ownerAddress,
        address: f.address,
        rw: f.rw,
        rt: f.rt,
        blok: f.blok,
        noBidang: f.noBidang,
        dusun: f.dusun,
        landArea: f.landArea != null ? Number(f.landArea) : null,
        buildingArea: f.buildingArea != null ? Number(f.buildingArea) : null,
        buildingCount: f.buildingCount,
        znt: f.znt,
        jenisTanah: f.jenisTanah,
        pendataanAt: f.pendataanAt?.toISOString() ?? null,
      })),
    );
  } catch (err) {
    console.error("PBB plots error:", err);
    return NextResponse.json(
      { error: "Gagal memuat data bidang." },
      { status: 500 },
    );
  }
}
