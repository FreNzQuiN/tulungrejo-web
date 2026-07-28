import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { getHomepageContent } from "@/lib/desa-queries";

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((s) => typeof s === "string");
}

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  try {
    const content = await getHomepageContent();

    return NextResponse.json(content, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("HomepageContent fetch error:", err);
    return NextResponse.json(
      { error: "Gagal memuat konten halaman depan" },
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
    heroTitle,
    heroSubtitle,
    heroDescription,
    aboutTitle,
    aboutParagraphs,
    googleMapsUrl,
  } = body;

  if (!heroTitle) {
    return NextResponse.json(
      { error: "Judul hero harus diisi" },
      { status: 400 },
    );
  }

  if (aboutParagraphs !== undefined && !isStringArray(aboutParagraphs)) {
    return NextResponse.json(
      { error: "Paragraf about harus berupa array of string" },
      { status: 400 },
    );
  }

  if (googleMapsUrl !== undefined) {
    try {
      const parsed = new URL(googleMapsUrl);
      if (
        parsed.hostname !== "www.google.com" ||
        !parsed.pathname.startsWith("/maps/embed")
      ) {
        return NextResponse.json(
          {
            error:
              "URL Google Maps tidak valid. Gunakan embed URL dari Google Maps",
          },
          { status: 400 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "URL Google Maps tidak valid" },
        { status: 400 },
      );
    }
  }

  try {
    const existing = await prisma.homepageContent.findFirst({
      orderBy: { id: "asc" },
    });

    const data = {
      heroTitle: heroTitle ?? "",
      heroSubtitle: heroSubtitle ?? "",
      heroDescription: heroDescription ?? "",
      aboutTitle: aboutTitle ?? "",
      aboutParagraphs: aboutParagraphs ? JSON.stringify(aboutParagraphs) : "[]",
      googleMapsUrl: googleMapsUrl ?? "",
    };

    if (!existing) {
      await prisma.homepageContent.create({ data });
    } else {
      await prisma.homepageContent.update({
        where: { id: existing.id },
        data,
      });
    }

    revalidateTag("homepage-content", "max");

    const updated = await getHomepageContent();
    return NextResponse.json(updated);
  } catch (err) {
    console.error("HomepageContent update error:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui konten halaman depan" },
      { status: 500 },
    );
  }
}
