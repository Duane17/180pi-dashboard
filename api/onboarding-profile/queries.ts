"use client";

import { useEffect } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios, { type AxiosError } from "axios";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { isApiErrorResponse } from "@/types/api";
import type { OnboardingProfileResponse } from "@/types/onboarding-profile";

/**
 * Query key helper
 */
export const onboardingProfileKey = (companyId: string) =>
  ["companies", "onboarding-profile", companyId] as const;

/**
 * GET /companies/:companyId/onboarding-profile
 * - enabled: !!companyId
 * - retry: false
 * - 403 → toast + redirect /auth
 * - 404 → return null (treat as "no profile yet")
 */
export function useGetOnboardingProfile(
  companyId: string
): UseQueryResult<OnboardingProfileResponse | null, AxiosError> {
  const router = useRouter();

  const query = useQuery<OnboardingProfileResponse | null, AxiosError>({
    queryKey: onboardingProfileKey(companyId),
    enabled: !!companyId,
    retry: false,
    queryFn: async () => {
      try {
        const { data } = await api.get<OnboardingProfileResponse>(
          `/companies/${companyId}/onboarding-profile`
        );
        return data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;

          if (status === 404) {
            // No profile yet — prefill empty on the caller side
            return null;
          }

          if (status === 403) {
            const data = err.response?.data;
            const msg =
              (isApiErrorResponse(data) && data.message) ||
              "You don’t have permission to view this profile.";
            toast.error(msg);
            // kick to auth (consistent with your other hooks)
            router.push("/auth");
            // Re-throw to put the query in error state (won’t retry)
            throw err;
          }
        }
        // Any other error → bubble up
        throw err as AxiosError;
      }
    },
  });

  // Optional side-effect placeholder if you later need one.
  useEffect(() => {
    // no-op
  }, [query.status]);

  return query;
}
