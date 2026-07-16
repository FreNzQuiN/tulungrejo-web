import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { safeJsonParse } from "@/lib/utils";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  try {
    const profile = await prisma.villageProfile.findFirst();
    if (!profile) {
      return NextResponse.json(
        { error: "Profil desa tidak ditemukan" },
        { status: 404 },
      );
    }

    const misi = safeJsonParse<string[]>(profile.misi, []);
    const strukturOrganisasi = safeJsonParse<{ role: string; name: string }[]>(
      profile.strukturOrganisasi,
      [],
    );
    const tugasFungsi = safeJsonParse<{ jabatan: string; tugas: string }[]>(
      profile.tugasFungsi,
      [],
    );
    const administratif = safeJsonParse<Record<string, string>>(
      profile.administratif,
      {},
    );

    return NextResponse.json(
      {
        visi: profile.visi,
        misi,
        strukturOrganisasi,
        tugasFungsi,
        administratif,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (err) {
    console.error("Profile fetch error:", err);
    return NextResponse.json(
      { error: "Gagal memuat profil desa" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["jurnalis"]);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { visi, misi, strukturOrganisasi, tugasFungsi, administratif } = body;

  if (!visi) {
    return NextResponse.json({ error: "Visi harus diisi" }, { status: 400 });
  }

  try {
    const profile = await prisma.villageProfile.findFirst({
      orderBy: { id: "asc" },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const updated = await prisma.villageProfile.update({
      where: { id: profile.id },
      data: {
        ...(visi !== undefined && { visi }),
        ...(misi !== undefined && { misi: JSON.stringify(misi) }),
        ...(strukturOrganisasi !== undefined && {
          strukturOrganisasi: JSON.stringify(strukturOrganisasi),
        }),
        ...(tugasFungsi !== undefined && {
          tugasFungsi: JSON.stringify(tugasFungsi),
        }),
        ...(administratif !== undefined && {
          administratif: JSON.stringify(administratif),
        }),
      },
    });

    revalidateTag("village-profile", "max");

    return NextResponse.json({
      visi: updated.visi,
      misi: safeJsonParse(updated.misi, []),
      strukturOrganisasi: safeJsonParse(updated.strukturOrganisasi, []),
      tugasFungsi: safeJsonParse(updated.tugasFungsi, []),
      administratif: safeJsonParse(updated.administratif, {}),
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui profil desa" },
      { status: 500 },
    );
  }
}
