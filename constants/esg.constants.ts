// constants/esg.constants.ts
import { createFoundationalDefaults } from "@/constants/foundational.constants";
import type {
  ESGWizardValues,
  EnvironmentValues,
  SocialValues,
  GovernanceValues,
} from "@/types/esg-wizard.types";

/** -------------------- Option arrays (shared) -------------------- */
export const COUNTRIES = [
  { value: "MW", label: "Malawi" },
  { value: "ZA", label: "South Africa" },
  { value: "NG", label: "Nigeria" },
  { value: "KE", label: "Kenya" },
  { value: "GH", label: "Ghana" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
] as const;

export const GHG_METHODOLOGIES = [
  "GHG Protocol Corporate Standard",
  "ISO 14064-1",
  "ISO 14064-3 (verification)",
  "DEFRA/BEIS",
  "IPCC Guidelines",
] as const;

/**
 * Units list used by TARGETS validation (not for energy quantity inputs).
 * Keep this list focused on target units to avoid confusing cross-usage.
 */
export const UNITS = [
  { value: "tCO2e", label: "tCO₂e" },
  { value: "MWh", label: "MWh" },
  { value: "m3", label: "m³" },
  { value: "tonnes", label: "tonnes" },
  { value: "%", label: "%" },
] as const;

export const TARGET_CATEGORIES = [
  "Emissions reduction",
  "Energy efficiency",
  "Renewable energy",
  "Water efficiency",
  "Waste reduction",
] as const;

export const GOV_POLICY_CATEGORIES = [
  "Code of Conduct",
  "Anti-corruption & Bribery",
  "Whistleblowing",
  "Data Privacy & Security",
  "Board Diversity",
] as const;

export const BOARD_ROLES = [
  "Chair",
  "Vice Chair",
  "CEO",
  "CFO",
  "Non-Executive Director",
  "Independent Director",
  "Company Secretary",
  "Audit Committee",
  "Remuneration Committee",
] as const;

/** Energy category used by aggregate rows (electricity/fuels/selfGenerated) */
export const ENERGY_CATEGORY = ["renewable", "non_renewable"] as const;

/** -------------------- Resource-card specific enums -------------------- */
/** Simple Yes/No used across the card */
export const YES_NO = ["Yes", "No"] as const;

/** Purchased energy */
export const ENERGY_PURCHASED_TYPES = [
  "Electricity",
  "District heat",
  "Steam",
  "Cooling",
] as const;

/** Quantity units for energy inputs in the card */
export const QUANTITY_UNITS_ENERGY = ["kWh", "MWh", "GJ", "MJ"] as const;

/** Fuels consumed */
export const FUEL_USES = ["Stationary", "Mobile"] as const;

export const FUEL_TYPES = [
  "diesel",
  "petrol",
  "kerosene",
  "natural_gas",
  "LPG",
  "coal",
  "biomass",
  "biogas",
  "other",
] as const;

export const FUEL_UNITS = ["L", "m3", "kg", "t"] as const;

/** Self-generated electricity */
export const SELF_GEN_SOURCES = [
  "Solar PV",
  "Wind",
  "Hydro",
  "Diesel genset",
  "Gas turbine",
  "Other",
] as const;

/** Energy sold (optional) */
export const ENERGY_SOLD_TYPES = ["Electricity", "Heat", "Steam", "Cooling"] as const;

/** Energy intensity denominator choices */
export const INTENSITY_DENOMINATORS = [
  "Turnover",
  "FTE",
  "Floor area (m²)",
  "Units produced",
] as const;

/**
 * Optional: indicative default NCV (lower heating value) factors used by the UI
 * (kWh per unit). If you prefer centralizing factors, expose them here.
 * The component can import this map instead of defining its own.
 */
export const NCV_KWH_PER_UNIT: Record<
  (typeof FUEL_TYPES)[number],
  Partial<Record<(typeof FUEL_UNITS)[number], number>>
> = {
  diesel:       { L: 10.0 },
  petrol:       { L: 8.8 },
  kerosene:     { L: 9.6 },
  natural_gas:  { m3: 10.55 },
  LPG:          { kg: 13.6 },
  coal:         { t: 7000 },  // highly variable by grade
  biomass:      { t: 4000 },  // depends on moisture/content
  biogas:       { m3: 6 },
  other:        {},
};

/** --------------- Step-scoped defaults factories --------------- */
export function defaultEnvironment(): EnvironmentValues {
  return {
    ghg: {
      year: new Date().getFullYear(),
      scope1_tCO2e: null,
      scope2_tCO2e: null,
      scope3_tCO2e: null,
      methodology: undefined,
      notes: undefined,
    },
    resourceConsumption: {
      recordedAt: undefined,

      // Legacy quick total
      energyMWh: null,

      // Water & Waste
      waterM3: null,
      wasteTonnes: null,

      // Aggregated by-type energy entries (arrays start empty)
      electricity: [],
      selfGenerated: [],
      fuels: [],

      /**
       * Detailed payload for the new card. Using a structured JSON string by default
       * ensures immediate hydration without conditionals in the component.
       */
      coreImpactData: JSON.stringify({
        purchased: [],
        fuels: [],
        selfGen: [],
        sold: [],
        intensity: {},
      }),
    },
    water: {
      withdrawals: [],
      discharges: [],
      totals_m3: { withdrawn: 0, discharged: 0 },
      note: "",
    },
    biodiversity: { sites: [], impacts: [], note: "" },
    waste: { rows: [], note: "" },
    targets: [],
  };
}

export function defaultSocial(): SocialValues {
  return {
    laborStats: { },
    workforceProfile: {},
    nonEmployeeWorkers: {},
    movement: {},
    pay: {},
    collectiveBargaining: {},
    training: {},
    ohs: {},
    humanRights: {},
    community: {},
  };
}

export function defaultGovernance(): GovernanceValues {
  return {
    boardMembers: [],
    policies: [],
    complianceStatus: [],
  };
}

/** ------------------ Wizard defaults (fresh) ------------------- */
export function DEFAULT_ESG_VALUES(): ESGWizardValues {
  // Fresh object every call so RHF `defaultValues` stay mutable
  return {
    general: createFoundationalDefaults(),
    environment: defaultEnvironment(),
    social: defaultSocial(),
    governance: defaultGovernance(),
  };
}
