"use client";

import {
  QUANTITY_UNITS_ENERGY,
  FUEL_UNITS,
  FUEL_TYPES,
  NCV_KWH_PER_UNIT,
  ENERGY_CATEGORY,
} from "@/constants/esg.constants";

/** Narrow literal union for energy category */
export type EnergyCategory = (typeof ENERGY_CATEGORY)[number];

/** Map Yes/No → energy category union (prevents literal widening) */
export const toEnergyCategory = (yn?: "Yes" | "No"): EnergyCategory =>
  yn === "Yes" ? "renewable" : "non_renewable";

/** Convert energy quantity to MWh from the provided unit */
export function toMWhFromEnergy(
  quantity: number,
  unit: (typeof QUANTITY_UNITS_ENERGY)[number]
) {
  if (!Number.isFinite(quantity) || quantity < 0) return 0;
  switch (unit) {
    case "kWh":
      return quantity / 1000;
    case "MWh":
      return quantity;
    case "GJ":
      // 1 GJ = 277.777... kWh = 0.277777... MWh
      return quantity * 0.2777777778;
    case "MJ":
      return quantity * 0.0002777777778;
    default:
      return 0;
  }
}

/** Convert fuel quantity to MWh via NCV (lower heating value) table */
export function fuelToMWh(
  quantity: number,
  unit: (typeof FUEL_UNITS)[number],
  fuel: (typeof FUEL_TYPES)[number]
) {
  if (!Number.isFinite(quantity) || quantity < 0) return 0;
  const table = NCV_KWH_PER_UNIT[fuel] || {};
  const kwhPerUnit = table[unit];
  if (!kwhPerUnit) return 0;
  const kWh = quantity * kwhPerUnit;
  return kWh / 1000;
}


// Shared energy conversions

export type EnergyUnit = "kWh" | "MWh" | "GJ" | "MJ";

export function toKWhFromEnergy(quantity: number, unit: EnergyUnit) {
  return toMWhFromEnergy(quantity, unit) * 1000;
}
