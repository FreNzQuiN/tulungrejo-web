// Replaces middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_PRESETS,
} from "@/lib/rate-limit";

export const proxy = auth(async (req) => {
  const path = req.nextUrl.pathname;

  if (path.startsWith("/api/")) {
    const ip = getClientIp(req);
    if (!ip) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    const rl = await checkRateLimit(`api:${ip}`, RATE_LIMIT_PRESETS.api);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi nanti." },
        { status: 429 },
      );
    }
    return NextResponse.next();
  }

  const session = req.auth;

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user?.role;

  // Match FE dashboard routes
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
