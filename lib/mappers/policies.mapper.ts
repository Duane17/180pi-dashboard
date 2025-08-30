// src/lib/mappers/policies.mapper.ts
import type { SustainabilityGovernanceValues } from "@/components/upload/foundational/sustainability-governance-card";
import {
  upsertPolicyByTitle,
  type PolicyCategory,
  type CreatePolicyPayload,
  type PolicyStatus,
} from "@/lib/services/policies.client";

/** Matrix keys */
export type PolicyKey =
  | "CLIMATE_CHANGE"
  | "POLLUTION"
  | "WATER_MARINE"
  | "BIODIVERSITY"
  | "CIRCULAR_ECONOMY"
  | "OWN_WORKFORCE"
  | "VALUE_CHAIN_WORKERS"
  | "AFFECTED_COMMUNITIES"
  | "CONSUMERS_END_USERS"
  | "BUSINESS_CONDUCT";

/** Canonical titles for the Policies table (stable, user-facing) */
export const POLICY_TITLES: Record<PolicyKey, string> = {
  CLIMATE_CHANGE: "Policy: Climate change",
  POLLUTION: "Policy: Pollution",
  WATER_MARINE: "Policy: Water & Marine resources",
  BIODIVERSITY: "Policy: Biodiversity & ecosystems",
  CIRCULAR_ECONOMY: "Policy: Circular economy",
  OWN_WORKFORCE: "Policy: Own workforce",
  VALUE_CHAIN_WORKERS: "Policy: Workers in the value chain",
  AFFECTED_COMMUNITIES: "Policy: Affected communities",
  CONSUMERS_END_USERS: "Policy: Consumers & end-users",
  BUSINESS_CONDUCT: "Policy: Business conduct",
};

/** Categories per topic (tweak as you wish) */
export const POLICY_CATEGORIES: Record<PolicyKey, PolicyCategory> = {
  CLIMATE_CHANGE: "ENVIRONMENT",
  POLLUTION: "ENVIRONMENT",
  WATER_MARINE: "ENVIRONMENT",
  BIODIVERSITY: "ENVIRONMENT",
  CIRCULAR_ECONOMY: "ENVIRONMENT",
  OWN_WORKFORCE: "HR",
  VALUE_CHAIN_WORKERS: "HR",
  AFFECTED_COMMUNITIES: "HR",
  CONSUMERS_END_USERS: "OTHER",
  BUSINESS_CONDUCT: "GOVERNANCE",
};

// Helper type so payload does NOT include title
type PolicyInput = { title: string; payload: Omit<CreatePolicyPayload, "title"> };

/**
 * Convert the governance matrix to policy create/update inputs.
 * Only emits rows for topics where the user toggled at least one flag.
 */
export function governanceToPolicyInputs(
  gov: SustainabilityGovernanceValues,
  opts?: { status?: PolicyStatus } // "DRAFT" for save, "ACTIVE" for submit
): PolicyInput[] {
  const result: PolicyInput[] = [];
  if (!gov?.policies) return result;

  const accountable = gov.accountableJobTitle?.trim() || undefined;
  const rowStatus: PolicyStatus = opts?.status ?? "ACTIVE";

  (Object.keys(gov.policies) as PolicyKey[]).forEach((key) => {
    const st = gov.policies?.[key];
    if (!st) return;

    const isPublic = st.isPublic === true ? true : undefined;
    const hasTargets = st.hasTargets === true ? true : undefined;

    // skip untouched topics
    if (isPublic === undefined && hasTargets === undefined) return;

    result.push({
      title: POLICY_TITLES[key],
      payload: {
        category: POLICY_CATEGORIES[key],
        status: rowStatus,
        isPublic,
        hasMeasurableTargets: hasTargets,
        accountableTitle: accountable,
      },
    });
  });

  return result;
}

/**
 * Bulk upsert policies based on the UI matrix.
 * Idempotent via (companyId, title).
 */
export async function syncGovernancePolicies(
  companyId: string,
  gov: SustainabilityGovernanceValues,
  opts?: { status?: PolicyStatus }
) {
  const inputs = governanceToPolicyInputs(gov, opts);
  const out: any[] = [];
  for (const item of inputs) {
    const row = await upsertPolicyByTitle(companyId, item.title, item.payload);
    out.push(row);
  }
  return out;
}
