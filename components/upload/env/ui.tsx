"use client";

import React from "react";

export function Divider() {
  return (
    <div className="h-px w-full bg-gradient-to-r from-gray-200/0 via-gray-200 to-gray-200/0" />
  );
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}

export function RowList<T>({
  rows,
  onAdd,
  onUpdate,
  onRemove,
  render,
}: {
  rows: T[];
  onAdd: () => void;
  onUpdate: (idx: number, patch: Partial<T>) => void;
  onRemove: (idx: number) => void;
  render: (row: T, update: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-white shadow hover:shadow-md"
          style={{ background: "linear-gradient(90deg, #3270a1 0%, #7e509c 50%, #8dcddb 100%)" }}
        >
          Add row
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-600">No entries yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-200/70 bg-white/60 p-4 backdrop-blur-sm"
            >
              {render(row, (patch) => onUpdate(idx, patch))}
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="rounded-lg border border-gray-300/70 bg-white/60 px-3 py-1.5 text-sm text-gray-800 shadow-sm backdrop-blur-sm transition hover:bg-white/80"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  error,
  hint,
  min,
}: {
  label: string;
  value: number | string;
  onChange: (n: number | null) => void;
  error?: string;
  hint?: string;
  min?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-gray-700">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        className="w-full rounded-lg border border-gray-300/70 bg-white/70 p-2 outline-none ring-0 focus:border-gray-400 focus:outline-none"
        value={value === null ? "" : value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") onChange(null);
          else onChange(Number(v));
        }}
      />
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-gray-700">{label}</label>
      <input
        type="text"
        className="w-full rounded-lg border border-gray-300/70 bg-white/70 p-2 outline-none ring-0 focus:border-gray-400 focus:outline-none"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value || undefined)}
      />
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  allowEmpty = false,
}: {
  label: string;
  value: string | undefined;
  options: readonly T[];
  onChange: (v: string | undefined) => void;
  allowEmpty?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-gray-700">{label}</label>
      <select
        className="w-full rounded-lg border border-gray-300/70 bg-white/70 p-2 outline-none ring-0 focus:border-gray-400 focus:outline-none"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
      >
        {allowEmpty && <option value="">Select…</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
