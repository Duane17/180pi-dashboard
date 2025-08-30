// src/lib/mappers/foundational.mapper.ts
import type { FoundationalFormValues } from "@/schemas/foundational.schemas";
import type { UpsertFoundationalPayload } from "@/lib/services/foundational.client";

const isBlank = (v: unknown) => v === "" || v == null;
const strUndef = (v: unknown) => (isBlank(v) ? undefined : String(v));

// Uppercasing helpers
const upper3Undef = (v: unknown) => {
  const s = strUndef(v);
  return s ? s.toUpperCase() : undefined;
};
const alpha2Undef = (v: unknown) => {
  const s = strUndef(v);
  return s ? s.toUpperCase() : undefined; // backend FK expects uppercase alpha-2
};

// Numbers should be undefined when blank (not null)
const numUndef = (v: unknown) => (isBlank(v) ? undefined : Number(v));

// Arrays: undefined when empty
const arrUndef = <T>(v: T[] | undefined | null) =>
  v && Array.isArray(v) && v.length ? v : undefined;

// "10-600" → "10-600" (no spaces); otherwise undefined
const EMP_RE = /^\s*\d+\s*-\s*\d+\s*$/;
const employeeRangeOrUndef = (v: unknown) => {
  const s = strUndef(v)?.trim();
  return s && EMP_RE.test(s) ? s.replace(/\s+/g, "") : undefined;
};

// Dates → "YYYY-MM-DD" or undefined
function iso(d?: string | Date | null) {
  if (!d) return undefined;
  if (typeof d === "string") return d || undefined;
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return undefined;
  }
}

// Normalize to http(s) URL; omit if invalid
function ensureHttpUrl(v: unknown): string | undefined {
  const raw = strUndef(v)?.trim();
  if (!raw) return undefined;
  const withScheme = /^(https?:)?\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
  } catch { /* invalid */ }
  return undefined;
}

export function mapGeneralToFoundationalPayload(
  general: FoundationalFormValues
): UpsertFoundationalPayload {
  const basics = general.companyBasics ?? {};
  const ids = general.identifiers ?? {};
  const hq = general.headquarters ?? {};
  const reg = general.registeredOffice ?? {};
  const fin = general.financials ?? {};
  const supply = general.supplyChain ?? {};
  const aligns = general.alignments ?? {};
  const periods = general.disclosurePeriods ?? {};
  const contact = general.disclosureContact ?? {};
  const firstRestate = general.firstRestatement ?? {};
  const valueChain = general.valueChain ?? {};
  const operations = (general as any).operations ?? { countries: [] };
  const sg = (general as any).sustainabilityGovernance ?? {}; // <-- NEW source for cert/audit

  const activitiesSummaryResolved =
    strUndef(aligns.activitiesSummary) ??
    strUndef((basics as any).companyActivities);

  // ---------------- Company block ----------------
  const company = {
    // Sector & NACE
    naceCode: strUndef(basics.naceCode),

    // Legal & ownership
    legalForm: strUndef(basics.legalForm),
    isPublic: isBlank(basics.isPublic) ? undefined : Boolean(basics.isPublic),

    // IDs
    lei: strUndef(ids.lei),
    duns: strUndef(ids.duns),
    euId: strUndef(ids.euId),
    permId: strUndef(ids.permId),

    // Financials
    reportingCurrency: upper3Undef(basics.reportingCurrency),
    annualTurnover: numUndef(fin.annualTurnover),
    balanceSheetTotal: numUndef(fin.balanceSheetTotal),
    smeClass: strUndef(basics.smeClass),

    // HQ
    hqCountry: alpha2Undef(hq.hqCountry),
    hqRegion: strUndef(hq.hqRegion),
    hqCity: strUndef(hq.hqCity),
    hqAddress: strUndef(hq.hqAddress),
    hqLatitude: numUndef(hq.hqLatitude),
    hqLongitude: numUndef(hq.hqLongitude),

    // Registered office
    registeredAddress: strUndef(reg.registeredAddress),
    registeredCity: strUndef(reg.registeredCity),
    registeredRegion: strUndef(reg.registeredRegion),
    registeredCountry: alpha2Undef(reg.registeredCountry),
    registeredZip: strUndef(reg.registeredZip),

    // Value chain & relations
    valueChainScopes: arrUndef(valueChain.valueChainScopes),
    businessRelations: arrUndef(valueChain.businessRelations),

    // Supply-chain context
    isInMNCChain: isBlank(supply.isInMNCChain) ? undefined : Boolean(supply.isInMNCChain),
    parentName: strUndef(supply.parentName),
    parentLocation: strUndef(supply.parentLocation),
    parentUrl: ensureHttpUrl(supply.parentUrl), // only send valid http(s) or omit

    // Alignments & context
    sdgCodes: arrUndef(aligns.sdgCodes),
    alignmentDetails: strUndef(aligns.alignmentDetails),

    // ✅ ensure activitiesSummary is forwarded (from alignments OR basics.companyActivities)
    activitiesSummary: activitiesSummaryResolved,

    strategySummary: strUndef(aligns.strategySummary),
    operatingContext: strUndef(aligns.operatingContext),
    stakeholderSummary: strUndef(aligns.stakeholderSummary),
    operatingCountries: arrUndef(operations.countries),

    // Employees
    employeeCount: employeeRangeOrUndef(basics.employeeCount),
  };

  // ---------------- Disclosure block ----------------
  const disclosure = {
    sustainabilityPeriodStart: iso(periods.sustainabilityPeriodStart),
    sustainabilityPeriodEnd: iso(periods.sustainabilityPeriodEnd),
    financialPeriodStart: iso(periods.financialPeriodStart),
    financialPeriodEnd: iso(periods.financialPeriodEnd),
    periodDifferenceReason: strUndef(periods.periodDifferenceReason),
    dateOfInformation: iso(periods.dateOfInformation),

    contactName: strUndef(contact.contactName),
    contactEmail: strUndef(contact.contactEmail),
    contactRole: strUndef((contact as any).contactRole),

    isFirstReport: isBlank(firstRestate.isFirstReport) ? undefined : Boolean(firstRestate.isFirstReport),
    isRestated:   isBlank(firstRestate.isRestated)   ? undefined : Boolean(firstRestate.isRestated),
    restatementReasons: arrUndef(firstRestate.restatementReasons),
    restatementNotes: strUndef(firstRestate.restatementNotes),

    previousReportDocumentIds: undefined, // phase 1
  };

  // ---------------- Certification block ----------------
  const certIssuer = strUndef(sg?.certification?.issuer);
  const certDate = iso(sg?.certification?.issuingDate as any);
  const certFile = sg?.certification?.file as File | undefined | null;

  // Only include when there is a flag or actual values
  const hasCertFlag = sg?.hasSustainabilityCert;
  const wantCert =
    hasCertFlag !== undefined ||
    !!certIssuer ||
    !!certDate ||
    !!certFile;

  const certification = wantCert
    ? {
        hasSustainabilityCert: isBlank(hasCertFlag) ? undefined : Boolean(hasCertFlag),
        issuer: certIssuer ?? null,
        issuingDate: certDate ?? null,
        // lightweight file meta (upload flow should generate URL server-side)
        certFileName: certFile?.name ?? undefined,
        certFileSize: certFile?.size ?? undefined,
        certFileMime: certFile?.type ?? undefined,
      }
    : undefined;

  // ---------------- NEW: External audit block ----------------
  const auditIssuer = strUndef(sg?.audit?.issuer);
  const auditDate = iso(sg?.audit?.issuingDate as any);
  const hasAuditFlag = sg?.hasExternalAudit;

  const wantAudit =
    hasAuditFlag !== undefined ||
    !!auditIssuer ||
    !!auditDate;

  const externalAudit = wantAudit
    ? {
        hasExternalAudit: isBlank(hasAuditFlag) ? undefined : Boolean(hasAuditFlag),
        auditIssuer: auditIssuer ?? null,
        auditDate: auditDate ?? null,
      }
    : undefined;

  // Strip empty company block
  const hasAnyCompanyField = Object.values(company).some(
    (v) => v !== undefined && !(Array.isArray(v) && v.length === 0)
  );

  return {
    ...(hasAnyCompanyField ? { company } : {}),
    disclosure,
    ...(certification ? { certification } : {}),
    ...(externalAudit ? { externalAudit } : {}),
  };
}
