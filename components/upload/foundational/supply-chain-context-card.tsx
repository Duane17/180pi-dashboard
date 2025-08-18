// components/upload/supply-chain-context-card.tsx
"use client";

import * as React from "react";
import type { SupplyChainContextValues } from "@/schemas/foundational.schemas";

type Errors = Partial<Record<keyof SupplyChainContextValues, string | undefined>>;

export interface SupplyChainContextCardProps {
  value: SupplyChainContextValues;
  onChange: (partial: Partial<SupplyChainContextValues>) => void;
  errors?: Errors;
}

/**
 * SupplyChainContextCard
 * Fields: isInMNCChain, parentName, parentLocation, parentUrl
 * Controlled via `value` + `onChange(partial)`.
 */
export function SupplyChainContextCard({
  value,
  onChange,
  errors,
}: SupplyChainContextCardProps) {
  const handleText =
    <K extends keyof SupplyChainContextValues>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ [key]: e.target.value } as Partial<SupplyChainContextValues>);

  return (
    <div className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-md shadow-md">
      <div className="px-4 py-4 border-b border-white/20">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">Supply Chain Context</h3>
        <p className="mt-1 text-sm text-gray-700">
          Indicate if you are part of a multinational supply chain and list the parent entity (if any).
        </p>
      </div>

      <div className="px-4 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* In MNC chain */}
        <div className="flex items-center gap-3 md:col-span-2">
          <input
            id="isInMNCChain"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 focus:ring-[#3270a1]"
            checked={value.isInMNCChain === true}
            onChange={(e) => onChange({ isInMNCChain: e.target.checked })}
          />
          <label htmlFor="isInMNCChain" className="text-sm font-medium text-gray-800">
            Our company is part of a multinational’s supply chain
          </label>
        </div>
        {errors?.isInMNCChain && (
          <span className="md:col-span-2 -mt-3 text-xs text-red-600">{errors.isInMNCChain}</span>
        )}

        {/* Parent name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">Parent company name</label>
          <input
            type="text"
            placeholder="e.g., Example Group Plc"
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.parentName ?? ""}
            onChange={handleText("parentName")}
          />
          {errors?.parentName && (
            <span className="mt-1 text-xs text-red-600">{errors.parentName}</span>
          )}
        </div>

        {/* Parent location */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-800">Parent location</label>
          <input
            type="text"
            placeholder="e.g., Paris, France"
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.parentLocation ?? ""}
            onChange={handleText("parentLocation")}
          />
          {errors?.parentLocation && (
            <span className="mt-1 text-xs text-red-600">{errors.parentLocation}</span>
          )}
        </div>

        {/* Parent URL */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm font-medium text-gray-800">Parent website</label>
          <input
            type="url"
            placeholder="https://www.example.com"
            className="mt-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            value={value.parentUrl ?? ""}
            onChange={handleText("parentUrl")}
          />
          {errors?.parentUrl && (
            <span className="mt-1 text-xs text-red-600">{errors.parentUrl}</span>
          )}
        </div>
      </div>
    </div>
  );
}
