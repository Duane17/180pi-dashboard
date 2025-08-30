// src/lib/services/policies.client.ts
import { api } from "@/lib/api";

export type PolicyCategory =
  | "GOVERNANCE"
  | "ETHICS"
  | "HR"
  | "ENVIRONMENT"
  | "HEALTH_SAFETY"
  | "SUPPLIER_CODE"
  | "DATA_PRIVACY"
  | "ANTI_CORRUPTION"
  | "OTHER";

export type PolicyStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type PolicyRow = {
  id: string;
  companyId: string;
  title: string;
  category: PolicyCategory;
  status: PolicyStatus;
  summary?: string | null;
  linkUrl?: string | null;
  documentUrl?: string | null;
  ownerUserId?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;

  // Extra model fields used by the governance matrix
  isPublic?: boolean | null;
  hasMeasurableTargets?: boolean | null;
  accountableTitle?: string | null;

  createdAt: string;
  updatedAt: string;
};

export type CreatePolicyPayload = {
  title: string;
  category: PolicyCategory;
  status?: PolicyStatus;
  summary?: string;
  linkUrl?: string;
  documentUrl?: string;
  ownerUserId?: string;
  effectiveFrom?: string | Date;
  effectiveTo?: string | Date;

  // Extras
  isPublic?: boolean;
  hasMeasurableTargets?: boolean;
  accountableTitle?: string;
};

export type UpdatePolicyPayload = Partial<CreatePolicyPayload>;

export async function listPolicies(
  companyId: string,
  params?: { page?: number; pageSize?: number; q?: string; category?: PolicyCategory; status?: PolicyStatus }
) {
  const { data } = await api.get(`/companies/${companyId}/policies`, { params });
  return data as { page: number; pageSize: number; total: number; data: PolicyRow[] };
}

export async function createPolicy(companyId: string, payload: CreatePolicyPayload) {
  const { data } = await api.post(`/companies/${companyId}/policies`, payload);
  return data as PolicyRow;
}

export async function updatePolicy(companyId: string, policyId: string, payload: UpdatePolicyPayload) {
  const { data } = await api.patch(`/companies/${companyId}/policies/${policyId}`, payload);
  return data as PolicyRow;
}

export async function getPolicy(companyId: string, policyId: string) {
  const { data } = await api.get(`/companies/${companyId}/policies/${policyId}`);
  return data as PolicyRow;
}

/**
 * Create or update by (companyId, title) uniqueness.
 * Tries POST; on 409, finds by title and PATCHes.
 */
export async function upsertPolicyByTitle(
  companyId: string,
  title: string,
  payload: Omit<CreatePolicyPayload, "title">
) {
  try {
    return await createPolicy(companyId, { title, ...payload });
  } catch (err: any) {
    if (err?.response?.status !== 409) throw err;

    const page = await listPolicies(companyId, { q: title, page: 1, pageSize: 10 });
    const existing = page.data.find((p) => p.title.toLowerCase() === title.toLowerCase());
    if (!existing) throw err;

    return await updatePolicy(companyId, existing.id, payload);
  }
}
