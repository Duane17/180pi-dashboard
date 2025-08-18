"use client";

import React from "react";

/** Tiny compound control for a checkbox + numeric volume */
type CheckboxWithNumberProps = {
  label: string;
  has: boolean;
  volume: number | null;
  onChange: (has: boolean, volumeKWh: number | null) => void;
  stacked?: boolean; // NEW
};

export function CheckboxWithNumber({
  label, has, volume, onChange, stacked = false,
}: CheckboxWithNumberProps) {
  return (
    <div>
      <label className="mb-1 block text-sm text-gray-700">{label}</label>
      <div className={stacked ? "flex flex-col gap-2" : "flex items-center gap-3"}>
        <label className="inline-flex items-center gap-2 text-sm text-gray-800">
          <input
            type="checkbox"
            checked={has}
            onChange={(e) => onChange(e.target.checked, has ? volume : null)}
            className="h-4 w-4"
          />
          Include
        </label>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          placeholder="Volume (kWh)"
          className="w-40 rounded-lg border border-gray-300/70 bg-white/70 p-2 outline-none ring-0 focus:border-gray-400 focus:outline-none disabled:opacity-50"
          value={volume ?? ""}
          onChange={(e) => onChange(has, e.target.value === "" ? null : Number(e.target.value))}
          disabled={!has}
        />
      </div>
    </div>
  );
}


/** Simple multi-select-as-chips control */
export function MultiSelectChips<T extends string>({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: readonly T[];
  values: T[];
  onChange: (v: T[]) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = values.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                if (selected) onChange(values.filter((v) => v !== opt));
                else onChange([...values, opt]);
              }}
              className={[
                "rounded-full border px-3 py-1 text-xs",
                selected
                  ? "border-transparent bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] text-white"
                  : "border-gray-300 bg-white text-gray-800",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
