// src/lib/services/environment.client.ts
import { api } from "@/lib/api";
import { WasteRowInput } from "@/types/environment.waste.types";

export const __ENV_CLIENT_VERSION__ = "env-client:v2-scope-rows";


/**
 * This file is a thin, declarative client for the Environment endpoints you built:
 * - GHG Inventory (upsert)
 * - Resource Consumption (upsert)
 * - Water (create snapshot + bulk replace rows)
 * - Biodiversity (create snapshot + bulk replace)
 * - Waste (create snapshot + batch rows)
 *
 * Each function returns the server's JSON.
 */

/* =========================
 * GHG INVENTORY
 * ========================= */

export type Scope1RowUpsert = {
  category: "STATIONARY" | "MOBILE" | "FUGITIVE" | "PROCESS";
  activity: string;
  quantity?: number | null;
  unit: string;
  efKgPerUnit?: number | null;
  refrigerant?: string | null;
};

export type Scope2RowUpsert = {
  energyType: "ELECTRICITY" | "DISTRICT_HEAT" | "STEAM" | "COOLING";
  quantity?: number | null;
  unit: string;
  country?: string | null;
  supplierName?: string | null;
  supplierEF_kgCO2e_per_kWh?: number | null;
  contracts?: {
    eac?: { has: boolean; volumeKWh?: number | null };
    ppa?: { has: boolean; volumeKWh?: number | null };
    greenTariff?: { has: boolean; volumeKWh?: number | null };
  } | null;
};


export type GHGUpsertBody = {
  siteId?: string | null;
  year: number;
  baseYear?: number;
  targetYear?: number;
  scope1_tCO2e: number;
  scope2_tCO2e: number;
  scope3_tCO2e?: number | null;
  boundary?: "OPERATIONAL_CONTROL" | "FINANCIAL_CONTROL" | "EQUITY_SHARE";
  equitySharePct?: number | null;
  gwpVersion?: "AR5" | "AR6";
  efSource?: "GHG_PROTOCOL" | "IEA" | "DEFRA" | "NATIONAL_DB" | "SUPPLIER_SPECIFIC" | "OTHER";
  recalcReasons?: ("STRUCTURAL_CHANGE" | "METHOD_CHANGE" | "ERROR" | "OTHER")[];
  scope1Rows?: Scope1RowUpsert[];
  scope2Rows?: Scope2RowUpsert[];
  notes?: string | null;
  methodology?: "GHG_PROTOCOL" | "ISO_14064_1" | "OTHER";
  methodologyId?: string | null;
  methodologyNotes?: string | null;
  emissionFactors?: Record<string, unknown> | null;
  uncertaintyPct?: number | null;
  evidenceId?: string | null;
};

/** PUT /companies/:id/environment/ghg/upsert  (upsert by (siteId||null, year)) */
export async function upsertGHGInventory(companyId: string, body: GHGUpsertBody) {
  const { data } = await api.put(`/companies/${companyId}/environment/ghg/upsert`, body);
  return data;
}

/* =========================
 * RESOURCE CONSUMPTION
 * ========================= */

export type PurchasedRowInput = {
  energyType?: "ELECTRICITY" | "DISTRICT_HEAT" | "STEAM" | "COOLING";
  quantity?: number | null;
  unit: string;
  country?: string | null;
  supplierFactorKgCO2ePerKWh?: number | null;
  hasCertificates?: boolean | null;
  renewable?: boolean | null;
  renewableSubtype?: string | null;
  volumeKWh?: number | null;
};

export type SelfGenRowInput = {
  source: string;
  grossKWh?: number | null;
  fuelBased?: boolean | null;
  exportedKWh?: number | null;
  selfConsumedKWh?: number | null;
};

export type SoldRowInput = {
  type?: string; // default "Electricity" on server
  kWh?: number | null;
};

export type FuelRowInput = {
  use?: string | null;
  fuelType: string;
  unit: string;
  quantity?: number | null;
  renewable?: boolean | null;
  renewableSubtype?: string | null;
};

export type IntensityInput = {
  denominatorType?: "FTE" | "OUTPUT" | "REVENUE" | "FLOOR_AREA" | "OTHER";
  denominatorValue?: number | null;
  denominatorUnitNote?: string | null;
};

export type ResourceUpsertBody = {
  siteId?: string | null;
  recordedAt: string;
  energyMWh?: number | null;
  waterM3?: number | null;
  wasteTonnes?: number | null;

  // legacy
  electricityBreakdown?: Array<Record<string, unknown>>;
  selfGenBreakdown?: Array<Record<string, unknown>>;
  fuelsBreakdown?: Array<Record<string, unknown>>;
  coreImpactData?: Record<string, unknown> | null;

  // ✅ normalized
  purchased?: PurchasedRowInput[];
  selfGen?: SelfGenRowInput[];
  sold?: SoldRowInput[];
  fuels?: FuelRowInput[];
  intensity?: IntensityInput;

  note?: string | null;
  evidenceId?: string | null;
};


/** PUT /companies/:id/environment/resources/upsert  (upsert by (siteId||null, recordedAt)) */
export async function upsertResourceConsumption(companyId: string, body: ResourceUpsertBody) {
  const { data } = await api.put(`/companies/${companyId}/environment/resources/upsert`, body);
  return data; // returns the record
}

/* =========================
 * WATER (snapshot + rows)
 * ========================= */

export type WaterSnapshotCreateBody = {
  siteId?: string | null;
  snapshotDate?: string | null; // optional
  note?: string | null;
};

/** POST /companies/:id/environment/water  -> creates a snapshot */
export async function createWaterSnapshot(companyId: string, body: WaterSnapshotCreateBody) {
  const { data } = await api.post(`/companies/${companyId}/environment/water`, body);
  return data; // returns full detail including id
}

export type WaterWithdrawalRow = {
  source: "SURFACE_WATER" | "GROUNDWATER" | "SEAWATER" | "PRODUCED_WATER" | "THIRD_PARTY";
  quality: "FRESHWATER" | "OTHER_WATER";
  quantity?: number | null;
  unit: "m3" | "L";
  method: "METER" | "UTILITY_BILL" | "ESTIMATE";
  period: Record<string, unknown>; // UI's union shape (month/range)
  country?: string | null;
  region?: string | null;
  city?: string | null;
};

export type WaterDischargeRow = {
  destination: "SURFACE_WATER" | "GROUNDWATER" | "SEAWATER" | "THIRD_PARTY";
  sentToOtherOrgForReuse?: boolean | null;
  quality: "FRESHWATER" | "OTHER_WATER";
  treatmentLevel?: "None" | "Primary" | "Secondary" | "Tertiary" | null;
  quantity?: number | null;
  unit: "m3" | "L";
  method: "METER" | "UTILITY_BILL" | "ESTIMATE";
  period: Record<string, unknown>;
  country?: string | null;
  region?: string | null;
  city?: string | null;
};

/** Bulk replace both arrays and let server recompute totals */
export type WaterBulkBody = {
  withdrawals?: WaterWithdrawalRow[];
  discharges?: WaterDischargeRow[];
};

/** POST /companies/:id/environment/water/:waterId/bulk  -> replaces arrays */
export async function replaceWaterRows(companyId: string, waterId: string, body: WaterBulkBody) {
  const { data } = await api.post(`/companies/${companyId}/environment/water/${waterId}/bulk`, body);
  return data; // returns detail
}

/* =========================
 * BIODIVERSITY (snapshot + bulk)
 * ========================= */

export type BiodiversitySnapshotCreateBody = {
  siteId?: string | null; // optional if you link to a site
  note?: string | null;
};

/** POST /companies/:id/environment/biodiversity */
export async function createBiodiversitySnapshot(companyId: string, body: BiodiversitySnapshotCreateBody) {
  const { data } = await api.post(`/companies/${companyId}/environment/biodiversity`, body);
  return data; // returns detail inc. id
}

export type BiodiversitySiteRow = {
  latitude?: number | null;
  longitude?: number | null;
  areaHectares?: number | null;
  habitat?: string | null;
  protectedArea?: boolean | null;
  kba?: boolean | null;
  ramsar?: boolean | null;
  natura2000?: boolean | null;
  other?: boolean | null;
  otherText?: string | null;
};

export type BiodiversityImpactRow = {
  activity: string;   // keep strings as per your schema
  receptor: string;
  proximity: string;
  severity?: number | null;
  extent?: number | null;
  irreversibility?: number | null;
  mitigateAvoid?: boolean | null;
  mitigateMinimize?: boolean | null;
  mitigateRestore?: boolean | null;
  mitigateOffset?: boolean | null;
};

export type BiodiversityBulkBody = {
  sites?: BiodiversitySiteRow[];
  impacts?: BiodiversityImpactRow[];
};

/** POST /companies/:id/environment/biodiversity/:biodiversityId/bulk */
export async function replaceBiodiversity(companyId: string, biodiversityId: string, body: BiodiversityBulkBody) {
  const { data } = await api.post(
    `/companies/${companyId}/environment/biodiversity/${biodiversityId}/bulk`,
    body
  );
  return data;
}

/* =========================
 * WASTE (snapshot + rows)
 * ========================= */

export type WasteSnapshotCreateBody = {
  siteId?: string | null;
  note?: string | null;
};

/** POST /companies/:id/environment/waste */
export async function createWasteSnapshot(companyId: string, body: WasteSnapshotCreateBody) {
  const { data } = await api.post(`/companies/${companyId}/environment/waste`, body);
  return data; // detail inc. id
}

export type WasteRow = {
  stream:
    | "PAPER"
    | "PLASTIC"
    | "METAL"
    | "GLASS"
    | "ORGANIC"
    | "E_WASTE"
    | "CONSTRUCTION"
    | "HAZARDOUS"
    | "OTHER_SPECIFY";
  hazardClass: "NON_HAZARDOUS" | "HAZARDOUS";
  physicalState: "SOLID" | "LIQUID" | "GAS" | "SLUDGE";
  managementRoute: "DIVERTED_FROM_DISPOSAL" | "DISPOSAL";
  managementMethod: string; // validated on server via zod/superRefine
  destination: "ONSITE" | "OFFSITE";
  quantity?: number | null;
  unit?: "kg" | "t"; // default(kg) if omitted
  measurementMethod: "WEIGHBRIDGE" | "INVOICE" | "ESTIMATE";
  otherStreamText?: string | null; // required if OTHER_SPECIFY
};

/** POST /companies/:id/environment/waste/:wasteId/rows  (accepts single or { rows: [...] }) */
export async function addWasteRows(companyId: string, wasteId: string, rows: WasteRowInput[]) {
  const body = rows.length === 1 ? rows[0] : { rows };
  const { data } = await api.post(`/companies/${companyId}/environment/waste/${wasteId}/rows`, body);
  return data; // detail
}
