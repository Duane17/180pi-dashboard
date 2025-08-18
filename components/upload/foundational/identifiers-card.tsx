// components/upload/identifiers-card.tsx
"use client";

import * as React from "react";
import type { IdentifiersValues } from "@/schemas/foundational.schemas";

type Errors = Partial<Record<keyof IdentifiersValues, string | undefined>>;

export interface IdentifiersCardProps {
  value: IdentifiersValues;
  onChange: (partial: Partial<IdentifiersValues>) => void;
  errors?: Errors;
}

/**
 * IdentifiersCard
 * Fields: LEI, DUNS, EU ID, PermID
 * Controlled via `value` + `onChange(partial)`.
 * Styling: glassmorphism container to match the rest of the form.
 */
export function IdentifiersCard({ value, onChange, errors }: IdentifiersCardProps) {
  const handle =
    <K extends keyof IdentifiersValues>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ [key]: e.target.value } as Partial<IdentifiersValues>);
    };

  return (
    <div className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-md shadow-md">
      <div className="px-4 py-4 border-b border-white/20">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">Official Identifiers</h3>
        <p className="mt-1 text-sm text-gray-700">
          Add registry identifiers to help verify and link disclosures across systems.
        </p>
      </div>

      <div className="px-4 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* LEI */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">LEI</label>
          <input
            type="text"
            placeholder="e.g., 529900T8BM49AURSDO55"
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.lei ?? ""}
            onChange={handle("lei")}
          />
          {errors?.lei && <span className="mt-1 text-xs text-red-600">{errors.lei}</span>}
        </div>

        {/* DUNS */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">DUNS</label>
          <input
            type="text"
            placeholder="e.g., 123456789"
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.duns ?? ""}
            onChange={handle("duns")}
          />
          {errors?.duns && <span className="mt-1 text-xs text-red-600">{errors.duns}</span>}
        </div>

        {/* EU ID */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">EU ID</label>
          <input
            type="text"
            placeholder="EU registry identifier"
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.euId ?? ""}
            onChange={handle("euId")}
          />
          {errors?.euId && <span className="mt-1 text-xs text-red-600">{errors.euId}</span>}
        </div>

        {/* PermID */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">PermID</label>
          <input
            type="text"
            placeholder="Thomson Reuters PermID"
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.permId ?? ""}
            onChange={handle("permId")}
          />
          {errors?.permId && <span className="mt-1 text-xs text-red-600">{errors.permId}</span>}
        </div>
      </div>
    </div>
  );
}
