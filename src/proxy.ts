import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequestEdge } from "@/lib/auth/session";

const PUBLIC_API_PATHS = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (PUBLIC_API_PATHS.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequestEdge(request);

  const isApiRoute = path.startsWith("/api/");
  const isDashboardRoute =
    path.startsWith("/pbb") ||
    path.startsWith("/kepala-desa") ||
    path.startsWith("/jurnalis");

  if (!isApiRoute && !isDashboardRoute) {
    return NextResponse.next();
  }

  if (!session) {
    if (isDashboardRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;

  if (path.startsWith("/pbb") && role !== "pamong_pajak") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (path.startsWith("/kepala-desa") && role !== "kepala_desa") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (path.startsWith("/jurnalis") && role !== "jurnalis") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/pbb/:path*",
    "/kepala-desa/:path*",
    "/jurnalis/:path*",
  ],
};
