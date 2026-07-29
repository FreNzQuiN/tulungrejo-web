import type { UserRole } from "@/lib/types";

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  tokenVersion?: number;
}

export interface Session {
  user: SessionUser;
}
