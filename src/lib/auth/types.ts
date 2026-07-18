import type { UserRole } from "@/lib/types";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Session {
  user: SessionUser;
}
