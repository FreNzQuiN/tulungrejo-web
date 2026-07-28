import { jwtVerify } from "jose";
import { ALLOWED_ROLES } from "@/lib/types";
import type { SessionUser } from "@/lib/auth/types";

const SECRET_RAW = process.env.JWT_SECRET ?? process.env.AUTH_SECRET;
if (!SECRET_RAW) throw new Error("JWT_SECRET or AUTH_SECRET must be set");
if (SECRET_RAW.length < 32)
  throw new Error(
    "JWT_SECRET or AUTH_SECRET must be at least 32 characters long",
  );
const SECRET = new TextEncoder().encode(SECRET_RAW);

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
