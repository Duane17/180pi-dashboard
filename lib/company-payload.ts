// src/lib/company-payload.ts
import type { CompanyCreateRequest } from "@/types/companies";

/**
 * Transforms raw wizard form data into a valid CompanyCreateRequest
 */
export function buildCompanyPayload(formData: any): CompanyCreateRequest {
  // Helper: remove commas, currency symbols, spaces, etc.
  const sanitizeNumber = (val: string | number | null | undefined): number | null => {
    if (val == null) return null;
    if (typeof val === "number") return val >= 0 ? val : 0;
    const cleaned = val.toString().replace(/[^\d.-]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) || num < 0 ? 0 : num;
  };

  // Helper: normalize employee count
  const normalizeEmployeeCount = (
    raw: string | null | undefined
  ): {
    employeeCountRange: string | null;
    employeeCountMin: number | null;
    employeeCountMax: number | null;
  } => {
    if (!raw) return { employeeCountRange: null, employeeCountMin: null, employeeCountMax: null };

    if (/^\d+\+$/.test(raw)) {
      // Example: "10000+"
      const min = parseInt(raw, 10);
      return {
        employeeCountRange: `${min}-99999999`,
        employeeCountMin: min,
        employeeCountMax: 99999999,
      };
    }

    if (/^\d+-\d+$/.test(raw)) {
      // Example: "10-50"
      const [minStr, maxStr] = raw.split("-");
      const min = parseInt(minStr, 10);
      const max = parseInt(maxStr, 10);
      return {
        employeeCountRange: `${min}-${max}`,
        employeeCountMin: min,
        employeeCountMax: max,
      };
    }

    return { employeeCountRange: null, employeeCountMin: null, employeeCountMax: null };
  };

  // Mapping legalForm UI → Prisma enum
  const legalFormMap: Record<string, CompanyCreateRequest["legalForm"]> = {
    llc: "PRIVATE_LIMITED",
    sole_proprietorship: "SOLE_PROPRIETORSHIP",
    partnership: "PARTNERSHIP",
    cooperative: "COOPERATIVE",
    others: "OTHER",
  };

  // Build payload
  const payload: CompanyCreateRequest = {
    name: formData.basics?.companyName || "",

    legalForm: legalFormMap[formData.basics?.legalForm] ?? null,
    sector: formData.basics?.sector ?? null,
    naceCode: null, // left empty per spec

    hqCountry: formData.location?.headquartersCountry ?? null,

    reportingCurrency: formData.sizeFinances?.currency
      ? formData.sizeFinances.currency.toUpperCase()
      : null,

    annualTurnover: sanitizeNumber(formData.sizeFinances?.annualTurnover),

    ...normalizeEmployeeCount(formData.sizeFinances?.employeeCount),
  };

  return payload;
}
