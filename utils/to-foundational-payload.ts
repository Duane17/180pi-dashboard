// utils/to-foundational-payload.ts
import type { CompanyCreateRequest } from "@/types/companies";
import type { FoundationalUpdateRequest } from "@/types/foundational";

// Accepts your wizard shape (using CompanyCreateRequest fields you already collect)
// and returns exactly what the backend expects for /foundational
export function toFoundationalPayload(
  input: Partial<CompanyCreateRequest> & {
    // if your wizard already collects this you can include it; otherwise remove this line
    employeeCount?: string | null;
  }
): FoundationalUpdateRequest {
  const out: FoundationalUpdateRequest = {};

  // Simple pass-throughs
  if (input.sector !== undefined) out.sector = emptyToNull(input.sector);
  if (input.naceCode !== undefined) out.naceCode = emptyToNull(input.naceCode);
  if (input.legalForm !== undefined) out.legalForm = input.legalForm ?? null;

  // Financials
  if (input.reportingCurrency !== undefined) {
    const cur = (input.reportingCurrency ?? "").toString().trim().toUpperCase();
    out.reportingCurrency = cur ? cur : null;
  }
  if (input.annualTurnover !== undefined) {
    out.annualTurnover =
      input.annualTurnover === null || input.annualTurnover === undefined
        ? null
        : Number(input.annualTurnover);
  }

  // HQ
  if (input.hqCountry !== undefined) {
    const c = (input.hqCountry ?? "").toString().trim().toUpperCase();
    out.hqCountry = c ? c : null;
  }
  if (input.hqRegion !== undefined) out.hqRegion = emptyToNull(input.hqRegion);
  if (input.hqCity !== undefined) out.hqCity = emptyToNull(input.hqCity);
  if (input.hqAddress !== undefined) out.hqAddress = emptyToNull(input.hqAddress);
  if (input.hqLatitude !== undefined) {
    out.hqLatitude =
      input.hqLatitude === null || input.hqLatitude === undefined
        ? null
        : Number(input.hqLatitude);
  }
  if (input.hqLongitude !== undefined) {
    out.hqLongitude =
      input.hqLongitude === null || input.hqLongitude === undefined
        ? null
        : Number(input.hqLongitude);
  }

  // Employees — build the single "min-max" field the API requires
  // 1) If you already have a plain employeeCount like "10-600", use it
  if (typeof input.employeeCount === "string" && input.employeeCount.trim()) {
    out.employeeCount = input.employeeCount.trim();
  } else {
    // 2) Otherwise derive from range/min/max if present
    const range = normalizeEmpRange(
      input.employeeCountRange,
      input.employeeCountMin,
      input.employeeCountMax
    );
    if (range !== undefined) out.employeeCount = range;
  }

  return out;
}

function emptyToNull(v: unknown) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function normalizeEmpRange(
  range?: string | null,
  min?: number | null,
  max?: number | null
): string | null | undefined {
  // undefined => don't send the field
  // null => send null
  if (range === null) return null;
  if (typeof range === "string" && range.trim()) {
    // caller provided a "10-600" style string already
    return range.trim();
  }
  if (min === undefined && max === undefined) return undefined;
  if (min === null || max === null) return null;

  const mi = Number(min);
  const ma = Number(max);
  if (!Number.isFinite(mi) || !Number.isFinite(ma)) return null;
  if (mi < 0 || ma < 0) return null;
  if (mi > ma) return null;
  return `${Math.trunc(mi)}-${Math.trunc(ma)}`;
}
