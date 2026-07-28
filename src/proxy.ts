import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequestEdge } from "@/lib/auth/edge-session";

const PUBLIC_API_PATHS = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/contact",
  "/api/articles/public",
  "/api/homepage",
  "/api/profile",
  "/api/stats",
];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Use path-segment matching — prevents prefix bypass (e.g. /api/auth/login-backdoor)
  if (PUBLIC_API_PATHS.some((p) => path === p || path.startsWith(p + "/"))) {
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

  if (
    path.startsWith("/pbb") &&
    role !== "pamong_pajak" &&
    role !== "kepala_desa"
  ) {
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
    "/api",
    "/pbb/:path*",
    "/pbb",
    "/kepala-desa/:path*",
    "/kepala-desa",
    "/jurnalis/:path*",
    "/jurnalis",
  ],
};
