"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Toaster } from "@/components/ui/toaster";
import type { SessionUser } from "@/lib/auth/types";

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refresh: async () => {},
  signOut: async () => {},
});

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

async function fetchUser(): Promise<SessionUser | null> {
  try {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    return data.user ?? null;
  } catch (err) {
    console.error("fetchUser error:", err);
    return null;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    fetchUser()
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const u = await fetchUser();
    setUser(u);
    setIsLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        refresh,
        signOut,
      }}
    >
      {children}
      <Toaster />
    </AuthContext.Provider>
  );
}
