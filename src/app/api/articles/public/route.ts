import { NextRequest, NextResponse } from "next/server";
import { getAllPublishedArticles } from "@/lib/article-queries";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

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
