// src/api/sites/mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SiteCreateRequest, SiteResponse } from "@/types/sites";

/** Create a single site under a company */
export function useCreateSite(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SiteCreateRequest) => {
      const { data } = await api.post<SiteResponse>(`/companies/${companyId}/sites`, payload);
      return data;
    },
    onSuccess: () => {
      // Invalidate a future list query if you add it
      queryClient.invalidateQueries({ queryKey: ["sites", "list", companyId] });
    },
  });
}
