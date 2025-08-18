"use client";

import { useMemo } from "react";
import { SectionHeader, NumberField, Divider } from "@/components/upload/env/ui";
import { Chip } from "./ui/chip";

/** Matches SocialSchema.collectiveBargaining */
export type CollectiveBargainingValue = {
  coveredEmployees?: number | null;
  totalEmployees?: number | null;
};

type Props = {
  value: CollectiveBargainingValue;
  onChange: (patch: Partial<CollectiveBargainingValue>) => void;
  readOnly?: boolean;
};

/* ------------------------------ helpers ------------------------------ */
function toNum(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}
function fmtPct(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(1)}%`;
}

/* --------------------------------- Card -------------------------------- */
export function CollectiveBargainingCard({ value, onChange, readOnly }: Props) {
  const covered = value.coveredEmployees ?? null;
  const total = value.totalEmployees ?? null;

  // Derived % coverage; guards divide-by-zero
  const coveragePct = useMemo(() => {
    const c = toNum(covered);
    const t = toNum(total);
    if (t <= 0) return null;
    return (c / t) * 100;
  }, [covered, total]);

  // Simple client-side validation: covered must not exceed total
  const coveredGtTotal =
    covered != null &&
    total != null &&
    Number.isFinite(covered) &&
    Number.isFinite(total) &&
    covered > total;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-medium text-gray-900">Collective bargaining</h3>
        <p className="text-sm text-gray-600">
          Enter the number of employees covered by a collective agreement and your total
          employees. Coverage % is computed automatically.
        </p>
      </div>

      <SectionHeader title="Coverage" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField
          label="Covered employees"
          value={covered ?? ""}
          min={0}
          onChange={(n) => onChange({ coveredEmployees: n ?? null })}
          error={coveredGtTotal ? "Cannot exceed Total employees" : undefined}
        />
        <NumberField
          label="Total employees"
          value={total ?? ""}
          min={0}
          onChange={(n) => onChange({ totalEmployees: n ?? null })}
        />
        {/* Derived, read-only */}
        <div className="flex items-end">
          <div className="w-full rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
            <Chip label="Coverage" value={fmtPct(coveragePct)} />
          </div>
        </div>
      </div>

      <Divider />
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <span className="text-gray-700">
          <u>Formula</u>: <code>Covered ÷ Total × 100</code>
        </span>
      </div>
    </div>
  );
}
