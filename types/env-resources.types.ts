"use client";

import {
  ENERGY_PURCHASED_TYPES,
  QUANTITY_UNITS_ENERGY,
  FUEL_USES,
  FUEL_TYPES,
  FUEL_UNITS,
  SELF_GEN_SOURCES,
  ENERGY_SOLD_TYPES,
  INTENSITY_DENOMINATORS,
} from "@/constants/esg.constants";

export type PurchasedEnergyRow = {
  energyType: (typeof ENERGY_PURCHASED_TYPES)[number];
  quantity: number | null;
  unit: (typeof QUANTITY_UNITS_ENERGY)[number];
  country?: string;
  supplierFactorKgCO2ePerKWh?: number | null;
  hasCertificates?: "Yes" | "No";
  volumeKWh?: number | null; // explicit kWh if provided
  renewable?: "Yes" | "No";
};

export type FuelRow = {
  use: (typeof FUEL_USES)[number];
  fuelType: (typeof FUEL_TYPES)[number];
  quantity: number | null;
  unit: (typeof FUEL_UNITS)[number];
  renewable?: "Yes" | "No";
  renewableSubtype?: "biomass" | "biogas"; // when renewable Yes
  nonRenewableSubtype?: "diesel" | "petrol" | "natural_gas" | "LPG" | "coal" | "kerosene"; // when renewable No
};

export type SelfGenRow = {
  source: (typeof SELF_GEN_SOURCES)[number];
  grossKWh: number | null;
  selfConsumedKWh: number | null;
  exportedKWh: number | null;
  fuelBased?: "Yes" | "No";
};

export type EnergySoldRow = {
  type: (typeof ENERGY_SOLD_TYPES)[number];
  kWh: number | null;
};

export type IntensityState = {
  denominatorType?: (typeof INTENSITY_DENOMINATORS)[number];
  denominatorValue?: number | null;
  denominatorUnitNote?: string; // e.g., currency, unit name
};

export type CoreImpactPayload = {
  purchased: PurchasedEnergyRow[];
  fuels: FuelRow[];
  selfGen: SelfGenRow[];
  sold: EnergySoldRow[];
  intensity?: IntensityState;
  note?: string;
};
