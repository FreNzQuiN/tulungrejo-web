import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireRole } from "@/lib/auth-helpers";
import {
  getArticleBySlugAll,
  updateArticle,
  deleteArticle,
  checkSlugExists,
} from "@/lib/article-queries";
import { CATEGORIES, MAX_IMAGE_SIZE } from "@/lib/constants";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["jurnalis"]);
  if ("error" in auth) return auth.error;

  const { slug } = await params;
  const article = await getArticleBySlugAll(slug);
  if (!article) {
    return NextResponse.json(
      { error: "Artikel tidak ditemukan" },
      { status: 404 },
    );
  }
  return NextResponse.json(article);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["jurnalis"]);
  if ("error" in auth) return auth.error;

  const { slug } = await params;
  const body = await req.json();
  const {
    title,
    slug: newSlug,
    category,
    summary,
    content,
    image,
    tags,
    published,
  } = body;

  if (title !== undefined && (!title || title.length > 255)) {
    return NextResponse.json({ error: "Judul tidak valid" }, { status: 400 });
  }
  if (newSlug !== undefined && newSlug !== slug) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newSlug)) {
      return NextResponse.json({ error: "Slug tidak valid" }, { status: 400 });
    }
    if (await checkSlugExists(newSlug, slug)) {
      return NextResponse.json(
        { error: "Slug sudah digunakan" },
        { status: 409 },
      );
    }
  }
  if (
    category !== undefined &&
    !CATEGORIES.includes(category as (typeof CATEGORIES)[number])
  ) {
    return NextResponse.json(
      { error: "Kategori tidak valid" },
      { status: 400 },
    );
  }
  if (image !== undefined && typeof image === "string") {
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
    await updateArticle(slug, {
      ...(title !== undefined && { title }),
      ...(newSlug !== undefined && { slug: newSlug }),
      ...(category !== undefined && { category }),
      ...(summary !== undefined && { summary }),
      ...(content !== undefined && { content }),
      ...(image !== undefined && { image }),
      ...(tags !== undefined && { tags }),
      ...(published !== undefined && { published }),
    });

    const finalSlug = newSlug ?? slug;
    const updated = await getArticleBySlugAll(finalSlug);
    revalidateTag("articles", "max");
    if (finalSlug !== slug) revalidateTag(`article-${slug}`, "max");
    revalidateTag(`article-${finalSlug}`, "max");
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update article error:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui artikel" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["jurnalis"]);
  if ("error" in auth) return auth.error;

  const { slug } = await params;
  try {
    const deleted = await deleteArticle(slug);
    if (!deleted) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan" },
        { status: 404 },
      );
    }
    revalidateTag("articles", "max");
    revalidateTag(`article-${slug}`, "max");
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Delete article error:", err);
    return NextResponse.json(
      { error: "Gagal menghapus artikel" },
      { status: 500 },
    );
  }
}
