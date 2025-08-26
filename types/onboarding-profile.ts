// src/types/onboarding-profile.ts

/** =========================
 *  Enums (frontend literals)
 *  =========================
 * Keep these string literal unions in exact parity with the backend Prisma enums & Zod schema.
 */

export type HelpFocus =
  | "FOOTPRINT"
  | "DISCLOSURE"
  | "REPORT_PREP"
  | "TARGETS_REDUCTION"
  | "SUPPLY_CHAIN"
  | "FINANCED"
  | "CREDITS_CLEAN_POWER";

export type ReportingObligation = "SUBJECT" | "VOLUNTARY";

export type StakeholderGroup =
  | "INVESTOR_ASSET_FINANCIAL_RATING"
  | "AUDITOR_CONSULTANT"
  | "NGO_ADVOCACY"
  | "MEDIA_JOURNALIST"
  | "REGULATOR_POLICYMAKER_STANDARD_SETTER"
  | "DATA_PROVIDER"
  | "ACADEMIC_RESEARCH"
  | "EMPLOYEE"
  | "CONSUMER"
  | "CONCERNED_CITIZEN";

/** =========================
 *  Wizard Local Shape
 *  =========================
 * Used by the onboarding wizard state only.
 */
export interface OnboardingIntentData {
  helpFocus: HelpFocus | "";              // empty string = not selected yet
  reportingObligation: ReportingObligation | "";
  stakeholderGroup: StakeholderGroup | "";
}

/** =========================
 *  API DTOs (mirror backend)
 *  =========================
 * These mirror the server’s request/response. Do not add optionality that the server doesn’t have.
 */

export interface OnboardingProfileUpsertRequest {
  helpFocus: HelpFocus;
  reportingObligation: ReportingObligation;
  stakeholderGroup: StakeholderGroup;
}

export interface OnboardingProfileResponse {
  companyId: string;
  helpFocus: HelpFocus;
  reportingObligation: ReportingObligation;
  stakeholderGroup: StakeholderGroup;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/** =========================
 *  Friendly Labels (UI)
 *  =========================
 * Reuse these in Step components and Review for consistent display.
 */

export const HelpFocusLabels: Record<HelpFocus, string> = {
  FOOTPRINT: "Measuring my carbon footprint",
  DISCLOSURE: "Reporting or disclosing emissions",
  REPORT_PREP: "Preparing for sustainability reporting",
  TARGETS_REDUCTION: "Setting targets and reducing emissions",
  SUPPLY_CHAIN: "Measure/report/act on supply chain emissions",
  FINANCED: "Measure/report/act on financed emissions",
  CREDITS_CLEAN_POWER: "Purchasing carbon removal credits / clean power",
};

export const ReportingObligationLabels: Record<ReportingObligation, string> = {
  SUBJECT: "Subject to reporting (upon investors/bank request)",
  VOLUNTARY: "Not subject to reporting (voluntary)",
};

export const StakeholderGroupLabels: Record<StakeholderGroup, string> = {
  INVESTOR_ASSET_FINANCIAL_RATING:
    "Investor / Asset Manager / Financial Analyst / Rating Provider",
  AUDITOR_CONSULTANT: "Auditor / Consultant",
  NGO_ADVOCACY: "NGO / Advocacy Group",
  MEDIA_JOURNALIST: "Media / Journalist",
  REGULATOR_POLICYMAKER_STANDARD_SETTER:
    "Regulator / Policymaker / Standard Setter",
  DATA_PROVIDER: "Data Provider",
  ACADEMIC_RESEARCH: "Academic / Research Institution",
  EMPLOYEE: "Employee",
  CONSUMER: "Consumer",
  CONCERNED_CITIZEN: "Concerned Citizen",
};
