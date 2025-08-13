"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios, { type AxiosError } from "axios";
import { api } from "@/lib/api";
import type { CompanyResponse } from "@/types/companies";
import { isApiErrorResponse } from "@/types/api";
import { toast } from "sonner";

export function useGetCompany(id: string) {
  const router = useRouter();

  const query = useQuery<CompanyResponse, AxiosError>({
    queryKey: ["companies", "detail", id],
    queryFn: async () => {
      const { data } = await api.get<CompanyResponse>(`/companies/${id}`);
      return data;
    },
    enabled: Boolean(id),
    retry: false,
  });

  // Side-effects belong outside useQuery in v5
  useEffect(() => {
    if (!query.isError || !query.error) return;

    const err = query.error;
    const status = err.response?.status;

    if (status === 403) {
      const data = err.response?.data;
      const msg =
        (isApiErrorResponse(data) && data.message) ||
        "You don’t have permission to view this company.";
      toast.error(msg);
      router.push("/auth"); // or "/"
      return;
    }

    toast.error("Failed to load company details.");
  }, [query.isError, query.error, router]);

  return query;
}

type CompaniesListResponse = {
  page: number;
  pageSize: number;
  total: number;
  data: CompanyResponse[];
};

export function useListCompanies(params?: { page?: number; pageSize?: number; q?: string }) {
  // If you want typed errors here too, add AxiosError like above
  return useQuery<CompaniesListResponse, AxiosError>({
    queryKey: ["companies", "list", params],
    queryFn: async () => {
      const { data } = await api.get<CompaniesListResponse>("/companies", { params });
      return data;
    },
    retry: false,
  });
}
