// /schemas/foundational.schema.ts
import { z } from "zod";

// ---------------------------
// Reusable regex & transforms
// ---------------------------
export const employeeRangeRegex = /^\s*(\d+)\s*-\s*(\d+)\s*$/;

const upper3 = z
  .string()
  .min(3)
  .max(3)
  .transform((s) => s.toUpperCase());

const upper2 = z
  .string()
  .min(2)
  .max(2)
  .transform((s) => s.toUpperCase());

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use yyyy-mm-dd");

const ymdCoerced = z
  .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.coerce.date()])
  .transform((v) =>
    typeof v === "string" ? v : new Date(v).toISOString().slice(0, 10)
  );

// ---------------------------
// Enums (match frontend intent)
// ---------------------------

// Legal form: narrowed per request
export const LegalFormEnum = z.enum([
  "PRIVATE_LIMITED",     // Private limited liability
  "SOLE_PROPRIETORSHIP", // Sole proprietorship
  "PARTNERSHIP",         // Partnership
  "COOPERATIVE",         // Cooperative
  "LLC",                 // Limited Liability Company
  "PLC",                 // Public Limited Company
  "SA",                  // Société Anonyme
  "GMBH",                // Gesellschaft mit beschränkter Haftung
  "SAS",                 // Société par actions simplifiée
  "OTHER",               // Other (specify)
]);


// New: Nature of ownership (the 7-option dropdown)
export const OwnershipNatureEnum = z.enum([
  "FOUNDER_OWNED",        // Founder-owned
  "FAMILY_OWNED",         // Family-owned
  "EMPLOYEE_OWNED",       // Employee-owned / ESOP
  "COOPERATIVE",          // Cooperative (member-owned)
  "VC_PE_CONTROLLED",     // Venture Capital / Private Equity controlled
  "STATE_MUNICIPAL",      // State-owned / Municipal
  "FOUNDATION_NGO",       // Foundation / NGO-owned
  "PUBLICLY_LISTED",      // Publicly listed company
  "PRIVATE",              // Private ownership
  "STATE",                // State-owned (general, broader than municipal)
  "NONPROFIT_ASSOC",      // Non-profit / Association
  "WIDELY_HELD_PRIVATE",  // Widely held (private)
  "OTHER",                // Other (specify)
]);

export const SMEClassEnum = z.enum(["MICRO", "SMALL", "MEDIUM"]);

// New: NACE Section (A–U)
export const NaceSectionEnum = z.enum([
  "A","B","C","D","E","F","G","H","I","J",
  "K","L","M","N","O","P","Q","R","S","T","U",
]);

export const ValueChainScopeEnum = z.enum([
  "CORE_OPERATIONS",
  "UPSTREAM",
  "DOWNSTREAM",
  "SERVICES",
  "OTHER",
]);

export const RestatementReasonEnum = z.enum([
  "METHODOLOGY_CHANGE",
  "BASE_PERIOD_CHANGE",
  "MERGER_ACQUISITION",
  "ERROR_CORRECTION",
  "OTHER",
]);

export const PolicyKeyEnum = z.enum([
  "CLIMATE_CHANGE",
  "POLLUTION",
  "WATER_MARINE",
  "BIODIVERSITY",
  "CIRCULAR_ECONOMY",
  "OWN_WORKFORCE",
  "VALUE_CHAIN_WORKERS",
  "AFFECTED_COMMUNITIES",
  "CONSUMERS_END_USERS",
  "BUSINESS_CONDUCT",
]);

export const PolicyStatusSchema = z.object({
  isPublic: z.boolean().optional(),
  hasTargets: z.boolean().optional(),
});

export const PoliciesMapSchema = z.record(PolicyKeyEnum, PolicyStatusSchema).optional();

export const CertificationSchema = z.object({
  issuer: z.string().max(200).optional(),
  issuingDate: ymdCoerced.optional(),
  file: z.instanceof(File).nullable().optional(),
});


export const AuditInfoSchema = z.object({
  issuer: z.string().trim().max(200).optional(),
  issuingDate: ymdCoerced.optional(),
  file: z.instanceof(File).nullable().optional(),
});

export const SustainabilityGovernanceSchema = z.object({
  hasSustainabilityCert: z.boolean().optional(),
  certification: CertificationSchema.optional(),
  draftedPractices: z.boolean().optional(),
  arePubliclyAvailable: z.boolean().optional(),
  haveTargets: z.boolean().optional(),
  accountableJobTitle: z.string().max(200).optional(),
  policies: z.record(
    z.enum([
      "CLIMATE_CHANGE","POLLUTION","WATER_MARINE","BIODIVERSITY","CIRCULAR_ECONOMY",
      "OWN_WORKFORCE","VALUE_CHAIN_WORKERS","AFFECTED_COMMUNITIES","CONSUMERS_END_USERS","BUSINESS_CONDUCT",
    ]),
    z.object({ isPublic: z.boolean().optional(), hasTargets: z.boolean().optional() })
  ).optional(),
  hasExternalAudit: z.boolean().optional(),
  audit: AuditInfoSchema.optional(),

});
export const AlignmentFlagEnum = z.enum(["ILO_PRINCIPLES", "LOCAL_LAWS"]);

// ---------------------------
// Section Schemas
// ---------------------------
export const CompanyBasicsSchema = z.object({
  legalForm: LegalFormEnum.optional(),
  // Keep isPublic for backward compatibility (not shown in UI now)
  isPublic: z.boolean().optional(),
  // New: nature of ownership
  ownershipNature: OwnershipNatureEnum.optional(),
  // Reporting currency as 3-letter uppercase code
  reportingCurrency: upper3.optional(),
  // Auto-derived from employeeCount
  smeClass: SMEClassEnum.optional(),
  // New: NACE section letter
  naceCode: NaceSectionEnum.optional(),
  // "min-max" string
  employeeCount: z
    .string()
    .regex(employeeRangeRegex, 'Use "min-max", e.g., "10-600"')
    .optional(),
  
    companyActivities: z.string().max(2000).optional(),

});

export const IdentifiersSchema = z.object({
  lei: z.string().trim().max(50).optional(),
  duns: z.string().trim().max(50).optional(),
  euId: z.string().trim().max(100).optional(),
  permId: z.string().trim().max(100).optional(),
});

export const HeadquartersSchema = z.object({
  hqCountry: upper2.optional(),
  hqRegion: z.string().max(200).optional(),
  hqCity: z.string().max(200).optional(),
  hqAddress: z.string().max(500).optional(),
  hqLatitude: z.coerce.number().min(-90).max(90).optional(),
  hqLongitude: z.coerce.number().min(-180).max(180).optional(),
});

export const RegisteredOfficeSchema = z.object({
  registeredCountry: upper2.optional(),
  registeredRegion: z.string().max(200).optional(),
  registeredCity: z.string().max(200).optional(),
  registeredAddress: z.string().max(500).optional(),
  registeredZip: z.string().max(50).optional(),
});

export const FinancialsSchema = z.object({
  annualTurnover: z.coerce.number().min(0).optional(),
  balanceSheetTotal: z.coerce.number().min(0).optional(),
});

export const ValueChainSchema = z.object({
  valueChainScopes: z.array(ValueChainScopeEnum).optional(),
  businessRelations: z.array(z.string().trim().max(500)).optional(),
});

export const SupplyChainContextSchema = z.object({
  isInMNCChain: z.boolean().optional(),
  parentName: z.string().max(200).optional(),
  parentLocation: z.string().max(200).optional(),
  parentUrl: z.string().url().max(500).optional(),
});

export const AlignmentsContextSchema = z.object({
  sdgCodes: z.array(z.string().trim().max(16)).optional(), // e.g., "SDG7"
  alignmentFlags: z.array(AlignmentFlagEnum).optional(),
  alignmentDetails: z.string().max(2000).optional(),
  activitiesSummary: z.string().max(4000).optional(),
  strategySummary: z.string().max(4000).optional(),
  operatingContext: z.string().max(4000).optional(),
  stakeholderSummary: z.string().max(2000).optional(),
});

export const ReportingFrequencyEnum = z.enum(["ANNUAL", "BIENNIAL", "AD_HOC"]);

export const DisclosurePeriodsSchema = z
  .object({
    sustainabilityPeriodStart: ymd.optional(),
    sustainabilityPeriodEnd: ymd.optional(),
    financialPeriodStart: ymd.optional(),
    financialPeriodEnd: ymd.optional(),
    periodDifferenceReason: z.string().max(2000).optional(),
    dateOfInformation: ymd.optional(),
    frequency: ReportingFrequencyEnum.optional(),
  })
  .superRefine((val, ctx) => {
    // paired requirement checks (strings)
    if (val.sustainabilityPeriodStart && !val.sustainabilityPeriodEnd) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sustainabilityPeriodEnd"], message: "Sustainability period end is required when start is set." });
    }
    if (val.sustainabilityPeriodEnd && !val.sustainabilityPeriodStart) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sustainabilityPeriodStart"], message: "Sustainability period start is required when end is set." });
    }

    if (val.financialPeriodStart && !val.financialPeriodEnd) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["financialPeriodEnd"], message: "Financial period end is required when start is set." });
    }
    if (val.financialPeriodEnd && !val.financialPeriodStart) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["financialPeriodStart"], message: "Financial period start is required when end is set." });
    }

    // difference reason check (compare strings)
    const hasS = !!val.sustainabilityPeriodStart && !!val.sustainabilityPeriodEnd;
    const hasF = !!val.financialPeriodStart && !!val.financialPeriodEnd;
    if (hasS && hasF) {
      const different =
        val.sustainabilityPeriodStart !== val.financialPeriodStart ||
        val.sustainabilityPeriodEnd !== val.financialPeriodEnd;
      if (different && !val.periodDifferenceReason) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["periodDifferenceReason"],
          message: "Please provide a reason when financial and sustainability periods differ.",
        });
      }
    }
  });

export const DisclosureContactSchema = z.object({
  contactName: z.string().max(200).optional(),
  contactEmail: z.string().email().max(320).optional(),
  contactRole: z.string().max(200).optional(),
  // contactEmailVerified is server-driven; omit from client schema
});

export const FirstRestatementSchema = z
  .object({
    isFirstReport: z.boolean().optional(),
    isRestated: z.boolean().optional(),
    restatementReasons: z.array(RestatementReasonEnum).optional(),
    restatementNotes: z.string().max(2000).optional(),
  })
  .superRefine((val, ctx) => {
    // If explicitly restated, require at least one reason
    if (val.isRestated === true) {
      if (!val.restatementReasons || val.restatementReasons.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select at least one restatement reason.",
          path: ["restatementReasons"],
        });
      }
    }
  });


  

// ---------------------------
// Documents (Phase 1: local only)
// ---------------------------
export const DocumentsSchema = z.object({
  registrationCertFile: z.instanceof(File).optional(), // single file
  previousReportFiles: z.array(z.instanceof(File)).optional(), // multi-file
});

// ---------------------------
// Composite Form Schema
// ---------------------------
export const foundationalFormSchema = z.object({
  companyBasics: CompanyBasicsSchema,
  identifiers: IdentifiersSchema,
  headquarters: HeadquartersSchema,
  registeredOffice: RegisteredOfficeSchema,
  financials: FinancialsSchema,
  valueChain: ValueChainSchema,
  supplyChain: SupplyChainContextSchema,
  alignments: AlignmentsContextSchema,
  disclosurePeriods: DisclosurePeriodsSchema,
  disclosureContact: DisclosureContactSchema,
  firstRestatement: FirstRestatementSchema,
  documents: DocumentsSchema,
  sustainabilityGovernance: SustainabilityGovernanceSchema.optional(),

});

export type CompanyBasicsValues = z.infer<typeof CompanyBasicsSchema>;
export type IdentifiersValues = z.infer<typeof IdentifiersSchema>;
export type HeadquartersValues = z.infer<typeof HeadquartersSchema>;
export type RegisteredOfficeValues = z.infer<typeof RegisteredOfficeSchema>;
export type FinancialsValues = z.infer<typeof FinancialsSchema>;
export type ValueChainValues = z.infer<typeof ValueChainSchema>;
export type SupplyChainContextValues = z.infer<typeof SupplyChainContextSchema>;
export type AlignmentsContextValues = z.infer<typeof AlignmentsContextSchema>;
export type DisclosurePeriodsValues = z.infer<typeof DisclosurePeriodsSchema>;
export type DisclosureContactValues = z.infer<typeof DisclosureContactSchema>;
export type FirstRestatementValues = z.infer<typeof FirstRestatementSchema>;
export type DocumentsValues = z.infer<typeof DocumentsSchema>;
export type SustainabilityGovernanceValues = z.infer<typeof SustainabilityGovernanceSchema>;
export type AuditInfo = z.infer<typeof AuditInfoSchema>;

export type FoundationalFormValues = z.infer<typeof foundationalFormSchema>;

// ---------------------------
// Utilities
// ---------------------------
export function parseEmployeeRange(input?: string | null): { min?: number; max?: number; error?: string } {
  if (!input) return {};
  const m = employeeRangeRegex.exec(input);
  if (!m) return { error: 'employeeCount must match "min-max", e.g., "10-600"' };
  const min = Number(m[1]);
  const max = Number(m[2]);
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < 0) {
    return { error: "employeeCount values must be non-negative integers" };
  }
  if (min > max) {
    return { error: "employeeCount min cannot be greater than max" };
  }
  return { min, max };
}
