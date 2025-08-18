// components/upload/disclosure-and-restatement-card.tsx
"use client";

import * as React from "react";
import type {
  DisclosurePeriodsValues,
  FirstRestatementValues,
} from "@/schemas/foundational.schemas";
import { RESTATEMENT_REASONS, FREQUENCY_OPTIONS } from "@/constants/foundational.constants";

/** -----------------------------
 * Types
 * ------------------------------*/
type PeriodErrors = Partial<Record<keyof DisclosurePeriodsValues, string | undefined>>;
type RestatementErrors = Partial<Record<keyof FirstRestatementValues, string | undefined>>;

export interface DisclosureAndRestatementValue {
  disclosurePeriods: DisclosurePeriodsValues;
  firstRestatement: FirstRestatementValues;
}

export interface DisclosureAndRestatementErrors {
  disclosurePeriods?: PeriodErrors;
  firstRestatement?: RestatementErrors;
}

export interface DisclosureAndRestatementCardProps {
  value: DisclosureAndRestatementValue;
  onChange: (partial: Partial<DisclosureAndRestatementValue>) => void;
  errors?: DisclosureAndRestatementErrors;
}

/** -----------------------------
 * Helpers
 * ------------------------------*/
function rangesDiffer(
  sStart?: string,
  sEnd?: string,
  fStart?: string,
  fEnd?: string
) {
  return (sStart || "") !== (fStart || "") || (sEnd || "") !== (fEnd || "");
}

/** -----------------------------
 * Component
 * ------------------------------*/
export function DisclosureAndRestatementCard({
  value,
  onChange,
  errors,
}: DisclosureAndRestatementCardProps) {
  const periods = value.disclosurePeriods ?? {};
  const restatement = value.firstRestatement ?? {};

  // Derived: are the financial dates exactly the same as sustainability?
  const equalToSustainability =
    !rangesDiffer(
      periods.sustainabilityPeriodStart as any,
      periods.sustainabilityPeriodEnd as any,
      periods.financialPeriodStart as any,
      periods.financialPeriodEnd as any
    ) &&
    !!periods.sustainabilityPeriodStart &&
    !!periods.sustainabilityPeriodEnd &&
    !!periods.financialPeriodStart &&
    !!periods.financialPeriodEnd;

  // Local toggle to lock financial to sustainability
  const [lockFinancialToSustainability, setLockFinancialToSustainability] =
    React.useState<boolean>(equalToSustainability);

  // When locked or when sustainability changes, mirror into financial fields
  React.useEffect(() => {
    if (!lockFinancialToSustainability) return;
    onChange({
      disclosurePeriods: {
        ...periods,
        financialPeriodStart: periods.sustainabilityPeriodStart,
        financialPeriodEnd: periods.sustainabilityPeriodEnd,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lockFinancialToSustainability,
    periods.sustainabilityPeriodStart,
    periods.sustainabilityPeriodEnd,
  ]);

  // Show reason when both pairs exist and differ
  const showDifferenceReason =
    !!periods.sustainabilityPeriodStart &&
    !!periods.sustainabilityPeriodEnd &&
    !!periods.financialPeriodStart &&
    !!periods.financialPeriodEnd &&
    rangesDiffer(
      periods.sustainabilityPeriodStart as any,
      periods.sustainabilityPeriodEnd as any,
      periods.financialPeriodStart as any,
      periods.financialPeriodEnd as any
    );

  // Generic period handlers
  const handlePeriodField =
    <K extends keyof DisclosurePeriodsValues>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({
        disclosurePeriods: {
          ...periods,
          [key]: e.target.value,
        },
      });
    };

  const handleToggleLock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setLockFinancialToSustainability(checked);
    if (checked) {
      onChange({
        disclosurePeriods: {
          ...periods,
          financialPeriodStart: periods.sustainabilityPeriodStart,
          financialPeriodEnd: periods.sustainabilityPeriodEnd,
        },
      });
    }
  };

  // Restatement handlers
  const handleRestatementField =
    <K extends keyof FirstRestatementValues>(key: K) =>
    (v: FirstRestatementValues[K]) => {
      onChange({
        firstRestatement: {
          ...restatement,
          [key]: v,
        },
      });
    };

  type Reason = (typeof RESTATEMENT_REASONS)[number]["value"];
  const reasons: Reason[] = (restatement.restatementReasons as Reason[]) ?? [];

  const toggleReason = (code: Reason) => {
    const next: Reason[] = reasons.includes(code)
      ? reasons.filter((c) => c !== code)
      : [...reasons, code];
    handleRestatementField("restatementReasons")(next);
  };

  const pErr = errors?.disclosurePeriods ?? {};
  const rErr = errors?.firstRestatement ?? {};

  return (
    <div className="rounded-2xl border border-white/20 bg-white/30 backdrop-blur-xl shadow-xl">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/20">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">
          Reporting
        </h2>
        <p className="mt-1 text-sm text-gray-700">
          Provide your reporting periods and indicate whether this is your first report or if any
          prior figures were restated.
        </p>
      </div>

      {/* Body */}
      <div className="px-6 py-6 space-y-10">
        {/* Reporting Periods */}
        <section className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-md shadow-md">
          <div className="px-4 py-4 border-b border-white/20">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">
              Reporting Periods
            </h3>
            <p className="mt-1 text-sm text-gray-700">
              Select the periods for <span className="font-medium">Sustainability</span> and{" "}
              <span className="font-medium">Financial</span> reporting. If they differ, briefly
              explain why.
            </p>
          </div>

          <div className="px-4 py-5 space-y-6">
            {/* Sustainability */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Sustainability period</h4>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-800">Start date</label>
                  <input
                    type="date"
                    value={(periods.sustainabilityPeriodStart as any) ?? ""}
                    onChange={handlePeriodField("sustainabilityPeriodStart")}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
                  />
                  {pErr.sustainabilityPeriodStart && (
                    <span className="mt-1 block text-xs text-red-600">
                      {pErr.sustainabilityPeriodStart}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">End date</label>
                  <input
                    type="date"
                    value={(periods.sustainabilityPeriodEnd as any) ?? ""}
                    onChange={handlePeriodField("sustainabilityPeriodEnd")}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
                  />
                  {pErr.sustainabilityPeriodEnd && (
                    <span className="mt-1 block text-xs text-red-600">
                      {pErr.sustainabilityPeriodEnd}
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-600">
                If you provide a start date, an end date is required (and vice versa).
              </p>
            </div>
            {/* Frequency of reporting */}
            <div>
              <label className="text-sm font-medium text-gray-800">Frequency of reporting</label>
              <select
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
                value={(periods as any).frequency ?? ""}
                onChange={(e) =>
                  onChange({
                    disclosurePeriods: {
                      ...periods,
                      frequency: (e.target.value || undefined) as any,
                    },
                  })
                }
              >
                <option value="">Select frequency</option>
                {FREQUENCY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {(errors?.disclosurePeriods as any)?.frequency && (
                <span className="mt-1 block text-xs text-red-600">
                  {(errors?.disclosurePeriods as any)?.frequency}
                </span>
              )}
            </div>

            {/* Financial */}
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-800">Financial period</h4>
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
                    value={(periods.financialPeriodStart as any) ?? ""}
                    onChange={handlePeriodField("financialPeriodStart")}
                    disabled={lockFinancialToSustainability}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
                  />
                  {pErr.financialPeriodStart && (
                    <span className="mt-1 block text-xs text-red-600">
                      {pErr.financialPeriodStart}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">End date</label>
                  <input
                    type="date"
                    value={(periods.financialPeriodEnd as any) ?? ""}
                    onChange={handlePeriodField("financialPeriodEnd")}
                    disabled={lockFinancialToSustainability}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
                  />
                  {pErr.financialPeriodEnd && (
                    <span className="mt-1 block text-xs text-red-600">
                      {pErr.financialPeriodEnd}
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-600">
                If you provide a start date, an end date is required (and vice versa).
              </p>
            </div>

            {/* Reason for difference */}
            {showDifferenceReason && (
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Reason for difference</h4>
                <textarea
                  value={periods.periodDifferenceReason ?? ""}
                  onChange={handlePeriodField("periodDifferenceReason")}
                  rows={3}
                  placeholder="Explain why the sustainability and financial reporting periods differ."
                  className="mt-2 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
                />
                {pErr.periodDifferenceReason && (
                  <span className="mt-1 block text-xs text-red-600">
                    {pErr.periodDifferenceReason}
                  </span>
                )}
              </div>
            )}

            {/* Date of information */}
            <div>
              <label className="text-sm font-medium text-gray-800">Date of information</label>
              <input
                type="date"
                value={(periods.dateOfInformation as any) ?? ""}
                onChange={handlePeriodField("dateOfInformation")}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
              />
              {pErr.dateOfInformation && (
                <span className="mt-1 block text-xs text-red-600">
                  {pErr.dateOfInformation}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* First-Time / Restatement */}
        <section className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-md shadow-md">
          <div className="px-4 py-4 border-b border-white/20">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">
              First-Time / Restatement
            </h3>
            <p className="mt-1 text-sm text-gray-700">
              Indicate if this is your first report and whether prior figures were restated.
            </p>
          </div>

          <div className="px-4 py-5 space-y-6">
            {/* First report */}
            <div className="flex items-center gap-3">
              <input
                id="isFirstReport"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 focus:ring-[#3270a1]"
                checked={restatement.isFirstReport === true}
                onChange={(e) => handleRestatementField("isFirstReport")(e.target.checked)}
              />
              <label htmlFor="isFirstReport" className="text-sm font-medium text-gray-800">
                This is our first sustainability report
              </label>
            </div>
            {rErr.isFirstReport && (
              <span className="block text-xs text-red-600 -mt-4">{rErr.isFirstReport}</span>
            )}

            {/* Restated */}
            <div className="flex items-center gap-3">
              <input
                id="isRestated"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 focus:ring-[#3270a1]"
                checked={restatement.isRestated === true}
                onChange={(e) => handleRestatementField("isRestated")(e.target.checked)}
              />
              <label htmlFor="isRestated" className="text-sm font-medium text-gray-800">
                We have restated previously reported figures
              </label>
            </div>
            {rErr.isRestated && (
              <span className="block text-xs text-red-600 -mt-4">{rErr.isRestated}</span>
            )}

            {/* Reasons (multi-select) */}
            <div>
              <label className="text-sm font-medium text-gray-800">
                Restatement reasons (select all that apply)
              </label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RESTATEMENT_REASONS.map((opt) => (
                  <label key={opt.value} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 focus:ring-[#3270a1]"
                      checked={reasons.includes(opt.value as Reason)}
                      onChange={() => toggleReason(opt.value as Reason)}
                    />
                    <span className="text-sm text-gray-800">{opt.label}</span>
                  </label>
                ))}
              </div>
              {rErr.restatementReasons && (
                <span className="mt-1 block text-xs text-red-600">
                  {rErr.restatementReasons}
                </span>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-gray-800">Restatement notes</label>
              <textarea
                rows={3}
                value={restatement.restatementNotes ?? ""}
                onChange={(e) => handleRestatementField("restatementNotes")(e.target.value)}
                placeholder="Briefly describe the changes, periods affected, and methodologies."
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
              />
              {rErr.restatementNotes && (
                <span className="mt-1 block text-xs text-red-600">
                  {rErr.restatementNotes}
                </span>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
