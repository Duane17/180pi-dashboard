// components/upload/governance/auditor-controls-card.tsx
"use client";

import { useMemo } from "react";
import {
  SectionHeader,
  NumberField,
  TextField,
  SelectField,
  Divider,
} from "@/components/upload/env/ui";
import { Chip } from "../social/ui/chip";

/* ============================== Types ============================== */

export type YesNo = "yes" | "no";

export type AuditorValue = {
  externalAuditor?: {
    name: string;
    initialYear?: number | null;
    latestRotationYear?: number | null;
  };
  internalAuditFunction?: YesNo;
  criticalConcerns?: {
    mechanism: YesNo;
    raised?: number | null;
    resolved?: number | null;
  };
  fees?: {
    total?: number | null;
    nonAudit?: number | null;
    currency?: string;
  };
};

type Props = {
  value: AuditorValue;
  onChange: (patch: Partial<AuditorValue>) => void;
  readOnly?: boolean;
};

/* ============================== Helpers ============================== */

const YES_NO: readonly YesNo[] = ["yes", "no"];

function toNum(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}
function fmtPct(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(1)}%`;
}
function fmtYears(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n} years`;
}

/* ============================== Component ============================== */

export function AuditorControlsCard({ value, onChange }: Props) {
  const currentYear = new Date().getFullYear();

  const ext = value.externalAuditor ?? {
    name: "",
    initialYear: null,
    latestRotationYear: null,
  };
  const internal = (value.internalAuditFunction as YesNo) ?? "no";
  const concerns = value.criticalConcerns ?? {
    mechanism: "no" as YesNo,
    raised: null,
    resolved: null,
  };
  const fees = value.fees ?? { total: null, nonAudit: null, currency: "" };

  // ---------- Derived ----------
  const auditorTenureYears = useMemo(() => {
    const y = ext.initialYear == null ? null : Number(ext.initialYear);
    if (y == null || !Number.isFinite(y) || y <= 0) return null;
    return Math.max(0, currentYear - y);
  }, [ext.initialYear, currentYear]);

  const nonAuditFeeRatioPct = useMemo(() => {
    const total = toNum(fees.total);
    const na = toNum(fees.nonAudit);
    if (total <= 0) return null;
    return (na / total) * 100;
  }, [fees.total, fees.nonAudit]);

  const concernsResolutionRatePct = useMemo(() => {
    const raised = toNum(concerns.raised);
    const resolved = toNum(concerns.resolved);
    if (raised <= 0) return null;
    return (resolved / raised) * 100;
  }, [concerns.raised, concerns.resolved]);

  // ---------- Errors / hints ----------
  const initialYearInvalid =
    ext.initialYear != null &&
    (Number(ext.initialYear) < 1900 || Number(ext.initialYear) > currentYear);
  const rotationYearInvalid =
    ext.latestRotationYear != null &&
    (Number(ext.latestRotationYear) < 1900 ||
      Number(ext.latestRotationYear) > currentYear);

  const nonAuditGtTotal =
    fees.nonAudit != null &&
    fees.total != null &&
    Number(fees.nonAudit) > Number(fees.total);

  const resolvedGtRaised =
    concerns.resolved != null &&
    concerns.raised != null &&
    Number(concerns.resolved) > Number(concerns.raised);

  // ---------- Patch helpers ----------
  const patchExt = (p: Partial<NonNullable<AuditorValue["externalAuditor"]>>) =>
    onChange({ externalAuditor: { ...ext, ...p } });
  const patchFees = (p: Partial<NonNullable<AuditorValue["fees"]>>) =>
    onChange({ fees: { ...fees, ...p } });
  const patchConcerns = (
    p: Partial<NonNullable<AuditorValue["criticalConcerns"]>>
  ) => onChange({ criticalConcerns: { ...concerns, ...p } });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-lg font-semibold text-transparent">
          Auditor & Controls
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Capture external auditor details, internal audit presence, fees split, and
          critical concerns with derived tenure, fee ratio, and resolution rate.
        </p>
      </div>

      {/* External auditor */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="External auditor" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <TextField
              label="Auditor name"
              value={ext.name}
              onChange={(v) => patchExt({ name: v ?? "" })}
              placeholder="e.g., KPMG"
            />
          </div>
          <div>
            <NumberField
              label="Initial appointment year"
              value={ext.initialYear ?? ""}
              min={1900}
              onChange={(n) => patchExt({ initialYear: n ?? null })}
              error={initialYearInvalid ? `Enter a year ≤ ${currentYear}` : undefined}
            />
          </div>
          <div>
            <NumberField
              label="Latest rotation year (optional)"
              value={ext.latestRotationYear ?? ""}
              min={1900}
              onChange={(n) => patchExt({ latestRotationYear: n ?? null })}
              error={rotationYearInvalid ? `Enter a year ≤ ${currentYear}` : undefined}
            />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <div className="w-full rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
              <Chip label="Auditor tenure" value={fmtYears(auditorTenureYears)} />
            </div>
          </div>
        </div>
      </div>

      {/* Internal audit & fees */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Internal audit & fees" />

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <SelectField
              label="Internal audit function?"
              value={internal}
              options={YES_NO as unknown as readonly string[]}
              onChange={(v) =>
                onChange({ internalAuditFunction: (v as YesNo) || "no" })
              }
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <div className="w-full rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
              <div className="flex flex-wrap gap-2">
                <Chip
                  label="Non-audit fee ratio"
                  value={fmtPct(nonAuditFeeRatioPct)}
                />
                {nonAuditGtTotal ? (
                  <span className="text-red-600">Non-audit exceeds total</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Fees grid */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <NumberField
            label="Total fees"
            value={fees.total ?? ""}
            min={0}
            onChange={(n) => patchFees({ total: n ?? null })}
          />
          <NumberField
            label="Non-audit fees"
            value={fees.nonAudit ?? ""}
            min={0}
            onChange={(n) => patchFees({ nonAudit: n ?? null })}
            error={nonAuditGtTotal ? "Cannot exceed Total fees" : undefined}
          />
          <TextField
            label="Currency"
            value={fees.currency ?? ""}
            onChange={(v) => patchFees({ currency: v ?? "" })}
            placeholder="ISO code or symbol"
          />
        </div>
      </div>

      {/* Critical concerns */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Critical concerns" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectField
            label="Mechanism in place?"
            value={concerns.mechanism}
            options={YES_NO as unknown as readonly string[]}
            onChange={(v) =>
              patchConcerns({ mechanism: (v as YesNo) || "no" })
            }
          />
          <NumberField
            label="Concerns raised"
            value={concerns.raised ?? ""}
            min={0}
            onChange={(n) => patchConcerns({ raised: n ?? null })}
          />
          <NumberField
            label="Concerns resolved"
            value={concerns.resolved ?? ""}
            min={0}
            onChange={(n) => patchConcerns({ resolved: n ?? null })}
            error={resolvedGtRaised ? "Cannot exceed Raised" : undefined}
          />
        </div>

        <div className="mt-3 rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
          <Chip
            label="Resolution rate"
            value={fmtPct(concernsResolutionRatePct)}
          />
        </div>
      </div>

      <Divider />
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <span className="text-gray-700">
          <u>Validation</u>: Years should be ≥ 1900 and not in the future. Counts must be
          non-negative. Non-audit fees must not exceed total fees.
        </span>
      </div>
    </div>
  );
}
