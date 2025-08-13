"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios, { type AxiosError } from "axios";
import { api } from "@/lib/api";
import { buildCompanyPayload } from "@/lib/company-payload";
import type { CompanyCreateRequest, CompanyResponse } from "@/types/companies";
import type { FoundationalUpdateRequest } from "@/types/foundational";
import { isApiErrorResponse } from "@/types/api";
import { toast } from "sonner";
import { toFoundationalPayload } from "@/utils/to-foundational-payload";

// Maps backend field errors to wizard step fields
function mapFieldErrorsToStep(
  issues: Record<string, string[]>
): Record<number, Record<string, string[]>> {
  const stepErrors: Record<number, Record<string, string[]>> = { 1: {}, 2: {}, 3: {} };

  for (const [field, messages] of Object.entries(issues)) {
    if (["companyName", "legalForm", "sector"].includes(field)) {
      stepErrors[1][field] = messages;
    } else if (field === "hqCountry") {
      stepErrors[2][field] = messages;
    } else if (
      ["employeeCount", "employeeCountRange", "reportingCurrency", "annualTurnover"].includes(field)
    ) {
      stepErrors[3][field] = messages;
    }
  }
  return stepErrors;
}

// ---------- Create Company ----------
export function useCreateCompany() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (basics: any) => {
      const payload: CompanyCreateRequest = buildCompanyPayload(basics);
      const { data } = await api.post<CompanyResponse>("/companies", payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["companies", "detail", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["companies", "list"] });
      toast.success("Company created successfully");
      router.push(`/companies/${data.id}/review`);
    },
    onError: (err: any) => {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 403) {
          const data = err.response?.data;
          const msg =
            (isApiErrorResponse(data) && data.message) ||
            "You don’t have permission to create a company.";
          toast.error(msg);
          router.push("/auth");
          return;
        }
      }
      if (isApiErrorResponse(err?.response?.data)) {
        const { message, issues } = err.response.data;
        const stepErrors = mapFieldErrorsToStep(issues.fieldErrors || {});
        toast.error(message || "Failed to create company");
        console.error("Step-specific errors:", stepErrors);
      } else {
        toast.error("Unexpected error occurred");
      }
    },
  });
}

// ---------- Update Company ----------
export function useUpdateCompany(companyId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (partial: Partial<CompanyCreateRequest>) => {
      const { data } = await api.patch<CompanyResponse>(`/companies/${companyId}`, partial);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["companies", "detail", companyId], data);
      queryClient.invalidateQueries({ queryKey: ["companies", "list"] });
      toast.success("Company updated successfully");
    },
    onError: (err: any) => {
      if (axios.isAxiosError(err)) {
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
      }
      if (isApiErrorResponse(err?.response?.data)) {
        const { message, issues } = err.response.data;
        const stepErrors = mapFieldErrorsToStep(issues.fieldErrors || {});
        toast.error(message || "Failed to update company");
        console.error("Step-specific errors:", stepErrors);
      } else {
        toast.error("Unexpected error occurred");
      }
    },
  });
}

// ---------- Upsert Foundational Data ----------
export function useUpsertFoundational(companyId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<CompanyResponse, AxiosError, Partial<any>>({
    mutationFn: async (partial) => {
      // Convert wizard data -> API shape
      const payload: FoundationalUpdateRequest = toFoundationalPayload(partial);
      console.log("🔍 Foundational payload being sent:", payload);

      const { data } = await api.put<CompanyResponse>(
        `/companies/${companyId}/foundational`,
        payload
      );
      return data;
    },
    retry: false,
  });

  // ✅ Success handling
  useEffect(() => {
    if (mutation.isSuccess && mutation.data) {
      queryClient.setQueryData(["companies", "detail", companyId], mutation.data);
      queryClient.invalidateQueries({ queryKey: ["companies", "list"] });
      toast.success("Company foundational data saved");
    }
  }, [mutation.isSuccess, mutation.data, companyId, queryClient]);

  // ❌ Error handling
  useEffect(() => {
    if (!mutation.isError || !mutation.error) return;

    const err = mutation.error;
    const status = err.response?.status;
    const data = err.response?.data;

    // Unauthorized
    if (status === 403) {
      const msg =
        (isApiErrorResponse(data) && data.message) ||
        "You don’t have permission to update this company.";
      toast.error(msg);
      router.push("/auth");
      return;
    }

    // Validation errors
    if (status === 400 && isApiErrorResponse(data)) {
      toast.error(data.message || "Failed to save data");

      if (data.issues?.fieldErrors) {
        console.group("🛑 Zod validation errors");
        Object.entries(data.issues.fieldErrors).forEach(([field, errors]) => {
          console.error(`Field: ${field}`, errors);
        });
        console.groupEnd();
      }

      return;
    }

    // Unexpected
    toast.error("Unexpected error occurred");
    console.error("Unexpected error details:", err);
  }, [mutation.isError, mutation.error, router]);

  return mutation;
}


