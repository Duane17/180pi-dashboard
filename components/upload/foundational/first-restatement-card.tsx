// components/uploads/first-restatement-card.tsx
"use client";

import * as React from "react";
import type { FirstRestatementValues } from "@/schemas/foundational.schemas";
import { RESTATEMENT_REASONS } from "@/constants/foundational.constants";

type Errors = Partial<Record<keyof FirstRestatementValues, string | undefined>>;

// Derive the literal union from your options list
type Reason = (typeof RESTATEMENT_REASONS)[number]["value"];

export interface FirstRestatementCardProps {
  value: FirstRestatementValues;
  onChange: (partial: Partial<FirstRestatementValues>) => void;
  errors?: Errors;
}

/**
 * FirstRestatementCard
 * Fields:
 *  - isFirstReport (boolean)
 *  - isRestated (boolean)
 *  - restatementReasons[] (multi-select)
 *  - restatementNotes (string)
 */
export function FirstRestatementCard({
  value,
  onChange,
  errors,
}: FirstRestatementCardProps) {
  // Ensure the local variable is the correct union-array type
  const reasons: Reason[] = value.restatementReasons ?? [];

  const toggleReason = (code: Reason) => {
    const next: Reason[] = reasons.includes(code)
      ? reasons.filter((c) => c !== code)
      : [...reasons, code];
    onChange({ restatementReasons: next });
  };

  return (
    <div className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-md shadow-md">
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
            checked={value.isFirstReport === true}
            onChange={(e) => onChange({ isFirstReport: e.target.checked })}
          />
          <label htmlFor="isFirstReport" className="text-sm font-medium text-gray-800">
            This is our first sustainability report
          </label>
        </div>
        {errors?.isFirstReport && (
          <span className="block text-xs text-red-600 -mt-4">{errors.isFirstReport}</span>
        )}

        {/* Restated */}
        <div className="flex items-center gap-3">
          <input
            id="isRestated"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 focus:ring-[#3270a1]"
            checked={value.isRestated === true}
            onChange={(e) => onChange({ isRestated: e.target.checked })}
          />
          <label htmlFor="isRestated" className="text-sm font-medium text-gray-800">
            We have restated previously reported figures
          </label>
        </div>
        {errors?.isRestated && (
          <span className="block text-xs text-red-600 -mt-4">{errors.isRestated}</span>
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
          {errors?.restatementReasons && (
            <span className="mt-1 block text-xs text-red-600">{errors.restatementReasons}</span>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-gray-800">Restatement notes</label>
          <textarea
            rows={3}
            value={value.restatementNotes ?? ""}
            onChange={(e) => onChange({ restatementNotes: e.target.value })}
            placeholder="Briefly describe the changes, periods affected, and methodologies."
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
          />
          {errors?.restatementNotes && (
            <span className="mt-1 block text-xs text-red-600">{errors.restatementNotes}</span>
          )}
        </div>
      </div>
    </div>
  );
}
