// src/lib/mappers/governance.mapper.ts
import type { SustainabilityGovernanceValues } from "@/schemas/foundational.schemas";

function isNonEmpty(value: unknown) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

/** Accept Date | string | undefined and return strict "YYYY-MM-DD" or undefined. */
function normalizeYMD(input?: unknown): string | undefined {
  if (!input) return undefined;

  // Already a good "YYYY-MM-DD"?
  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return undefined; // don't send empty strings
    // allow full ISO (e.g. "2025-08-27T00:00:00Z"): slice safely
    const m = /^\d{4}-\d{2}-\d{2}/.exec(s);
    return m ? m[0] : undefined;
  }

  // Coerce Date
  if (input instanceof Date && !Number.isNaN(+input)) {
    // Always send the canonical y-m-d (UTC-safe)
    return new Date(Date.UTC(
      input.getUTCFullYear(),
      input.getUTCMonth(),
      input.getUTCDate()
    )).toISOString().slice(0, 10);
  }

  return undefined;
}

export function toCertificationBody(sg?: Partial<SustainabilityGovernanceValues>) {
  const has = sg?.hasSustainabilityCert;
  const cert = (sg as any)?.certification ?? {};

  const issuingDate = normalizeYMD(cert.issuingDate);
  const anyCertField =
    isNonEmpty(cert.issuer) ||
    isNonEmpty(issuingDate) ||
    isNonEmpty(cert.fileUrl) ||
    isNonEmpty(cert.fileName) ||
    isNonEmpty(cert.fileMime) ||
    isNonEmpty(cert.fileSize) ||
    isNonEmpty(cert.file?.name);

  const inferredHas = has ?? (anyCertField ? true : undefined);

  return {
    // send a decisive boolean when we can
    hasSustainabilityCert: inferredHas === undefined ? undefined : Boolean(inferredHas),
    certification:
      inferredHas
        ? {
            issuer: cert.issuer ?? undefined,
            issuingDate, // "YYYY-MM-DD" or undefined
            fileUrl:  cert.fileUrl  ?? undefined,
            fileName: cert.fileName ?? cert.file?.name ?? undefined,
            fileMime: cert.fileMime ?? cert.file?.type ?? undefined,
            fileSize: cert.fileSize ?? cert.file?.size ?? undefined,
          }
        : undefined,
  };
}

export function toExternalAuditBody(sg?: Partial<SustainabilityGovernanceValues>) {
  const has = (sg as any)?.hasExternalAudit;
  const audit = (sg as any)?.audit ?? {};
  const issuingDate = normalizeYMD(audit.issuingDate);

  return {
    hasExternalAudit: has === undefined ? undefined : Boolean(has),
    audit: has
      ? {
          issuer: audit.issuer ?? undefined,
          issuingDate, // strictly "YYYY-MM-DD" or undefined
        }
      : undefined,
  };
}
