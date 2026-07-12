import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeJsonParse } from "@/lib/utils";
import type { ArticleFrontmatter } from "@/lib/types";

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
    });

    const result: ArticleFrontmatter[] = articles.map((a) => ({
      title: a.title,
      slug: a.slug,
      date: a.date instanceof Date ? a.date.toISOString() : String(a.date),
      author: a.author,
      category: a.category,
      summary: a.summary,
      image: a.image ?? undefined,
      tags: a.tags ? safeJsonParse<string[]>(a.tags, []) : undefined,
      published: a.published,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("Public articles fetch error:", err);
    return NextResponse.json(
      { error: "Gagal memuat artikel" },
      { status: 500 },
    );
  }
}
