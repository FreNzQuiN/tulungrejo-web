import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireRole } from "@/lib/auth-helpers";
import {
  getAllArticlesForJournalist,
  createArticle,
  checkSlugExists,
} from "@/lib/article-queries";
import { CATEGORIES, MAX_IMAGE_SIZE } from "@/lib/constants";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["jurnalis"]);
  if ("error" in auth) return auth.error;

  const articles = await getAllArticlesForJournalist();
  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["jurnalis"]);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { title, slug, category, summary, content, image, tags, published } =
    body;

  if (!title || title.length > 255) {
    return NextResponse.json(
      { error: "Judul harus diisi (max 255 karakter)" },
      { status: 400 },
    );
  }
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json(
      { error: "Slug tidak valid (hanya huruf kecil, angka, dan tanda strip)" },
      { status: 400 },
    );
  }
  if (await checkSlugExists(slug)) {
    return NextResponse.json(
      { error: "Slug sudah digunakan" },
      { status: 409 },
    );
  }
  if (
    !category ||
    !CATEGORIES.includes(category as (typeof CATEGORIES)[number])
  ) {
    return NextResponse.json(
      { error: "Kategori tidak valid" },
      { status: 400 },
    );
  }
  if (!summary || summary.length > 500) {
    return NextResponse.json(
      { error: "Ringkasan harus diisi (max 500 karakter)" },
      { status: 400 },
    );
  }
  if (!content) {
    return NextResponse.json({ error: "Konten harus diisi" }, { status: 400 });
  }
  if (image && typeof image === "string") {
    if (image.length > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran gambar terlalu besar (maks 5MB)" },
        { status: 400 },
      );
    }
    const VALID_PREFIXES = [
      "data:image/webp;base64,",
      "data:image/jpeg;base64,",
      "data:image/png;base64,",
    ];
    if (!VALID_PREFIXES.some((p) => image.startsWith(p))) {
      return NextResponse.json(
        {
          error: "Format gambar tidak didukung. Gunakan webp, jpeg, atau png.",
        },
        { status: 400 },
      );
    }
  }

  try {
    const author = auth.session.user?.name ?? "Jurnalis";
    const today = new Date().toISOString().substring(0, 10);
    const articleSlug = await createArticle({
      title,
      slug,
      date: today,
      author,
      category,
      summary,
      content,
      image: image || "",
      tags: tags || [],
      published: published ?? true,
    });
    revalidateTag("articles", "max");
    return NextResponse.json({ slug: articleSlug }, { status: 201 });
  } catch (err) {
    console.error("Create article error:", err);
    return NextResponse.json(
      { error: "Gagal membuat artikel" },
      { status: 500 },
    );
  }
}
