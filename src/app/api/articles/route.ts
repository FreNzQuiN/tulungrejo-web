import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import {
  getAllArticlesForJournalistWithMeta,
  createArticle,
  checkSlugExists,
} from "@/lib/article-queries";
import { CATEGORIES, validateArticleImage } from "@/lib/constants";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["jurnalis"]);
  if ("error" in auth) return auth.error;

  const take = Math.min(
    Number(req.nextUrl.searchParams.get("take")) || 100,
    500,
  );
  const skip = Math.max(0, Number(req.nextUrl.searchParams.get("skip")) || 0);
  const { data: articles, total } = await getAllArticlesForJournalistWithMeta(
    take,
    skip,
  );
  const page = Math.floor(skip / take) + 1;
  return NextResponse.json({
    data: articles,
    meta: { total, page, pageSize: take, hasMore: skip + take < total },
  });
}

export async function POST(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["jurnalis"]);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const {
    title,
    slug,
    category,
    summary,
    content,
    image,
    tags,
    published,
    date,
  } = body;

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
  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Konten harus diisi" }, { status: 400 });
  }
  if (content.length > 100000) {
    return NextResponse.json(
      { error: "Konten terlalu panjang (maks 100.000 karakter)" },
      { status: 400 },
    );
  }
  if (image && typeof image === "string") {
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

  if (tags !== undefined && !Array.isArray(tags)) {
    return NextResponse.json(
      { error: "Tags harus berupa array" },
      { status: 400 },
    );
  }

  try {
    const author = auth.session.user?.name ?? "Jurnalis";
    const defaultDate = new Date().toISOString().substring(0, 10);
    const articleSlug = await createArticle(
      {
        title,
        slug,
        date: date ?? defaultDate,
        author,
        category,
        summary,
        content,
        image: image || "",
        tags: tags || [],
        published: published ?? true,
      },
      auth.session.user.id,
    );
    revalidateTag("articles", "max");
    return NextResponse.json({ slug: articleSlug }, { status: 201 });
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Slug sudah digunakan" },
        { status: 409 },
      );
    }
    console.error("Create article error:", err);
    return NextResponse.json(
      { error: "Gagal membuat artikel" },
      { status: 500 },
    );
  }
}
