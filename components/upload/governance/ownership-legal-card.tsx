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

/** ====================== Types (UI value) ====================== */
export type ShareholderRow = {
  id?: string;
  name: string;
  pct: number | null;
};

export type ShareClassEntry = {
  name: string;
  votingRightsPerShare?: number | null;
  notes?: string;
};

export type ShareClassesValue = {
  structure: "ordinary" | "dual_class";
  classes?: ShareClassEntry[];
  dualClassNotes?: string;
};

export type ControlFeaturesValue = {
  hasControlFeatures: boolean;
  description?: string;
};

export type UltimateParentValue = {
  name: string;
  status: "named" | "independent";
};

export type OwnershipLegalValue = {
  ultimateParent: UltimateParentValue;
  topShareholders: ShareholderRow[];
  isListedEquity: boolean;
  shareClasses?: ShareClassesValue;
  controlFeatures?: ControlFeaturesValue;
};

type Props = {
  value: OwnershipLegalValue;
  onChange: (patch: Partial<OwnershipLegalValue>) => void;
  readOnly?: boolean;
};

/** ========================= Helpers =========================== */
function toNum(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}
function fmtPct(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(1)}%`;
}
function newId() {
  return Math.random().toString(36).slice(2, 10);
}
function sumTopN(rows: ShareholderRow[], n: number) {
  const sorted = [...rows].map((r) => toNum(r.pct)).sort((a, b) => b - a);
  return sorted.slice(0, n).reduce((acc, v) => acc + v, 0);
}

/** ========================= Component ========================= */
export function OwnershipLegalCard({ value, onChange }: Props) {
  const parent = value.ultimateParent;
  const holders = value.topShareholders ?? [];
  const sc = value.shareClasses;

  // ---- Derived metrics ----
  const concentration = useMemo(
    () => ({
      top1: sumTopN(holders, 1),
      top3: sumTopN(holders, 3),
      top5: sumTopN(holders, 5),
      top10: sumTopN(holders, 10),
    }),
    [holders]
  );

  const majorityOwner = useMemo(() => {
    const maxPct = holders.reduce((m, r) => Math.max(m, toNum(r.pct)), 0);
    return maxPct >= 50;
  }, [holders]);

  const dualClassFlag = (sc?.structure ?? "ordinary") === "dual_class";
  const sumPct = useMemo(
    () => holders.reduce((acc, r) => acc + toNum(r.pct), 0),
    [holders]
  );
  const pctExceeds100 = value.isListedEquity && sumPct > 100.000001;
  const needsDualNotes = dualClassFlag && !sc?.dualClassNotes?.trim();

  // ---- Patch helpers ----
  const patchParent = (p: Partial<UltimateParentValue>) =>
    onChange({ ultimateParent: { ...parent, ...p } });

  const patchShareholders = (rows: ShareholderRow[]) =>
    onChange({ topShareholders: rows });

  const addHolder = () =>
    patchShareholders([...holders, { id: newId(), name: "", pct: null }]);

  const updateHolder = (i: number, patch: Partial<ShareholderRow>) => {
    const next = holders.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    patchShareholders(next);
  };

  const removeHolder = (i: number) => {
    const next = holders.slice();
    next.splice(i, 1);
    patchShareholders(next);
  };

  const patchShareClasses = (p: Partial<ShareClassesValue>) => {
    const next: ShareClassesValue = {
      structure: sc?.structure ?? "ordinary",
      classes: sc?.classes ?? [],
      dualClassNotes: sc?.dualClassNotes,
      ...p,
    };
    onChange({ shareClasses: next });
  };

  const patchClassRow = (i: number, patch: Partial<ShareClassEntry>) => {
    const rows = sc?.classes ?? [];
    const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    patchShareClasses({ classes: next });
  };

  const addClassRow = () => {
    const rows = sc?.classes ?? [];
    patchShareClasses({
      classes: [...rows, { name: "", votingRightsPerShare: null, notes: "" }],
    });
  };

  const removeClassRow = (i: number) => {
    const rows = sc?.classes ?? [];
    const next = rows.slice();
    next.splice(i, 1);
    patchShareClasses({ classes: next });
  };

  // Booleans via SelectField (yes/no) to avoid ToggleField
  const boolToYesNo = (b: boolean) => (b ? "yes" : "no");
  const yesNoToBool = (v: string | undefined) => v === "yes";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-lg font-semibold text-transparent">
          Ownership & Legal Structure
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Capture beneficial ownership, top shareholders, share class structure, and any control features.
        </p>
      </div>

      {/* Ultimate parent / beneficial owner */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Ultimate parent / Beneficial owner" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectField
            label="Status"
            value={parent.status}
            options={["named", "independent"]}
            onChange={(v: string | undefined) => {
              const status = (v as "named" | "independent") || "named";
              patchParent({
                status,
                name: status === "independent" ? "" : parent.name,
              });
            }}
          />
          <TextField
            label="Name"
            placeholder={parent.status === "independent" ? "Independent" : "Owner name"}
            value={parent.status === "independent" ? "" : parent.name}
            onChange={(v: string | undefined) => patchParent({ name: v ?? "" })}
          />
        </div>
      </div>

      {/* Listing & shareholders */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Listing & shareholders" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectField
            label="Listed equity?"
            value={boolToYesNo(!!value.isListedEquity)}
            options={["yes", "no"]}
            onChange={(v: string | undefined) =>
              onChange({ isListedEquity: yesNoToBool(v) })
            }
          />
          <div className="sm:col-span-2 flex items-end">
            <div className="w-full rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
              <div className="text-gray-700 mb-1">Ownership concentration</div>
              <div className="flex flex-wrap gap-2">
                <Chip label="Top 1" value={fmtPct(concentration.top1)} />
                <Chip label="Top 3" value={fmtPct(concentration.top3)} />
                <Chip label="Top 5" value={fmtPct(concentration.top5)} />
                <Chip label="Top 10" value={fmtPct(concentration.top10)} />
                <Chip label="Majority owner" value={majorityOwner ? "Yes" : "No"} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <SectionHeader title="Top shareholders" />
          <RowList
            rows={holders}
            onAdd={() => addHolder()}
            onRemove={(i: number) => removeHolder(i)}
            onUpdate={(i: number, patch: Partial<ShareholderRow>) => updateHolder(i, patch)}
            render={(row, update) => (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <TextField
                  label="Name"
                  value={row.name}
                  onChange={(v: string | undefined) => update({ name: v ?? "" })}
                />
                <NumberField
                  label="Ownership %"
                  value={row.pct ?? ""}
                  min={0}
                  onChange={(n: number | null) => update({ pct: n ?? null })}
                />
                <div className="flex items-end">
                  <div className="w-full rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
                    <Chip label="Row" value={fmtPct(toNum(row.pct))} />
                  </div>
                </div>
              </div>
            )}
          />
          {pctExceeds100 && (
            <p className="mt-2 text-xs text-red-600">
              Sum of shareholder percentages must not exceed 100% for listed equity. Current total: {fmtPct(sumPct)}.
            </p>
          )}
        </div>
      </div>

      {/* Share classes */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Share classes" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectField
            label="Structure"
            value={sc?.structure ?? "ordinary"}
            options={["ordinary", "dual_class"]}
            onChange={(v: string | undefined) => {
              const structure = (v as "ordinary" | "dual_class") || "ordinary";
              patchShareClasses({ structure });
            }}
          />
          <div className="sm:col-span-2 flex items-end">
            <div className="w-full rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
              <div className="flex flex-wrap gap-2">
                <Chip label="Dual-class" value={dualClassFlag ? "Yes" : "No"} />
              </div>
            </div>
          </div>
        </div>

        {dualClassFlag && (
          <div className="mt-3 grid grid-cols-1 gap-3">
            <TextField
              label="Voting differences (required)"
              value={sc?.dualClassNotes ?? ""}
              onChange={(v: string | undefined) => patchShareClasses({ dualClassNotes: v ?? "" })}
            />
            {needsDualNotes && (
              <p className="text-xs text-red-600">
                Please describe voting differences for dual-class shares.
              </p>
            )}
          </div>
        )}

        <div className="mt-4">
          <SectionHeader title="Classes" />
          <RowList
            rows={sc?.classes ?? []}
            onAdd={() => addClassRow()}
            onRemove={(i: number) => removeClassRow(i)}
            onUpdate={(i: number, patch: Partial<ShareClassEntry>) => patchClassRow(i, patch)}
            render={(row, update) => (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <TextField
                  label="Class name"
                  value={row.name}
                  onChange={(v: string | undefined) => update({ name: v ?? "" })}
                />
                <NumberField
                  label="Voting rights per share"
                  value={row.votingRightsPerShare ?? ""}
                  min={0}
                  onChange={(n: number | null) => update({ votingRightsPerShare: n ?? null })}
                />
                <TextField
                  label="Notes"
                  value={row.notes ?? ""}
                  onChange={(v: string | undefined) => update({ notes: v ?? "" })}
                />
              </div>
            )}
          />
        </div>
      </div>

      {/* Control features */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Control features" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectField
            label="Control features present?"
            value={boolToYesNo(!!value.controlFeatures?.hasControlFeatures)}
            options={["yes", "no"]}
            onChange={(v: string | undefined) =>
              onChange({
                controlFeatures: {
                  hasControlFeatures: yesNoToBool(v),
                  description: value.controlFeatures?.description ?? "",
                },
              })
            }
          />
          <div className="sm:col-span-2">
            <TextField
              label="Description (golden share, shareholder agreements, etc.)"
              value={value.controlFeatures?.description ?? ""}
              onChange={(v: string | undefined) =>
                onChange({
                  controlFeatures: {
                    hasControlFeatures: !!value.controlFeatures?.hasControlFeatures,
                    description: v ?? "",
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Footer chips + formula hint */}
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <div className="flex flex-wrap gap-2">
          <Chip label="Top 1" value={fmtPct(concentration.top1)} />
          <Chip label="Top 3" value={fmtPct(concentration.top3)} />
          <Chip label="Top 5" value={fmtPct(concentration.top5)} />
          <Chip label="Top 10" value={fmtPct(concentration.top10)} />
          <Chip label="Majority owner" value={majorityOwner ? "Yes" : "No"} />
          <Chip label="Dual-class" value={dualClassFlag ? "Yes" : "No"} />
          <Chip label="Sum %" value={fmtPct(sumPct)} />
        </div>
        {value.isListedEquity && (
          <p className="mt-2 text-xs text-gray-700">
            <u>Rule for listed equity:</u> total shareholder % ≤ 100. This card shows a warning if exceeded.
          </p>
        )}
      </div>

      <Divider />
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <span className="text-gray-700">
          <u>Concentration</u>: sum of top N shareholder percentages (sorted descending).
        </span>
      </div>
    </div>
  );
}
