// constants/esg.water.constants.ts

import type {
  WaterUnit,
  WaterSource,
  WaterQuality,
  MeasurementMethod,
  DischargeDestination,
} from "@/types/env-water.types";

/** Units (values are data-safe; UI can show "m³" for label) */
export const WATER_UNITS: ReadonlyArray<{ value: WaterUnit; label: string }> = [
  { value: "m3", label: "m³" },
  { value: "L", label: "L" },
] as const;

export const WATER_SOURCES: ReadonlyArray<WaterSource> = [
  "Surface water",
  "Groundwater",
  "Seawater",
  "Produced water",
  "Third-party (municipal/other)",
] as const;

export const WATER_QUALITY: ReadonlyArray<WaterQuality> = [
  "Freshwater",
  "Other water",
] as const;

export const MEASUREMENT_METHODS: ReadonlyArray<MeasurementMethod> = [
  "Meter",
  "Utility bill",
  "Estimate",
] as const;

export const DISCHARGE_DESTINATIONS: ReadonlyArray<DischargeDestination> = [
  "Surface water",
  "Groundwater",
  "Seawater",
  "Third-party (sewer/other org)",
] as const;

export const TREATMENT_LEVELS = ["None", "Primary", "Secondary", "Tertiary"] as const;

/** Yes/No helper reused in water UI */
export const YES_NO = ["Yes", "No"] as const;
