"use client";

import type { EnvironmentValues } from "@/types/esg-wizard.types";
import { TARGET_CATEGORIES, UNITS } from "@/constants/esg.constants";

type EnvironmentTarget = NonNullable<EnvironmentValues["targets"]>[number];

type Props = {
  value: NonNullable<EnvironmentValues["targets"]>;
  onChange: (next: NonNullable<EnvironmentValues["targets"]>) => void;
  errors?: Array<Partial<Record<keyof EnvironmentTarget, string>>>;
};

export function EnvTargetsCard({ value, onChange, errors }: Props) {
  const addRow = () => {
    const next: EnvironmentTarget = {
      baseline: null,
      target: null,
      unit: undefined,
      dueDate: undefined,
      category: undefined,
    };
    onChange([...(value ?? []), next]);
  };

  const updateRow = (idx: number, patch: Partial<EnvironmentTarget>) => {
    const next = [...(value ?? [])];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const removeRow = (idx: number) => {
    const next = [...(value ?? [])];
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="font-medium text-gray-900">Targets (optional)</h3>
          <p className="text-sm text-gray-600">Track baselines, targets, units, and due dates.</p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-white shadow hover:shadow-md"
          style={{
            background:
              "linear-gradient(90deg, #3270a1 0%, #7e509c 50%, #8dcddb 100%)",
          }}
        >
          Add target
        </button>
      </div>

      {(value ?? []).length === 0 ? (
        <p className="text-sm text-gray-600">No targets added yet.</p>
      ) : (
        <div className="space-y-4">
          {value.map((row, idx) => {
            const err = errors?.[idx] ?? {};
            return (
              <div
                key={idx}
                className="rounded-xl border border-gray-200/70 bg-white/60 p-4 backdrop-blur-sm"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <NumberField
                    label="Baseline"
                    value={row.baseline ?? ""}
                    onChange={(n) => updateRow(idx, { baseline: n })}
                    error={err?.baseline}
                  />
                  <NumberField
                    label="Target"
                    value={row.target ?? ""}
                    onChange={(n) => updateRow(idx, { target: n })}
                    error={err?.target}
                  />

                  {/* Unit */}
                  <div>
                    <label className="mb-1 block text-sm text-gray-700">Unit</label>
                    <select
                      className="w-full rounded-lg border border-gray-300/70 bg-white/70 p-2 outline-none ring-0 focus:border-gray-400 focus:outline-none"
                      value={row.unit ?? ""}
                      onChange={(e) =>
                        updateRow(idx, { unit: e.target.value || undefined })
                      }
                    >
                      <option value="">Select unit</option>
                      {UNITS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                    {err?.unit && <p className="mt-1 text-xs text-red-600">{err.unit}</p>}
                  </div>

                  {/* Due date */}
                  <div>
                    <label className="mb-1 block text-sm text-gray-700">
                      Due date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-gray-300/70 bg-white/70 p-2 outline-none ring-0 focus:border-gray-400 focus:outline-none"
                      value={row.dueDate ?? ""}
                      onChange={(e) =>
                        updateRow(idx, { dueDate: e.target.value || undefined })
                      }
                    />
                    {err?.dueDate && (
                      <p className="mt-1 text-xs text-red-600">{err.dueDate}</p>
                    )}
                  </div>

                  {/* Category (optional) */}
                  <div>
                    <label className="mb-1 block text-sm text-gray-700">Category</label>
                    <select
                      className="w-full rounded-lg border border-gray-300/70 bg-white/70 p-2 outline-none ring-0 focus:border-gray-400 focus:outline-none"
                      value={row.category ?? ""}
                      onChange={(e) =>
                        updateRow(idx, { category: e.target.value || undefined })
                      }
                    >
                      <option value="">Select category</option>
                      {TARGET_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {err?.category && (
                      <p className="mt-1 text-xs text-red-600">{err.category}</p>
                    )}
                  </div>
                </div>

                {/* Remove row */}
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="rounded-lg border border-gray-300/70 bg-white/60 px-3 py-1.5 text-sm text-gray-800 shadow-sm backdrop-blur-sm transition hover:bg-white/80"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: number | string;
  onChange: (n: number | null) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-gray-700">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        className="w-full rounded-lg border border-gray-300/70 bg-white/70 p-2 outline-none ring-0 focus:border-gray-400 focus:outline-none"
        value={value === null ? "" : value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") onChange(null);
          else onChange(Number(v));
        }}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
