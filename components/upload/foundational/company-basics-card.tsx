// components/upload/company-basics-card.tsx
"use client";

import * as React from "react";

// Types and helpers from schema (keeps the component type-safe)
import type { CompanyBasicsValues } from "@/schemas/foundational.schemas";
import { parseEmployeeRange } from "@/schemas/foundational.schemas";

// Centralized option lists from constants
import {
  LEGAL_FORMS,
  OWNERSHIP_NATURE,
  CURRENCIES,
  NACE_SECTORS,
} from "@/constants/foundational.constants";

/* ----------------------------------------------------------------------------
   Local UI type: extends schema with UI-only fields for seamless migration
   - ownershipNatureMulti: UI uses MULTI chips. We also keep ownershipNature
     updated with the first selection for backward compatibility.
   - legalFormOther: free text when Legal Form === OTHER
---------------------------------------------------------------------------- */
type CompanyBasicsValuesUI = CompanyBasicsValues & {
  legalFormOther?: string;
  // NOTE: companyActivities is added to the schema below; keeping here for type safety in UI.
};

type Errors = Partial<Record<keyof CompanyBasicsValuesUI, string | undefined>>;

export interface CompanyBasicsCardProps {
  value: CompanyBasicsValuesUI;
  onChange: (partial: Partial<CompanyBasicsValuesUI>) => void;
  errors?: Errors;
}

/** Employee ranges mapped to "min-max" strings; drives SME auto-derive */
const EMPLOYEE_RANGES = [
  { value: "0-9", label: "0–9 (Micro)" },
  { value: "10-49", label: "10–49 (Small)" },
  { value: "50-250", label: "50–250 (Medium)" },
  { value: "251-999999", label: "251+ (Not an SME)" },
] as const;



export function CompanyBasicsCard({ value, onChange, errors }: CompanyBasicsCardProps) {
  // ---- OWNERSHIP (multi) adapter: tolerate old single-valued data ----

  // ---- SME classification auto-derivation when employeeCount changes ----
  React.useEffect(() => {
    if (!value.employeeCount) return;
    const { min } = parseEmployeeRange(value.employeeCount);
    if (min === undefined) return;

    let classification: CompanyBasicsValuesUI["smeClass"] | undefined;
    if (min < 10) classification = "MICRO";
    else if (min >= 10 && min < 50) classification = "SMALL";
    else if (min >= 50 && min <= 250) classification = "MEDIUM";
    else classification = undefined; // > 250 → not SME

    if (classification !== value.smeClass) {
      onChange({ smeClass: classification });
    }
  }, [value.employeeCount, value.smeClass, onChange]);

  // Unified handler for simple <select>/<input>
  const handleField =
    <K extends keyof CompanyBasicsValuesUI>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const v =
        e.target instanceof HTMLInputElement && e.target.type === "checkbox"
          ? (e.target.checked as any)
          : (e.target.value as any);
      onChange({ [key]: v } as Partial<CompanyBasicsValuesUI>);
    };


  const isLegalFormOther = value.legalForm === "OTHER";

  return (
    <div className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-md shadow-md">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/20">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">
          Company Basics
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Core attributes used across reporting and disclosures.
        </p>
      </div>

      {/* Body */}
      <div className="px-4 py-5 space-y-6">
        {/* Row 1: Legal form | Reporting currency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Legal Form */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-800">Legal form</label>
            <select
              className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
              value={value.legalForm ?? ""}
              onChange={(e) => {
                const next = e.target.value || undefined;
                onChange({
                  legalForm: next as any,
                  // if switching away from OTHER, clear the free text
                  legalFormOther: next === "OTHER" ? value.legalFormOther : undefined,
                });
              }}
            >
              <option value="">Select legal form</option>
              {LEGAL_FORMS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {errors?.legalForm && (
              <span className="mt-1 text-xs text-red-600">{errors.legalForm}</span>
            )}

            {/* "Other (specify)" */}
            {isLegalFormOther && (
              <div className="mt-2">
                <label className="text-sm font-medium text-gray-800">Please specify</label>
                <input
                  type="text"
                  value={value.legalFormOther ?? ""}
                  onChange={(e) => onChange({ legalFormOther: e.target.value })}
                  placeholder="e.g., S.R.L., Pty Ltd, SpA…"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
                />
                {errors?.legalFormOther && (
                  <span className="mt-1 text-xs text-red-600">{errors.legalFormOther}</span>
                )}
              </div>
            )}
          </div>

          {/* Reporting Currency */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-800">Reporting currency</label>
            <select
              className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
              value={value.reportingCurrency ?? ""}
              onChange={handleField("reportingCurrency")}
            >
              <option value="">Select currency</option>
              {CURRENCIES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {errors?.reportingCurrency && (
              <span className="mt-1 text-xs text-red-600">{errors.reportingCurrency}</span>
            )}
          </div>
        </div>

        {/* Row 2: Employee range | SME classification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Employee Range */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-800">Employee range</label>
            <select
              className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
              value={value.employeeCount ?? ""}
              onChange={handleField("employeeCount")}
            >
              <option value="">Select employee range</option>
              {EMPLOYEE_RANGES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {errors?.employeeCount && (
              <span className="mt-1 text-xs text-red-600">{errors.employeeCount}</span>
            )}
          </div>

          {/* SME Class (Auto-filled, read-only) */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-800">SME classification</label>
            <input
              type="text"
              className="mt-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-900"
              value={value.smeClass ?? ""}
              readOnly
            />
            {errors?.smeClass && (
              <span className="mt-1 text-xs text-red-600">{errors.smeClass}</span>
            )}
          </div>
        </div>

        {/* Row 3: Nature of ownership (FULL WIDTH, dropdown) */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">Nature of ownership</label>
          <select
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.ownershipNature ?? ""}
            onChange={handleField("ownershipNature")}
          >
            <option value="">Select ownership nature</option>
            {OWNERSHIP_NATURE.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {errors?.ownershipNature && (
            <span className="mt-1 text-xs text-red-600">{errors.ownershipNature}</span>
          )}
        </div>


        {/* Row 4: NACE sector (FULL WIDTH) */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">NACE sector</label>
          <select
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.naceCode ?? ""}
            onChange={handleField("naceCode")}
          >
            <option value="">Select NACE sector</option>
            {NACE_SECTORS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {errors?.naceCode && (
            <span className="mt-1 text-xs text-red-600">{errors.naceCode}</span>
          )}
        </div>

        {/* Row 5: Company activities (FULL WIDTH) */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">Company activities</label>
          <textarea
            rows={3}
            value={(value as any).companyActivities ?? ""}
            onChange={(e) => onChange({ companyActivities: e.target.value } as any)}
            placeholder="Briefly describe your main business activities, products/services, and markets served…"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
          />
          {errors?.companyActivities && (
            <span className="mt-1 text-xs text-red-600">{errors.companyActivities}</span>
          )}
        </div>
      </div>
    </div>
  );
}
