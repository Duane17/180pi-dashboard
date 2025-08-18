// components/upload/financials-card.tsx
"use client";

import * as React from "react";
import type { FinancialsValues } from "@/schemas/foundational.schemas";

type Errors = Partial<Record<keyof FinancialsValues, string | undefined>>;

export interface FinancialsCardProps {
  value: FinancialsValues;
  onChange: (partial: Partial<FinancialsValues>) => void;
  errors?: Errors;
}

/**
 * FinancialsCard
 * Fields: annualTurnover, balanceSheetTotal
 * Controlled via `value` + `onChange(partial)`.
 * Glassmorphism styling consistent with the Upload page.
 */
export function FinancialsCard({ value, onChange, errors }: FinancialsCardProps) {
  const handleNumber =
    <K extends keyof FinancialsValues>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "") return onChange({ [key]: undefined } as Partial<FinancialsValues>);
      const num = Number(raw);
      if (!Number.isFinite(num) || num < 0) return;
      onChange({ [key]: num } as Partial<FinancialsValues>);
    };

  return (
    <div className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-md shadow-md">
      <div className="px-4 py-4 border-b border-white/20">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">Financials</h3>
        <p className="mt-1 text-sm text-gray-700">
          High-level financial figures used for context in disclosures.
        </p>
      </div>

      <div className="px-4 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Annual Turnover */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">Net turnover</label>
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="e.g., 1000000.00"
            value={value.annualTurnover ?? ""}
            onChange={handleNumber("annualTurnover")}
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
          />
          {errors?.annualTurnover && (
            <span className="mt-1 text-xs text-red-600">{errors.annualTurnover}</span>
          )}
        </div>

        {/* Balance Sheet Total */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">Balance sheet total</label>
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="e.g., 5000000.00"
            value={value.balanceSheetTotal ?? ""}
            onChange={handleNumber("balanceSheetTotal")}
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
          />
          {errors?.balanceSheetTotal && (
            <span className="mt-1 text-xs text-red-600">{errors.balanceSheetTotal}</span>
          )}
        </div>
      </div>
    </div>
  );
}
