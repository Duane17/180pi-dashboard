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

/* ============================== Types ============================== */

export type CommitteeKey = "audit" | "remuneration" | "nomination" | "esg";

export type AttendanceRow = {
  directorId: string;
  attended: number | null;
  held?: number | null; // falls back to committee.meetingsHeld
};

export type OneCommitteeValue = {
  exists: boolean;
  chairId?: string;
  memberIds?: string[];
  independenceMajority?: "yes" | "no" | null;
  meetingsHeld?: number | null;
  responsibilities?: string;
  attendance?: AttendanceRow[];
};

export type CommitteesValue = Record<CommitteeKey, OneCommitteeValue>;

export type DirectorMini = { id: string; name: string; independence?: "independent" | "non-independent" };

type Props = {
  value: CommitteesValue;
  onChange: (patch: Partial<CommitteesValue>) => void;
  directors: DirectorMini[]; // from governance.body.directors
  readOnly?: boolean;
};

/* ============================== Constants ============================== */

const COMMITTEE_KEYS: CommitteeKey[] = ["audit", "remuneration", "nomination", "esg"];
const YES_NO_NULL = ["", "yes", "no"] as const;

/* ============================== Helpers ============================== */
function toNum(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}
function fmtPct(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(1)}%`;
}

/** Build select options & maps: labels are stable as "Name — id••••" to avoid pure-name ambiguity */
function buildDirectorLabel(d: DirectorMini) {
  const suffix = d.id?.slice(-4) ?? "????";
  return `${d.name || "(unnamed)"} — id•${suffix}`;
}

function makeDirectorMaps(directors: DirectorMini[]) {
  const labelById = new Map<string, string>();
  const idByLabel = new Map<string, string>();
  directors.forEach((d) => {
    const label = buildDirectorLabel(d);
    labelById.set(d.id, label);
    idByLabel.set(label, d.id);
  });
  return { labelById, idByLabel, options: Array.from(idByLabel.keys()) as readonly string[] };
}

/** Overall attendance % for a committee using attendance rows */
function computeAttendancePct(rows: AttendanceRow[] | undefined, fallbackHeld: number | null | undefined) {
  if (!rows?.length) return null;
  let sumHeld = 0;
  let sumAtt = 0;
  rows.forEach((r) => {
    const held = r.held != null ? toNum(r.held) : toNum(fallbackHeld);
    const att = r.attended != null ? toNum(r.attended) : 0;
    if (held > 0) {
      sumHeld += held;
      sumAtt += Math.min(att, held);
    }
  });
  if (sumHeld <= 0) return null;
  return (sumAtt / sumHeld) * 100;
}

/* ============================== Component ============================== */

export function CommitteesCard({ value, onChange, directors }: Props) {
  const { labelById, idByLabel, options } = useMemo(
    () => makeDirectorMaps(directors ?? []),
    [directors]
  );

  const patchCommittee = (key: CommitteeKey, patch: Partial<OneCommitteeValue>) => {
    const next: CommitteesValue = {
      ...value,
      [key]: { ...(value[key] as OneCommitteeValue), ...patch },
    };
    onChange(next);
  };

  const toggleExists = (key: CommitteeKey, exists: boolean) => {
    if (!exists) {
      // When turning off, keep the object but blank optional fields
      patchCommittee(key, {
        exists: false,
        chairId: undefined,
        memberIds: [],
        independenceMajority: null,
        responsibilities: "",
        meetingsHeld: null,
        attendance: [],
      });
    } else {
      patchCommittee(key, { exists: true });
    }
  };

  const renderCommittee = (key: CommitteeKey, title: string) => {
    const c = value[key] ?? { exists: false } as OneCommitteeValue;
    const members = new Set(c.memberIds ?? []);
    const attendance = c.attendance ?? [];

    // Derived
    const overallPct = computeAttendancePct(attendance, c.meetingsHeld);
    const hasChair = !!c.chairId;
    const hasMembers = (c.memberIds?.length ?? 0) > 0;
    const softHint = c.exists && (!hasChair || !hasMembers);

    return (
      <details className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40" open>
        <summary className="cursor-pointer select-none list-none">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-medium text-gray-900">{title}</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <Chip label="Exists" value={c.exists ? "Yes" : "No"} />
              <Chip label="Attendance" value={fmtPct(overallPct)} />
              <Chip label="Indep. majority" value={c.independenceMajority ?? "—"} />
            </div>
          </div>
        </summary>

        <div className="mt-4 space-y-4">
          <SectionHeader title="Status & basics" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Exists toggle via SelectField yes/no to keep UI primitives simple */}
            <SelectField
              label="Committee exists?"
              value={c.exists ? "yes" : "no"}
              options={["yes", "no"]}
              onChange={(v) => toggleExists(key, v === "yes")}
            />
            <SelectField
              label="Independence majority"
              value={(c.independenceMajority ?? "") as any}
              options={YES_NO_NULL as unknown as readonly string[]}
              onChange={(v) =>
                patchCommittee(key, {
                  independenceMajority: (v as "yes" | "no") || null,
                })
              }
            />
            <NumberField
              label="Meetings held (period)"
              value={c.meetingsHeld ?? ""}
              min={0}
              onChange={(n) => patchCommittee(key, { meetingsHeld: n ?? null })}
            />
          </div>

          <SectionHeader title="Chair & members" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SelectField
              label="Chair (director)"
              value={c.chairId ? (labelById.get(c.chairId) ?? "") : ""}
              options={options}
              onChange={(label) =>
                patchCommittee(key, { chairId: label ? idByLabel.get(label as string) : undefined })
              }
            />
            {/* Members as a grid of checkboxes (uses the same label mapping) */}
            <div className="sm:col-span-2">
              <div className="text-xs text-gray-700 mb-1">Members</div>
              <div className="flex flex-wrap gap-3">
                {directors.map((d) => {
                  const id = d.id;
                  const label = labelById.get(id) ?? d.name;
                  const checked = members.has(id);
                  return (
                    <label key={id} className="inline-flex items-center gap-2 text-sm text-gray-800">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={checked}
                        onChange={(e) => {
                          const next = new Set(members);
                          if (e.target.checked) next.add(id);
                          else next.delete(id);
                          patchCommittee(key, { memberIds: Array.from(next) });
                        }}
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {softHint && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
              Tip: when a committee exists, select a Chair and at least one Member.
            </p>
          )}

          <SectionHeader title="Responsibilities (short)" />
          <TextField
            label="Description"
            value={c.responsibilities ?? ""}
            onChange={(v) => patchCommittee(key, { responsibilities: v ?? "" })}
            placeholder="Key remit (e.g., financial reporting, risk oversight)"
          />

          <Divider />

          <SectionHeader title="Attendance" />
          <p className="text-xs text-gray-600">
            Use “Held (row)” to override the period Meetings held; otherwise the overall number is used. Attended must not exceed Held.
          </p>
          <RowList
            rows={attendance}
            onAdd={() =>
              patchCommittee(key, {
                attendance: [
                  ...attendance,
                  { directorId: directors[0]?.id ?? "", attended: null, held: null },
                ],
              })
            }
            onRemove={(i) => {
              const next = attendance.slice();
              next.splice(i, 1);
              patchCommittee(key, { attendance: next });
            }}
            onUpdate={(i, patch) => {
              const next = attendance.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
              patchCommittee(key, { attendance: next });
            }}
            render={(row, update) => {
              // Validate attended ≤ held (with fallback)
              const heldEff =
                row.held != null && Number.isFinite(Number(row.held))
                  ? toNum(row.held)
                  : toNum(c.meetingsHeld);
              const att = row.attended != null ? toNum(row.attended) : 0;
              const hint =
                heldEff > 0 && att > heldEff ? "Attended cannot exceed Held" : undefined;

              return (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <SelectField
                    label="Director"
                    value={labelById.get(row.directorId) ?? ""}
                    options={options}
                    onChange={(label) =>
                      update({ directorId: label ? (idByLabel.get(label as string) ?? "") : "" })
                    }
                  />
                  <NumberField
                    label="Attended"
                    value={row.attended ?? ""}
                    min={0}
                    onChange={(n) => update({ attended: n ?? null })}
                  />
                  <NumberField
                    label="Held (row, optional)"
                    value={row.held ?? ""}
                    min={0}
                    onChange={(n) => update({ held: n ?? null })}
                    hint={!row.held ? "Falls back to Meetings held" : undefined}
                  />
                  <div className="flex items-end">
                    <div className="w-full rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
                      <Chip
                        label="Row %"
                        value={fmtPct(
                          heldEff > 0 ? Math.min(att, heldEff) / heldEff * 100 : null
                        )}
                      />
                      {hint ? (
                        <div className="mt-1 text-[11px] text-red-600">{hint}</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            }}
          />

          {/* Footer chips */}
          <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
            <div className="flex flex-wrap gap-2">
              <Chip label="Overall attendance" value={fmtPct(overallPct)} />
              <Chip label="Chair set" value={hasChair ? "Yes" : "No"} />
              <Chip label="Members" value={String(c.memberIds?.length ?? 0)} />
            </div>
          </div>
        </div>
      </details>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-lg font-semibold text-transparent">
          Committees
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Define Audit, Remuneration, Nomination, and ESG committees. Link directors, set independence and meetings, and track attendance.
        </p>
      </div>

      {renderCommittee("audit", "Audit Committee")}
      {renderCommittee("remuneration", "Remuneration Committee")}
      {renderCommittee("nomination", "Nomination Committee")}
      {renderCommittee("esg", "ESG / Sustainability Committee")}

      <Divider />
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <span className="text-gray-700">
          <u>Note</u>: Independence majority is recorded as entered. Attendance overall is Σattended ÷ Σheld (row-level held falls back to committee Meetings held).
        </span>
      </div>
    </div>
  );
}
