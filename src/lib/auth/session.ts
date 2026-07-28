import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { SessionUser, Session } from "@/lib/auth/types";
import { verifyToken } from "./jwt";

const SECRET_RAW = process.env.JWT_SECRET ?? process.env.AUTH_SECRET;
if (!SECRET_RAW) throw new Error("JWT_SECRET or AUTH_SECRET must be set");
if (SECRET_RAW.length < 32)
  throw new Error(
    "JWT_SECRET or AUTH_SECRET must be at least 32 characters long",
  );
const SECRET = new TextEncoder().encode(SECRET_RAW);

const COOKIE_NAME = "session-token";

const COOKIE_OPTIONS = {
  sameSite: "lax" as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function signToken(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .setSubject(String(payload.id))
    .sign(SECRET);
}

async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await signToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const user = await verifyToken(token);
  if (!user) return null;
  return { user };
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { setSessionCookie };
