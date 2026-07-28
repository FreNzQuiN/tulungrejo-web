import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { getContactInfo } from "@/lib/desa-queries";
import { safeJsonParse } from "@/lib/utils";
import type { SocialMediaLink } from "@/lib/types";

function isSocialMediaArray(v: unknown): v is SocialMediaLink[] {
  if (!Array.isArray(v)) return false;
  return v.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>).platform === "string" &&
      typeof (item as Record<string, unknown>).url === "string",
  );
}

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  try {
    const contact = await getContactInfo();

    return NextResponse.json(contact, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("Contact fetch error:", err);
    return NextResponse.json(
      { error: "Gagal memuat informasi kontak" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["jurnalis"]);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { address, phone, email, jamKerja, jamLibur, socialMedia } = body;

  if (!address) {
    return NextResponse.json({ error: "Alamat harus diisi" }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json(
      { error: "Nomor telepon harus diisi" },
      { status: 400 },
    );
  }
  if (!email) {
    return NextResponse.json({ error: "Email harus diisi" }, { status: 400 });
  }

  if (socialMedia !== undefined && !isSocialMediaArray(socialMedia)) {
    return NextResponse.json(
      { error: "Social media harus berupa array of { platform, url }" },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.contactInfo.findFirst({
      orderBy: { id: "asc" },
    });

    const data = {
      ...(address !== undefined && { address }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(jamKerja !== undefined && { jamKerja }),
      ...(jamLibur !== undefined && { jamLibur }),
      ...(socialMedia !== undefined && {
        socialMedia: JSON.stringify(socialMedia),
      }),
    };

    let updated;
    if (!existing) {
      updated = await prisma.contactInfo.create({ data: data as any });
    } else {
      updated = await prisma.contactInfo.update({
        where: { id: existing.id },
        data,
      });
    }

    revalidateTag("contact-info", "max");

    return NextResponse.json({
      address: updated.address,
      phone: updated.phone,
      email: updated.email,
      jamKerja: updated.jamKerja,
      jamLibur: updated.jamLibur,
      socialMedia: safeJsonParse<SocialMediaLink[]>(updated.socialMedia, []),
    });
  } catch (err) {
    console.error("Contact update error:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui informasi kontak" },
      { status: 500 },
    );
  }
}
