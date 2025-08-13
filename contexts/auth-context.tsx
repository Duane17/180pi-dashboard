"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
};

type AuthContextValue = AuthState & {
  /** Load state from localStorage (tokens + user/company/role). Called automatically on mount. */
  loadFromStorage: () => void;
  /** Sign in with email/password. Returns the LoginResponse on success. Throws normalized ApiErrorResponse on error. */
  signIn: (payload: LoginRequest) => Promise<LoginResponse>;
  /** Sign up (register + bootstrap company). Returns the RegisterResponse on success. Throws normalized ApiErrorResponse on error. */
  signUp: (payload: RegisterRequest) => Promise<RegisterResponse>;
  /** Clear tokens + local storage + in-memory state. */
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/* ---------------------------------------------
   Provider
---------------------------------------------- */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [company, setCompany] = useState<CompanySummary | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(accessToken && user);
  const tokensLookSane = useCallback((at: string | null, rt: string | null) => {
    const ok = (s: string | null) => !!s && typeof s === "string" && s.length >= 16;
    return ok(at) && ok(rt);
  }, []);
  
  const persistIdentity = useCallback((u: UserSummary | null, c: CompanySummary | null, r: string | null) => {
    if (typeof window === "undefined") return;
    if (u) localStorage.setItem(LS_USER, JSON.stringify(u));
    else localStorage.removeItem(LS_USER);

    if (c) localStorage.setItem(LS_COMPANY, JSON.stringify(c));
    else localStorage.removeItem(LS_COMPANY);

    if (r) localStorage.setItem(LS_ROLE, r);
    else localStorage.removeItem(LS_ROLE);
  }, []);

  const loadFromStorage = useCallback(() => {
    if (typeof window === "undefined") return;

    // Tokens come from auth-tokens (already hydrated in Providers via initAuthTokens)
    const at = getAccessToken();
    const rt = getRefreshToken();

    setAccessTokenState(at);
    setRefreshTokenState(rt);

    // Identity details (best-effort) come from localStorage
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

    setIsLoading(false);
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

        // Persist tokens
        setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        setAccessTokenState(data.accessToken);
        setRefreshTokenState(data.refreshToken);

        // Persist identity
        setUser(data.user);
        setCompany(data.company);
        setRole(data.role ?? null);
        persistIdentity(data.user, data.company, data.role ?? null);

        return data;
      } catch (err: any) {
        // Normalize and rethrow so the caller (mutation) can map to field errors / summary
        if (axios.isAxiosError(err) && isApiErrorResponse(err.response?.data)) {
          throw err.response!.data; // ApiErrorResponse
        }
        throw { message: "Unable to sign in. Please try again." };
      }
    },
    [persistIdentity]
  );

  const validateSession = useCallback(async () => {
    const at = getAccessToken();
    const rt = getRefreshToken();

    // If tokens are obviously missing/invalid, clear and bail early.
    if (!tokensLookSane(at, rt)) {
      signOut();
      return;
    }

    try {
      // Any route behind requireAuth is fine; use /users with a small query.
      // This will attach Authorization via the request interceptor.
      await api.get("/users", { params: { limit: 1 } });
      // If this succeeds, we consider the session valid.
    } catch (err: any) {
      // If the server responded, normalize the error; otherwise it may be a network issue.
      if (axios.isAxiosError(err) && err.response) {
        if (isApiErrorResponse(err.response.data)) {
          // Optionally: console.warn("Auth validation failed:", err.response.data.message);
        }
        // Clear tokens + identity if the validation call fails.
        signOut();
      } else {
        // Network error with no response: keep current state (developer may be booting backend).
        // Optionally show a non-blocking toast/log here if you prefer.
      }
    }
  }, [signOut, tokensLookSane]);

  const signUp = useCallback(
    async (payload: RegisterRequest): Promise<RegisterResponse> => {
      try {
        const { data } = await api.post<RegisterResponse>("/auth/register", payload);

        // Persist tokens
        setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        setAccessTokenState(data.accessToken);
        setRefreshTokenState(data.refreshToken);

        // Persist identity
        setUser(data.user);
        setCompany(data.company);
        setRole("Owner"); // Controller ensures Owner role on bootstrap
        persistIdentity(data.user, data.company, "Owner");

        return data;
      } catch (err: any) {
        if (axios.isAxiosError(err) && isApiErrorResponse(err.response?.data)) {
          throw err.response!.data; // ApiErrorResponse
        }
        throw { message: "Unable to create your account. Please try again." };
      }
    },
    [persistIdentity]
  );

  // Register a global auth-failure handler so interceptor-triggered 401/refresh failures log the user out.
  useEffect(() => {
    setAuthFailureHandler(({ message } = {}) => {
      // Optionally: toast(message ?? "Your session has expired.");
      signOut();
    });
  }, [signOut]);

  // Initial hydration
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // After hydration, if tokens exist, validate them once.
  useEffect(() => {
    // Only run after loadFromStorage set isLoading=false
    if (isLoading) return;

    const at = getAccessToken();
    const rt = getRefreshToken();
    if (at && rt) {
      // Flip a short-lived loading state while validating (optional)
      setIsLoading(true);
      validateSession().finally(() => setIsLoading(false));
    }
  }, [isLoading, validateSession]);

    // Subscribe to token changes so accessToken/refreshToken state stays in sync
    useEffect(() => {
        // Subscribe returns an unsubscribe fn
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
