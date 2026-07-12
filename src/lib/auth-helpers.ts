import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/types";
import type { Session } from "next-auth";

type AuthError = { error: NextResponse };
type AuthSuccess = { session: Session };
type AuthResult = AuthError | AuthSuccess;

function isError(result: AuthResult): result is AuthError {
  return "error" in result;
}

export async function requireAuth(): Promise<AuthResult> {
  const session = await auth();
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session };
}

export async function requireRole(
  allowedRoles: UserRole[],
): Promise<AuthResult> {
  const result = await requireAuth();
  if (isError(result)) return result;

  const role = result.session.user?.role as UserRole | undefined;
  if (!role || !allowedRoles.includes(role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return result;
}

export function getRole(result: AuthResult): UserRole | null {
  if (isError(result)) return null;
  return (result.session.user?.role as UserRole) ?? null;
}

export function getSession(result: AuthResult): Session | null {
  if (isError(result)) return null;
  return result.session;
}
