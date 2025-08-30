// src/lib/services/governance-body.client.ts
import { api } from "@/lib/api";
import type {
  GovernanceList,
  GovernanceDetail,
  GovernanceUpsertPayload,
} from "@/types/governance.types";

export const __GOVERNANCE_CLIENT_VERSION__ = "v1";

const base = (companyId: string) => `/companies/${companyId}/governance`;

export async function listGovernance(
  companyId: string,
  params: { page?: number; pageSize?: number } = {}
): Promise<GovernanceList> {
  const { data } = await api.get(base(companyId), { params });
  return data;
}

export async function getGovernance(
  companyId: string,
  govId: string
): Promise<GovernanceDetail> {
  const { data } = await api.get(`${base(companyId)}/${govId}`);
  return data;
}

export async function createGovernance(
  companyId: string
): Promise<{ id: string }> {
  const { data } = await api.post(base(companyId), {}); // empty body by design
  return data;
}

export async function upsertGovernance(
  companyId: string,
  govId: string,
  payload: GovernanceUpsertPayload
): Promise<GovernanceDetail> {
  const { data } = await api.put(`${base(companyId)}/${govId}`, payload);
  return data;
}
