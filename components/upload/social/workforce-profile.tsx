"use client";

import { useMemo, useEffect } from "react";
import {
  Divider,
  SectionHeader,
  RowList,
  NumberField,
  TextField,
} from "@/components/upload/env/ui";

import { Chip } from "./ui/chip";

export type WorkforceProfileValue = {
  headcountByLocation: Array<{
    country: string;
    site?: string;
    headcount: number | null;
  }>;
  contractType: { permanent: number | null; temporary: number | null };
  employmentType: { fullTime: number | null; partTime: number | null };
  gender: { women: number | null; men: number | null; undisclosed: number | null };
  ageBands: { under30: number | null; from30to50: number | null; over50: number | null };
  /** kept in schema but now auto-derived */
  fteTotal: number | null;
};

type Props = {
  value: WorkforceProfileValue;
  onChange: (patch: Partial<WorkforceProfileValue>) => void;
  readOnly?: boolean;
};

/* ----------------------------- helpers ----------------------------- */

const PT_FTE_RATIO = 0.5;

function toNum(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}
function fmt(n: number | null | undefined, digits = 0) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}
function pct(part: number | null | undefined, total: number): string {
  if (total <= 0) return "—";
  const v = (toNum(part) / total) * 100;
  if (!Number.isFinite(v)) return "—";
  return `${v.toFixed(1)}%`;
}

/* --------------------------------- card ---------------------------------- */

export function WorkforceProfileCard({ value, onChange, readOnly }: Props) {
  const rows = value.headcountByLocation ?? [];

  // Show summary only after at least one row exists
  const hasRows = rows.length > 0;

  // ---- derived totals ----
  const totalFromLocations = useMemo(
    () => rows.reduce((acc, r) => acc + toNum(r.headcount), 0),
    [rows]
  );

  const totalFromGender = useMemo(() => {
    const g = value.gender ?? { women: 0, men: 0, undisclosed: 0 };
    return toNum(g.women) + toNum(g.men) + toNum(g.undisclosed);
  }, [value.gender]);

  const totalHeadcount = totalFromLocations > 0 ? totalFromLocations : totalFromGender;

  // ---- computed FTE from employment type ----
  const computedFTE = useMemo(() => {
    const ft = toNum(value.employmentType?.fullTime);
    const pt = toNum(value.employmentType?.partTime);
    const fte = ft + PT_FTE_RATIO * pt;
    return Number.isFinite(fte) && fte > 0 ? fte : null;
  }, [value.employmentType]);

  // Keep schema field in sync so downstream cards can read fteTotal
  useEffect(() => {
    const current = value.fteTotal ?? null;
    const next = computedFTE;
    const changed =
      (current == null && next != null) ||
      (current != null && next == null) ||
      (current != null && next != null && Math.abs(current - next) > 1e-9);

    if (changed) onChange({ fteTotal: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedFTE]);

  // ---- percent breakdowns (derived) ----
  const genderPct = useMemo(() => {
    const g = value.gender ?? { women: 0, men: 0, undisclosed: 0 };
    return {
      women: pct(g.women, totalHeadcount),
      men: pct(g.men, totalHeadcount),
      undisclosed: pct(g.undisclosed, totalHeadcount),
    };
  }, [value.gender, totalHeadcount]);

  const contractPct = useMemo(() => {
    const c = value.contractType ?? { permanent: 0, temporary: 0 };
    return {
      permanent: pct(c.permanent, totalHeadcount),
      temporary: pct(c.temporary, totalHeadcount),
    };
  }, [value.contractType, totalHeadcount]);

  const employmentPct = useMemo(() => {
    const e = value.employmentType ?? { fullTime: 0, partTime: 0 };
    return {
      fullTime: pct(e.fullTime, totalHeadcount),
      partTime: pct(e.partTime, totalHeadcount),
    };
  }, [value.employmentType, totalHeadcount]);

  const agePct = useMemo(() => {
    const a = value.ageBands ?? { under30: 0, from30to50: 0, over50: 0 };
    return {
      under30: pct(a.under30, totalHeadcount),
      from30to50: pct(a.from30to50, totalHeadcount),
      over50: pct(a.over50, totalHeadcount),
    };
  }, [value.ageBands, totalHeadcount]);

  // ---- patch helpers ----
  const updateLocations = (next: WorkforceProfileValue["headcountByLocation"]) =>
    onChange({ headcountByLocation: next });

  const patchContract = (p: Partial<WorkforceProfileValue["contractType"]>) =>
    onChange({
      contractType: { ...(value.contractType ?? { permanent: null, temporary: null }), ...p },
    });

  const patchEmployment = (p: Partial<WorkforceProfileValue["employmentType"]>) =>
    onChange({
      employmentType: { ...(value.employmentType ?? { fullTime: null, partTime: null }), ...p },
    });

  const patchGender = (p: Partial<WorkforceProfileValue["gender"]>) =>
    onChange({
      gender: { ...(value.gender ?? { women: null, men: null, undisclosed: null }), ...p },
    });

  const patchAge = (p: Partial<WorkforceProfileValue["ageBands"]>) =>
    onChange({
      ageBands: { ...(value.ageBands ?? { under30: null, from30to50: null, over50: null }), ...p },
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-medium text-gray-900">Workforce profile (employees)</h3>
        <p className="text-sm text-gray-600">
          Enter headcount by location and summary splits. Totals, percentages, and FTE are computed automatically.
        </p>
      </div>

      {/* Locations */}
      <SectionHeader title="Headcount by location" />
      <RowList
        rows={rows}
        onAdd={() => {
          if (readOnly) return;
          const next = [...rows, { country: "", site: "", headcount: null }];
          updateLocations(next);
        }}
        onUpdate={(i, patch) => {
          const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
          updateLocations(next);
        }}
        onRemove={(i) => {
          if (readOnly) return;
          const next = rows.filter((_, idx) => idx !== i);
          updateLocations(next);
        }}
        render={(row, update) => (
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-5">
            <TextField
              label="Country"
              value={row.country}
              onChange={(v) => update({ country: v })}
            />
            <TextField
              label="Site (optional)"
              value={row.site ?? ""}
              onChange={(v) => update({ site: v || undefined })}
            />
            <div className="sm:col-span-1 lg:col-span-2">
              <NumberField
                label="Headcount"
                value={row.headcount ?? ""}
                min={0}
                onChange={(n) => update({ headcount: n })}
              />
            </div>
          </div>
        )}
      />

      {/* Summary splits – only show once at least one row exists */}
      {hasRows && (
        <>
          <Divider />

          <SectionHeader
            title="Summary splits"
            subtitle="Contract, employment type, gender, and age bands"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Contract type */}
            <div className="rounded-xl border border-white/30 bg-white/50 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
              <div className="text-sm font-medium text-gray-900">Contract type</div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <NumberField
                  label="Permanent"
                  value={value.contractType?.permanent ?? ""}
                  min={0}
                  onChange={(n) => patchContract({ permanent: n })}
                />
                <NumberField
                  label="Temporary"
                  value={value.contractType?.temporary ?? ""}
                  min={0}
                  onChange={(n) => patchContract({ temporary: n })}
                />
              </div>
            </div>

            {/* Employment type */}
            <div className="rounded-xl border border-white/30 bg-white/50 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
              <div className="text-sm font-medium text-gray-900">Employment type</div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <NumberField
                  label="Full-time"
                  value={value.employmentType?.fullTime ?? ""}
                  min={0}
                  onChange={(n) => patchEmployment({ fullTime: n })}
                />
                <NumberField
                  label="Part-time"
                  value={value.employmentType?.partTime ?? ""}
                  min={0}
                  onChange={(n) => patchEmployment({ partTime: n })}
                />
              </div>
              <p className="mt-2 text-xs text-gray-600">
                FTE is estimated as <code>Full-time + {PT_FTE_RATIO} × Part-time</code>.
              </p>
            </div>

            {/* Gender */}
            <div className="rounded-xl border border-white/30 bg-white/50 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
              <div className="text-sm font-medium text-gray-900">Gender</div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <NumberField
                  label="Women"
                  value={value.gender?.women ?? ""}
                  min={0}
                  onChange={(n) => patchGender({ women: n })}
                />
                <NumberField
                  label="Men"
                  value={value.gender?.men ?? ""}
                  min={0}
                  onChange={(n) => patchGender({ men: n })}
                />
                <NumberField
                  label="Undisclosed"
                  value={value.gender?.undisclosed ?? ""}
                  min={0}
                  onChange={(n) => patchGender({ undisclosed: n })}
                />
              </div>
            </div>

            {/* Age bands */}
            <div className="rounded-xl border border-white/30 bg-white/50 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
              <div className="text-sm font-medium text-gray-900">Age bands</div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <NumberField
                  label="Under 30"
                  value={value.ageBands?.under30 ?? ""}
                  min={0}
                  onChange={(n) => patchAge({ under30: n })}
                />
                <NumberField
                  label="30–50"
                  value={value.ageBands?.from30to50 ?? ""}
                  min={0}
                  onChange={(n) => patchAge({ from30to50: n })}
                />
                <NumberField
                  label="Over 50"
                  value={value.ageBands?.over50 ?? ""}
                  min={0}
                  onChange={(n) => patchAge({ over50: n })}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Totals & percentages */}
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="text-gray-700">
            <u>Total headcount</u>:{" "}
            <strong className="text-gray-900">{fmt(totalHeadcount)}</strong>
          </span>
          <span className="text-gray-700">
            <u>FTE total (auto)</u>:{" "}
            <strong className="text-gray-900">{fmt(computedFTE)}</strong>
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-gray-700">Gender</div>
            <div className="mt-1 flex flex-wrap gap-2">
              <Chip label="Women" value={genderPct.women} />
              <Chip label="Men" value={genderPct.men} />
              <Chip label="Undisclosed" value={genderPct.undisclosed} />
            </div>
          </div>
          <div>
            <div className="text-gray-700">Contract type</div>
            <div className="mt-1 flex flex-wrap gap-2">
              <Chip label="Permanent" value={contractPct.permanent} />
              <Chip label="Temporary" value={contractPct.temporary} />
            </div>
          </div>
          <div>
            <div className="text-gray-700">Employment type</div>
            <div className="mt-1 flex flex-wrap gap-2">
              <Chip label="Full-time" value={employmentPct.fullTime} />
              <Chip label="Part-time" value={employmentPct.partTime} />
            </div>
          </div>
          <div>
            <div className="text-gray-700">Age bands</div>
            <div className="mt-1 flex flex-wrap gap-2">
              <Chip label="Under 30" value={agePct.under30} />
              <Chip label="30–50" value={agePct.from30to50} />
              <Chip label="Over 50" value={agePct.over50} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
