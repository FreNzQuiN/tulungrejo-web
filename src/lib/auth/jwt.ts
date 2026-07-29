import { jwtVerify } from "jose";
import { ALLOWED_ROLES } from "@/lib/types";
import type { SessionUser } from "@/lib/auth/types";
import { getJwtSecret } from "./secret";

const SECRET = getJwtSecret();

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role as SessionUser["role"];
    if (!role || !ALLOWED_ROLES.includes(role)) return null;
    const id = Number(payload.sub ?? payload.id);
    if (!id) return null;
    return {
      id,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role,
      tokenVersion:
        payload.tokenVersion != null ? Number(payload.tokenVersion) : undefined,
    };
  } catch (err) {
    console.error("verifyToken error:", err);
    return null;
  }
}
