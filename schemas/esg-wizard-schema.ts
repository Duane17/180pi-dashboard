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
  // keep existing laborStats + policies if needed
  laborStats: LaborStatsSchema.optional(),

  workforceProfile: z.object({
    headcountByLocation: z.array(z.object({
      country: z.string().min(1),
      site: z.string().optional(),
      headcount: nonNegDecimal(),
    })).optional(),
    contractType: z.object({
      permanent: nonNegDecimal(),
      temporary: nonNegDecimal(),
    }).optional(),
    employmentType: z.object({
      fullTime: nonNegDecimal(),
      partTime: nonNegDecimal(),
    }).optional(),
    gender: z.object({
      women: nonNegDecimal(),
      men: nonNegDecimal(),
      undisclosed: nonNegDecimal(),
    }).optional(),
    ageBands: z.object({
      under30: nonNegDecimal(),
      from30to50: nonNegDecimal(),
      over50: nonNegDecimal(),
    }).optional(),
    fteTotal: nonNegDecimal().optional(),
  }).optional(),

  nonEmployeeWorkers: z.object({
    counts: z.object({
      agency: nonNegDecimal(),
      apprentices: nonNegDecimal(),
      contractors: nonNegDecimal(),
      homeWorkers: nonNegDecimal(),
      internsVolunteers: nonNegDecimal(),
      selfEmployed: nonNegDecimal(),
    }).optional(),
    hoursWorked: nonNegDecimal().optional(),
  }).optional(),

  movement: z.object({
    headcountStart: nonNegDecimal().optional(),
    headcountEnd: nonNegDecimal().optional(),
    newHiresTotal: nonNegDecimal().optional(),
    exitsTotal: nonNegDecimal().optional(),
    newHiresBreakdown: z.object({
      byGender: z.object({
        women: nonNegDecimal().optional(),
        men: nonNegDecimal().optional(),
        undisclosed: nonNegDecimal().optional(),
      }).optional(),
      byAge: z.object({
        under30: nonNegDecimal().optional(),
        from30to50: nonNegDecimal().optional(),
        over50: nonNegDecimal().optional(),
      }).optional(),
      byRegion: z.array(z.object({
        region: z.string().min(1),
        count: nonNegDecimal(),
      })).optional(),
    }).optional(),
    exitsBreakdown: z.lazy(() => /* same shape as newHiresBreakdown */ z.object({
      byGender: z.object({
        women: nonNegDecimal().optional(),
        men: nonNegDecimal().optional(),
        undisclosed: nonNegDecimal().optional(),
      }).optional(),
      byAge: z.object({
        under30: nonNegDecimal().optional(),
        from30to50: nonNegDecimal().optional(),
        over50: nonNegDecimal().optional(),
      }).optional(),
      byRegion: z.array(z.object({
        region: z.string().min(1),
        count: nonNegDecimal(),
      })).optional(),
    }).optional()),
  }).optional(),

  pay: z.object({
    meetsMinimumWage: z.enum(["yes","no","mixed"]).optional(),
    lowestHourlyRate: z.object({
      amount: nonNegDecimal(),
      currency: z.string().max(8),
    }).optional(),
    salaryByGroupAndLocation: z.array(z.object({
      group: z.string().min(1),
      country: z.string().min(1),
      avgWomen: nonNegDecimal(),
      avgMen: nonNegDecimal(),
    })).optional(),
  }).optional(),

  collectiveBargaining: z.object({
    coveredEmployees: nonNegDecimal().optional(),
    totalEmployees: nonNegDecimal().optional(),
  }).optional(),

  training: z.object({
    totalTrainingHours: nonNegDecimal().optional(),
    employeesTrained: nonNegDecimal().optional(),
    byGender: z.object({
      women: nonNegDecimal().optional(),
      men: nonNegDecimal().optional(),
      undisclosed: nonNegDecimal().optional(),
    }).optional(),
    byGroup: z.array(z.object({
      group: z.string().min(1),
      hours: nonNegDecimal(),
    })).optional(),
  }).optional(),

  ohs: z.object({
    employees: z.object({
      hoursWorked: nonNegDecimal().optional(),
      recordableInjuries: nonNegDecimal().optional(),
      highConsequenceInjuries: nonNegDecimal().optional(),
      fatalities: nonNegDecimal().optional(),
    }).optional(),
    nonEmployees: z.object({
      hoursWorked: nonNegDecimal().optional(),
      recordableInjuries: nonNegDecimal().optional(),
      highConsequenceInjuries: nonNegDecimal().optional(),
      fatalities: nonNegDecimal().optional(),
    }).optional(),
  }).optional(),

  humanRights: z.object({
    policyExists: z.enum(["yes","no"]).nullable().optional(),
    policyCovers: z.object({
      childLabour: z.boolean().optional(),
      forcedLabour: z.boolean().optional(),
      humanTrafficking: z.boolean().optional(),
      discrimination: z.boolean().optional(),
      healthAndSafety: z.boolean().optional(),
      other: z.boolean().optional(),
      otherText: z.string().max(200).optional(),
    }).optional()
      .refine(v => !v?.other || !!v?.otherText?.trim(), { path:["otherText"], message:"Specify topic" }),
    grievanceMechanism: z.enum(["yes","no"]).nullable().optional(),
    incidents: z.array(z.object({
      topic: z.enum(["childLabour","forcedLabour","humanTrafficking","discrimination","healthAndSafety","other"]),
      confirmed: z.enum(["yes","no"]),
      description: z.string().max(500).nullable().optional(),
    })).optional(),
  }).optional(),

  community: z.object({
    volunteerHours: nonNegDecimal().optional(),
    cashDonations: z.object({ amount: nonNegDecimal(), currency: z.string().max(8) }).optional(),
    inKindDonations: z.object({ amount: nonNegDecimal(), currency: z.string().max(8) }).optional(),
    estimatedBeneficiaries: nonNegDecimal().optional(),
    sitesWithAssessment: nonNegDecimal().optional(),
    totalSites: nonNegDecimal().optional(),
  }).optional(),
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

/** ───────────────────────────── Governance: Extensions ─────────────────────────────
 * Requires: coerceDecimal, nonNegDecimal, BoardMemberSchema, GovernancePolicySchema,
 *           ComplianceStatusEntrySchema already defined above in this file.
 */

/* ========== (1) Ownership & Legal Structure ========== */

const ShareholderRowSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Shareholder name is required"),
  pct: nonNegDecimal("Invalid %"), // allow null if blank; UI should enforce presence
});

const ShareClassEntrySchema = z.object({
  name: z.string().min(1, "Class name is required"),
  votingRightsPerShare: nonNegDecimal().nullable().optional(),
  notes: z.string().max(500).optional(),
});

const ShareClassesSchema = z
  .object({
    structure: z.enum(["ordinary", "dual_class"]),
    classes: z.array(ShareClassEntrySchema).optional(),
    dualClassNotes: z.string().max(500).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.structure === "dual_class" && !v.dualClassNotes?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please describe voting differences for dual-class shares.",
        path: ["dualClassNotes"],
      });
    }
  });

const GovernanceOwnershipSchema = z
  .object({
    ultimateParent: z.object({
      name: z.string().min(1, "Required"),
      status: z.enum(["named", "independent"]).default("named"),
    }),
    topShareholders: z.array(ShareholderRowSchema).default([]),
    isListedEquity: z.boolean().default(false),
    shareClasses: ShareClassesSchema.optional(),
    controlFeatures: z
      .object({
        hasControlFeatures: z.boolean(),
        description: z.string().max(1000).optional(),
      })
      .optional(),
  })
  .superRefine((v, ctx) => {
    if (v.isListedEquity) {
      const sum =
        (v.topShareholders ?? []).reduce(
          (acc, r) => acc + (Number(r.pct ?? 0) || 0),
          0
        ) || 0;
      if (sum > 100.000001) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sum of shareholder percentages must not exceed 100% for listed equity.",
          path: ["topShareholders"],
        });
      }
    }
  });

/* ========== (2) Governance Body & Composition ========== */

const DirectorRoleEnum = z.enum([
  "chair",
  "member",
  "vice_chair",
  "executive",
  "non_executive",
]);

const DirectorGenderEnum = z.enum(["woman", "man", "undisclosed"]);
const DirectorAgeBandEnum = z.enum(["<30", "30–50", ">50"]);
const CommitteeKeyEnum = z.enum(["audit", "remuneration", "nomination", "esg"]);

const DirectorSchema = z.object({
  id: z.string().optional(), // optional but recommended for linking
  fullName: z.string().min(1, "Required"),
  role: DirectorRoleEnum,
  independence: z.enum(["independent", "non-independent"]),
  gender: DirectorGenderEnum.optional(),
  ageBand: DirectorAgeBandEnum.optional(),
  nationality: z.string().optional(),
  tenureYears: nonNegDecimal().nullable().optional(),
  appointedAt: z.string().date("Invalid date").optional(),
  committees: z.array(CommitteeKeyEnum).optional(),
  meetingsHeld: nonNegDecimal().nullable().optional(),
  meetingsAttended: nonNegDecimal().nullable().optional(),
});

const BoardEvaluationSchema = z
  .object({
    conducted: z.enum(["yes", "no"]).default("no"),
    type: z.enum(["internal", "external"]).optional(),
    date: z.string().date("Invalid date").optional(),
  })
  .superRefine((v, ctx) => {
    if (v.conducted === "yes") {
      if (!v.type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Specify whether evaluation was internal or external.",
          path: ["type"],
        });
      }
      if (!v.date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Provide the evaluation date.",
          path: ["date"],
        });
      }
    }
  });

const GovernanceBodySchema = z
  .object({
    highestBodyName: z.string().min(1, "Required").optional(),
    chairCeoRoles: z.enum(["separate", "combined"]).optional(),
    directors: z.array(DirectorSchema).default([]),
    meetingsHeldTotal: nonNegDecimal().nullable().optional(),
    boardEvaluation: BoardEvaluationSchema.optional(),
  })
  .superRefine((v, ctx) => {
    v.directors.forEach((d, idx) => {
      const held =
        d.meetingsHeld != null
          ? Number(d.meetingsHeld)
          : v.meetingsHeldTotal != null
          ? Number(v.meetingsHeldTotal)
          : null;
      const attended =
        d.meetingsAttended != null ? Number(d.meetingsAttended) : null;
      if (held != null && attended != null && attended > held) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Attendance cannot exceed meetings held.",
          path: ["directors", idx, "meetingsAttended"],
        });
      }
    });
  });

/* ========== (3) Oversight of Sustainability (GRI 2-12 & 2-14) ========== */

const GovernanceOversightSchema = z.object({
  oversightBody: z.enum(["board", "committee", "senior_executive"]).optional(),
  namesRoles: z
    .array(
      z.object({
        name: z.string().min(1),
        role: z.string().min(1),
      })
    )
    .optional(),
  briefingFrequency: z
    .enum(["every_meeting", "quarterly", "annually", "ad_hoc"])
    .optional(),
  reportApproval: z
    .object({
      approver: z.enum(["board", "committee", "executive"]).optional(),
      approved: z.enum(["yes", "no"]).optional(),
    })
    .optional(),
  assurance: z
    .object({
      level: z.enum(["none", "limited", "reasonable"]).default("none"),
      providerName: z.string().optional(),
    })
    .optional(),
});

/* ========== (4) Committees (Audit / Remuneration / Nomination / ESG) ========== */

const CommitteeAttendanceRowSchema = z.object({
  directorId: z.string().min(1),
  attended: nonNegDecimal(),
  held: nonNegDecimal().nullable().optional(), // falls back to committee.meetingsHeld
});

const SingleCommitteeSchema = z
  .object({
    exists: z.boolean(),
    chairId: z.string().optional(),
    memberIds: z.array(z.string()).default([]).optional(),
    independenceMajority: z.enum(["yes", "no"]).nullable().optional(),
    meetingsHeld: nonNegDecimal().nullable().optional(),
    responsibilities: z.string().max(1000).optional(),
    attendance: z.array(CommitteeAttendanceRowSchema).optional(),
  })
  .superRefine((c, ctx) => {
    (c.attendance ?? []).forEach((row, i) => {
      const held =
        row.held != null
          ? Number(row.held)
          : c.meetingsHeld != null
          ? Number(c.meetingsHeld)
          : null;
      const attended = row.attended != null ? Number(row.attended) : null;
      if (held != null && attended != null && attended > held) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Attendance cannot exceed meetings held.",
          path: ["attendance", i, "attended"],
        });
      }
    });
  });

const GovernanceCommitteesSchema = z.object({
  audit: SingleCommitteeSchema,
  remuneration: SingleCommitteeSchema,
  nomination: SingleCommitteeSchema,
  esg: SingleCommitteeSchema,
});

/* ========== (5) Executive Remuneration ========== */

const LinkOrUploadSchema = z.object({
  url: z.string().url().optional(),
  uploadId: z.string().optional(),
});

const ESGMetricSchema = z.object({
  name: z.string().min(1),
  weightPct: nonNegDecimal(), // UI can warn if sum > 100; not hard-blocked
});

const MoneySchema = z.object({
  amount: nonNegDecimal().nullable().optional(),
  currency: z.string().max(8).optional(),
});

const GovernanceRemunerationSchema = z
  .object({
    policy: LinkOrUploadSchema.optional(),
    payElements: z
      .object({
        fixed: z.boolean().optional(),
        annualBonus: z.boolean().optional(),
        lti: z.boolean().optional(),
      })
      .optional(),
    esgLinked: z.enum(["yes", "no"]).optional(),
    esgMetrics: z.array(ESGMetricSchema).optional(),
    ceoPay: MoneySchema.optional(),
    medianEmployeePay: MoneySchema.optional(),
  })
  .superRefine((v, ctx) => {
    if (v.esgLinked === "yes" && (!v.esgMetrics || v.esgMetrics.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one ESG metric and weight when ESG is linked to pay.",
        path: ["esgMetrics"],
      });
    }
  });

/* ========== (6) Ethics & Compliance ========== */

const PolicyPresenceSchema = z.object({
  exists: z.boolean(),
  date: z.string().date("Invalid date").optional(),
  url: z.string().url().optional(),
});

const TrainingCoverageSchema = z
  .object({
    codeOfConductPct: nonNegDecimal().nullable().optional(),
    antiCorruptionPct: nonNegDecimal().nullable().optional(),
  })
  .superRefine((v, ctx) => {
    (["codeOfConductPct", "antiCorruptionPct"] as const).forEach((k) => {
      const val = v[k];
      if (val != null && (Number(val) < 0 || Number(val) > 100)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Coverage must be between 0 and 100.",
          path: [k],
        });
      }
    });
  });

const EthicsIncidentsSchema = z.object({
  corruption: nonNegDecimal().nullable().optional(),
  fraud: nonNegDecimal().nullable().optional(),
  dataPrivacy: nonNegDecimal().nullable().optional(),
  other: nonNegDecimal().nullable().optional(),
  otherText: z.string().max(300).optional(),
});

const PenaltiesSchema = z.object({
  finesAmount: nonNegDecimal().nullable().optional(),
  finesCurrency: z.string().max(8).optional(),
  nonMonetaryCount: nonNegDecimal().nullable().optional(),
});

const PoliticalContributionsSchema = z
  .object({
    none: z.boolean().default(false),
    amount: nonNegDecimal().nullable().optional(),
    currency: z.string().max(8).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.none && v.amount != null && Number(v.amount) > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount must be empty when 'None' is selected.",
        path: ["amount"],
      });
    }
    if (!v.none && v.amount != null && !v.currency?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide currency for political contributions.",
        path: ["currency"],
      });
    }
  });

const GovernanceEthicsSchema = z.object({
  policies: z.object({
    codeOfConduct: PolicyPresenceSchema,
    antiCorruption: PolicyPresenceSchema,
    conflictOfInterest: PolicyPresenceSchema,
    whistleblowing: PolicyPresenceSchema,
    relatedParty: PolicyPresenceSchema,
    giftsHospitality: PolicyPresenceSchema,
    dataPrivacy: PolicyPresenceSchema,
  }),
  trainingCoverage: TrainingCoverageSchema.optional(),
  whistleblowingChannel: z.enum(["yes", "no"]).optional(),
  incidents: EthicsIncidentsSchema.optional(),
  penalties: PenaltiesSchema.optional(),
  politicalContributions: PoliticalContributionsSchema.optional(),
});

/* ========== (7) Related-Party Transactions (RPT) ========== */

const RptRowSchema = z
  .object({
    id: z.string().optional(),
    counterparty: z.string().min(1),
    relationship: z.enum([
      "shareholder",
      "director_related",
      "affiliate",
      "key_management",
      "other",
    ]),
    amount: z.object({
      value: nonNegDecimal().nullable().optional(),
      currency: z.string().max(8).optional(),
    }),
    nature: z.enum(["goods", "services", "loan", "lease", "other"]),
    armsLength: z.enum(["yes", "no"]),
    independentApproval: z.enum(["yes", "no"]),
    notes: z.string().max(500).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.amount.value != null && !v.amount.currency?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide currency when an amount is entered.",
        path: ["amount", "currency"],
      });
    }
  });

const GovernanceRPTSchema = z.array(RptRowSchema).default([]);

/* ========== (8) Auditor & Controls ========== */

const ExternalAuditorSchema = z.object({
  name: z.string().min(1),
  initialYear: z.coerce.number().int().min(1900).max(3000).nullable().optional(),
  latestRotationYear: z
    .coerce.number()
    .int()
    .min(1900)
    .max(3000)
    .nullable()
    .optional(),
});

const CriticalConcernsSchema = z.object({
  mechanism: z.enum(["yes", "no"]),
  raised: nonNegDecimal().nullable().optional(),
  resolved: nonNegDecimal().nullable().optional(),
});

const AuditFeesSchema = z.object({
  total: nonNegDecimal().nullable().optional(),
  nonAudit: nonNegDecimal().nullable().optional(),
  currency: z.string().max(8).optional(),
});

const GovernanceAuditSchema = z
  .object({
    externalAuditor: ExternalAuditorSchema.optional(),
    internalAuditFunction: z.enum(["yes", "no"]).optional(),
    criticalConcerns: CriticalConcernsSchema.optional(),
    fees: AuditFeesSchema.optional(),
  })
  .superRefine((v, ctx) => {
    // Year ordering
    const a = v.externalAuditor;
    if (
      a?.initialYear != null &&
      a?.latestRotationYear != null &&
      Number(a.latestRotationYear) < Number(a.initialYear)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Latest rotation year cannot precede initial appointment year.",
        path: ["externalAuditor", "latestRotationYear"],
      });
    }
    // Fee ratio sanity
    if (
      v.fees?.total != null &&
      v.fees?.nonAudit != null &&
      Number(v.fees.nonAudit) > Number(v.fees.total)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Non-audit fees cannot exceed total fees.",
        path: ["fees", "nonAudit"],
      });
    }
  });

/* ========== (9) Materiality & Stakeholder Engagement ========== */

const StakeholderEnum = z.enum([
  "employees",
  "customers",
  "suppliers",
  "communities",
  "investors",
  "regulators",
  "other",
]);

const GovernanceMaterialitySchema = z
  .object({
    assessment: z
      .object({
        done: z.enum(["yes", "no", "planned"]).default("no"),
        method: z.string().max(500).optional(),
        date: z.string().date("Invalid date").optional(),
      })
      .optional(),
    stakeholderGroups: z.array(StakeholderEnum).default([]),
    otherStakeholderText: z.string().max(200).optional(),
    topMaterialTopics: z.array(z.string().min(1)).default([]),
    criticalConcernsComms: z
      .object({
        how: z.string().max(500),
        frequency: z.string().max(200),
        countToBoard: nonNegDecimal().nullable().optional(),
      })
      .optional(),
  })
  .superRefine((v, ctx) => {
    if ((v.stakeholderGroups ?? []).includes("other") && !v.otherStakeholderText?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Specify the 'Other' stakeholder group.",
        path: ["otherStakeholderText"],
      });
    }
  });

/* ========== (10) Transparency & Reporting ========== */

const GovernanceReportingSchema = z.object({
  publications: z
    .object({
      annualReport: LinkOrUploadSchema.optional(),
      financialStatements: LinkOrUploadSchema.optional(),
      sustainabilityReport: LinkOrUploadSchema.optional(),
    })
    .optional(),
  assuranceStatement: LinkOrUploadSchema.optional(),
  index: z
    .object({
      gri: LinkOrUploadSchema.optional(),
      vsme: LinkOrUploadSchema.optional(),
    })
    .optional(),
});

/* ========== Compose: Replace previous GovernanceSchema export with this ========== */

export const GovernanceSchema = z.object({
  // ── Backward-compat fields (keep to avoid breaking older forms)
  boardMembers: z.array(BoardMemberSchema),
  policies: z.array(GovernancePolicySchema).optional(),
  complianceStatus: z.array(ComplianceStatusEntrySchema).optional(),

  // ── New slices
  ownership: GovernanceOwnershipSchema.optional(),
  body: GovernanceBodySchema.optional(),
  oversight: GovernanceOversightSchema.optional(),
  committees: GovernanceCommitteesSchema.optional(),
  remuneration: GovernanceRemunerationSchema.optional(),
  ethics: GovernanceEthicsSchema.optional(),
  rpt: GovernanceRPTSchema.optional(),
  audit: GovernanceAuditSchema.optional(),
  materiality: GovernanceMaterialitySchema.optional(),
  reporting: GovernanceReportingSchema.optional(),
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
    "governance.boardMembers",
    "governance.ownership", 
    "governance.body.directors", 
    "governance.committees.audit", 
    "governance.remuneration", 
    "governance.ethics.policies", 
  ],
} as const;
