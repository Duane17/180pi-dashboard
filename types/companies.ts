// src/types/companies.ts

/**
 * Request payload for creating a company.
 * Matches backend createCompanySchema fields.
 */
export interface CompanyCreateRequest {
  name: string;
  sector?: string | null;
  naceCode?: string | null;
  legalForm?: "PRIVATE_LIMITED" | "SOLE_PROPRIETORSHIP" | "PARTNERSHIP" | "COOPERATIVE" | "OTHER" | null;

  // Financials
  reportingCurrency?: string | null; // 3-letter code
  annualTurnover?: number | null; // always sent as a number

  // Headquarters
  hqCountry?: string | null; // ISO alpha-2
  hqRegion?: string | null;
  hqCity?: string | null;
  hqAddress?: string | null;
  hqLatitude?: number | null;
  hqLongitude?: number | null;

  // Employees
  employeeCountRange?: string | null; // e.g., "10-600"
  employeeCountMin?: number | null;
  employeeCountMax?: number | null;
}

/**
 * Shape of a single company returned by backend.
 * Matches companySelect in companies.controller.ts
 * Decimal/float values come as strings.
 */
export interface CompanyResponse {
  id: string;
  name: string;
  sector: string | null;
  naceCode: string | null;
  naceSection: string | null;
  legalForm: "PRIVATE_LIMITED" | "SOLE_PROPRIETORSHIP" | "PARTNERSHIP" | "COOPERATIVE" | "OTHER" | null;

  // Financials (strings to preserve precision)
  reportingCurrency: string | null;
  annualTurnover: string | null;

  // Headquarters
  hqCountry: string | null;
  hqRegion: string | null;
  hqCity: string | null;
  hqAddress: string | null;
  hqLatitude: string | null;
  hqLongitude: string | null;

  // Employees
  employeeCountRange: string | null;
  employeeCountMin: number | null;
  employeeCountMax: number | null;

  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

/**
 * Paginated companies list response.
 */
export interface CompaniesListResponse {
  page: number;
  pageSize: number;
  total: number;
  data: CompanyResponse[];
}