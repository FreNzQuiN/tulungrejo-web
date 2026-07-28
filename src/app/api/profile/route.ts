import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { safeJsonParse } from "@/lib/utils";
import { validateArticleImage } from "@/lib/constants";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { getVillageProfile } from "@/lib/desa-queries";
import type { Administratif, OrgMember, TugasFungsi } from "@/lib/types";

function isArrayOf<T>(
  arr: unknown,
  guard: (item: unknown) => item is T,
): arr is T[] {
  return Array.isArray(arr) && arr.every(guard);
}

function isOrgMember(v: unknown): v is OrgMember {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as Record<string, unknown>).role === "string" &&
    typeof (v as Record<string, unknown>).name === "string"
  );
}

function isTugasFungsiItem(v: unknown): v is TugasFungsi {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as Record<string, unknown>).jabatan === "string" &&
    typeof (v as Record<string, unknown>).tugas === "string"
  );
}

function isAdministratif(v: unknown): v is Administratif {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const keys: (keyof Administratif)[] = [
    "koordinat",
    "batasUtara",
    "batasSelatan",
    "batasTimur",
    "batasBarat",
    "luasWilayah",
    "mataPencaharianUtama",
    "saranaPendidikan",
    "saranaKesehatan",
  ];
  return keys.every(
    (k) => typeof (v as Record<string, unknown>)[k] === "string",
  );
}

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
  const {
    visi,
    misi,
    strukturOrganisasi,
    strukturOrganisasiImage,
    tugasFungsi,
    administratif,
  } = body;

  if (!visi) {
    return NextResponse.json({ error: "Visi harus diisi" }, { status: 400 });
  }

  if (
    misi !== undefined &&
    !isArrayOf(misi, (s): s is string => typeof s === "string")
  ) {
    return NextResponse.json(
      { error: "Misi harus berupa array of string" },
      { status: 400 },
    );
  }

  if (
    strukturOrganisasi !== undefined &&
    !isArrayOf(strukturOrganisasi, isOrgMember)
  ) {
    return NextResponse.json(
      { error: "Struktur organisasi harus berupa array of { role, name }" },
      { status: 400 },
    );
  }

  if (tugasFungsi !== undefined && !isArrayOf(tugasFungsi, isTugasFungsiItem)) {
    return NextResponse.json(
      { error: "Tugas fungsi harus berupa array of { jabatan, tugas }" },
      { status: 400 },
    );
  }

  if (administratif !== undefined && !isAdministratif(administratif)) {
    return NextResponse.json(
      {
        error:
          "Administratif harus berupa objek dengan semua field bertipe string",
      },
      { status: 400 },
    );
  }

  if (strukturOrganisasiImage !== undefined) {
    if (
      strukturOrganisasiImage !== null &&
      typeof strukturOrganisasiImage !== "string"
    ) {
      return NextResponse.json(
        { error: "Gambar struktur organisasi tidak valid" },
        { status: 400 },
      );
    }
    if (typeof strukturOrganisasiImage === "string") {
      const err = validateArticleImage(strukturOrganisasiImage);
      if (err) {
        return NextResponse.json({ error: err }, { status: 400 });
      }
    }
    // null = clear the image, string = validated base64 — both fall through to update
  }

  try {
    const profile = await prisma.villageProfile.findFirst({
      orderBy: { id: "asc" },
    });
    if (!profile) {
      return NextResponse.json(
        { error: "Profil desa tidak ditemukan" },
        { status: 404 },
      );
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
        ...(strukturOrganisasiImage !== undefined && {
          strukturOrganisasiImage: strukturOrganisasiImage, // null or base64 string
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
      strukturOrganisasiImage: updated.strukturOrganisasiImage ?? undefined,
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
