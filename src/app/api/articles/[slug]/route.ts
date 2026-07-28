import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import {
  getArticleBySlugAll,
  updateArticle,
  deleteArticle,
  checkSlugExists,
} from "@/lib/article-queries";
import { CATEGORIES, validateArticleImage } from "@/lib/constants";
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

async function ensureArticleOwnership(
  slug: string,
  userId: number,
): Promise<NextResponse | null> {
  const existing = await prisma.article.findUnique({
    where: { slug },
    select: { authorId: true },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Artikel tidak ditemukan" },
      { status: 404 },
    );
  }
  if (existing.authorId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["jurnalis"]);
  if ("error" in auth) return auth.error;

  const { slug } = await params;

  const ownershipError = await ensureArticleOwnership(
    slug,
    auth.session.user.id,
  );
  if (ownershipError) return ownershipError;

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
    date,
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
  if (summary !== undefined && (!summary || summary.length > 500)) {
    return NextResponse.json(
      { error: "Ringkasan tidak valid (max 500 karakter)" },
      { status: 400 },
    );
  }
  if (content !== undefined && (typeof content !== "string" || !content)) {
    return NextResponse.json({ error: "Konten tidak valid" }, { status: 400 });
  }
  if (image !== undefined && typeof image === "string") {
    const imgErr = validateArticleImage(image);
    if (imgErr) {
      return NextResponse.json({ error: imgErr }, { status: 400 });
    }
  }

  if (date !== undefined) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json(
        { error: "Format tanggal tidak valid" },
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
      ...(date !== undefined && { date }),
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

  const ownershipError = await ensureArticleOwnership(
    slug,
    auth.session.user.id,
  );
  if (ownershipError) return ownershipError;

  try {
    const result = await deleteArticle(slug);
    if (!result.success) {
      if (result.notFound) {
        return NextResponse.json(
          { error: "Artikel tidak ditemukan" },
          { status: 404 },
        );
      }
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
