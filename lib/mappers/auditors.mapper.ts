// src/lib/mappers/auditor.mapper.ts
import type { SustainabilityGovernanceValues } from "@/components/upload/foundational/sustainability-governance-card";
import {
  upsertAuditorByFirmName,
  ensureOpinionForYear,
  type AuditorRow,
} from "@/lib/services/auditors.client";

/**
 * Extracts a normalized auditor “intent” from the governance card.
 * - Uses `audit.issuer` as the auditor firm name.
 * - Derives an opinion year from `audit.issuingDate` (YYYY-MM-DD -> YYYY).
 */
export function governanceToAuditorIntent(gov: SustainabilityGovernanceValues | undefined) {
  if (!gov || gov.hasExternalAudit !== true) return undefined;

  const issuer = (gov.audit?.issuer || "").trim();
  if (!issuer) return undefined;

  const iso = (gov.audit?.issuingDate || "").trim();
  const year = iso ? new Date(iso).getFullYear() : undefined;

  return {
    firmName: issuer,
    opinionYear: Number.isFinite(year as any) ? (year as number) : undefined,
  };
}

/**
 * Sync the governance audit block into Auditor (+Opinion) tables.
 * Idempotent:
 * - upsert auditor by firm name
 * - if opinionYear present, ensure a single opinion for that year exists
 *
 * NOTE: This is designed to run on FINAL SUBMIT to avoid “draft” auditors.
 */
export async function syncGovernanceAudit(
  companyId: string,
  gov: SustainabilityGovernanceValues
): Promise<{ auditor?: AuditorRow; createdOpinionYear?: number } | null> {
  const intent = governanceToAuditorIntent(gov);
  if (!intent) return null;

  const auditor = await upsertAuditorByFirmName(companyId, { firmName: intent.firmName });

  if (intent.opinionYear) {
    await ensureOpinionForYear(companyId, auditor.id, intent.opinionYear);
    return { auditor, createdOpinionYear: intent.opinionYear };
  }

  return { auditor };
}
