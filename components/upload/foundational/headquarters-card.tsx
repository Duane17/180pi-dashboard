// components/upload/headquarters-card.tsx
"use client";

import * as React from "react";
import type { HeadquartersValues } from "@/schemas/foundational.schemas";
import { COUNTRIES } from "@/constants/foundational.constants";

type Errors = Partial<Record<keyof HeadquartersValues, string | undefined>>;

export interface HeadquartersCardProps {
  value: HeadquartersValues;
  onChange: (partial: Partial<HeadquartersValues>) => void;
  errors?: Errors;
}

/**
 * HeadquartersCard
 * Fields: hqCountry, hqRegion, hqCity, hqAddress, hqLatitude, hqLongitude
 * Controlled via `value` + `onChange(partial)`.
 * Glassmorphism styling to match page.
 */
export function HeadquartersCard({ value, onChange, errors }: HeadquartersCardProps) {
  const handleText =
    <K extends keyof HeadquartersValues>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ [key]: e.target.value } as Partial<HeadquartersValues>);

  const handleNumber =
    <K extends keyof HeadquartersValues>(key: K, clamp?: (n: number) => number) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "") return onChange({ [key]: undefined } as Partial<HeadquartersValues>);
      let num = Number(raw);
      if (!Number.isFinite(num)) return;
      if (clamp) num = clamp(num);
      onChange({ [key]: num } as Partial<HeadquartersValues>);
    };

  const handleSelect =
    <K extends keyof HeadquartersValues>(key: K) =>
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      onChange({ [key]: e.target.value || undefined } as Partial<HeadquartersValues>);

  return (
    <div className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-md shadow-md">
      <div className="px-4 py-4 border-b border-white/20">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">Headquarters</h3>
        <p className="mt-1 text-sm text-gray-700">
          Principal place of management for reporting purposes.
        </p>
      </div>

      <div className="px-4 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Country */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">Country</label>
          <select
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.hqCountry ?? ""}
            onChange={handleSelect("hqCountry")}
          >
            <option value="">Select country</option>
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {errors?.hqCountry && (
            <span className="mt-1 text-xs text-red-600">{errors.hqCountry}</span>
          )}
        </div>

        {/* Region/State/Province */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">Region / State / Province</label>
          <input
            type="text"
            placeholder="e.g., Central Region"
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.hqRegion ?? ""}
            onChange={handleText("hqRegion")}
          />
          {errors?.hqRegion && (
            <span className="mt-1 text-xs text-red-600">{errors.hqRegion}</span>
          )}
        </div>

        {/* City */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">City</label>
          <input
            type="text"
            placeholder="e.g., Lilongwe"
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.hqCity ?? ""}
            onChange={handleText("hqCity")}
          />
          {errors?.hqCity && <span className="mt-1 text-xs text-red-600">{errors.hqCity}</span>}
        </div>

        {/* Address (full) */}
        <div className="flex flex-col md:col-span-1">
          <label className="text-sm font-medium text-gray-800">Address</label>
          <input
            type="text"
            placeholder="Street, number, unit"
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.hqAddress ?? ""}
            onChange={handleText("hqAddress")}
          />
          {errors?.hqAddress && (
            <span className="mt-1 text-xs text-red-600">{errors.hqAddress}</span>
          )}
        </div>
      </div>
    </div>
  );
}
