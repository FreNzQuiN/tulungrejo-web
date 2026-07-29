import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/types";
import type { Session } from "@/lib/auth/types";

type AuthError = { error: NextResponse };
type AuthSuccess = { session: Session; assignedBlok: string | null };
type AuthResult = AuthError | AuthSuccess;

function isError(result: AuthResult): result is AuthError {
  return "error" in result;
}

export async function requireAuth(): Promise<AuthResult> {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, assignedBlok: true, tokenVersion: true },
  });
  if (
    !dbUser ||
    dbUser.role !== session.user.role ||
    (session.user.tokenVersion !== undefined &&
      dbUser.tokenVersion !== session.user.tokenVersion)
  ) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, assignedBlok: dbUser.assignedBlok ?? null };
}

export async function requireRole(
  allowedRoles: UserRole[],
): Promise<AuthResult> {
  const result = await requireAuth();
  if (isError(result)) return result;

  const role = result.session.user.role as UserRole | undefined;
  if (!role || !allowedRoles.includes(role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return result;
}

export function unwrapSession(result: AuthResult): Session | null {
  if (isError(result)) return null;
  return result.session;
}

export function getAssignedBlok(result: AuthResult): string | null {
  if (isError(result)) return null;
  return result.assignedBlok ?? null;
}
