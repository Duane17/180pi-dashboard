// types/env.water.types.ts

/** Allowed unit values (data uses ASCII "m3"; show "m³" in labels) */
export type WaterUnit = "m3" | "L";

/** Shared picklists */
export type WaterSource =
  | "Surface water"
  | "Groundwater"
  | "Seawater"
  | "Produced water"
  | "Third-party (municipal/other)";

export type WaterQuality = "Freshwater" | "Other water";

export type MeasurementMethod = "Meter" | "Utility bill" | "Estimate";

export type DischargeDestination =
  | "Surface water"
  | "Groundwater"
  | "Seawater"
  | "Third-party (sewer/other org)";

/** Period can be a single month (YYYY-MM) or an explicit range */
export type WaterPeriod =
  | { mode: "month"; month: string }
  | { mode: "range"; startDate?: string; endDate?: string };
  
/** Withdrawal row — `quantity` is OPTIONAL to match form-in-progress states */
export type WithdrawalRow = {
  source: WaterSource;
  quality: WaterQuality;
  quantity?: number | string | null;
  unit: WaterUnit;
  method: MeasurementMethod;
  period: WaterPeriod;
};

/** Discharge row — `quantity` is OPTIONAL to match form-in-progress states */
export type DischargeRow = {
  destination: DischargeDestination;
  quality: WaterQuality;
  treatmentLevel?: "None" | "Primary" | "Secondary" | "Tertiary";
  sentToOtherOrgForReuse?: "Yes" | "No";
  quantity?: number | string | null;
  unit: WaterUnit;
  method: MeasurementMethod;
  period: WaterPeriod;
};

/** Full payload kept in the schema; arrays are REQUIRED (empty by default) */
export type WaterFlowsPayload = {
  note?: string;
  withdrawals: WithdrawalRow[];
  discharges: DischargeRow[];
};

/** Patch type so components can bubble partial updates (matches your calling code) */
export type WaterFlowsPatch = Partial<WaterFlowsPayload>;
