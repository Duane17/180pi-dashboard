"use client";

import { useMemo, useState } from "react";
import {
  Divider,
  SectionHeader,
  RowList,
  NumberField,
  TextField,
} from "@/components/upload/env/ui";

/** Normalized value shape for the card (kept nullable for easy form hydration) */
export type MovementValue = {
  headcountStart: number | null;
  headcountEnd: number | null;
  newHiresTotal: number | null;
  exitsTotal: number | null;
  newHiresBreakdown?: {
    byGender?: { women?: number | null; men?: number | null; undisclosed?: number | null };
    byAge?: { under30?: number | null; from30to50?: number | null; over50?: number | null };
    byRegion?: Array<{ region: string; count: number | null }>;
  };
  exitsBreakdown?: {
    byGender?: { women?: number | null; men?: number | null; undisclosed?: number | null };
    byAge?: { under30?: number | null; from30to50?: number | null; over50?: number | null };
    byRegion?: Array<{ region: string; count: number | null }>;
  };
};

type Props = {
  value: MovementValue;
  onChange: (patch: Partial<MovementValue>) => void;
  readOnly?: boolean;
};

/* --------------------------------- helpers -------------------------------- */

function toNum(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}
function fmt(n: number | null | undefined, digits = 0) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}
function fmtPct(n: number | null | undefined, digits = 1) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(digits)}%`;
}

type BreakdownKey = "newHiresBreakdown" | "exitsBreakdown";

const emptyG = { women: null as number | null, men: null as number | null, undisclosed: null as number | null };
const emptyA = { under30: null as number | null, from30to50: null as number | null, over50: null as number | null };

/* ----------------------------------- UI ----------------------------------- */

export function MovementCard({ value, onChange, readOnly }: Props) {
  // local expand/collapse states for breakdowns
  const [openHires, setOpenHires] = useState<boolean>(false);
  const [openExits, setOpenExits] = useState<boolean>(false);

  /* ----------------------------- derived metrics ---------------------------- */

  const averageHeadcount = useMemo(() => {
    const start = toNum(value.headcountStart);
    const end = toNum(value.headcountEnd);
    const avg = (start + end) / 2;
    return start === 0 && end === 0 ? null : avg;
  }, [value.headcountStart, value.headcountEnd]);

  const hireRatePct = useMemo(() => {
    const hires = toNum(value.newHiresTotal);
    const end = toNum(value.headcountEnd);
    if (end <= 0) return null;
    return (hires / end) * 100;
  }, [value.newHiresTotal, value.headcountEnd]);

  const turnoverRatePct = useMemo(() => {
    const exits = toNum(value.exitsTotal);
    const avg = averageHeadcount ?? 0;
    if (avg <= 0) return null;
    return (exits / avg) * 100;
  }, [value.exitsTotal, averageHeadcount]);

  /* ---------------------------- soft validations --------------------------- */

  function sumGender(g?: { women?: number | null; men?: number | null; undisclosed?: number | null }) {
    if (!g) return 0;
    return toNum(g.women) + toNum(g.men) + toNum(g.undisclosed);
    }
  function sumAge(a?: { under30?: number | null; from30to50?: number | null; over50?: number | null }) {
    if (!a) return 0;
    return toNum(a.under30) + toNum(a.from30to50) + toNum(a.over50);
  }
  function sumRegions(rows?: Array<{ region: string; count: number | null }>) {
    if (!rows || rows.length === 0) return 0;
    return rows.reduce((acc, r) => acc + toNum(r.count), 0);
  }

  const hiresGenderSum = sumGender(value.newHiresBreakdown?.byGender);
  const hiresAgeSum = sumAge(value.newHiresBreakdown?.byAge);
  const hiresRegionSum = sumRegions(value.newHiresBreakdown?.byRegion);
  const exitsGenderSum = sumGender(value.exitsBreakdown?.byGender);
  const exitsAgeSum = sumAge(value.exitsBreakdown?.byAge);
  const exitsRegionSum = sumRegions(value.exitsBreakdown?.byRegion);

  const hiresTotal = toNum(value.newHiresTotal);
  const exitsTotal = toNum(value.exitsTotal);

  const hiresOverTotals = {
    gender: hiresGenderSum > hiresTotal,
    age: hiresAgeSum > hiresTotal,
    region: hiresRegionSum > hiresTotal,
  };
  const exitsOverTotals = {
    gender: exitsGenderSum > exitsTotal,
    age: exitsAgeSum > exitsTotal,
    region: exitsRegionSum > exitsTotal,
  };

  /* ------------------------------- patchers -------------------------------- */

  const setTop = (patch: Partial<Pick<MovementValue, "headcountStart" | "headcountEnd" | "newHiresTotal" | "exitsTotal">>) =>
    onChange(patch);

  const patchBreakdown = (
    key: BreakdownKey,
    patch: Partial<NonNullable<MovementValue[BreakdownKey]>>
  ) => {
    const current = (value[key] ?? {}) as NonNullable<MovementValue[BreakdownKey]>;
    onChange({ [key]: { ...current, ...patch } } as Partial<MovementValue>);
  };

  const patchBreakdownGender = (
    key: BreakdownKey,
    p: Partial<NonNullable<MovementValue[BreakdownKey]>["byGender"]>
  ) => {
    const bd = (value[key] ?? {}) as NonNullable<MovementValue[BreakdownKey]>;
    const g = bd.byGender ?? {};
    patchBreakdown(key, { byGender: { ...g, ...p } });
  };

  const patchBreakdownAge = (
    key: BreakdownKey,
    p: Partial<NonNullable<MovementValue[BreakdownKey]>["byAge"]>
  ) => {
    const bd = (value[key] ?? {}) as NonNullable<MovementValue[BreakdownKey]>;
    const a = bd.byAge ?? {};
    patchBreakdown(key, { byAge: { ...a, ...p } });
  };

  const updateBreakdownRegions = (
    key: BreakdownKey,
    rows: Array<{ region: string; count: number | null }>
  ) => {
    patchBreakdown(key, { byRegion: rows });
  };

  /* --------------------------------- render -------------------------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-medium text-gray-900">Hires &amp; turnover (movement)</h3>
        <p className="text-sm text-gray-600">
          Enter start/end headcount and movement during the period. Derived rates are computed automatically.
        </p>
      </div>

      {/* Top grid */}
      <SectionHeader title="Headcount & movement" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NumberField
          label="Headcount at start"
          value={value.headcountStart ?? ""}
          min={0}
          onChange={(n) => setTop({ headcountStart: n ?? null })}
        />
        <NumberField
          label="Headcount at end"
          value={value.headcountEnd ?? ""}
          min={0}
          onChange={(n) => setTop({ headcountEnd: n ?? null })}
        />
        <NumberField
          label="New hires during period"
          value={value.newHiresTotal ?? ""}
          min={0}
          onChange={(n) => setTop({ newHiresTotal: n ?? null })}
        />
        <NumberField
          label="Exits during period"
          value={value.exitsTotal ?? ""}
          min={0}
          onChange={(n) => setTop({ exitsTotal: n ?? null })}
        />
      </div>

      <Divider />

      {/* Optional breakdowns */}
      <SectionHeader title="Optional breakdowns" subtitle="By gender, age, and region" />

      {/* New hires breakdown */}
      <div className="rounded-xl border border-white/30 bg-white/50 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-900">New hires breakdown</div>
          <button
            type="button"
            className="text-xs underline text-gray-700"
            onClick={() => setOpenHires((s) => !s)}
          >
            {openHires ? "Hide" : "Show"}
          </button>
        </div>

        {openHires && (
          <div className="mt-3 space-y-4">
            {/* by gender */}
            <div>
              <div className="text-xs text-gray-700 mb-2">By gender</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <NumberField
                  label="Women"
                  value={value.newHiresBreakdown?.byGender?.women ?? ""}
                  min={0}
                  onChange={(n) => patchBreakdownGender("newHiresBreakdown", { women: n ?? null })}
                />
                <NumberField
                  label="Men"
                  value={value.newHiresBreakdown?.byGender?.men ?? ""}
                  min={0}
                  onChange={(n) => patchBreakdownGender("newHiresBreakdown", { men: n ?? null })}
                />
                <NumberField
                  label="Undisclosed"
                  value={value.newHiresBreakdown?.byGender?.undisclosed ?? ""}
                  min={0}
                  onChange={(n) =>
                    patchBreakdownGender("newHiresBreakdown", { undisclosed: n ?? null })
                  }
                />
              </div>
              {hiresOverTotals.gender && (
                <p className="mt-1 text-xs text-red-600">
                  Sum of gender breakdown exceeds total new hires ({fmt(hiresGenderSum)} &gt; {fmt(hiresTotal)}).
                </p>
              )}
            </div>

            {/* by age */}
            <div>
              <div className="text-xs text-gray-700 mb-2">By age</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <NumberField
                  label="Under 30"
                  value={value.newHiresBreakdown?.byAge?.under30 ?? ""}
                  min={0}
                  onChange={(n) => patchBreakdownAge("newHiresBreakdown", { under30: n ?? null })}
                />
                <NumberField
                  label="30–50"
                  value={value.newHiresBreakdown?.byAge?.from30to50 ?? ""}
                  min={0}
                  onChange={(n) =>
                    patchBreakdownAge("newHiresBreakdown", { from30to50: n ?? null })
                  }
                />
                <NumberField
                  label="Over 50"
                  value={value.newHiresBreakdown?.byAge?.over50 ?? ""}
                  min={0}
                  onChange={(n) => patchBreakdownAge("newHiresBreakdown", { over50: n ?? null })}
                />
              </div>
              {hiresOverTotals.age && (
                <p className="mt-1 text-xs text-red-600">
                  Sum of age breakdown exceeds total new hires ({fmt(hiresAgeSum)} &gt; {fmt(hiresTotal)}).
                </p>
              )}
            </div>

            {/* by region */}
            <div>
              <div className="text-xs text-gray-700 mb-2">By region</div>
              <RowList
                rows={value.newHiresBreakdown?.byRegion ?? []}
                onAdd={() => {
                  if (readOnly) return;
                  const rows = value.newHiresBreakdown?.byRegion ?? [];
                  updateBreakdownRegions("newHiresBreakdown", [
                    ...rows,
                    { region: "", count: null },
                  ]);
                }}
                onUpdate={(i, patch) => {
                  const rows = [...(value.newHiresBreakdown?.byRegion ?? [])];
                  rows[i] = { ...rows[i], ...patch };
                  updateBreakdownRegions("newHiresBreakdown", rows);
                }}
                onRemove={(i) => {
                  if (readOnly) return;
                  const rows = [...(value.newHiresBreakdown?.byRegion ?? [])];
                  rows.splice(i, 1);
                  updateBreakdownRegions("newHiresBreakdown", rows);
                }}
                render={(row, update) => (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <TextField
                        label="Region"
                        value={row.region}
                        onChange={(v) => update({ region: v })}
                      />
                    </div>
                    <NumberField
                      label="Count"
                      value={row.count ?? ""}
                      min={0}
                      onChange={(n) => update({ count: n ?? null })}
                    />
                  </div>
                )}
              />
              {hiresOverTotals.region && (
                <p className="mt-1 text-xs text-red-600">
                  Sum of region rows exceeds total new hires ({fmt(hiresRegionSum)} &gt; {fmt(hiresTotal)}).
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Exits breakdown */}
      <div className="rounded-xl border border-white/30 bg-white/50 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-900">Exits breakdown</div>
          <button
            type="button"
            className="text-xs underline text-gray-700"
            onClick={() => setOpenExits((s) => !s)}
          >
            {openExits ? "Hide" : "Show"}
          </button>
        </div>

        {openExits && (
          <div className="mt-3 space-y-4">
            {/* by gender */}
            <div>
              <div className="text-xs text-gray-700 mb-2">By gender</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <NumberField
                  label="Women"
                  value={value.exitsBreakdown?.byGender?.women ?? ""}
                  min={0}
                  onChange={(n) => patchBreakdownGender("exitsBreakdown", { women: n ?? null })}
                />
                <NumberField
                  label="Men"
                  value={value.exitsBreakdown?.byGender?.men ?? ""}
                  min={0}
                  onChange={(n) => patchBreakdownGender("exitsBreakdown", { men: n ?? null })}
                />
                <NumberField
                  label="Undisclosed"
                  value={value.exitsBreakdown?.byGender?.undisclosed ?? ""}
                  min={0}
                  onChange={(n) =>
                    patchBreakdownGender("exitsBreakdown", { undisclosed: n ?? null })
                  }
                />
              </div>
              {exitsOverTotals.gender && (
                <p className="mt-1 text-xs text-red-600">
                  Sum of gender breakdown exceeds total exits ({fmt(exitsGenderSum)} &gt; {fmt(exitsTotal)}).
                </p>
              )}
            </div>

            {/* by age */}
            <div>
              <div className="text-xs text-gray-700 mb-2">By age</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <NumberField
                  label="Under 30"
                  value={value.exitsBreakdown?.byAge?.under30 ?? ""}
                  min={0}
                  onChange={(n) => patchBreakdownAge("exitsBreakdown", { under30: n ?? null })}
                />
                <NumberField
                  label="30–50"
                  value={value.exitsBreakdown?.byAge?.from30to50 ?? ""}
                  min={0}
                  onChange={(n) => patchBreakdownAge("exitsBreakdown", { from30to50: n ?? null })}
                />
                <NumberField
                  label="Over 50"
                  value={value.exitsBreakdown?.byAge?.over50 ?? ""}
                  min={0}
                  onChange={(n) => patchBreakdownAge("exitsBreakdown", { over50: n ?? null })}
                />
              </div>
              {exitsOverTotals.age && (
                <p className="mt-1 text-xs text-red-600">
                  Sum of age breakdown exceeds total exits ({fmt(exitsAgeSum)} &gt; {fmt(exitsTotal)}).
                </p>
              )}
            </div>

            {/* by region */}
            <div>
              <div className="text-xs text-gray-700 mb-2">By region</div>
              <RowList
                rows={value.exitsBreakdown?.byRegion ?? []}
                onAdd={() => {
                  if (readOnly) return;
                  const rows = value.exitsBreakdown?.byRegion ?? [];
                  updateBreakdownRegions("exitsBreakdown", [
                    ...rows,
                    { region: "", count: null },
                  ]);
                }}
                onUpdate={(i, patch) => {
                  const rows = [...(value.exitsBreakdown?.byRegion ?? [])];
                  rows[i] = { ...rows[i], ...patch };
                  updateBreakdownRegions("exitsBreakdown", rows);
                }}
                onRemove={(i) => {
                  if (readOnly) return;
                  const rows = [...(value.exitsBreakdown?.byRegion ?? [])];
                  rows.splice(i, 1);
                  updateBreakdownRegions("exitsBreakdown", rows);
                }}
                render={(row, update) => (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <TextField
                        label="Region"
                        value={row.region}
                        onChange={(v) => update({ region: v })}
                      />
                    </div>
                    <NumberField
                      label="Count"
                      value={row.count ?? ""}
                      min={0}
                      onChange={(n) => update({ count: n ?? null })}
                    />
                  </div>
                )}
              />
              {exitsOverTotals.region && (
                <p className="mt-1 text-xs text-red-600">
                  Sum of region rows exceeds total exits ({fmt(exitsRegionSum)} &gt; {fmt(exitsTotal)}).
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Derived metrics */}
      <div className="rounded-xl border border-white/30 bg-white/50 p-4 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Average headcount" value={fmt(averageHeadcount)} />
          <Stat label="Hire rate" value={fmtPct(hireRatePct)} />
          <Stat label="Turnover rate" value={fmtPct(turnoverRatePct)} />
        </div>
      </div>
    </div>
  );
}

/* simple stat cell */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200/70 bg-white/60 p-3">
      <div className="text-gray-700">{label}</div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  );
}
