// hooks/use-companies.ts
"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios, { type AxiosError } from "axios";
import { api } from "@/lib/api";
import type { CompanyResponse } from "@/types/companies";
import type { FoundationalUpdateRequest } from "@/types/foundational";
import { isApiErrorResponse } from "@/types/api";
import { toast } from "sonner";
import { toFoundationalPayload } from "@/utils/to-foundational-payload";

export function useUpsertFoundational(companyId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<CompanyResponse, AxiosError, Partial<any>>({
    mutationFn: async (partial) => {
      // Convert wizard data -> API shape
      const payload: FoundationalUpdateRequest = toFoundationalPayload(partial);
      const { data } = await api.put<CompanyResponse>(
        `/companies/${companyId}/foundational`,
        payload
      );
      return data;
    },
    retry: false,
  });

  // v5-style side effects: react to state changes
  useEffect(() => {
    if (mutation.isSuccess && mutation.data) {
      queryClient.setQueryData(["companies", "detail", companyId], mutation.data);
      queryClient.invalidateQueries({ queryKey: ["companies", "list"] });
      toast.success("Company foundational data saved");
    }
  }, [mutation.isSuccess, mutation.data, companyId, queryClient]);

  useEffect(() => {
    if (!mutation.isError || !mutation.error) return;

    const err = mutation.error;
    const status = err.response?.status;

    if (status === 403) {
      const data = err.response?.data;
      const msg =
        (isApiErrorResponse(data) && data.message) ||
        "You don’t have permission to update this company.";
      toast.error(msg);
      router.push("/auth");
      return;
    }

    const data = err.response?.data;
    if (isApiErrorResponse(data)) {
      toast.error(data.message || "Failed to save data");
      // If you want: log field-level messages for your wizard step UI
      // console.error("Issues:", data.issues?.fieldErrors ?? {});
      return;
    }

    toast.error("Unexpected error occurred");
  }, [mutation.isError, mutation.error, router]);

  return mutation;
}
