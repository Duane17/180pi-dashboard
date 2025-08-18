// src/lib/country-mapping.ts
import { COUNTRIES } from "@/constants/foundational.constants";

/** Build maps for quick lookups */
export function buildCountryMaps() {
  const codeToLabel = new Map<string, string>();
  const labelToCode = new Map<string, string>();
  for (const c of COUNTRIES) {
    const code = (c.value || "").toUpperCase();
    codeToLabel.set(code, c.label);
    labelToCode.set(c.label.toLowerCase(), code);
  }
  return { codeToLabel, labelToCode };
}

/** Normalize user-provided code into UPPER-2 (ISO-2) */
export function normalizeISO2(code?: string | null): string | undefined {
  if (!code) return undefined;
  const s = code.trim().toUpperCase();
  return s.length === 2 ? s : undefined;
}

/** Ensure array of codes is unique, valid ISO-2, and UPPER-2 */
export function normalizeCodes(codes: (string | undefined | null)[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const c of codes) {
    const n = normalizeISO2(c);
    if (n && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

/** Filter COUNTRIES by a free-text query on label or code */
export function filterCountries(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return COUNTRIES;
  return COUNTRIES.filter((c) => {
    return (
      c.value.toLowerCase().includes(q) ||
      c.label.toLowerCase().includes(q)
    );
  });
}
