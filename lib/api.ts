// src/lib/api.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from "./auth-tokens";
import { isApiErrorResponse, mapIssuesToMessages } from "@/types/api";

// -----------------------------
// Optional auth failure handler
// (Your Auth context can register a callback to react to global auth failures.)
// -----------------------------
export type AuthFailureHandler = (info?: { message?: string; details?: string[] }) => void;

let authFailureHandler: AuthFailureHandler | null = null;
export function setAuthFailureHandler(fn: AuthFailureHandler) {
  authFailureHandler = fn;
}

// -----------------------------
// Base URL + client
// -----------------------------
function normalizeBaseUrl(url: string | undefined): string {
  if (!url || url.trim() === "") {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is missing. Ensure it is set in your .env.development (or .env) file."
    );
  }
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

const BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
  timeout: 15000,
});

// -----------------------------
// Request interceptor: attach Authorization
// -----------------------------
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------
// Response interceptor: 401 -> refresh flow
// -----------------------------

// Augment config to mark a single retry
declare module "axios" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface InternalAxiosRequestConfig<D = any> extends AxiosRequestConfig<D> {
    _retry?: boolean;
  }
}

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

/** Process queued requests after refresh completes */
function flushQueue(token: string | null) {
  pendingQueue.forEach((resolve) => resolve(token));
  pendingQueue = [];
}

/** Enqueue a request until refresh completes */
function enqueueUntilRefreshed(): Promise<string | null> {
  return new Promise((resolve) => {
    pendingQueue.push(resolve);
  });
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalConfig = error.config as typeof error.config & { _retry?: boolean };

    // Only handle 401s from our API (avoid CORS/proxy noise)
    const status = error?.response?.status;
    if (status !== 401 || originalConfig?._retry) {
      // Not our case or already retried once—bail out with the original error
      return Promise.reject(error);
    }

    // If there is no refresh token, we can't refresh—clear and fail
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      authFailureHandler?.({ message: "Not authenticated" });
      return Promise.reject(error);
    }

    // Mark this request so we don't retry it twice
    originalConfig._retry = true;

    try {
      if (isRefreshing) {
        // Wait for the in-flight refresh to finish
        const newToken = await enqueueUntilRefreshed();
        if (!newToken) {
          // Refresh ultimately failed
          clearTokens();
          authFailureHandler?.({ message: "Session expired" });
          return Promise.reject(error);
        }

        // Token present: retry original request with updated header
        originalConfig.headers = originalConfig.headers ?? {};
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return api(originalConfig);
      }

      // Start refresh
      isRefreshing = true;

      // Use a bare axios instance to avoid this interceptor in the refresh call itself
      const refreshClient = axios.create({
        baseURL: BASE_URL,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        withCredentials: false,
        timeout: 15000,
      });

      const refreshResp = await refreshClient.post<{ accessToken: string }>("/auth/refresh", {
        refreshToken,
      });

      const newAccessToken = refreshResp.data?.accessToken ?? null;
      setAccessToken(newAccessToken);

      // Wake any queued requests
      flushQueue(newAccessToken);
      isRefreshing = false;

      if (!newAccessToken) {
        // Shouldn't happen if refresh succeeded, but guard anyway
        clearTokens();
        authFailureHandler?.({ message: "Session expired" });
        return Promise.reject(error);
      }

      // Retry original request with new token
      originalConfig.headers = originalConfig.headers ?? {};
      originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalConfig);
    } catch (refreshErr: any) {
      // Normalize error from /auth/refresh
      let message = "Authentication failed";
      let details: string[] | undefined;

      const data = refreshErr?.response?.data;
      if (isApiErrorResponse(data)) {
        message = data.message || message;
        const msgs = mapIssuesToMessages(data.issues);
        details = msgs.length ? msgs : undefined;
      }

      // Clear tokens and notify app
      clearTokens();
      flushQueue(null);
      isRefreshing = false;

      authFailureHandler?.({ message, details });

      return Promise.reject(refreshErr);
    }
  }
);
