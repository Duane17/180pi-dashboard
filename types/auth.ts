// src/types/auth.ts

/**
 * Shared primitives from your controllers:
 * - userSelect => { id, email, name }
 * - company => { id, name }
 */
export interface UserSummary {
  id: string;
  email: string;
  name: string;
}

export interface CompanySummary {
  id: string;
  name: string;
}

/**
 * Zod .flatten() error shape returned by your controllers on 400:
 *   { message: "Invalid payload", issues: parsed.error.flatten() }
 *
 * NOTE: `fieldErrors` keys match your input field names (e.g., "email", "password").
 */
export interface ZodFlattenIssues {
  fieldErrors: Record<string, string[] | undefined>;
  formErrors: string[];
}

/**
 * Standard API error shape used across endpoints.
 * Controllers also use other statuses like 401/403/409 with { message }.
 */
export interface ApiErrorResponse {
  message: string;
  issues?: ZodFlattenIssues;
}

/* =========================
   Auth Endpoint: Register
   POST /api/v1/auth/register
   Request: { name, email, password, companyName }
   Response: { user, company, accessToken, refreshToken }
   ========================= */

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

export interface RegisterResponse {
  user: UserSummary;
  company: CompanySummary;
  accessToken: string;
  refreshToken: string;
}

/* =========================
   Auth Endpoint: Login
   POST /api/v1/auth/login
   Request: { email, password }
   Response: { user, company, role, accessToken, refreshToken }
   ========================= */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserSummary;
  company: CompanySummary;
  role: string;             // membership.role.name
  accessToken: string;
  refreshToken: string;
}

/* =========================
   Auth Endpoint: Refresh
   POST /api/v1/auth/refresh
   Request: { refreshToken }
   Response: { accessToken }
   ========================= */

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

/* =========================
   Auth Endpoint: Logout
   POST /api/v1/auth/logout
   Request: none (stateless MVP)
   Response: 204 No Content
   ========================= */

export type LogoutRequest = Record<string, never>;
export type LogoutResponse = void; // Axios data will be undefined on 204

/* =========================
   Auth Endpoint: Forgot
   POST /api/v1/auth/forgot
   Request: { email }
   Response: { message } (202 Accepted, generic to avoid user enumeration)
   ========================= */

export interface ForgotRequest {
  email: string;
}

export interface ForgotResponse {
  message: string;
}

/* =========================
   Auth Endpoint: Reset
   POST /api/v1/auth/reset
   Request: { token, newPassword }
   Response: { message }
   ========================= */

export interface ResetRequest {
  token: string;
  newPassword: string;
}

export interface ResetResponse {
  message: string;
}

/* =========================
   Narrow helpers
   ========================= */

/** Type guard to check if an unknown error payload matches ApiErrorResponse. */
export function isApiErrorResponse(x: unknown): x is ApiErrorResponse {
  if (!x || typeof x !== "object") return false;
  const obj = x as Record<string, unknown>;
  const hasMessage = typeof obj.message === "string";
  const issues = obj.issues as ZodFlattenIssues | undefined;

  const issuesLooksOk =
    issues === undefined ||
    (issues &&
      typeof issues === "object" &&
      issues.fieldErrors &&
      typeof issues.fieldErrors === "object" &&
      Array.isArray(issues.formErrors));

  return hasMessage && issuesLooksOk;
}

/** Empty object constant for endpoints with no request body (e.g., logout). */
export const EMPTY_BODY: LogoutRequest = {};
