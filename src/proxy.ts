// Next.js 16 proxy (replaces middleware.ts)
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export const proxy = auth((req) => {
  const path = req.nextUrl.pathname;

  // Rate limit API routes
  if (path.startsWith("/api/")) {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`edge:api:${ip}`, {
      windowMs: 60_000,
      maxAttempts: 60,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi nanti." },
        { status: 429 },
      );
    }
    return NextResponse.next();
  }

  const session = req.auth;

  // Redirect unauthenticated users to login
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user?.role;

  // Dashboard routes — match FE paths
  if (path.startsWith("/pbb") && role !== "pamong_pajak") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (path.startsWith("/kepala-desa") && role !== "kepala_desa") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (path.startsWith("/jurnalis") && role !== "jurnalis") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/api/((?!auth).*)",
    "/pbb/:path*",
    "/kepala-desa/:path*",
    "/jurnalis/:path*",
  ],
};
