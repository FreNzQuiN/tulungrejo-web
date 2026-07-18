import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";
import { importExcel } from "@/lib/pbb-import";

export async function POST(req: NextRequest) {
  if (!(await checkApiRateLimit(req))) return rateLimitResponse();

  const auth = await requireRole(["pamong_pajak"]);
  if ("error" in auth) return auth.error;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "File Excel wajib diupload." },
        { status: 400 },
      );
    }

    if (
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls") &&
      !file.name.endsWith(".csv")
    ) {
      return NextResponse.json(
        { error: "Format file harus .xlsx, .xls, atau .csv." },
        { status: 400 },
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 10MB." },
        { status: 400 },
      );
    }

    const ALLOWED_MIME_TYPES = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "text/plain",
    ];

    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await importExcel(buffer, file.name);

    return NextResponse.json(result);
  } catch (err) {
    console.error("PBB import error:", err);
    return NextResponse.json(
      { error: "Gagal mengimpor file. Pastikan format sesuai." },
      { status: 500 },
    );
  }
}
