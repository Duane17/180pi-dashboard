// components/upload/disclosure-periods-card.tsx
"use client";

import * as React from "react";
import type { DisclosurePeriodsValues } from "@/schemas/foundational.schemas";

/**
 * Utility: do two date ranges (start/end) differ?
 * Returns true if any of the four parts is different (including one missing).
 */
function rangesDiffer(
  sStart?: string,
  sEnd?: string,
  fStart?: string,
  fEnd?: string
) {
  return (sStart || "") !== (fStart || "") || (sEnd || "") !== (fEnd || "");
}

type Errors = Partial<Record<keyof DisclosurePeriodsValues, string | undefined>>;

export interface DisclosurePeriodsCardProps {
  value: DisclosurePeriodsValues;
  onChange: (partial: Partial<DisclosurePeriodsValues>) => void;
  errors?: Errors;
}

export function DisclosurePeriodsCard({
  value,
  onChange,
  errors,
}: DisclosurePeriodsCardProps) {
  // Derived flag: are the financial dates exactly the same as sustainability dates?
  const equalToSustainability =
    !rangesDiffer(
      value.sustainabilityPeriodStart as any, // values are dates coerced to string by your parent state;
      value.sustainabilityPeriodEnd as any,   // treat as string here since <input type="date"> expects yyyy-mm-dd
      value.financialPeriodStart as any,
      value.financialPeriodEnd as any
    ) &&
    !!value.sustainabilityPeriodStart &&
    !!value.sustainabilityPeriodEnd &&
    !!value.financialPeriodStart &&
    !!value.financialPeriodEnd;

  // Keep a local toggle to control "Same as sustainability" UX.
  const [lockFinancialToSustainability, setLockFinancialToSustainability] =
    React.useState<boolean>(equalToSustainability);

  // When the lock is enabled or sustainability period changes, mirror into financial fields.
  React.useEffect(() => {
    if (!lockFinancialToSustainability) return;
    onChange({
        financialPeriodStart: value.sustainabilityPeriodStart,
        financialPeriodEnd: value.sustainabilityPeriodEnd,

    });
  }, [
    lockFinancialToSustainability,
    value.sustainabilityPeriodStart,
    value.sustainabilityPeriodEnd,
    onChange,
  ]);

  // Show the reason field when both pairs exist and differ.
  const showDifferenceReason =
    !!value.sustainabilityPeriodStart &&
    !!value.sustainabilityPeriodEnd &&
    !!value.financialPeriodStart &&
    !!value.financialPeriodEnd &&
    rangesDiffer(
      value.sustainabilityPeriodStart as any,
      value.sustainabilityPeriodEnd as any,
      value.financialPeriodStart as any,
      value.financialPeriodEnd as any
    );

  // Generic handlers
  const handleField =
    <K extends keyof DisclosurePeriodsValues>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({ [key]: e.target.value } as Partial<DisclosurePeriodsValues>);
    };

  const handleToggleLock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setLockFinancialToSustainability(checked);
    if (checked) {
      onChange({
          financialPeriodStart: value.sustainabilityPeriodStart,
          financialPeriodEnd: value.sustainabilityPeriodEnd,

      });
    }
  };

  return (
    <div className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-md shadow-md">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/20">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">
          Reporting Periods
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Select the reporting periods for <span className="font-medium">Sustainability</span> and{" "}
          <span className="font-medium">Financial</span> reporting. If the periods differ, briefly explain why.
        </p>
      </div>

      {/* Body */}
      <div className="px-4 py-5 space-y-6">
        {/* Sustainability Period */}
        <section>
          <h4 className="text-sm font-semibold text-gray-800">Sustainability period</h4>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Start date</label>
              <input
                type="date"
                value={(value.sustainabilityPeriodStart as any) ?? ""}
                onChange={handleField("sustainabilityPeriodStart")}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
              />
              {errors?.sustainabilityPeriodStart && (
                <span className="mt-1 block text-xs text-red-600">
                  {errors.sustainabilityPeriodStart}
                </span>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-800">End date</label>
              <input
                type="date"
                value={(value.sustainabilityPeriodEnd as any) ?? ""}
                onChange={handleField("sustainabilityPeriodEnd")}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
              />
              {errors?.sustainabilityPeriodEnd && (
                <span className="mt-1 block text-xs text-red-600">
                  {errors.sustainabilityPeriodEnd}
                </span>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            If you provide a start date, an end date is required (and vice versa).
          </p>
        </section>

        {/* Financial Period */}
        <section>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-800">Financial period</h4>

            {/* Lock toggle */}
            <label className="inline-flex items-center gap-2 text-sm text-gray-800 select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 focus:ring-[#3270a1]"
                checked={lockFinancialToSustainability}
                onChange={handleToggleLock}
              />
              <span>Same as sustainability</span>
            </label>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Start date</label>
              <input
                type="date"
                value={(value.financialPeriodStart as any) ?? ""}
                onChange={handleField("financialPeriodStart")}
                disabled={lockFinancialToSustainability}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
              />
              {errors?.financialPeriodStart && (
                <span className="mt-1 block text-xs text-red-600">
                  {errors.financialPeriodStart}
                </span>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-800">End date</label>
              <input
                type="date"
                value={(value.financialPeriodEnd as any) ?? ""}
                onChange={handleField("financialPeriodEnd")}
                disabled={lockFinancialToSustainability}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
              />
              {errors?.financialPeriodEnd && (
                <span className="mt-1 block text-xs text-red-600">
                  {errors.financialPeriodEnd}
                </span>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            If you provide a start date, an end date is required (and vice versa).
          </p>
        </section>

        {/* Reason when periods differ */}
        {showDifferenceReason && (
          <section>
            <h4 className="text-sm font-semibold text-gray-800">Reason for difference</h4>
            <textarea
              value={value.periodDifferenceReason ?? ""}
              onChange={handleField("periodDifferenceReason")}
              rows={3}
              placeholder="Explain why the sustainability and financial reporting periods differ."
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            />
            {errors?.periodDifferenceReason && (
              <span className="mt-1 block text-xs text-red-600">
                {errors.periodDifferenceReason}
              </span>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
