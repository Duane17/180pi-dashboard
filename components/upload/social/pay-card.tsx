"use client";

import { useMemo } from "react";
import {
  SectionHeader,
  RowList,
  NumberField,
  SelectField,
  Divider,
  TextField,
} from "@/components/upload/env/ui";
import { COUNTRIES, CURRENCIES } from "@/constants/foundational.constants";

/** --------------------------- Types (aligned to schema) --------------------------- */
export type PayValue = {
  /** "yes" | "no" | "mixed" */
  meetsMinimumWage?: "yes" | "no" | "mixed";
  /** { amount >= 0, currency string } */
  lowestHourlyRate?: { amount: number | null; currency: string };
  /** rows for comparisons by group & country */
  salaryByGroupAndLocation: Array<{
    group: string;
    country: string;
    avgWomen: number | null;
    avgMen: number | null;
  }>;
};

type Props = {
  value: PayValue;
  onChange: (patch: Partial<PayValue>) => void;
  readOnly?: boolean;
};

/** --------------------------------- Helpers --------------------------------- */
function toNum(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}

function fmt(n: number | null | undefined, digits = 2) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Derived metrics for a single row */
function calcRatio(avgWomen: number | null, avgMen: number | null) {
  const men = toNum(avgMen);
  if (men <= 0) return null;
  const women = toNum(avgWomen);
  return women / men;
}

function calcGapPct(avgWomen: number | null, avgMen: number | null) {
  const men = toNum(avgMen);
  if (men <= 0) return null;
  const women = toNum(avgWomen);
  return ((men - women) / men) * 100;
}

/** ---------------------------------- Card ---------------------------------- */
export function PayCard({ value, onChange, readOnly }: Props) {
  const mw = value.meetsMinimumWage ?? undefined;
  const rate = value.lowestHourlyRate ?? { amount: null, currency: "" };
  const rows = value.salaryByGroupAndLocation ?? [];

  const onChangeMW = (v: "yes" | "no" | "mixed" | "") =>
    onChange({ meetsMinimumWage: (v || undefined) as PayValue["meetsMinimumWage"] });

  const patchRate = (p: Partial<NonNullable<PayValue["lowestHourlyRate"]>>) =>
    onChange({
      lowestHourlyRate: { ...(rate ?? { amount: null, currency: "" }), ...p },
    });

  const updateRows = (
    next: NonNullable<PayValue["salaryByGroupAndLocation"]>
  ) => onChange({ salaryByGroupAndLocation: next });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-medium text-gray-900">Pay &amp; minimum wage / pay gap</h3>
        <p className="text-sm text-gray-600">
          Declare minimum wage compliance, the lowest hourly rate, and compare average
          salaries of women and men by employee group and country. Ratios and pay gaps
          are computed automatically per row.
        </p>
      </div>

      {/* Minimum wage & lowest rate */}
      <SectionHeader title="Minimum wage & lowest rate" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SelectField
          label="Meets minimum wage?"
          value={mw ?? ""}
          options={["yes", "no", "mixed"] as const}
          onChange={(v) => onChangeMW((v as any) || "")}
          allowEmpty
        />
        <NumberField
          label="Lowest hourly rate — amount"
          value={rate.amount ?? ""}
          min={0}
          onChange={(n) => patchRate({ amount: n ?? null })}
        />
        <SelectField
          label="Currency"
          value={rate.currency ?? ""}
          options={CURRENCIES.map((c) => c.label) as readonly string[]}
          onChange={(v) => {
            patchRate({ currency: v || "" });
          }}
          allowEmpty
        />
      </div>

      <Divider />

      {/* Pay comparisons by group & country */}
      <SectionHeader
        title="Pay comparisons"
        subtitle="Add rows to compare average salary by group and country"
      />
      <RowList
        rows={rows}
        onAdd={() => {
          if (readOnly) return;
          const next = [
            ...rows,
            { group: "", country: "", avgWomen: null, avgMen: null },
          ];
          updateRows(next);
        }}
        onUpdate={(i, patch) => {
          const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
          updateRows(next);
        }}
        onRemove={(i) => {
          if (readOnly) return;
          const next = rows.filter((_, idx) => idx !== i);
          updateRows(next);
        }}
        render={(row, update) => {
          const ratio = calcRatio(row.avgWomen, row.avgMen);
          const gap = calcGapPct(row.avgWomen, row.avgMen);

          return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <TextField
                label="Employee group"
                value={row.group}
                onChange={(v) => update({ group: v })}
                placeholder="e.g., Management"
              />
              <SelectField
                label="Country"
                value={row.country}
                options={COUNTRIES.map((c) => c.label) as readonly string[]}
                onChange={(v) => update({ country: v })}
                allowEmpty
              />
              <NumberField
                label="Avg women salary"
                value={row.avgWomen ?? ""}
                min={0}
                onChange={(n) => update({ avgWomen: n ?? null })}
              />
              <NumberField
                label="Avg men salary"
                value={row.avgMen ?? ""}
                min={0}
                onChange={(n) => update({ avgMen: n ?? null })}
              />

              {/* Derived, read-only mini-panels */}
              <div className="sm:col-span-1 lg:col-span-2 flex items-end">
                <div className="w-full rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
                  <div className="flex flex-wrap gap-2">
                    <MetricChip label="Women/Men ratio" value={ratio == null ? "—" : fmt(ratio, 3)} />
                    <MetricChip
                      label="Pay gap"
                      value={gap == null ? "—" : `${fmt(gap, 1)}%`}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}

/** Small reusable “chip” for derived metrics. */
function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-300/70 bg-white/70 px-2 py-1 text-[11px] text-gray-800">
      <span className="font-medium">{label}:</span> <span>{value}</span>
    </span>
  );
}
