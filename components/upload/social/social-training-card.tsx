"use client";

import { useMemo, useState } from "react";
import { SectionHeader, NumberField, RowList, TextField, Divider } from "@/components/upload/env/ui";
import { Chip } from "./ui/chip";

/** Shape aligned to SocialSchema.training */
export type TrainingValue = {
  totalTrainingHours?: number | null;
  employeesTrained?: number | null;
  byGender?: {
    women?: number | null;
    men?: number | null;
    undisclosed?: number | null;
  };
  byGroup?: Array<{ group: string; hours: number | null }>;
};

type GenderCounts = {
  women?: number | null;
  men?: number | null;
  undisclosed?: number | null;
};

type Props = {
  value: TrainingValue;
  onChange: (patch: Partial<TrainingValue>) => void;
  readOnly?: boolean;

  /** For derived average hours per employee; pass social.movement.headcountEnd */
  headcountEnd?: number | null;

  /** Optional: for derived average hours by gender; pass social.workforceProfile.gender */
  genderCounts?: GenderCounts;
};

/* ------------------------------ helpers ------------------------------ */
function toNum(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}
function fmt(n: number | null | undefined, d = 1) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: d });
}

/* --------------------------------- Card -------------------------------- */
export function TrainingCard({
  value,
  onChange,
  readOnly,
  headcountEnd,
  genderCounts,
}: Props) {
  const [showBreakdowns, setShowBreakdowns] = useState(false);

  // Normalize arrays so RowList always renders consistently
  const rows = (value.byGroup ?? []) as Array<{ group: string; hours: number | null }>;
  const byGender = value.byGender ?? { women: null, men: null, undisclosed: null };

  // Derived: average hours per employee (guard 0 / missing)
  const avgHoursPerEmployee = useMemo(() => {
    const hours = toNum(value.totalTrainingHours);
    const denom = toNum(headcountEnd);
    if (denom <= 0) return null;
    return hours / denom;
  }, [value.totalTrainingHours, headcountEnd]);

  // Derived: average hours by gender if both numerator+denominator are present
  const avgByGender = useMemo(() => {
    const gc = genderCounts || {};
    const safeAvg = (hours: number | null | undefined, count: number | null | undefined) => {
      const h = toNum(hours);
      const c = toNum(count);
      if (c <= 0) return null;
      return h / c;
    };
    return {
      women: safeAvg(byGender.women, gc.women),
      men: safeAvg(byGender.men, gc.men),
      undisclosed: safeAvg(byGender.undisclosed, gc.undisclosed),
    };
  }, [byGender, genderCounts]);

  // Patch helpers — always write number|null (never undefined)
  const patchGender = (p: Partial<NonNullable<TrainingValue["byGender"]>>) => {
    onChange({
      byGender: {
        women: byGender.women ?? null,
        men: byGender.men ?? null,
        undisclosed: byGender.undisclosed ?? null,
        ...{
          ...(p.women !== undefined ? { women: p.women ?? null } : null),
          ...(p.men !== undefined ? { men: p.men ?? null } : null),
          ...(p.undisclosed !== undefined ? { undisclosed: p.undisclosed ?? null } : null),
        },
      },
    });
  };

  const updateGroups = (next: Array<{ group: string; hours: number | null }>) =>
    onChange({ byGroup: next });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-medium text-gray-900">Training &amp; development</h3>
        <p className="text-sm text-gray-600">
          Capture total training hours and employees trained. Optional breakdowns by gender and employee
          group. Averages are computed automatically when denominators are available.
        </p>
      </div>

      {/* Main grid */}
      <SectionHeader title="Totals" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NumberField
          label="Total training hours"
          value={value.totalTrainingHours ?? ""}
          min={0}
          onChange={(n) => onChange({ totalTrainingHours: n ?? null })}
        />
        <NumberField
          label="Employees trained (count)"
          value={value.employeesTrained ?? ""}
          min={0}
          onChange={(n) => onChange({ employeesTrained: n ?? null })}
        />
      </div>

      {/* Derived averages bar */}
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <div className="flex flex-wrap items-center gap-3">
          <Chip label="Avg hours / employee" value={fmt(avgHoursPerEmployee)} />
          {/* Only show by-gender averages if any numerator entered */}
          {(byGender.women ?? byGender.men ?? byGender.undisclosed) != null && (
            <>
              <Chip label="Avg (women)" value={fmt(avgByGender.women)} />
              <Chip label="Avg (men)" value={fmt(avgByGender.men)} />
              <Chip label="Avg (undisclosed)" value={fmt(avgByGender.undisclosed)} />
            </>
          )}
        </div>
        <div className="mt-2 text-[11px] text-gray-600">
          {headcountEnd ? (
            <>Averages use <code>headcountEnd</code> and gender counts (if provided).</>
          ) : (
            <>Provide <code>Headcount at end</code> in Hires &amp; turnover to enable averages.</>
          )}
        </div>
      </div>

      <Divider />

      {/* Collapsible breakdowns */}
      <div className="flex items-center justify-between">
        <SectionHeader title="Optional breakdowns" />
        <button
          type="button"
          onClick={() => setShowBreakdowns((s) => !s)}
          className="rounded-lg border border-gray-300/70 bg-white/70 px-3 py-1 text-xs text-gray-800 hover:bg-white/90"
        >
          {showBreakdowns ? "Hide" : "Show"}
        </button>
      </div>

      {showBreakdowns && (
        <div className="space-y-6">
          {/* By gender (hours) */}
          <div className="rounded-xl border border-white/30 bg-white/50 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
            <div className="text-sm font-medium text-gray-900">Hours by gender</div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <NumberField
                label="Women (hours)"
                value={byGender.women ?? ""}
                min={0}
                onChange={(n) => patchGender({ women: n ?? null })}
              />
              <NumberField
                label="Men (hours)"
                value={byGender.men ?? ""}
                min={0}
                onChange={(n) => patchGender({ men: n ?? null })}
              />
              <NumberField
                label="Undisclosed (hours)"
                value={byGender.undisclosed ?? ""}
                min={0}
                onChange={(n) => patchGender({ undisclosed: n ?? null })}
              />
            </div>
          </div>

          {/* By group (RowList) */}
          <div className="rounded-xl border border-white/30 bg-white/50 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
            <div className="text-sm font-medium text-gray-900">Hours by employee group</div>
            <RowList
              rows={rows}
              onAdd={() => {
                if (readOnly) return;
                updateGroups([...(rows || []), { group: "", hours: null }]);
              }}
              onUpdate={(i, patch) =>
                updateGroups(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
              }
              onRemove={(i) => {
                if (readOnly) return;
                updateGroups(rows.filter((_, idx) => idx !== i));
              }}
              render={(row, update) => (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <TextField
                    label="Employee group"
                    value={row.group}
                    onChange={(v) => update({ group: v })}
                  />
                  <NumberField
                    label="Hours"
                    value={row.hours ?? ""}
                    min={0}
                    onChange={(n) => update({ hours: n ?? null })}
                  />
                </div>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
