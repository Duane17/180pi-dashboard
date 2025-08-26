"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { api, setAuthFailureHandler } from "@/lib/api";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/lib/auth-tokens";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserSummary,
  CompanySummary,
} from "@/types/auth";
import { isApiErrorResponse } from "@/types/api";
import { subscribe as subscribeTokens } from "@/lib/auth-tokens";
import { usePathname } from "next/navigation";

/* ---------------------------------------------
   LocalStorage keys (persist user/company/role)
---------------------------------------------- */
const LS_USER = "auth.user";
const LS_COMPANY = "auth.company";
const LS_ROLE = "auth.role";

/* ---------------------------------------------
   Context shape
---------------------------------------------- */
type AuthState = {
  user: UserSummary | null;
  company: CompanySummary | null;
  role: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isReady: boolean;
};

type AuthContextValue = AuthState & {
  loadFromStorage: () => void;
  signIn: (payload: LoginRequest) => Promise<LoginResponse>;
  signUp: (payload: RegisterRequest) => Promise<RegisterResponse>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/* ---------------------------------------------
   Provider
---------------------------------------------- */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [company, setCompany] = useState<CompanySummary | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const isAuthenticated = Boolean(user);   

  const tokensLookSane = useCallback((at: string | null, rt: string | null) => {
    const ok = (s: string | null) => !!s && typeof s === "string" && s.length >= 16;
    return ok(at) && ok(rt);
  }, []);

  const persistIdentity = useCallback(
    (u: UserSummary | null, c: CompanySummary | null, r: string | null) => {
      if (typeof window === "undefined") return;
      if (u) localStorage.setItem(LS_USER, JSON.stringify(u));
      else localStorage.removeItem(LS_USER);

      if (c) localStorage.setItem(LS_COMPANY, JSON.stringify(c));
      else localStorage.removeItem(LS_COMPANY);

      if (r) localStorage.setItem(LS_ROLE, r);
      else localStorage.removeItem(LS_ROLE);
    },
    []
  );

  const loadFromStorage = useCallback(() => {
    if (typeof window === "undefined") return;

    const at = getAccessToken();
    const rt = getRefreshToken();

    setAccessTokenState(at);
    setRefreshTokenState(rt);

    const uRaw = localStorage.getItem(LS_USER);
    const cRaw = localStorage.getItem(LS_COMPANY);
    const rRaw = localStorage.getItem(LS_ROLE);

    try {
      setUser(uRaw ? (JSON.parse(uRaw) as UserSummary) : null);
    } catch {
      setUser(null);
      localStorage.removeItem(LS_USER);
    }
    try {
      setCompany(cRaw ? (JSON.parse(cRaw) as CompanySummary) : null);
    } catch {
      setCompany(null);
      localStorage.removeItem(LS_COMPANY);
    }
    setRole(rRaw || null);
    
    setIsLoading(true);
    setIsReady(false)
  }, []);

  const signOut = useCallback(() => {
    clearTokens();
    persistIdentity(null, null, null);
    setUser(null);
    setCompany(null);
    setRole(null);
    setAccessTokenState(null);
    setRefreshTokenState(null);
  }, [persistIdentity]);

  const signIn = useCallback(
    async (payload: LoginRequest): Promise<LoginResponse> => {
      try {
        const { data } = await api.post<LoginResponse>("/auth/login", payload);

        setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        setAccessTokenState(data.accessToken);
        setRefreshTokenState(data.refreshToken);

        setUser(data.user);
        setCompany(data.company);
        setRole(data.role ?? null);
        persistIdentity(data.user, data.company, data.role ?? null);

        return data;
      } catch (err: any) {
        if (axios.isAxiosError(err) && isApiErrorResponse(err.response?.data)) {
          throw err.response!.data;
        }
        throw { message: "Unable to sign in. Please try again." };
      }
    },
    [persistIdentity]
  );

  const signUp = useCallback(
    async (payload: RegisterRequest): Promise<RegisterResponse> => {
      try {
        const { data } = await api.post<RegisterResponse>("/auth/register", payload);

        setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        setAccessTokenState(data.accessToken);
        setRefreshTokenState(data.refreshToken);

        setUser(data.user);
        setCompany(data.company);

        // IMPORTANT HARDENING:
        // Use the server-provided role if present; don't hardcode "Owner".
        setRole((data as any).role ?? null);
        persistIdentity(data.user, data.company, (data as any).role ?? null);

        return data;
      } catch (err: any) {
        if (axios.isAxiosError(err) && isApiErrorResponse(err.response?.data)) {
          throw err.response!.data;
        }
        throw { message: "Unable to create your account. Please try again." };
      }
    },
    [persistIdentity]
  );

  // Ensure interceptor-triggered auth failures log the user out.
  useEffect(() => {
    setAuthFailureHandler(({ message } = {}) => {
      // Optional toast(message ?? "Your session has expired.")
      signOut();
    });
  }, [signOut]);

  // Initial hydration
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Validate session once after hydration (if tokens exist).
  // IMPORTANT CHANGES: do not gate this on isLoading; run once when tokens are present.
  const validatedOnceRef = useRef(false);

  const validateSession = useCallback(async () => {
    const at = getAccessToken();
    const rt = getRefreshToken();
    if (!tokensLookSane(at, rt)) {
      // Clearly unauthenticated
      setIsReady(true); 
      return;
    }
    try {
      const res = await api.get("/auth/me");
      const { user: srvUser, company: srvCompany, role: srvRole } = res.data as {
        user: UserSummary;
        company: CompanySummary | null;
        role: string | null;
      };

      setUser(srvUser ?? null);
      setCompany(srvCompany ?? null);
      setRole(srvRole ?? null);
      persistIdentity(srvUser ?? null, srvCompany ?? null, srvRole ?? null);
    } catch (err: any) {
      // Only sign out on 401; don’t nuke session on network hiccups
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        signOut();
      }
      // else ignore (keep hydrated LS state)
    } finally {
      setIsReady(true);                                     // <-- NEW
    }
  }, [persistIdentity, signOut, tokensLookSane]);

  useEffect(() => {
    if (validatedOnceRef.current) return;

    
    if (pathname?.startsWith("/auth")) {
      setIsLoading(false);
      setIsReady(true);
      return;
    }

    const at = getAccessToken();
    const rt = getRefreshToken();

    if (tokensLookSane(at, rt)) {
      validatedOnceRef.current = true;
      setIsLoading(true); // show loading during validation
      validateSession().finally(() => setIsLoading(false));
    } else {
      // No tokens → definitely unauthenticated
      setIsLoading(false);
      setIsReady(true); 
    }
  }, [pathname, validateSession, tokensLookSane]);

  // Keep in-memory tokens synced with storage via subscription
  useEffect(() => {
    const unsubscribe = subscribeTokens((at, rt) => {
      setAccessTokenState(at);
      setRefreshTokenState(rt);
    });
    return unsubscribe;
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      company,
      role,
      accessToken,
      refreshToken,
      isAuthenticated,
      isLoading,
      isReady,
      loadFromStorage,
      signIn,
      signUp,
      signOut,
    }),
    [
      user,
      company,
      role,
      accessToken,
      refreshToken,
      isAuthenticated,
      isLoading,
      isReady,
      loadFromStorage,
      signIn,
      signUp,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ---------------------------------------------
   Hook
---------------------------------------------- */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
