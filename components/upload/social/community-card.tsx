"use client";

import { useMemo } from "react";
import {
  SectionHeader,
  NumberField,
  SelectField,
  TextField,
} from "@/components/upload/env/ui";
import { CURRENCIES } from "@/constants/foundational.constants";

/** Matches SocialSchema.social.community (with UI-friendly nullables) */
export type CommunityValue = {
  volunteerHours?: number | null;
  cashDonations?: { amount: number | null; currency: string };
  inKindDonations?: { amount: number | null; currency: string; description?: string | null };
  estimatedBeneficiaries?: number | null;
  sitesWithAssessment?: number | null;
  totalSites?: number | null;
};

type Props = {
  value: CommunityValue;
  onChange: (patch: Partial<CommunityValue>) => void;
  readOnly?: boolean;
};

/* ------------------------------ helpers ------------------------------ */

function toNum(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}

function fmt(n: number | null | undefined, digits = 0) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function pct(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(1)}%`;
}

type Donation = NonNullable<CommunityValue["cashDonations"]>;

const EMPTY_DONATION: Donation = { amount: null, currency: "" };

/** keep undefined if both amount and currency are empty */
function normalizeDonation(d: Donation | undefined): Donation | undefined {
  if (!d) return undefined;
  const hasAmount = d.amount != null;
  const hasCurrency = !!d.currency?.trim();
  return hasAmount || hasCurrency ? { amount: d.amount ?? null, currency: d.currency?.trim() } : undefined;
}

/* --------------------------------- card -------------------------------- */


export function CommunityCard({ value, onChange, readOnly }: Props) {
  const cash = value.cashDonations ?? EMPTY_DONATION;
  const inKind = value.inKindDonations ?? { ...EMPTY_DONATION, description: "" };

  const totalSites = toNum(value.totalSites);
  const sitesWith = toNum(value.sitesWithAssessment);

  // Derived coverage %
  const coveragePct = useMemo(() => {
    if (totalSites <= 0) return null;
    return (sitesWith / totalSites) * 100;
  }, [sitesWith, totalSites]);

  const coverageInvalid = totalSites > 0 && sitesWith > totalSites;

  // Donation totals
  const donationsCombined = useMemo(() => {
    const cCur = cash.currency?.trim();
    const iCur = inKind.currency?.trim();
    if (!cCur || !iCur) return undefined;
    if (cCur !== iCur) return undefined;
    const total = toNum(cash.amount) + toNum(inKind.amount);
    return { total, currency: cCur };
  }, [cash.amount, cash.currency, inKind.amount, inKind.currency]);

  // Patch helpers
  const patchCash = (p: Partial<Donation>) => {
    const next = normalizeDonation({ ...cash, ...p } as Donation);
    onChange({ cashDonations: next });
  };
  const patchInKind = (p: Partial<CommunityValue["inKindDonations"]>) => {
    const next = { ...inKind, ...p };
    const hasAmount   = next.amount != null;
    const hasCurrency = !!next.currency?.trim();
    const hasDesc     = !!next.description?.trim();

    onChange({
      inKindDonations: hasAmount || hasCurrency || hasDesc ? next : undefined,
    });
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-medium text-gray-900">Community engagement</h3>
        <p className="text-sm text-gray-600">
          Capture volunteer hours, donations, beneficiaries, and coverage of community needs assessments.
        </p>
      </div>

      {/* Hours & Beneficiaries */}
      <SectionHeader title="Participation & reach" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <NumberField
          label="Volunteer hours"
          value={value.volunteerHours ?? ""}
          min={0}
          onChange={(n) => onChange({ volunteerHours: n ?? null })}
        />
        <NumberField
          label="Estimated beneficiaries"
          value={value.estimatedBeneficiaries ?? ""}
          min={0}
          onChange={(n) => onChange({ estimatedBeneficiaries: n ?? null })}
        />
      </div>

      {/* Donations */}
      <SectionHeader title="Donations" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Cash */}
        <div className="rounded-xl border border-white/30 bg-white/50 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
          <div className="text-sm font-medium text-gray-900">Cash donations</div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NumberField
              label="Amount"
              value={cash.amount ?? ""}
              min={0}
              onChange={(n) => patchCash({ amount: n ?? null })}
            />
            <SelectField
              label="Currency"
              value={cash.currency ?? ""}
              options={CURRENCIES.map((c) => c.label) as readonly string[]}
              onChange={(v) => patchCash({ currency: v })}
              allowEmpty
            />
          </div>
        </div>

        {/* In-kind */}
        <div className="rounded-xl border border-white/30 bg-white/50 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
          <div className="text-sm font-medium text-gray-900">In-kind donations (estimated value)</div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NumberField
              label="Amount"
              value={inKind.amount ?? ""}
              min={0}
              onChange={(n) => patchInKind({ amount: n ?? null })}
            />
            <SelectField
              label="Currency"
              value={inKind.currency ?? ""}
              options={CURRENCIES.map((c) => c.label) as readonly string[]}
              onChange={(v) => patchInKind({ currency: v })}
              allowEmpty
            />
            <div className="sm:col-span-2">
              <TextField
                label="Description"
                value={inKind.description ?? undefined}
                onChange={(v) => patchInKind({ description: (v ?? "") })}
                placeholder="e.g., food supplies, equipment, clothing"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Assessment coverage */}
      <SectionHeader title="Community needs / impact assessments" />
      <div className="grid grid-cols-1 gap-3 sm:max-w-2xl sm:grid-cols-3">
        <NumberField
          label="Sites with assessment"
          value={value.sitesWithAssessment ?? ""}
          min={0}
          onChange={(n) => onChange({ sitesWithAssessment: n ?? null })}
          hint={coverageInvalid ? "Cannot exceed total sites." : undefined}
        />
        <NumberField
          label="Total sites"
          value={value.totalSites ?? ""}
          min={0}
          onChange={(n) => onChange({ totalSites: n ?? null })}
        />
        <div className="sm:col-span-1 flex items-end">
          <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40 w-full">
            <div className="text-gray-700">Assessment coverage</div>
            <div className="mt-1">
              <KpiChip label="Coverage" value={pct(coveragePct)} />
            </div>
          </div>
        </div>
      </div>

      {/* Totals / chips */}
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <div className="flex flex-wrap gap-2">
          {donationsCombined ? (
            <KpiChip
              label="Donations total"
              value={`${fmt(donationsCombined.total)} ${donationsCombined.currency}`}
            />
          ) : (
            <>
              <KpiChip
                label="Cash"
                value={
                  cash.currency?.trim()
                    ? `${fmt(cash.amount)} ${cash.currency?.trim()}`
                    : fmt(cash.amount)
                }
              />
              <KpiChip
                label="In-kind"
                value={
                  inKind.currency?.trim()
                    ? `${fmt(inKind.amount)} ${inKind.currency?.trim()}`
                    : fmt(inKind.amount)
                }
              />
            </>
          )}
          <KpiChip label="Volunteer hours" value={fmt(value.volunteerHours)} />
          <KpiChip label="Beneficiaries" value={fmt(value.estimatedBeneficiaries)} />
        </div>
      </div>
    </div>
  );
}

/* tiny local chip */
function KpiChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-300/70 bg-white/70 px-2 py-1 text-xs text-gray-800">
      <span className="font-medium">{label}:</span> <span>{value}</span>
    </span>
  );
}
