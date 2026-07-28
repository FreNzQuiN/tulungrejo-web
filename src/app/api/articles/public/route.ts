import { NextRequest, NextResponse } from "next/server";
import { getAllPublishedArticlesWithMeta } from "@/lib/article-queries";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

export async function GET(req: NextRequest) {
  if (!(await checkApiRateLimit(req, "api:public"))) return rateLimitResponse();

  try {
    const { searchParams } = req.nextUrl;
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");
    const take = limitParam
      ? Math.max(1, Math.min(100, parseInt(limitParam, 10)))
      : 10;
    const skip = offsetParam ? Math.max(0, parseInt(offsetParam, 10)) : 0;

    const { data: articles, total } = await getAllPublishedArticlesWithMeta(
      take,
      skip,
    );
    const page = Math.floor(skip / take) + 1;

    return NextResponse.json(
      {
        data: articles,
        meta: {
          total,
          page,
          pageSize: take,
          hasMore: skip + take < total,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (err) {
    console.error("Public articles fetch error:", err);
    return NextResponse.json(
      { error: "Gagal memuat artikel" },
      { status: 500 },
    );
  }
}
