"use client";

import * as React from "react";

interface AlignmentsContextValues {
  alignmentFrameworks?: string[];
  notes?: string;
}

type Errors = Partial<Record<keyof AlignmentsContextValues, string | undefined>>;

export interface AlignmentsContextCardProps {
  value: AlignmentsContextValues;
  onChange: (partial: Partial<AlignmentsContextValues>) => void;
  errors?: Errors;
}

const ALIGNMENT_OPTIONS = [
  "IFRS Sustainability Disclosure Standards",
  "GRI Standards",
  "TCFD",
  "SASB",
  "UN SDGs",
  "Other",
];

export function AlignmentsContextCard({
  value,
  onChange,
  errors,
}: AlignmentsContextCardProps) {
  const frameworks = value.alignmentFrameworks ?? [];

  const toggleFramework = (f: string) => {
    const next = frameworks.includes(f)
      ? frameworks.filter((item) => item !== f)
      : [...frameworks, f];
    onChange({ alignmentFrameworks: next });
  };

  return (
    <div className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-md shadow-md">
      <div className="px-4 py-4 border-b border-white/20">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">
          Alignments Context
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Indicate frameworks and standards your disclosures align with.
        </p>
      </div>

      <div className="px-4 py-5 space-y-4">
        {ALIGNMENT_OPTIONS.map((opt) => (
          <label key={opt} className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 focus:ring-[#3270a1]"
              checked={frameworks.includes(opt)}
              onChange={() => toggleFramework(opt)}
            />
            <span className="text-sm text-gray-800">{opt}</span>
          </label>
        ))}
        {errors?.alignmentFrameworks && (
          <span className="block text-xs text-red-600">{errors.alignmentFrameworks}</span>
        )}

        <div>
          <label className="text-sm font-medium text-gray-800">
            Notes / Additional context
          </label>
          <textarea
            value={value.notes ?? ""}
            onChange={(e) => onChange({ notes: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            rows={3}
          />
          {errors?.notes && (
            <span className="mt-1 block text-xs text-red-600">{errors.notes}</span>
          )}
        </div>
      </div>
    </div>
  );
}
