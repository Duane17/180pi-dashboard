// Reusable GHG inventory option sets, maps, and helpers
import { z } from "zod";

export type Boundary = "Operational control" | "Financial control" | "Equity share";
export type GWPVersion = "AR5" | "AR6";
export type EFSource =
  | "GHG Protocol"
  | "IEA"
  | "DEFRA"
  | "National DB"
  | "Supplier-specific"
  | "Other";
export type Scope1Category = "stationary" | "mobile" | "fugitive" | "process";
export type RecalcReason = "structural change" | "method change" | "error" | "other";

export const BOUNDARIES: Boundary[] = [
  "Operational control",
  "Financial control",
  "Equity share",
];

export const GWP_VERSIONS: GWPVersion[] = ["AR5", "AR6"];

export const RECALC_REASONS: RecalcReason[] = [
  "structural change",
  "method change",
  "error",
  "other",
];

export const EF_SOURCES: EFSource[] = [
  "GHG Protocol",
  "IEA",
  "DEFRA",
  "National DB",
  "Supplier-specific",
  "Other",
];

export const REFRIGERANTS = [
  "R-410A",
  "R-22",
  "R-134a",
  "R-407C",
  "R-404A",
  "R-32",
  "R-1234yf",
  "R-290",
  "R-744",
  "Other",
] as const;

export const S1_ACTIVITY_BY_CATEGORY: Record<Scope1Category, readonly string[]> = {
  stationary: [
    "Diesel",
    "Light fuel oil",
    "Heavy fuel oil (HFO)",
    "Petrol/Gasoline",
    "Kerosene/Paraffin",
    "Natural gas",
    "LPG/Propane/Butane",
    "Coal",
    "Biomass (wood/charcoal/pellets)",
    "Biogas",
    "Other (specify)",
  ],
  mobile: [
    "Diesel",
    "Petrol/Gasoline",
    "LPG/Autogas",
    "CNG",
    "Biodiesel blends",
    "Ethanol blends",
    "Other (specify)",
  ],
  fugitive: [
    "R-410A",
    "R-22",
    "R-134a",
    "R-407C",
    "R-404A",
    "R-32",
    "R-1234yf",
    "R-290",
    "R-744",
    "Other",
  ],
  process: [
    "Calcination (cement/lime)",
    "Onsite waste incineration",
    "Fire suppression agents",
    "Other process",
  ],
} as const;

export const UNIT_PRESET_BY_ACTIVITY: Record<string, readonly string[]> = {
  "Diesel": ["L"],
  "Light fuel oil": ["L"],
  "Heavy fuel oil (HFO)": ["L"],
  "Petrol/Gasoline": ["L"],
  "Kerosene/Paraffin": ["L"],
  "Biodiesel blends": ["L"],
  "Ethanol blends": ["L"],

  "Natural gas": ["m3"],
  "CNG": ["m3"],

  "LPG/Propane/Butane": ["kg", "L"],
  "LPG/Autogas": ["kg", "L"],

  "Coal": ["kg", "t"],
  "Biomass (wood/charcoal/pellets)": ["kg"],

  "Biogas": ["m3"],

  "R-410A": ["kg"],
  "R-22": ["kg"],
  "R-134a": ["kg"],
  "R-407C": ["kg"],
  "R-404A": ["kg"],
  "R-32": ["kg"],
  "R-1234yf": ["kg"],
  "R-290": ["kg"],
  "R-744": ["kg"],

  "Calcination (cement/lime)": ["t"],
  "Onsite waste incineration": ["t"],
  "Fire suppression agents": ["kg"],

  "Other (specify)": ["kg"],
  "Other": ["kg"],
  "Other process": ["kg"],
};

export function presetUnit(activity: string): readonly string[] {
  return UNIT_PRESET_BY_ACTIVITY[activity] || ["kg"];
}


export const GHG_BoundaryEnum = z.enum([
  "Operational control",
  "Financial control",
  "Equity share",
]);

export type GHGBoundary = z.infer<typeof GHG_BoundaryEnum>;
