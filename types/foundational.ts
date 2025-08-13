export interface FoundationalUpdateRequest {
  sector?: string | null;
  naceCode?: string | null;
  legalForm?: "PRIVATE_LIMITED" | "SOLE_PROPRIETORSHIP" | "PARTNERSHIP" | "COOPERATIVE" | "OTHER" | null;

  // Financials
  reportingCurrency?: string | null; // 3-letter, uppercase
  annualTurnover?: number | null;

  // HQ
  hqCountry?: string | null; // 2-letter, uppercase
  hqRegion?: string | null;
  hqCity?: string | null;
  hqAddress?: string | null;
  hqLatitude?: number | null;
  hqLongitude?: number | null;

  // Employees
  employeeCount?: string | null; // "min-max"
}
