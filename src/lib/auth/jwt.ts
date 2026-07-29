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
    return {
      id: Number(payload.sub ?? payload.id ?? 0),
      email: payload.email as string,
      name: payload.name as string,
      role,
      tokenVersion: payload.tokenVersion as number | undefined,
    };
  } catch (err) {
    console.error("verifyToken error:", err);
    return null;
  }
}
