import type { UserRole } from "./types";

const VALID_ROLES = new Set<string>([
  "kepala_desa",
  "pamong_pajak",
  "jurnalis",
]);

export const authCookieConfig = {
  sessionToken: {
    options: {
      sameSite: "lax" as const,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  },
  csrfToken: {
    options: {
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authCallbacks: any = {
  jwt({ token, user }: { token: unknown; user?: unknown }) {
    if (user) {
      (token as Record<string, unknown>).role = (
        user as { role: UserRole }
      ).role;
    }
    return token;
  },
  session({ session, token }: { session: unknown; token: unknown }) {
    const s = session as { user?: Record<string, unknown> };
    if (s.user) {
      const role = (token as Record<string, unknown>).role as
        string | undefined;
      if (role && VALID_ROLES.has(role)) {
        s.user.role = role as UserRole;
      }
      s.user.id = ((token as Record<string, unknown>).sub as string) ?? "";
    }
    return session;
  },
};
