// schemas/esg-wizard.schema.ts
import { z } from "zod";
import {
  foundationalFormSchema as GeneralSchema, // reuse your existing foundational schema
} from "@/schemas/foundational.schemas";
import {
  GHG_METHODOLOGIES,
  UNITS,
  TARGET_CATEGORIES,
  GOV_POLICY_CATEGORIES,
  BOARD_ROLES,
  ENERGY_CATEGORY, // ← use the shared constant to avoid drift
} from "@/constants/esg.constants";

import {
  WASTE_STREAMS,
  WASTE_HAZARD_CLASSES,
  WASTE_STATES,
  WASTE_ROUTES,
  WASTE_METHODS_DIVERTED,
  WASTE_METHODS_DISPOSAL,
  WASTE_DESTINATIONS,
  WASTE_UNITS,
  WASTE_MEASUREMENT_METHODS,
} from "@/constants/esg.waste.constants";

/** ----------------------- Helpers ----------------------- */
export const coerceDecimal = (msg = "Invalid number") =>
  z.union([z.number(), z.string()]).transform((v, ctx) => {
    if (typeof v === "number") return v;
    const trimmed = (v ?? "").toString().trim();
    if (trimmed === "") return null as any;
    const num = Number(trimmed.replace(/,/g, ""));
    if (Number.isFinite(num)) return num;
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg });
    return z.NEVER;
  });

/** Coerced decimal that must be >= 0 (or null/undefined) */
const nonNegDecimal = (msg = "Must be ≥ 0") =>
  coerceDecimal().refine((v) => v == null || v >= 0, { message: msg });

/** parseEmployeeRange("10-600") -> { min: 10, max: 600 } */
export function parseEmployeeRange(value?: string) {
  if (!value) return undefined;
  const m = value.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
  if (!m) return undefined;
  const min = Number(m[1]);
  const max = Number(m[2]);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) return undefined;
  return { min, max };
}

/** -------------------- Environment ---------------------- */
export const EnvironmentGHGSchema = z.object({
  year: z.number().int().min(1900).max(3000),
  scope1_tCO2e: nonNegDecimal().nullable().optional(),
  scope2_tCO2e: nonNegDecimal().nullable().optional(),
  scope3_tCO2e: nonNegDecimal().nullable().optional(),
  methodology: z
    .string()
    .optional()
    .refine((v) => !v || GHG_METHODOLOGIES.includes(v as any), {
      message: "Unknown methodology",
    }),
  notes: z.string().max(2000).optional(),
});

/** Aggregate rows the UI writes after computing MWh */
const EnergyRowSchema = z
  .object({
    category: z.enum(ENERGY_CATEGORY).optional(), // "renewable" | "non_renewable"
    type: z.string().max(200).optional(),
    mwh: nonNegDecimal().nullable().optional(),
  })
  .refine((r) => r.mwh == null || r.category != null, {
    message: "Select a category for this amount",
    path: ["category"],
  });

/** --------- Detailed payload (matches updated Resource card) ---------
 * NOTE: The UI currently serializes this to JSON and stores in coreImpactData.
 * We accept BOTH the object shape and the string for painless migration.
 */

const YesNo = z.enum(["Yes", "No"]);

const PurchasedEnergyRowSchema = z.object({
  energyType: z.enum(["Electricity", "District heat", "Steam", "Cooling"]),
  quantity: nonNegDecimal().nullable().optional(),
  unit: z.enum(["kWh", "MWh", "GJ", "MJ"]),
  country: z.string().max(120).optional(),
  supplierFactorKgCO2ePerKWh: nonNegDecimal().nullable().optional(),
  hasCertificates: YesNo.optional(),
  volumeKWh: nonNegDecimal().nullable().optional(),
  renewable: YesNo.optional(),
});

const FuelRowSchema = z.object({
  use: z.enum(["Stationary", "Mobile"]),
  fuelType: z.enum([
    "diesel",
    "petrol",
    "kerosene",
    "natural_gas",
    "LPG",
    "coal",
    "biomass",
    "biogas",
    "other",
  ]),
  quantity: nonNegDecimal().nullable().optional(),
  unit: z.enum(["L", "m3", "kg", "t"]),
  renewable: YesNo.optional(),
  renewableSubtype: z.enum(["biomass", "biogas"]).optional(),
  nonRenewableSubtype: z
    .enum(["diesel", "petrol", "natural_gas", "LPG", "coal", "kerosene"])
    .optional(),
})
  // If renewable Yes -> expect renewableSubtype; if No -> expect nonRenewableSubtype
  .refine(
    (r) =>
      !r.renewable ||
      (r.renewable === "Yes" ? !!r.renewableSubtype : !!r.nonRenewableSubtype),
    {
      message: "Select an appropriate subtype for the chosen renewable flag",
      path: ["renewable"],
    }
  );

const SelfGenRowSchema = z.object({
  source: z.enum(["Solar PV", "Wind", "Hydro", "Diesel genset", "Gas turbine", "Other"]),
  grossKWh: nonNegDecimal().nullable().optional(),
  selfConsumedKWh: nonNegDecimal().nullable().optional(),
  exportedKWh: nonNegDecimal().nullable().optional(),
  fuelBased: YesNo.optional(),
});

const EnergySoldRowSchema = z.object({
  type: z.enum(["Electricity", "Heat", "Steam", "Cooling"]),
  kWh: nonNegDecimal().nullable().optional(),
});

const IntensityStateSchema = z.object({
  denominatorType: z
    .enum(["Turnover", "FTE", "Floor area (m²)", "Units produced"])
    .optional(),
  denominatorValue: nonNegDecimal().nullable().optional(),
  denominatorUnitNote: z.string().max(120).optional(),
});

const CoreImpactPayloadSchema = z.object({
  purchased: z.array(PurchasedEnergyRowSchema),
  fuels: z.array(FuelRowSchema),
  selfGen: z.array(SelfGenRowSchema),
  sold: z.array(EnergySoldRowSchema),
  intensity: IntensityStateSchema.optional(),
  note: z.string().max(4000).optional(),
});

/** ---------------- Resource Consumption (schema) ---------------- */
export const EnvironmentResourceConsumptionSchema = z.object({
  recordedAt: z.string().date("Invalid date").optional(),

  // Legacy “quick total” — keep it for backwards compatibility
  energyMWh: nonNegDecimal().nullable().optional(),

  waterM3: nonNegDecimal().nullable().optional(),
  wasteTonnes: nonNegDecimal().nullable().optional(),

  // Aggregated by-type entries the UI writes (computed MWh)
  electricity: z.array(EnergyRowSchema).optional(),
  selfGenerated: z.array(EnergyRowSchema).optional(),
  fuels: z.array(EnergyRowSchema).optional(),

  // Detailed payload:
  // Accept EITHER a JSON string (current UI) OR the structured object (future-ready).
  // Max expanded to accommodate larger arrays.
  coreImpactData: z
    .union([z.string().max(200000), CoreImpactPayloadSchema])
    .optional(),
});

export const EnvironmentTargetSchema = z.object({
  baseline: nonNegDecimal().nullable().optional(),
  target: nonNegDecimal().nullable().optional(),
  unit: z
    .string()
    .optional()
    .refine((v) => !v || UNITS.some((u) => u.value === v || u.label === v), {
      message: "Unknown unit",
    }),
  dueDate: z.string().date("Invalid date").optional(),
  category: z
    .string()
    .optional()
    .refine((v) => !v || TARGET_CATEGORIES.includes(v as any), {
      message: "Unknown target category",
    }),
});


/** ---------------- Water (schema) ---------------- */

const WATER_UNITS = ["m3", "L"] as const;
const WATER_QUALITY = ["Freshwater", "Other water"] as const;
const MEASUREMENT_METHODS = ["Meter", "Utility bill", "Estimate"] as const;
const WITHDRAWAL_SOURCES = [
  "Surface water",
  "Groundwater",
  "Seawater",
  "Produced water",
  "Third-party (municipal/other)",
] as const;
const DISCHARGE_DESTINATIONS = [
  "Surface water",
  "Groundwater",
  "Seawater",
  "Third-party (sewer/other org)",
] as const;

// Period union
const WaterPeriodSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("month"), month: z.string().min(1) }),
  z.object({
    mode: z.literal("range"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
]);

const WaterWithdrawalRowSchema = z.object({
  source: z.enum(WITHDRAWAL_SOURCES),
  quality: z.enum(WATER_QUALITY),
  quantity: coerceDecimal().nullable().optional(),
  unit: z.enum(WATER_UNITS),
  method: z.enum(MEASUREMENT_METHODS),
  period: WaterPeriodSchema,
});

const WaterDischargeRowSchema = z.object({
  destination: z.enum(DISCHARGE_DESTINATIONS),
  sentToOtherOrgForReuse: z.enum(["Yes", "No"]).optional(),
  quality: z.enum(WATER_QUALITY),
  treatmentLevel: z.enum(["None", "Primary", "Secondary", "Tertiary"]).optional(),
  quantity: coerceDecimal().nullable().optional(),
  unit: z.enum(WATER_UNITS),
  method: z.enum(MEASUREMENT_METHODS),
  period: WaterPeriodSchema,
});

export const EnvironmentWaterSchema = z.object({
  withdrawals: z.array(WaterWithdrawalRowSchema).optional(),
  discharges: z.array(WaterDischargeRowSchema).optional(),
  totals_m3: z
    .object({
      withdrawn: coerceDecimal().nullable().optional(),
      discharged: coerceDecimal().nullable().optional(),
    })
    .optional(),
  note: z.string().max(4000).optional(),
});


/** ---------------- Biodiversity (schema) ---------------- */
const HabitatEnum = z.enum([
  "Forest","Grassland","Wetland","Freshwater","Marine–coastal","Agricultural mosaic","Urban–brownfield","Other",
]);
const ActivityEnum = z.enum([
  "New construction","Expansion","Quarrying","Water abstraction","Effluent discharge","Traffic/noise/light","Vegetation clearance","Other",
]);
const ReceptorEnum = z.enum(["Habitat","Species","Ecosystem service"]);
const ProximityEnum = z.enum(["Inside","≤1 km","1–5 km",">5 km"]);

const BiodiversitySiteSchema = z.object({
  latitude: z.number().finite().nullable().optional(),
  longitude: z.number().finite().nullable().optional(),
  areaHectares: z.number().finite().min(0).nullable().optional(),
  habitat: HabitatEnum.optional(),
  designation: z.object({
    protectedArea: z.boolean().optional(),
    kba: z.boolean().optional(),
    ramsar: z.boolean().optional(),
    natura2000: z.boolean().optional(),
    other: z.boolean().optional(),
    otherText: z.string().max(200).optional(),
  }).optional(),
});

const oneToFive = z.number().int().min(1).max(5);

const BiodiversityImpactSchema = z.object({
  activity: ActivityEnum,
  receptor: ReceptorEnum,
  proximity: ProximityEnum,
  severity: oneToFive.nullable().optional(),
  extent: oneToFive.nullable().optional(),
  irreversibility: oneToFive.nullable().optional(),
  mitigation: z.object({
    avoid: z.boolean().optional(),
    minimize: z.boolean().optional(),
    restore: z.boolean().optional(),
    offset: z.boolean().optional(),
  }).optional(),
});

export const BiodiversitySchema = z.object({
  sites: z.array(BiodiversitySiteSchema).default([]),
  impacts: z.array(BiodiversityImpactSchema).default([]),
  note: z.string().max(2000).optional(),
});


/** ----------------------- Waste (new) ----------------------- */

const WasteRowSchema = z.object({
  stream: z.enum(WASTE_STREAMS),
  hazardClass: z.enum(WASTE_HAZARD_CLASSES),
  physicalState: z.enum(WASTE_STATES),

  /** Route + method with conditional allowed values */
  managementRoute: z.enum(WASTE_ROUTES),
  managementMethod: z.string(), // refined below

  destination: z.enum(WASTE_DESTINATIONS),

  quantity: nonNegDecimal().nullable().optional(),
  unit: z.enum(WASTE_UNITS).default("kg"),

  measurementMethod: z.enum(WASTE_MEASUREMENT_METHODS),

  // If "Other (specify)" stream is selected, allow a note
  otherStreamText: z.string().max(200).optional(),
})
.refine(
  (r) =>
    r.managementRoute === "Diverted from disposal"
      ? (WASTE_METHODS_DIVERTED as readonly string[]).includes(r.managementMethod)
      : (WASTE_METHODS_DISPOSAL as readonly string[]).includes(r.managementMethod),
  { message: "Invalid management method for selected route", path: ["managementMethod"] }
)
.refine(
  (r) => r.stream !== "Other (specify)" || !!r.otherStreamText?.trim(),
  { message: "Please specify the waste stream", path: ["otherStreamText"] }
);

export const EnvironmentWasteSchema = z.object({
  rows: z.array(WasteRowSchema).default([]),
  note: z.string().max(2000).optional(),
});


export const EnvironmentSchema = z.object({
  ghg: EnvironmentGHGSchema,
  resourceConsumption: EnvironmentResourceConsumptionSchema,
  water: EnvironmentWaterSchema.optional(),
  biodiversity: BiodiversitySchema.optional(),
  waste: EnvironmentWasteSchema.optional(),
  targets: z.array(EnvironmentTargetSchema).optional(),
});

/** ----------------------- Social ------------------------ */
export const LaborStatsSchema = z.object({
  asOfDate: z.string().date("Invalid date").optional(),
  fte: nonNegDecimal().nullable().optional(),
  femalePct: nonNegDecimal()
    .nullable()
    .refine((v) => v == null || (v >= 0 && v <= 100), {
      message: "femalePct must be 0–100",
    })
    .optional(),
  femaleMgmtPct: nonNegDecimal()
    .nullable()
    .refine((v) => v == null || (v >= 0 && v <= 100), {
      message: "femaleMgmtPct must be 0–100",
    })
    .optional(),
  injuryRate: nonNegDecimal().nullable().optional(),
  trainingHoursPerEmployee: nonNegDecimal().nullable().optional(),
  genderPayGapPct: nonNegDecimal()
    .nullable()
    .refine((v) => v == null || (v >= 0 && v <= 100), {
      message: "genderPayGapPct must be 0–100",
    })
    .optional(),
});

export const SocialPolicySummarySchema = z.object({
  title: z.string().max(200).optional(),
  status: z.enum(["none", "draft", "published"]).optional(),
  category: z.string().optional(),
  links: z.array(z.string().url()).optional(),
});

export const SocialSchema = z.object({
  laborStats: LaborStatsSchema,
  policies: z.array(SocialPolicySummarySchema).optional(),
});

/** --------------------- Governance --------------------- */
export const BoardMemberSchema = z.object({
  fullName: z.string().min(1, "Required"),
  gender: z.string().optional(),
  independence: z.enum(["independent", "non-independent"]).optional(),
  roles: z
    .array(z.string().refine((v) => BOARD_ROLES.includes(v as any), "Unknown role"))
    .optional(),
  appointedAt: z.string().date("Invalid date").optional(),
  resignedAt: z.string().date("Invalid date").optional(),
});

export const GovernancePolicySchema = z.object({
  category: z
    .string()
    .optional()
    .refine((v) => !v || GOV_POLICY_CATEGORIES.includes(v as any), {
      message: "Unknown policy category",
    }),
  status: z.enum(["none", "draft", "approved", "published"]).optional(),
  title: z.string().max(200).optional(),
  links: z.array(z.string().url()).optional(),
});

export const ComplianceStatusEntrySchema = z.object({
  framework: z.string().optional(),
  requirementCode: z.string().optional(),
  status: z
    .enum(["not-applicable", "non-compliant", "partially-compliant", "compliant"])
    .optional(),
  notes: z.string().max(2000).optional(),
});

export const GovernanceSchema = z.object({
  boardMembers: z.array(BoardMemberSchema),
  policies: z.array(GovernancePolicySchema).optional(),
  complianceStatus: z.array(ComplianceStatusEntrySchema).optional(),
});

/** ------------------ Composed Wizard ------------------- */
export const ESGWizardSchema = z.object({
  general: GeneralSchema, // ← reuse foundational schema as-is
  environment: EnvironmentSchema,
  social: SocialSchema,
  governance: GovernanceSchema,
});

// Optional: export the inferred root type (pure type export = safe)
export type ESGWizardValues = z.infer<typeof ESGWizardSchema>;

/** -------- Field paths per step (for RHF trigger) -------
 * NOTE: We avoid importing WizardStep from types to prevent cycles.
 * If you prefer a type, use a local literal union 1|2|3|4 here.
 */
export const fieldPathsByStep: Record<1 | 2 | 3 | 4, string[]> = {
  1: [
    // General (pick your required subset)
    "general.companyBasics.legalForm",
    "general.companyBasics.reportingCurrency",
    "general.companyBasics.employeeCount",
    "general.identifiers.lei",
    "general.headquarters.hqCountry",
    "general.registeredOffice.registeredCountry",
    "general.financials.annualTurnover",
    "general.valueChain.valueChainScopes",
    "general.disclosurePeriods.sustainabilityPeriodStart",
    "general.disclosurePeriods.sustainabilityPeriodEnd",
    "general.disclosureContact.contactEmail",
  ],
  2: [
    "environment.ghg.year",
    "environment.ghg.scope1_tCO2e",
    "environment.ghg.scope2_tCO2e",
    "environment.ghg.methodology",
    "environment.resourceConsumption.recordedAt",
    "environment.water.withdrawals", 
    // (Optional) You can add paths like "environment.resourceConsumption.electricity"
    // to force array-level validation attempts if you gate Next with `trigger`.
  ],
  3: [
    "social.laborStats.asOfDate",
    "social.laborStats.fte",
    "social.laborStats.femalePct",
    "social.laborStats.femaleMgmtPct",
  ],
  4: [
    "governance.boardMembers", // validating the array is sufficient for RHF
  ],
} as const;
