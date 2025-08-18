// components/upload/registered-office-card.tsx
"use client";

import * as React from "react";
import type { RegisteredOfficeValues } from "@/schemas/foundational.schemas";
import { COUNTRIES } from "@/constants/foundational.constants";

type Errors = Partial<Record<keyof RegisteredOfficeValues, string | undefined>>;

export interface RegisteredOfficeCardProps {
  value: RegisteredOfficeValues;
  onChange: (partial: Partial<RegisteredOfficeValues>) => void;
  errors?: Errors;
}

/**
 * RegisteredOfficeCard
 * Fields: registeredCountry, registeredRegion, registeredCity, registeredAddress, registeredZip
 * Controlled via `value` + `onChange(partial)`.
 * Styling: glassmorphism to match the rest of the Upload page.
 */
export function RegisteredOfficeCard({ value, onChange, errors }: RegisteredOfficeCardProps) {
  const handleText =
    <K extends keyof RegisteredOfficeValues>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ [key]: e.target.value } as Partial<RegisteredOfficeValues>);

  const handleSelect =
    <K extends keyof RegisteredOfficeValues>(key: K) =>
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      onChange({ [key]: e.target.value || undefined } as Partial<RegisteredOfficeValues>);

  return (
    <div className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-md shadow-md">
      <div className="px-4 py-4 border-b border-white/20">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">Registered Office</h3>
        <p className="mt-1 text-sm text-gray-700">
          Legal registration address (may differ from headquarters).
        </p>
      </div>

      <div className="px-4 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Country */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">Country</label>
          <select
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.registeredCountry ?? ""}
            onChange={handleSelect("registeredCountry")}
          >
            <option value="">Select country</option>
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {errors?.registeredCountry && (
            <span className="mt-1 text-xs text-red-600">{errors.registeredCountry}</span>
          )}
        </div>

        {/* Region / State / Province */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">Region / State / Province</label>
          <input
            type="text"
            placeholder="e.g., Central Region"
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.registeredRegion ?? ""}
            onChange={handleText("registeredRegion")}
          />
          {errors?.registeredRegion && (
            <span className="mt-1 text-xs text-red-600">{errors.registeredRegion}</span>
          )}
        </div>

        {/* City */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">City</label>
          <input
            type="text"
            placeholder="e.g., Lilongwe"
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.registeredCity ?? ""}
            onChange={handleText("registeredCity")}
          />
            {errors?.registeredCity && (
              <span className="mt-1 text-xs text-red-600">{errors.registeredCity}</span>
            )}
        </div>

        {/* Address */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">Address</label>
          <input
            type="text"
            placeholder="Street, number, unit"
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.registeredAddress ?? ""}
            onChange={handleText("registeredAddress")}
          />
          {errors?.registeredAddress && (
            <span className="mt-1 text-xs text-red-600">{errors.registeredAddress}</span>
          )}
        </div>

        {/* Postal / ZIP code */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">Postal / ZIP code</label>
          <input
            type="text"
            placeholder="e.g., 26500"
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.registeredZip ?? ""}
            onChange={handleText("registeredZip")}
          />
          {errors?.registeredZip && (
            <span className="mt-1 text-xs text-red-600">{errors.registeredZip}</span>
          )}
        </div>
      </div>
    </div>
  );
}
