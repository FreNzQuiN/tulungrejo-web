import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { UserRole } from "./types";
import { checkRateLimit } from "./rate-limit";

const VALID_ROLES = new Set<string>([
  "kepala_desa",
  "pamong_pajak",
  "jurnalis",
]);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      options: {
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
    },
    csrfToken: {
      options: {
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const ip =
          req?.headers?.get("x-real-ip") ??
          req?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";
        const rateLimit = checkRateLimit(`login:${ip}`);
        if (!rateLimit.allowed) {
          throw new Error("RATE_LIMITED");
        }

        const { prisma } = await import("./prisma");
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: UserRole }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const role = token.role as string | undefined;
        if (role && VALID_ROLES.has(role)) {
          session.user.role = role as UserRole;
        }
        session.user.id = token.sub ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
