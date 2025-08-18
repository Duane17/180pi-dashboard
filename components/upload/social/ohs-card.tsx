"use client";

import { useEffect, useMemo } from "react";
import { SectionHeader, NumberField, Divider } from "@/components/upload/env/ui";
import { Chip } from "./ui/chip";

/** One entity block (employees or non-employees) */
export type OhsBlock = {
  hoursWorked?: number | null;
  recordableInjuries?: number | null;
  highConsequenceInjuries?: number | null;
  fatalities?: number | null;
};

/** Shape aligned to SocialSchema.ohs */
export type OhsValue = {
  employees?: OhsBlock;
  nonEmployees?: OhsBlock;
};

type Props = {
  value: OhsValue;
  onChange: (patch: Partial<OhsValue>) => void;
  readOnly?: boolean;

  /** Soft-link prefill for nonEmployees.hoursWorked (from social.nonEmployeeWorkers.hoursWorked) */
  nonEmployeeHoursHint?: number | null;
};

/* ------------------------------ helpers ------------------------------ */
const DEFAULT_BLOCK: Required<OhsBlock> = {
  hoursWorked: null,
  recordableInjuries: null,
  highConsequenceInjuries: null,
  fatalities: null,
};

function toNum(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}
function fmt(n: number | null | undefined, d = 2) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: d });
}
function rate(numerator?: number | null, hours?: number | null): number | null {
  const num = toNum(numerator);
  const hrs = toNum(hours);
  if (hrs <= 0) return null;
  return (num / hrs) * 200_000; // OSHA-equivalent
}

/* --------------------------------- Card -------------------------------- */
export function OhsCard({ value, onChange, readOnly, nonEmployeeHoursHint }: Props) {
  // Normalize to stable, non-optional blocks
  const employees: Required<OhsBlock> = { ...DEFAULT_BLOCK, ...(value.employees ?? {}) };
  const nonEmployees: Required<OhsBlock> = { ...DEFAULT_BLOCK, ...(value.nonEmployees ?? {}) };

  // Soft prefill for nonEmployees.hoursWorked (only if not set by user yet)
  useEffect(() => {
    if (
      nonEmployeeHoursHint != null &&
      (value.nonEmployees?.hoursWorked == null || Number.isNaN(value.nonEmployees?.hoursWorked))
    ) {
      onChange({
        nonEmployees: {
          ...(value.nonEmployees ?? {}),
          hoursWorked: nonEmployeeHoursHint,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonEmployeeHoursHint]);

  // Derived rates (per entity)
  const empRates = useMemo(
    () => ({
      recordable: rate(employees.recordableInjuries, employees.hoursWorked),
      highConsequence: rate(employees.highConsequenceInjuries, employees.hoursWorked),
      fatality: rate(employees.fatalities, employees.hoursWorked),
    }),
    [employees]
  );

  const nonEmpRates = useMemo(
    () => ({
      recordable: rate(nonEmployees.recordableInjuries, nonEmployees.hoursWorked),
      highConsequence: rate(nonEmployees.highConsequenceInjuries, nonEmployees.hoursWorked),
      fatality: rate(nonEmployees.fatalities, nonEmployees.hoursWorked),
    }),
    [nonEmployees]
  );

  // Patch helpers (always write number|null, never undefined)
  const patchEmployees = (p: Partial<OhsBlock>) =>
    onChange({
      employees: {
        ...employees,
        ...(p.hoursWorked !== undefined ? { hoursWorked: p.hoursWorked ?? null } : null),
        ...(p.recordableInjuries !== undefined
          ? { recordableInjuries: p.recordableInjuries ?? null }
          : null),
        ...(p.highConsequenceInjuries !== undefined
          ? { highConsequenceInjuries: p.highConsequenceInjuries ?? null }
          : null),
        ...(p.fatalities !== undefined ? { fatalities: p.fatalities ?? null } : null),
      },
    });

  const patchNonEmployees = (p: Partial<OhsBlock>) =>
    onChange({
      nonEmployees: {
        ...nonEmployees,
        ...(p.hoursWorked !== undefined ? { hoursWorked: p.hoursWorked ?? null } : null),
        ...(p.recordableInjuries !== undefined
          ? { recordableInjuries: p.recordableInjuries ?? null }
          : null),
        ...(p.highConsequenceInjuries !== undefined
          ? { highConsequenceInjuries: p.highConsequenceInjuries ?? null }
          : null),
        ...(p.fatalities !== undefined ? { fatalities: p.fatalities ?? null } : null),
      },
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-medium text-gray-900">Health &amp; Safety (OHS)</h3>
        <p className="text-sm text-gray-600">
          Enter hours and incident counts for employees and non-employee workers. Rates are calculated per
          200,000 hours worked.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Employees panel */}
        <div className="rounded-2xl border border-white/30 bg-white/50 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
          <SectionHeader title="Employees" />
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NumberField
              label="Hours worked"
              value={employees.hoursWorked ?? ""}
              min={0}
              onChange={(n) => patchEmployees({ hoursWorked: n ?? null })}
            />
            <NumberField
              label="Recordable injuries (count)"
              value={employees.recordableInjuries ?? ""}
              min={0}
              onChange={(n) => patchEmployees({ recordableInjuries: n ?? null })}
            />
            <NumberField
              label="High-consequence injuries (count)"
              value={employees.highConsequenceInjuries ?? ""}
              min={0}
              onChange={(n) => patchEmployees({ highConsequenceInjuries: n ?? null })}
            />
            <NumberField
              label="Fatalities (count)"
              value={employees.fatalities ?? ""}
              min={0}
              onChange={(n) => patchEmployees({ fatalities: n ?? null })}
            />
          </div>

          <div className="mt-3 rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
            <div className="flex flex-wrap items-center gap-3">
              <Chip label="Recordable injury rate" value={fmt(empRates.recordable)} />
              <Chip label="High-consequence rate" value={fmt(empRates.highConsequence)} />
              <Chip label="Fatality rate" value={fmt(empRates.fatality)} />
            </div>
          </div>
        </div>

        {/* Non-employees panel */}
        <div className="rounded-2xl border border-white/30 bg-white/50 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
          <SectionHeader title="Non-employee workers" />
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NumberField
              label="Hours worked"
              value={nonEmployees.hoursWorked ?? ""}
              min={0}
              onChange={(n) => patchNonEmployees({ hoursWorked: n ?? null })}
              hint={nonEmployeeHoursHint != null ? "Prefilled from Non-employee workers." : undefined}
            />
            <NumberField
              label="Recordable injuries (count)"
              value={nonEmployees.recordableInjuries ?? ""}
              min={0}
              onChange={(n) => patchNonEmployees({ recordableInjuries: n ?? null })}
            />
            <NumberField
              label="High-consequence injuries (count)"
              value={nonEmployees.highConsequenceInjuries ?? ""}
              min={0}
              onChange={(n) => patchNonEmployees({ highConsequenceInjuries: n ?? null })}
            />
            <NumberField
              label="Fatalities (count)"
              value={nonEmployees.fatalities ?? ""}
              min={0}
              onChange={(n) => patchNonEmployees({ fatalities: n ?? null })}
            />
          </div>

          <div className="mt-3 rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
            <div className="flex flex-wrap items-center gap-3">
              <Chip label="Recordable injury rate" value={fmt(nonEmpRates.recordable)} />
              <Chip label="High-consequence rate" value={fmt(nonEmpRates.highConsequence)} />
              <Chip label="Fatality rate" value={fmt(nonEmpRates.fatality)} />
            </div>
          </div>
        </div>
      </div>

      <Divider />
      <p className="text-[11px] text-gray-600">
        Counts should be integers. Division-by-zero is guarded; enter hours worked to enable rate
        calculations.
      </p>
    </div>
  );
}
