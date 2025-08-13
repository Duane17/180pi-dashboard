// src/lib/auth-tokens.ts

/**
 * Minimal, SSR-safe token manager.
 * - Persists accessToken + refreshToken in localStorage (MVP).
 * - Mirrors accessToken in memory for fast header injection.
 * - Keeps multiple tabs in sync via the "storage" event.
 */

const ACCESS_TOKEN_KEY = "auth.accessToken";
const REFRESH_TOKEN_KEY = "auth.refreshToken";

// In-memory mirror for the access token (fast, no localStorage hit on every request)
let accessTokenMemory: string | null = null;

// Optional: lightweight subscription so other modules can react to token changes.
type TokenListener = (accessToken: string | null, refreshToken: string | null) => void;
const listeners = new Set<TokenListener>();

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Initialize memory state from localStorage. Call once on app start (client-side). */
export function initAuthTokens(): void {
  if (!isBrowser()) return;

  accessTokenMemory = window.localStorage.getItem(ACCESS_TOKEN_KEY);

  // Keep tabs/windows in sync
  window.addEventListener("storage", (e: StorageEvent) => {
    if (!e.key || (e.key !== ACCESS_TOKEN_KEY && e.key !== REFRESH_TOKEN_KEY)) return;
    if (e.key === ACCESS_TOKEN_KEY) {
      accessTokenMemory = e.newValue;
    }
    notify();
  });
}

/** Getters */
export function getAccessToken(): string | null {
  return accessTokenMemory;
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

/** Setters */
export function setAccessToken(token: string | null): void {
  if (!isBrowser()) return;
  accessTokenMemory = token;
  if (token) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  notify();
}

export function setRefreshToken(token: string | null): void {
  if (!isBrowser()) return;
  if (token) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  notify();
}

/** Convenience: set both at once (common after login/register/refresh) */
export function setTokens(tokens: { accessToken?: string | null; refreshToken?: string | null }): void {
  const { accessToken = null, refreshToken = null } = tokens;
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
}

/** Clear both tokens (common on logout or refresh failure) */
export function clearTokens(): void {
  setTokens({ accessToken: null, refreshToken: null });
}

/** Subscriptions (optional) */
export function subscribe(listener: TokenListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  const at = accessTokenMemory;
  const rt = isBrowser() ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  listeners.forEach((cb) => cb(at, rt));
}

/** Export keys if you prefer direct access elsewhere (e.g., debugging) */
export const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
};
