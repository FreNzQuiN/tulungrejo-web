// Middleware-safe auth — no providers, no Prisma, no rate-limit imports.
// Full config with providers lives in auth-full.ts.
import NextAuth from "next-auth";
import { authCookieConfig, authCallbacks } from "./auth-shared";

export const { auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  cookies: authCookieConfig,
  providers: [],
  callbacks: authCallbacks,
  pages: { signIn: "/login" },
});
