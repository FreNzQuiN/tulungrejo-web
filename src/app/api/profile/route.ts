import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { safeJsonParse } from "@/lib/utils";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { getVillageProfile } from "@/lib/desa-queries";

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  try {
    const profile = await getVillageProfile();

    return NextResponse.json(profile, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
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

  if (
    misi !== undefined &&
    (!Array.isArray(misi) || !misi.every((s: unknown) => typeof s === "string"))
  ) {
    return NextResponse.json(
      { error: "Misi harus berupa array of string" },
      { status: 400 },
    );
  }
  if (
    strukturOrganisasi !== undefined &&
    (!Array.isArray(strukturOrganisasi) ||
      !strukturOrganisasi.every(
        (s: unknown) =>
          typeof s === "object" &&
          s !== null &&
          typeof (s as Record<string, unknown>).role === "string" &&
          typeof (s as Record<string, unknown>).name === "string",
      ))
  ) {
    return NextResponse.json(
      { error: "Struktur organisasi harus berupa array of { role, name }" },
      { status: 400 },
    );
  }
  if (
    tugasFungsi !== undefined &&
    (!Array.isArray(tugasFungsi) ||
      !tugasFungsi.every(
        (s: unknown) =>
          typeof s === "object" &&
          s !== null &&
          typeof (s as Record<string, unknown>).jabatan === "string" &&
          typeof (s as Record<string, unknown>).tugas === "string",
      ))
  ) {
    return NextResponse.json(
      { error: "Tugas fungsi harus berupa array of { jabatan, tugas }" },
      { status: 400 },
    );
  }
  if (
    administratif !== undefined &&
    (typeof administratif !== "object" ||
      administratif === null ||
      Array.isArray(administratif) ||
      !(
        [
          "koordinat",
          "batasUtara",
          "batasSelatan",
          "batasTimur",
          "batasBarat",
          "luasWilayah",
          "mataPencaharianUtama",
          "saranaPendidikan",
          "saranaKesehatan",
        ] as const
      ).every(
        (k) =>
          typeof (administratif as Record<string, unknown>)[k] === "string",
      ))
  ) {
    return NextResponse.json(
      {
        error:
          "Administratif harus berupa objek dengan semua field bertipe string",
      },
      { status: 400 },
    );
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
