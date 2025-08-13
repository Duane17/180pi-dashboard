// src/api/sites/queries.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SiteResponse } from "@/types/sites";

export function useListSites(companyId: string, params?: { page?: number; pageSize?: number; q?: string }) {
  return useQuery({
    queryKey: ["sites", "list", companyId, params],
    queryFn: async () => {
      const { data } = await api.get<{ page: number; pageSize: number; total: number; data: SiteResponse[] }>(
        `/companies/${companyId}/sites`,
        { params }
      );
      return data;
    },
    enabled: !!companyId,
  });
}
