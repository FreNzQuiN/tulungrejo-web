import type { SessionUser, Session } from "@/lib/auth/types";
import { verifyToken } from "./jwt";

const COOKIE_NAME = "session-token";

function parseCookie(cookie: string, name: string): string | null {
  for (const part of cookie.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (key === name) {
      return part.slice(eq + 1).trim();
    }
  }
  return null;
}

export async function getSessionFromRequestEdge(
  request: Request,
): Promise<Session | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = parseCookie(cookieHeader, COOKIE_NAME);
  if (!token) return null;
  const user = await verifyToken(token);
  if (!user) return null;
  return { user };
}
