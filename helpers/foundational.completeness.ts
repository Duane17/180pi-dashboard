// /helpers/foundational.completeness.ts
import type { FoundationalFormValues } from "@/schemas/foundational.schemas";

/**
 * Very light heuristic for Phase 1 UI:
 * Count a section complete when its minimal core fields are filled.
 * Adjust thresholds later as business rules evolve.
 */
export function summarizeFoundationalCompleteness(values: FoundationalFormValues) {
  let completed = 0;
  const total = 8; // company, ids, HQ, financials, context, disclosure, contact/restatement, documents

  // 1) Company basics (any of the key fields)
  const companyOk =
    !!values.companyBasics.legalForm ||
    typeof values.companyBasics.isPublic === "boolean" ||
    !!values.companyBasics.reportingCurrency ||
    !!values.companyBasics.smeClass ||
    !!values.companyBasics.employeeCount;
  if (companyOk) completed++;

  // 2) Identifiers (at least one)
  const idsOk =
    !!values.identifiers.lei ||
    !!values.identifiers.duns ||
    !!values.identifiers.euId ||
    !!values.identifiers.permId;
  if (idsOk) completed++;

  // 3) HQ (country and at least one of address/city)
  const hqOk =
    !!values.headquarters.hqCountry &&
    (!!values.headquarters.hqAddress || !!values.headquarters.hqCity);
  if (hqOk) completed++;

  // 4) Financials (at least one numeric)
  const finOk =
    typeof values.financials.annualTurnover === "number" ||
    typeof values.financials.balanceSheetTotal === "number";
  if (finOk) completed++;

  // 5) Context (value chain or supply chain or alignments present)
  const contextOk =
    (values.valueChain.valueChainScopes && values.valueChain.valueChainScopes.length > 0) ||
    (values.supplyChain.isInMNCChain !== undefined ||
      !!values.supplyChain.parentName ||
      !!values.supplyChain.parentUrl) ||
    (values.alignments.sdgCodes && values.alignments.sdgCodes.length > 0);
  if (contextOk) completed++;

  // 6) Disclosure periods (both sustainability dates OR both financial dates)
  const sPair =
    !!values.disclosurePeriods.sustainabilityPeriodStart &&
    !!values.disclosurePeriods.sustainabilityPeriodEnd;
  const fPair =
    !!values.disclosurePeriods.financialPeriodStart &&
    !!values.disclosurePeriods.financialPeriodEnd;
  if (sPair || fPair) completed++;

  // 7) Contact + restatement (contact set AND isFirstReport/isRestated decided)
  const contactOk =
    !!values.disclosureContact.contactName && !!values.disclosureContact.contactEmail;
  const restatementDecided =
    values.firstRestatement.isFirstReport !== undefined ||
    values.firstRestatement.isRestated !== undefined;
  if (contactOk && restatementDecided) completed++;

  // 8) Documents (registration OR at least one previous report file)
  const docsOk =
    !!values.documents.registrationCertFile ||
    (values.documents.previousReportFiles &&
      values.documents.previousReportFiles.length > 0);
  if (docsOk) completed++;

  return { completed, total };
}
