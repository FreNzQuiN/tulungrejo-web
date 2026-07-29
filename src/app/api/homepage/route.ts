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

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  const {
    heroTitle,
    heroSubtitle,
    heroDescription,
    aboutTitle,
    aboutParagraphs,
    googleMapsUrl,
  } = body as {
    heroTitle?: string;
    heroSubtitle?: string;
    heroDescription?: string;
    aboutTitle?: string;
    aboutParagraphs?: string[];
    googleMapsUrl?: string;
  };

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
      const allowedHosts = [
        "www.google.com",
        "maps.google.com",
        "maps.google.co.id",
      ];
      if (
        !allowedHosts.includes(parsed.hostname) ||
        !parsed.pathname.startsWith("/maps/embed")
      ) {
        throw new Error("Invalid URL");
      }
    } catch {
      return NextResponse.json(
        {
          error:
            "URL Google Maps tidak valid. Gunakan embed URL dari Google Maps",
        },
        { status: 400 },
      );
    }
  }

  try {
    const existing = await prisma.homepageContent.findFirst({
      orderBy: { id: "asc" },
    });

    const data: Record<string, unknown> = {
      ...(heroTitle !== undefined && { heroTitle }),
      ...(heroSubtitle !== undefined && { heroSubtitle }),
      ...(heroDescription !== undefined && { heroDescription }),
      ...(aboutTitle !== undefined && { aboutTitle }),
      ...(aboutParagraphs !== undefined && {
        aboutParagraphs: JSON.stringify(aboutParagraphs),
      }),
      ...(googleMapsUrl !== undefined && { googleMapsUrl }),
    };

    if (!existing) {
      await prisma.homepageContent.create({
        data: data as Parameters<
          typeof prisma.homepageContent.create
        >[0]["data"],
      });
    } else {
      await prisma.homepageContent.update({
        where: { id: existing.id },
        data: data as Parameters<
          typeof prisma.homepageContent.update
        >[0]["data"],
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
