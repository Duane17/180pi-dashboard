// src/hooks/use-auth-mutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { api } from "@/lib/api";
import { getRefreshToken, setAccessToken } from "@/lib/auth-tokens";
import { useAuth } from "@/contexts/auth-context";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  ForgotRequest,
  ForgotResponse,
  ResetRequest,
  ResetResponse,
} from "@/types/auth";
import { isApiErrorResponse, mapIssuesToMessages } from "@/types/api";

/* ------------------------------------------------
   Error sinks for RHF & summaries
-------------------------------------------------- */

type SetRHFError = (name: string, message: string) => void;

interface ErrorSinks {
  setTopLevelError?: (msg: string) => void;    // banner/inline
  setSummaryErrors?: (msgs: string[]) => void; // <ValidationSummary />
  setFieldError?: SetRHFError;                 // wraps RHF setError
}

function pushApiErrorsToSinks(err: unknown, sinks?: ErrorSinks) {
  if (!sinks) return;

  if (axios.isAxiosError(err) && isApiErrorResponse(err.response?.data)) {
    const { message, issues } = err.response!.data;
    sinks.setTopLevelError?.(message);

    const summary = mapIssuesToMessages(issues);
    if (summary.length) sinks.setSummaryErrors?.(summary);

    const fieldErrors = issues?.fieldErrors ?? {};
    if (sinks.setFieldError) {
      for (const [field, msgs] of Object.entries(fieldErrors)) {
        if (!msgs || msgs.length === 0) continue;
        sinks.setFieldError(field, msgs[0]);
      }
    }
  } else {
    sinks.setTopLevelError?.("Something went wrong. Please try again.");
  }
}

/* ------------------------------------------------
   Helpers: validate responses & invalidate queries
-------------------------------------------------- */

const GENERIC_BAD_RESPONSE = { message: "Unexpected response from server. Please try again." };

function ensureLoginResponseShape(data: LoginResponse) {
  if (!data?.user || !data?.company || !data?.accessToken || !data?.refreshToken) {
    throw GENERIC_BAD_RESPONSE;
  }
}

function ensureRegisterResponseShape(data: RegisterResponse) {
  if (!data?.user || !data?.company || !data?.accessToken || !data?.refreshToken) {
    throw GENERIC_BAD_RESPONSE;
  }
}

// Central place to invalidate auth-related queries (tweak keys to your app)
const AUTH_INVALIDATE_KEYS: Array<Parameters<ReturnType<typeof useQueryClient>["invalidateQueries"]>[0]> = [
  { queryKey: ["me"] },
  { queryKey: ["company"] },
  { queryKey: ["permissions"] },
  { queryKey: ["dashboard"] },
];

async function invalidateAuthDependentQueries(qc: ReturnType<typeof useQueryClient>) {
  await Promise.all(AUTH_INVALIDATE_KEYS.map((args) => qc.invalidateQueries(args)));
}

/* ------------------------------------------------
   useRegister → POST /auth/register  (via Auth ctx)
   On success: verify shape, queries invalidate, navigate /onboarding
-------------------------------------------------- */

export function useRegisterMutation(sinks?: ErrorSinks) {
  const auth = useAuth();
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation<RegisterResponse, unknown, RegisterRequest>({
    mutationFn: (payload) => auth.signUp(payload),
    onError: (err) => pushApiErrorsToSinks(err, sinks),
    onSuccess: async (data) => {
      try {
        ensureRegisterResponseShape(data);
        await invalidateAuthDependentQueries(qc);
        router.push("/onboarding");
      } catch (shapeErr) {
        pushApiErrorsToSinks(shapeErr, sinks);
      }
    },
  });
}

/* ------------------------------------------------
   useLogin → POST /auth/login  (via Auth ctx)
   On success: verify shape, queries invalidate, navigate /dashboard
-------------------------------------------------- */

export function useLoginMutation(sinks?: ErrorSinks) {
  const auth = useAuth();
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation<LoginResponse, unknown, LoginRequest>({
    mutationFn: (payload) => auth.signIn(payload),
    onError: (err) => pushApiErrorsToSinks(err, sinks),
    onSuccess: async (data) => {
      try {
        ensureLoginResponseShape(data);
        await invalidateAuthDependentQueries(qc);
        router.push("/dashboard");
      } catch (shapeErr) {
        pushApiErrorsToSinks(shapeErr, sinks);
      }
    },
  });
}

/* ------------------------------------------------
   useRefresh → POST /auth/refresh  (direct API)
   On success: set new access token + invalidate "me"
-------------------------------------------------- */

export function useRefreshMutation(sinks?: ErrorSinks) {
  const qc = useQueryClient();

  return useMutation<RefreshResponse, unknown, void>({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        const err = { message: "No refresh token available." };
        pushApiErrorsToSinks(err, sinks);
        throw err;
      }
      const { data } = await api.post<RefreshResponse>("/auth/refresh", { refreshToken });
      setAccessToken(data.accessToken);
      return data;
    },
    onError: (err) => pushApiErrorsToSinks(err, sinks),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

/* ------------------------------------------------
   useLogout → POST /auth/logout
   Always clears local state; then invalidate & navigate /auth
-------------------------------------------------- */

export function useLogoutMutation() {
  const auth = useAuth();
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation<void, unknown, void>({
    mutationFn: async () => {
      try {
        await api.post<void>("/auth/logout");
      } finally {
        auth.signOut();
      }
    },
    onSettled: async () => {
      await invalidateAuthDependentQueries(qc);
      router.push("/auth");
    },
  });
}

/* ------------------------------------------------
   useForgotPassword → POST /auth/forgot
-------------------------------------------------- */

export function useForgotPasswordMutation(sinks?: ErrorSinks) {
  return useMutation<ForgotResponse, unknown, ForgotRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.post<ForgotResponse>("/auth/forgot", payload);
      return data; // { message }
    },
    onError: (err) => pushApiErrorsToSinks(err, sinks),
  });
}

/* ------------------------------------------------
   useResetPassword → POST /auth/reset
-------------------------------------------------- */

export function useResetPasswordMutation(sinks?: ErrorSinks) {
  return useMutation<ResetResponse, unknown, ResetRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.post<ResetResponse>("/auth/reset", payload);
      return data; // { message }
    },
    onError: (err) => pushApiErrorsToSinks(err, sinks),
  });
}
