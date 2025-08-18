"use client";

import { useMemo } from "react";
import { SectionHeader, NumberField } from "@/components/upload/env/ui";
import { Chip } from "./ui/chip";

/** Shape aligned to SocialSchema.social.nonEmployeeWorkers */
export type NonEmployeeWorkersValue = {
  counts?: {
    agency: number | null;
    apprentices: number | null;
    contractors: number | null;
    homeWorkers: number | null;
    internsVolunteers: number | null;
    selfEmployed: number | null;
  };
  hoursWorked?: number | null; // combined hours for all non-employee workers
};

type Props = {
  value: NonEmployeeWorkersValue;
  onChange: (patch: Partial<NonEmployeeWorkersValue>) => void;
  readOnly?: boolean;
};

/* ------------------------------ helpers ------------------------------ */

function toNum(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}

type Counts = NonNullable<NonEmployeeWorkersValue["counts"]>;

const EMPTY_COUNTS: Counts = {
  agency: null,
  apprentices: null,
  contractors: null,
  homeWorkers: null,
  internsVolunteers: null,
  selfEmployed: null,
};

/* --------------------------------- Card -------------------------------- */

export function NonEmployeeWorkersCard({ value, onChange, readOnly }: Props) {
  // Normalize counts so the grid always renders consistently
  const counts: Counts = value.counts ?? EMPTY_COUNTS;

  // Derived total (UI only)
  const totalNonEmployees = useMemo(
    () =>
      toNum(counts.agency) +
      toNum(counts.apprentices) +
      toNum(counts.contractors) +
      toNum(counts.homeWorkers) +
      toNum(counts.internsVolunteers) +
      toNum(counts.selfEmployed),
    [counts]
  );

  // Patch helpers — ensure we always write number|null (never undefined)
  const patchCounts = (p: Partial<Counts>) => {
    const next: Counts = {
      ...counts,
      ...(p.agency !== undefined ? { agency: p.agency ?? null } : null),
      ...(p.apprentices !== undefined ? { apprentices: p.apprentices ?? null } : null),
      ...(p.contractors !== undefined ? { contractors: p.contractors ?? null } : null),
      ...(p.homeWorkers !== undefined ? { homeWorkers: p.homeWorkers ?? null } : null),
      ...(p.internsVolunteers !== undefined
        ? { internsVolunteers: p.internsVolunteers ?? null }
        : null),
      ...(p.selfEmployed !== undefined ? { selfEmployed: p.selfEmployed ?? null } : null),
    };
    onChange({ counts: next });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="font-medium text-gray-900">Workers who are not employees</h3>
        <p className="text-sm text-gray-600">
          Record counts of non-employee workers and combined hours worked (used later by Health &amp; Safety).
        </p>
      </div>

      {/* Counts grid */}
      <SectionHeader title="Counts by worker type" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <NumberField
          label="Agency workers"
          value={counts.agency ?? ""}
          min={0}
          onChange={(n) => patchCounts({ agency: n ?? null })}
        />
        <NumberField
          label="Apprentices"
          value={counts.apprentices ?? ""}
          min={0}
          onChange={(n) => patchCounts({ apprentices: n ?? null })}
        />
        <NumberField
          label="Contractors / sub-contractors"
          value={counts.contractors ?? ""}
          min={0}
          onChange={(n) => patchCounts({ contractors: n ?? null })}
        />
        <NumberField
          label="Home workers"
          value={counts.homeWorkers ?? ""}
          min={0}
          onChange={(n) => patchCounts({ homeWorkers: n ?? null })}
        />
        <NumberField
          label="Interns / volunteers"
          value={counts.internsVolunteers ?? ""}
          min={0}
          onChange={(n) => patchCounts({ internsVolunteers: n ?? null })}
        />
        <NumberField
          label="Self-employed"
          value={counts.selfEmployed ?? ""}
          min={0}
          onChange={(n) => patchCounts({ selfEmployed: n ?? null })}
        />
      </div>

      {/* Hours worked */}
      <SectionHeader title="Hours worked (combined)" />
      <div className="grid grid-cols-1 gap-3 sm:max-w-sm">
        <NumberField
          label="Hours worked in the period"
          value={value.hoursWorked ?? ""}
          min={0}
          onChange={(n) => onChange({ hoursWorked: n ?? null })}
          hint="Used to calculate safety rates for non-employee workers."
        />
      </div>

      {/* Totals chip */}
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <Chip label="Total non-employee workers" value={totalNonEmployees.toLocaleString()} />
      </div>
    </div>
  );
}
