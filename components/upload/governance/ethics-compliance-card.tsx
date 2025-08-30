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
import { CURRENCIES } from "@/constants/foundational.constants";
import { PolicyRow } from "./ui/policy-row";
/* ============================== Types ============================== */

type CurrencyLike = string | { value?: string; code?: string; label?: string; name?: string };

const CURRENCY_OPTIONS: readonly string[] = (CURRENCIES as unknown as CurrencyLike[])
  .map((c) => (typeof c === "string" ? c : c.value ?? c.code ?? ""))
  .filter((s): s is string => !!s);


export type YesNo = "yes" | "no";

export type PolicyEntry = {
  exists: boolean;
  date?: string; // ISO (optional)
  url?: string;  // optional
};

export type PoliciesBlock = {
  codeOfConduct: PolicyEntry;
  antiCorruption: PolicyEntry;
  conflictOfInterest: PolicyEntry;
  whistleblowing: PolicyEntry;
  relatedParty: PolicyEntry;
  giftsHospitality: PolicyEntry;
  dataPrivacy: PolicyEntry;
};

export type TrainingCoverage = {
  codeOfConductPct?: number | null;
  antiCorruptionPct?: number | null;
};

export type IncidentsBlock = {
  corruption?: number | null;
  fraud?: number | null;
  dataPrivacy?: number | null;
  other?: number | null;
  otherText?: string;
};

export type PenaltiesBlock = {
  finesAmount?: number | null;
  finesCurrency?: string;
  nonMonetaryCount?: number | null;
};

export type PoliticalContributions = {
  none: boolean;
  amount?: number | null;
  currency?: string;
};

export type EthicsComplianceValue = {
  policies: PoliciesBlock;
  trainingCoverage?: TrainingCoverage;
  whistleblowingChannel?: YesNo;
  incidents?: IncidentsBlock;
  penalties?: PenaltiesBlock;
  politicalContributions?: PoliticalContributions;
};

type Props = {
  value: EthicsComplianceValue;
  onChange: (patch: Partial<EthicsComplianceValue>) => void;
  readOnly?: boolean;
};

type PolicyRowProps = {
  label: string;
  row: PolicyEntry;
  onPatch: (patch: Partial<PolicyEntry>) => void;
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
function fmtMoney(n: number | null | undefined, cur?: string) {
  if (n == null || !Number.isFinite(n)) return "—";
  const s = n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return cur?.trim() ? `${s} ${cur.trim()}` : s;
}

/* ============================== Component ============================== */

export function EthicsComplianceCard({ value, onChange, readOnly }: Props) {
  const policies = value.policies;
  const training = value.trainingCoverage ?? {};
  const incidents = value.incidents ?? {};
  const penalties = value.penalties ?? {};
  const contrib = value.politicalContributions ?? { none: false };

  // ---------- Derived ----------
  const policyCoverageScore = useMemo(() => {
    const entries: PolicyEntry[] = [
      policies.codeOfConduct,
      policies.antiCorruption,
      policies.conflictOfInterest,
      policies.whistleblowing,
      policies.relatedParty,
      policies.giftsHospitality,
      policies.dataPrivacy,
    ];
    const present = entries.filter((p) => !!p?.exists).length;
    return { present, total: 7, percent: (present / 7) * 100 };
  }, [policies]);

  const totalIncidents = useMemo(() => {
    const c = toNum(incidents.corruption);
    const f = toNum(incidents.fraud);
    const d = toNum(incidents.dataPrivacy);
    const o = toNum(incidents.other);
    return { byType: { corruption: c, fraud: f, dataPrivacy: d, other: o }, overall: c + f + d + o };
  }, [incidents.corruption, incidents.fraud, incidents.dataPrivacy, incidents.other]);

  const sanctionsCount = useMemo(() => {
    const nonMonetary = toNum(penalties.nonMonetaryCount);
    const fines = toNum(penalties.finesAmount);
    // count 1 if fines > 0 (you can show the amount separately)
    return nonMonetary + (fines > 0 ? 1 : 0);
  }, [penalties.nonMonetaryCount, penalties.finesAmount]);

  // ---------- Patchers ----------
  const patchPolicies = (key: keyof PoliciesBlock, patch: Partial<PolicyEntry>) => {
    onChange({
      policies: {
        ...policies,
        [key]: { ...policies[key], ...patch },
      } as PoliciesBlock,
    });
  };

  const patchTraining = (p: Partial<TrainingCoverage>) =>
    onChange({ trainingCoverage: { ...training, ...p } });

  const patchIncidents = (p: Partial<IncidentsBlock>) =>
    onChange({ incidents: { ...incidents, ...p } });

  const patchPenalties = (p: Partial<PenaltiesBlock>) =>
    onChange({ penalties: { ...penalties, ...p } });

  const patchContrib = (p: Partial<PoliticalContributions>) => {
    // If toggling none -> true, force amount null
    const next = { ...contrib, ...p };
    if (p.none === true) {
      next.amount = null;
      // currency can remain for display, but you may clear it if desired.
    }
    onChange({ politicalContributions: next });
  };

  // Training coverage hints
  const pctHint = "Enter 0–100 (optional)";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-lg font-semibold text-transparent">
          Ethics & Compliance
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Capture policy coverage, training, incidents, penalties and political contributions.
        </p>
      </div>

      {/* Policies matrix */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Policies" />
          <div className="mt-3 space-y-3">
            <PolicyRow
              label="Code of Conduct"
              row={policies.codeOfConduct}
              onPatch={(p) => patchPolicies("codeOfConduct", p)}
              readOnly={readOnly}
            />
            <PolicyRow
              label="Anti-corruption & Bribery"
              row={policies.antiCorruption}
              onPatch={(p) => patchPolicies("antiCorruption", p)}
              readOnly={readOnly}
            />
            <PolicyRow
              label="Conflict of Interest"
              row={policies.conflictOfInterest}
              onPatch={(p) => patchPolicies("conflictOfInterest", p)}
              readOnly={readOnly}
            />
            <PolicyRow
              label="Whistleblowing"
              row={policies.whistleblowing}
              onPatch={(p) => patchPolicies("whistleblowing", p)}
              readOnly={readOnly}
            />
            <PolicyRow
              label="Related-Party Transactions"
              row={policies.relatedParty}
              onPatch={(p) => patchPolicies("relatedParty", p)}
              readOnly={readOnly}
            />
            <PolicyRow
              label="Gifts & Hospitality"
              row={policies.giftsHospitality}
              onPatch={(p) => patchPolicies("giftsHospitality", p)}
              readOnly={readOnly}
            />
            <PolicyRow
              label="Data Privacy"
              row={policies.dataPrivacy}
              onPatch={(p) => patchPolicies("dataPrivacy", p)}
              readOnly={readOnly}
            />
          </div>


        <div className="mt-4 rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
          <div className="flex flex-wrap items-center gap-2">
            <Chip
              label="Policy coverage"
              value={`${policyCoverageScore.present}/${policyCoverageScore.total} (${fmtPct(
                policyCoverageScore.percent
              )})`}
            />
          </div>
        </div>
      </div>

      {/* Training coverage */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Training coverage (optional)" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:max-w-xl sm:grid-cols-2">
          <NumberField
            label="Code of Conduct trained (%)"
            value={training.codeOfConductPct ?? ""}
            min={0}
            onChange={(n) => {
              const v = n == null ? null : Math.max(0, Math.min(100, n));
              patchTraining({ codeOfConductPct: v });
            }}
            hint={pctHint}
          />
          <NumberField
            label="Anti-corruption trained (%)"
            value={training.antiCorruptionPct ?? ""}
            min={0}
            onChange={(n) => {
              const v = n == null ? null : Math.max(0, Math.min(100, n));
              patchTraining({ antiCorruptionPct: v });
            }}
            hint={pctHint}
          />
        </div>
      </div>

      {/* Whistleblowing channel */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Whistleblowing channel" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:max-w-xs">
          <SelectField
            label="Channel in place?"
            value={value.whistleblowingChannel ?? undefined}
            options={YES_NO as unknown as readonly string[]}
            onChange={(v) => onChange({ whistleblowingChannel: (v as YesNo | undefined) ?? undefined })}
            allowEmpty
          />

        </div>
      </div>

      {/* Incidents */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Incidents this period" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <NumberField
            label="Corruption"
            value={incidents.corruption ?? ""}
            min={0}
            onChange={(n) => patchIncidents({ corruption: n ?? null })}
          />
          <NumberField
            label="Fraud"
            value={incidents.fraud ?? ""}
            min={0}
            onChange={(n) => patchIncidents({ fraud: n ?? null })}
          />
          <NumberField
            label="Data privacy"
            value={incidents.dataPrivacy ?? ""}
            min={0}
            onChange={(n) => patchIncidents({ dataPrivacy: n ?? null })}
          />
          <NumberField
            label="Other (count)"
            value={incidents.other ?? ""}
            min={0}
            onChange={(n) => patchIncidents({ other: n ?? null })}
          />
        </div>
        <div className="mt-3 grid grid-cols-1 sm:max-w-2xl">
          <TextField
            label="Other (short description)"
            value={incidents.otherText ?? ""}
            onChange={(v) => patchIncidents({ otherText: v ?? "" })}
            placeholder="e.g., harassment, theft, etc."
          />
        </div>

        <div className="mt-4 rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
          <div className="flex flex-wrap items-center gap-2">
            <Chip label="Total incidents" value={`${totalIncidents.overall}`} />
            <Chip label="Corruption" value={`${totalIncidents.byType.corruption}`} />
            <Chip label="Fraud" value={`${totalIncidents.byType.fraud}`} />
            <Chip label="Data privacy" value={`${totalIncidents.byType.dataPrivacy}`} />
            <Chip label="Other" value={`${totalIncidents.byType.other}`} />
          </div>
        </div>
      </div>

      {/* Penalties & sanctions */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Fines & sanctions" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectField
            label="Currency"
            value={penalties.finesCurrency ?? undefined}
            options={CURRENCY_OPTIONS}
            onChange={(v) => patchPenalties({ finesCurrency: (v as string | undefined) ?? undefined })}
            allowEmpty
          />
          <NumberField
            label="Fines (amount)"
            value={penalties.finesAmount ?? ""}
            min={0}
            onChange={(n) => patchPenalties({ finesAmount: n ?? null })}
          />
          <NumberField
            label="Non-monetary sanctions (count)"
            value={penalties.nonMonetaryCount ?? ""}
            min={0}
            onChange={(n) => patchPenalties({ nonMonetaryCount: n ?? null })}
          />
        </div>

        <div className="mt-4 rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
          <div className="flex flex-wrap items-center gap-2">
            <Chip
              label="Fines"
              value={fmtMoney(penalties.finesAmount ?? null, penalties.finesCurrency)}
            />
            <Chip label="Sanctions count" value={`${sanctionsCount}`} />
          </div>
        </div>
      </div>

      {/* Political contributions */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Political contributions" />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!contrib.none}
              onChange={(e) => patchContrib({ none: e.target.checked })}
              disabled={readOnly}
            />
            None
          </label>
        </div>

        {!contrib.none && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:max-w-xl sm:grid-cols-2">
            <SelectField
              label="Currency"
              value={contrib.currency ?? undefined}
              options={CURRENCY_OPTIONS}
              onChange={(v) => patchContrib({ currency: (v as string | undefined) ?? undefined })}
              allowEmpty
            />
            <NumberField
              label="Amount"
              value={contrib.amount ?? ""}
              min={0}
              onChange={(n) => patchContrib({ amount: n ?? null })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
