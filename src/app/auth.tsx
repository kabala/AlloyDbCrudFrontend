import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  AuthUser,
  RoleName,
  Session,
  api,
  clearSession,
  loadSession,
  saveSession,
  setUnauthorizedHandler,
} from "@/api";

type AuthContextValue = {
  session: Session | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasAnyRole: (roles?: RoleName[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession());

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      setSession(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      login: async (email, password) => {
        const next = await api.auth.login(email, password);
        saveSession(next);
        setSession(next);
      },
      logout: () => {
        clearSession();
        setSession(null);
      },
      hasAnyRole: (roles) => {
        if (!roles || roles.length === 0) return Boolean(session);
        return roles.some((role) => session?.user.roles.includes(role));
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider.");
  return context;
}
