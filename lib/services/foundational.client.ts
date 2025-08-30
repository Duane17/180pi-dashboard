// src/lib/services/foundational.client.ts
import { api } from "@/lib/api";

/** ---------------- Company + Disclosure (unchanged) ---------------- */

export type UpsertFoundationalCompanyPayload = {
  name?: string;

  // Sector & NACE
  sector?: string | null;
  naceCode?: string | null;

  // Legal form & ownership
  legalForm?: string | null; // matches backend enum value
  isPublic?: boolean | null;

  // Official IDs
  lei?: string | null;
  duns?: string | null;
  euId?: string | null;
  permId?: string | null;

  // Financials
  reportingCurrency?: string | null; // 3-letter ISO, uppercased server-side
  annualTurnover?: number | null;
  balanceSheetTotal?: number | null;
  smeClass?: string | null; // enum on server

  // HQ (principal place of management)
  hqCountry?: string | null;  // 2-letter
  hqRegion?: string | null;
  hqCity?: string | null;
  hqAddress?: string | null;
  hqLatitude?: number | null;
  hqLongitude?: number | null;

  // Registered office
  registeredAddress?: string | null;
  registeredCity?: string | null;
  registeredRegion?: string | null;
  registeredCountry?: string | null; // 2-letter
  registeredZip?: string | null;

  // Value chain & relations
  valueChainScopes?: string[];     // enum values
  businessRelations?: string[];    // strings/urls

  // Supply-chain context
  isInMNCChain?: boolean | null;
  parentName?: string | null;
  parentLocation?: string | null;
  parentUrl?: string | null;

  // Alignments & context
  sdgCodes?: string[];
  alignmentFlags?: string[]; // enum values
  alignmentDetails?: string | null;
  activitiesSummary?: string | null;
  strategySummary?: string | null;
  operatingContext?: string | null;
  stakeholderSummary?: string | null;

  // Employees
  employeeCount?: string | null; // "min-max"
};

export type UpsertFoundationalDisclosurePayload = {
  sustainabilityPeriodStart?: string | Date | null;
  sustainabilityPeriodEnd?: string | Date | null;
  financialPeriodStart?: string | Date | null;
  financialPeriodEnd?: string | Date | null;
  periodDifferenceReason?: string | null;
  dateOfInformation?: string | Date | null;

  contactName?: string | null;
  contactEmail?: string | null;
  contactEmailVerified?: boolean | null;
  contactRole?: string | null;

  isFirstReport?: boolean | null;
  isRestated?: boolean | null;
  restatementReasons?: string[]; // enum values
  restatementNotes?: string | null;

  previousReportDocumentIds?: string[]; // UUIDs
};

/** ---------------- NEW: Certification + External Audit blocks ----------------
 * These ride in the same PUT /companies/:id/foundational payload.
 * Backend controller should read them and populate the new CompanyCertification
 * and CompanyExternalAudit tables (as per your server changes).
 */

export type UpsertCertificationPayload = {
  hasSustainabilityCert?: boolean | null;
  issuer?: string | null;
  issuingDate?: string | null; // "yyyy-mm-dd"
  // Lightweight file metadata (optional). Upload flow should set URL server-side.
  certFileName?: string | null;
  certFileSize?: number | null;
  certFileMime?: string | null;
};

export type UpsertExternalAuditPayload = {
  hasExternalAudit?: boolean | null;
  auditIssuer?: string | null;
  auditDate?: string | null; // "yyyy-mm-dd"
};

export type UpsertFoundationalPayload = {
  company?: UpsertFoundationalCompanyPayload;
  disclosure: UpsertFoundationalDisclosurePayload;

  /** NEW: optional certification block */
  certification?: UpsertCertificationPayload;

  /** NEW: optional external audit block */
  externalAudit?: UpsertExternalAuditPayload;
};

/** PUT /companies/:id/foundational */
export async function upsertFoundational(companyId: string, payload: UpsertFoundationalPayload) {
  const { data } = await api.put(`/companies/${companyId}/foundational`, payload);
  return data; // server returns the full company (companySelect)
}
