import { jwtVerify } from "jose";
import { ALLOWED_ROLES } from "@/lib/types";
import type { SessionUser, Session } from "@/lib/auth/types";

const SECRET_RAW = process.env.JWT_SECRET ?? process.env.AUTH_SECRET;
if (!SECRET_RAW) throw new Error("JWT_SECRET or AUTH_SECRET must be set");
const SECRET = new TextEncoder().encode(SECRET_RAW);

const COOKIE_NAME = "session-token";

async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role as SessionUser["role"];
    if (!role || !ALLOWED_ROLES.includes(role)) return null;
    return {
      id: Number(payload.sub ?? payload.id),
      email: payload.email as string,
      name: payload.name as string,
      role,
    };
  } catch {
    return null;
  }
}

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
