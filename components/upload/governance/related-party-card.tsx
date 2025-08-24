// components/upload/governance/related-party-card.tsx
"use client";

import { useMemo } from "react";
import {
  SectionHeader,
  NumberField,
  TextField,
  SelectField,
  RowList,
  Divider,
} from "@/components/upload/env/ui";
import { Chip } from "../social/ui/chip";
import { CURRENCIES } from "@/constants/foundational.constants";

/* ============================== Types ============================== */
type CurrencyLike = string | { value?: string; code?: string; label?: string; name?: string };
  const CURRENCY_OPTIONS: readonly string[] = (CURRENCIES as unknown as CurrencyLike[])
    .map((c) => (typeof c === "string" ? c : c.value ?? c.code ?? ""))
    .filter((s): s is string => !!s);

export type YesNo = "yes" | "no";

export type RptRow = {
  id: string;
  counterparty: string;
  relationship?:
    | "shareholder"
    | "director_related"
    | "affiliate"
    | "key_management"
    | "other";
  amount: { value: number | null; currency: string };
  nature?: "goods" | "services" | "loan" | "lease" | "other";
  armsLength?: YesNo;
  independentApproval?: YesNo;
  notes?: string;
};

export type RptValue = {
  rows: RptRow[];
};

type Props = {
  value: RptValue;
  onChange: (patch: Partial<RptValue>) => void;
  readOnly?: boolean;
};

/* ============================== Constants ============================== */

const RELATIONSHIP_OPTS = [
  { value: "shareholder", label: "Shareholder" },
  { value: "director_related", label: "Director-related" },
  { value: "affiliate", label: "Affiliate" },
  { value: "key_management", label: "Key management" },
  { value: "other", label: "Other" },
] as const;

const NATURE_OPTS = [
  { value: "goods", label: "Goods" },
  { value: "services", label: "Services" },
  { value: "loan", label: "Loan" },
  { value: "lease", label: "Lease" },
  { value: "other", label: "Other" },
] as const;

const YES_NO: readonly YesNo[] = ["yes", "no"];

/* ============================== Helpers ============================== */

function toNum(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}
function fmtMoney(n: number | null | undefined, cur?: string) {
  if (n == null || !Number.isFinite(n)) return "—";
  const s = n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return cur?.trim() ? `${s} ${cur.trim()}` : s;
}

/* ============================== Component ============================== */

export function RelatedPartyTransactionsCard({ value, onChange, readOnly }: Props) {
  const rows = value.rows ?? [];

  // Totals by currency
  const totalsByCurrency = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const cur = (r.amount?.currency ?? "").trim();
      const val = r.amount?.value;
      if (!cur || val == null || !Number.isFinite(Number(val)) || Number(val) < 0) continue;
      map.set(cur, (map.get(cur) ?? 0) + Number(val));
    }
    return Array.from(map.entries()).map(([currency, total]) => ({ currency, total }));
  }, [rows]);

  // Red flags
  const redFlags = useMemo(
    () =>
      rows.reduce((acc, r) => {
        const nonArms = r.armsLength === "no";
        const noIndep = r.independentApproval === "no";
        return acc + (nonArms || noIndep ? 1 : 0);
      }, 0),
    [rows]
  );

  // Patch helpers
  const setRows = (next: RptRow[]) => onChange({ rows: next });

  const onAdd = () => {
    const next: RptRow = {
      id: crypto.randomUUID(),
      counterparty: "",
      relationship: undefined,
      amount: { value: null, currency: "" },
      nature: undefined,
      armsLength: undefined,
      independentApproval: undefined,
      notes: "",
    };
    setRows([...(rows ?? []), next]);
  };

  const onRemove = (idx: number) => {
    const next = rows.slice();
    next.splice(idx, 1);
    setRows(next);
  };

  const onUpdate = (idx: number, patch: Partial<RptRow>) => {
    const next = rows.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    setRows(next);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-lg font-semibold text-transparent">
          Related-Party Transactions (RPT)
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Record transactions with related parties. Totals are grouped by currency; rows are flagged
          when non–arm’s-length or without independent approval.
        </p>
      </div>

      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Transactions" />

        <RowList<RptRow>
          rows={rows}
          onAdd={onAdd}
          onRemove={onRemove}
          onUpdate={onUpdate}
          render={(row, update) => {
            const cur = (row.amount?.currency ?? "").trim();
            const amt = row.amount?.value;
            const amountNegative = amt != null && Number(amt) < 0;
            const currencyMissing =
              amt != null && Number.isFinite(Number(amt)) && Number(amt) > 0 && !cur;

            const isNonArms = row.armsLength === "no";
            const noIndep = row.independentApproval === "no";

            return (
              <div className="space-y-4">
                {/* Row A: Counterparty • Relationship • Nature */}
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-3">
                  <TextField
                    label="Counterparty"
                    value={row.counterparty}
                    onChange={(v) => update({ counterparty: v ?? "" })}
                    placeholder="Name"
                  />
                  <SelectField
                    label="Relationship"
                    value={
                      row.relationship
                        ? RELATIONSHIP_OPTS.find((o) => o.value === row.relationship)?.label
                        : undefined
                    }
                    options={RELATIONSHIP_OPTS.map(
                      (o) => o.label
                    ) as unknown as readonly string[]}
                    onChange={(label) => {
                      const found = RELATIONSHIP_OPTS.find((o) => o.label === label)?.value;
                      update({
                        relationship: (found as RptRow["relationship"] | undefined) ?? undefined,
                      });
                    }}
                    allowEmpty
                  />
                  <SelectField
                    label="Nature"
                    value={
                      row.nature
                        ? NATURE_OPTS.find((o) => o.value === row.nature)?.label
                        : undefined
                    }
                    options={NATURE_OPTS.map(
                      (o) => o.label
                    ) as unknown as readonly string[]}
                    onChange={(label) => {
                      const found = NATURE_OPTS.find((o) => o.label === label)?.value;
                      update({ nature: (found as RptRow["nature"] | undefined) ?? undefined });
                    }}
                    allowEmpty
                  />
                </div>

                {/* Row B: Amount • Currency • Arm’s length? */}
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-3">
                  <SelectField
                    label="Currency"
                    value={row.amount?.currency ? row.amount.currency : undefined}
                    options={CURRENCY_OPTIONS}
                    onChange={(v) =>
                      update({
                        amount: { ...row.amount, currency: (v as string | undefined) ?? "" },
                      })
                    }
                    allowEmpty
                  />
                  <NumberField
                    label="Amount"
                    value={amt ?? ""}
                    min={0}
                    onChange={(n) => update({ amount: { ...row.amount, value: n ?? null } })}
                    error={amountNegative ? "Must be ≥ 0" : undefined}
                  />
                  <SelectField
                    label="Arm’s length?"
                    value={row.armsLength ?? undefined}
                    options={YES_NO as unknown as readonly string[]}
                    onChange={(v) => update({ armsLength: (v as YesNo | undefined) ?? undefined })}
                    allowEmpty
                  />
                </div>

                {/* Row C: Independent approval • Notes */}
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-3">
                  <SelectField
                    label="Independent approval?"
                    value={row.independentApproval ?? undefined}
                    options={YES_NO as unknown as readonly string[]}
                    onChange={(v) =>
                      update({ independentApproval: (v as YesNo | undefined) ?? undefined })
                    }
                    allowEmpty
                  />
                  <TextField
                    label="Notes (optional)"
                    value={row.notes ?? ""}
                    onChange={(v) => update({ notes: v ?? "" })}
                    placeholder="Short description or reference"
                  />
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {isNonArms ? (
                      <span className="rounded-full border border-red-300 bg-red-50 px-2 py-1 text-red-700">
                        Non–arm’s-length
                      </span>
                    ) : null}
                    {noIndep ? (
                      <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-amber-700">
                        No independent approval
                      </span>
                    ) : null}
                    {currencyMissing ? (
                      <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-amber-700">
                        Currency missing for amount
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          }}
        />

      </div>

      {/* Totals / flags */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-4 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <div className="flex flex-wrap items-center gap-2">
          {totalsByCurrency.length ? (
            totalsByCurrency.map((t) => (
              <Chip key={t.currency} label={`Total (${t.currency})`} value={fmtMoney(t.total, t.currency)} />
            ))
          ) : (
            <span className="text-gray-700">No totals to show yet.</span>
          )}
          <Chip label="Red flags" value={`${redFlags}`} />
        </div>
      </div>

      <Divider />
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <span className="text-gray-700">
          <u>Validation</u>: Amounts must be ≥ 0. Provide a currency when an amount is entered. Red-flags
          count increases if a row is non–arm’s-length or lacks independent approval.
        </span>
      </div>
    </div>
  );
}
