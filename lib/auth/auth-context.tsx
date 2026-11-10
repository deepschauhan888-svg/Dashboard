"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthService, Session, UserRole } from "./types";
import { DemoAuthService } from "./demo-auth";

/**
 * Selects the auth implementation. Only "demo" exists in the showcase build;
 * a SupabaseAuthService will be added behind NEXT_PUBLIC_AUTH_PROVIDER=supabase.
 */
function createAuthService(): AuthService {
  return new DemoAuthService();
}

interface AuthContextValue {
  session: Session | null;
  ready: boolean;
  service: AuthService;
  signIn: (email: string, password: string, remember: boolean) => Promise<Session>;
  startDemo: (role: UserRole) => Promise<Session>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [service] = useState<AuthService>(() => createAuthService());
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(service.getSession());
    setReady(true);
  }, [service]);

  const signIn = useCallback(
    async (email: string, password: string, remember: boolean) => {
      const s = await service.signIn(email, password, remember);
      setSession(s);
      return s;
    },
    [service],
  );

  const startDemo = useCallback(
    async (role: UserRole) => {
      const s = await service.startDemo(role);
      setSession(s);
      return s;
    },
    [service],
  );

  const signOut = useCallback(async () => {
    await service.signOut();
    setSession(null);
  }, [service]);

  const value = useMemo(
    () => ({ session, ready, service, signIn, startDemo, signOut }),
    [session, ready, service, signIn, startDemo, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
