import { NextResponse } from "next/server";
import { getAllPublishedArticles } from "@/lib/article-queries";

export async function GET() {
  try {
    const articles = await getAllPublishedArticles();

    return NextResponse.json(articles, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("Public articles fetch error:", err);
    return NextResponse.json(
      { error: "Gagal memuat artikel" },
      { status: 500 },
    );
  }
}
