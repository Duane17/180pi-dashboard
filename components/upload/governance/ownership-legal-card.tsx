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
  /** Rendered only when hasControlFeatures === true */
  hasGoldenShare?: boolean;
  hasShareholderAgreements?: boolean;
  description?: string;
};

export type UltimateParentValue = {
  name?: string;
  status?: "named" | "independent";
};

export type OwnershipLegalValue = {
  ultimateParent: UltimateParentValue;
  topShareholders: ShareholderRow[];
  isListedEquity?: boolean;
  shareClasses?: ShareClassesValue;
  controlFeatures?: ControlFeaturesValue | undefined; // tri-state entry point
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

/** Simple labeled checkbox **/
function LabeledCheckbox({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-800">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span>{label}</span>
    </label>
  );
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
  const pctExceeds100 = value.isListedEquity === true && sumPct > 100.000001;
  const needsDualNotes = dualClassFlag && !sc?.dualClassNotes?.trim();

  // Breakdown table rows (sorted by % desc)
  const holderTable = useMemo(() => {
    const rows = [...holders].map((h) => ({
      name: (h.name || "").trim() || "—",
      pct: h.pct == null ? null : Number(h.pct),
    }));
    rows.sort((a, b) => toNum(b.pct) - toNum(a.pct));
    return rows;
  }, [holders]);

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

  // ---- Derived booleans for checkbox pairs ----
  const isListed = value.isListedEquity === true;
  const isUnlisted = value.isListedEquity === false;
  const isNamed = parent?.status === "named";
  const isIndependent = parent?.status === "independent";

  // Control feature derived flags
  const cf = value.controlFeatures;
  const cfYes = cf?.hasControlFeatures === true;
  const cfNo = cf?.hasControlFeatures === false;

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
          {/* Status as two checkboxes (tri-state: named / independent / cleared) */}
          <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
            <div className="mb-2 text-gray-700 font-medium">Status</div>
            <div className="flex items-center gap-4">
              <LabeledCheckbox
                label="Named"
                checked={isNamed}
                onChange={() => {
                  if (isNamed) {
                    // toggle off → undefined
                    patchParent({ status: undefined });
                  } else {
                    // set named, preserve existing name
                    patchParent({ status: "named", name: parent?.name ?? "" });
                  }
                }}
              />
              <LabeledCheckbox
                label="Independent"
                checked={isIndependent}
                onChange={() => {
                  if (isIndependent) {
                    // toggle off → undefined
                    patchParent({ status: undefined });
                  } else {
                    // set independent, blank the name
                    patchParent({ status: "independent", name: "" });
                  }
                }}
              />
            </div>
          </div>

          <TextField
            label="Name"
            placeholder={parent?.status === "independent" ? "Independent" : "Owner name"}
            value={parent?.status === "independent" ? "" : parent?.name ?? ""}
            onChange={(v) => patchParent({ name: v ?? "" })}
          />
        </div>
      </div>

      {/* Listing & shareholders */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Listing & shareholders" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Listed equity as two checkboxes (tri-state: yes / no / cleared) */}
          <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
            <div className="mb-2 text-gray-700 font-medium">Listed equity?</div>
            <div className="flex items-center gap-4">
              <LabeledCheckbox
                label="Yes"
                checked={isListed}
                onChange={() => {
                  // toggle: true → undefined, otherwise → true
                  onChange({ isListedEquity: isListed ? undefined : true });
                }}
              />
              <LabeledCheckbox
                label="No"
                checked={isUnlisted}
                onChange={() => {
                  // toggle: false → undefined, otherwise → false
                  onChange({ isListedEquity: isUnlisted ? undefined : false });
                }}
              />
            </div>
          </div>

          {/* Shareholder breakdown – ONLY when listed = yes */}
          {isListed && (
            <div className="sm:col-span-2">
              <div className="rounded-xl border border-white/30 bg-white/50 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
                <div className="mb-2 text-xs font-medium text-gray-700">Shareholder breakdown</div>

                {holderTable.length === 0 ? (
                  <div className="text-xs text-gray-600">No shareholders added yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="px-2 py-1">#</th>
                          <th className="px-2 py-1">Stakeholder</th>
                          <th className="px-2 py-1">Equity share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holderTable.map((r, i) => (
                          <tr key={`${r.name}-${i}`} className="border-t border-white/40">
                            <td className="px-2 py-1 text-gray-700">{i + 1}</td>
                            <td className="px-2 py-1 text-gray-900">{r.name}</td>
                            <td className="px-2 py-1 text-gray-900">
                              {fmtPct(r.pct ?? null)}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-white/40 font-medium">
                          <td className="px-2 py-1 text-gray-700">—</td>
                          <td className="px-2 py-1 text-gray-900">Total (sum %)</td>
                          <td className="px-2 py-1 text-gray-900">{fmtPct(sumPct)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Top shareholders input – ONLY when listed = yes */}
        {isListed && (
          <div className="mt-4">
            <SectionHeader title="Top shareholders" />
            <RowList<ShareholderRow>
              rows={holders}
              onAdd={addHolder}
              onRemove={removeHolder}
              onUpdate={updateHolder}
              render={(row, update) => (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <TextField
                    label="Name"
                    value={row.name}
                    onChange={(v) => update({ name: v ?? "" })}
                  />
                  <NumberField
                    label="Ownership %"
                    value={row.pct ?? ""}
                    min={0}
                    onChange={(n) => update({ pct: n ?? null })}
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
        )}
      </div>

      {/* Share classes */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Share classes" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectField
            label="Structure"
            value={(sc?.structure as "ordinary" | "dual_class" | undefined) ?? undefined}
            options={["ordinary", "dual_class"] as const}
            onChange={(v) => {
              const structure = (v as "ordinary" | "dual_class" | undefined) ?? undefined;
              if (!structure) {
                onChange({ shareClasses: undefined }); // leave unselected
                return;
              }
              const base = sc ?? { classes: [], dualClassNotes: "" };
              onChange({ shareClasses: { ...base, structure } });
            }}
            allowEmpty
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
              onChange={(v) => patchShareClasses({ dualClassNotes: v ?? "" })}
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
          <RowList<ShareClassEntry>
            rows={sc?.classes ?? []}
            onAdd={addClassRow}
            onRemove={removeClassRow}
            onUpdate={patchClassRow}
            render={(row, update) => (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <TextField
                  label="Class name"
                  value={row.name}
                  onChange={(v) => update({ name: v ?? "" })}
                />
                <NumberField
                  label="Voting rights per share"
                  value={row.votingRightsPerShare ?? ""}
                  min={0}
                  onChange={(n) => update({ votingRightsPerShare: n ?? null })}
                />
                <TextField
                  label="Notes"
                  value={row.notes ?? ""}
                  onChange={(v) => update({ notes: v ?? "" })}
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
          {/* Control features as two checkboxes (tri-state: yes / no / cleared) */}
          <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
            <div className="mb-2 text-gray-700 font-medium">Control features present?</div>
            <div className="flex items-center gap-4">
              <LabeledCheckbox
                label="Yes"
                checked={cfYes}
                onChange={() => {
                  if (cfYes) {
                    // toggle off → undefined (cleared)
                    onChange({ controlFeatures: undefined });
                  } else {
                    // set yes; keep previous sub-flags if any else default false
                    onChange({
                      controlFeatures: {
                        hasControlFeatures: true,
                        hasGoldenShare: cf?.hasGoldenShare ?? false,
                        hasShareholderAgreements: cf?.hasShareholderAgreements ?? false,
                        description: cf?.description ?? "",
                      },
                    });
                  }
                }}
              />
              <LabeledCheckbox
                label="No"
                checked={cfNo}
                onChange={() => {
                  if (cfNo) {
                    // toggle off → undefined (cleared)
                    onChange({ controlFeatures: undefined });
                  } else {
                    // set no; hide sub-flags
                    onChange({
                      controlFeatures: {
                        hasControlFeatures: false,
                        description: cf?.description ?? "",
                      },
                    });
                  }
                }}
              />
            </div>
          </div>

          {/* When Yes → show sub-feature checkboxes + description */}
          {cfYes && (
            <div className="sm:col-span-2 rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
              <div className="mb-2 text-gray-700 font-medium">Types of control features</div>
              <div className="flex flex-wrap items-center gap-6">
                <LabeledCheckbox
                  label="Golden share"
                  checked={!!cf?.hasGoldenShare}
                  onChange={() =>
                    onChange({
                      controlFeatures: {
                        ...cf!,
                        hasControlFeatures: true,
                        hasGoldenShare: !cf?.hasGoldenShare,
                      },
                    })
                  }
                />
                <LabeledCheckbox
                  label="Shareholder agreements"
                  checked={!!cf?.hasShareholderAgreements}
                  onChange={() =>
                    onChange({
                      controlFeatures: {
                        ...cf!,
                        hasControlFeatures: true,
                        hasShareholderAgreements: !cf?.hasShareholderAgreements,
                      },
                    })
                  }
                />
              </div>

              <div className="mt-3">
                <TextField
                  label="Description"
                  value={cf?.description ?? ""}
                  onChange={(v) =>
                    onChange({
                      controlFeatures: {
                        ...cf!,
                        hasControlFeatures: true,
                        description: v ?? "",
                      },
                    })
                  }
                />
              </div>
            </div>
          )}
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
