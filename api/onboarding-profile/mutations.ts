"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios, { type AxiosError } from "axios";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { isApiErrorResponse } from "@/types/api";
import type {
  OnboardingProfileResponse,
  OnboardingProfileUpsertRequest,
} from "@/types/onboarding-profile";
import { onboardingProfileKey } from "./queries";

/**
 * PUT /companies/:companyId/onboarding-profile
 * - Sets cache for ["companies","onboarding-profile", companyId]
 * - Invalidates the same key (for any dependent observers)
 * - Error handling:
 *    • 403 → toast + redirect /auth
 *    • 400 with Zod issues → toast + console.group(fieldErrors) for inline mapping
 */
export function useUpsertOnboardingProfile(companyId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<
    OnboardingProfileResponse,
    AxiosError,
    OnboardingProfileUpsertRequest
  >({
    mutationFn: async (payload) => {
      const { data } = await api.put<OnboardingProfileResponse>(
        `/companies/${companyId}/onboarding-profile`,
        payload
      );
      return data;
    },
    onSuccess: async (data) => {
      // Prime cache with fresh server truth
      queryClient.setQueryData(onboardingProfileKey(companyId), data);
      // Invalidate so any subscribers refetch if they want to
      await queryClient.invalidateQueries({
        queryKey: onboardingProfileKey(companyId),
      });
      // Success toast is handled by caller (optional). Keep this quiet here.
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;

        if (status === 403) {
          const msg =
            (isApiErrorResponse(data) && data.message) ||
            "You don’t have permission to update this profile.";
          toast.error(msg);
          router.push("/auth");
          return;
        }

        if (status === 400 && isApiErrorResponse(data)) {
          const msg = data.message || "Invalid data. Please review your selections.";
          toast.error(msg);

          if (data.issues?.fieldErrors) {
            // Surface to dev console for mapping back to forms inline
            console.group("🛑 OnboardingProfile validation errors");
            Object.entries(data.issues.fieldErrors).forEach(([field, messages]) => {
              console.error(`Field: ${field}`, messages);
            });
            console.groupEnd();
          }
          return;
        }
      }

      // Unexpected error
      toast.error("Unexpected error occurred while saving your preferences.");
      // For debugging clarity:
      // eslint-disable-next-line no-console
      console.error("Upsert onboarding profile error:", err);
    },
  });

  // If you ever want post-success side-effects (analytics, etc.)
  useEffect(() => {
    // no-op
  }, [mutation.isSuccess]);

  return mutation;
}
