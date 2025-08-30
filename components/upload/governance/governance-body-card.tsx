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

export type DirectorRow = {
  id?: string;
  fullName: string;
  role?: "chair" | "member" | "vice_chair" | "executive" | "non_executive";          // ⬅ allow empty
  independence?: "independent" | "non-independent";                                   // ⬅ allow empty
  gender?: "woman" | "man" | "undisclosed";                                            // already optional
  ageBand?: "<30" | "30–50" | ">50";                                                   // already optional
  nationality?: string;
  tenureYears?: number | null;
  appointedAt?: string; // ISO text
  committees?: Array<"audit" | "remuneration" | "nomination" | "esg">;                 // ⬅ allow empty
  meetingsHeld?: number | null;
  meetingsAttended?: number | null;
};

export type BoardEvaluationValue = {
  conducted?: "yes" | "no";                                                            // ⬅ allow empty
  type?: "internal" | "external";
  date?: string;
};

export type GovernanceBodyValue = {
  highestBodyName: string;
  chairCeoRoles?: "separate" | "combined";                                             // ⬅ allow empty
  directors: DirectorRow[];
  meetingsHeldTotal?: number | null;
  boardEvaluation?: BoardEvaluationValue;
};

type Props = {
  value: GovernanceBodyValue;
  onChange: (patch: Partial<GovernanceBodyValue>) => void;
  readOnly?: boolean;
};

/* ============================ Helpers ============================= */

const ROLES = ["chair", "member", "vice_chair", "executive", "non_executive"] as const;
const INDEP = ["independent", "non-independent"] as const;
const GENDER = ["woman", "man", "undisclosed"] as const;
const AGE = ["<30", "30–50", ">50"] as const;
const CHAIRSPLIT = ["separate", "combined"] as const;
const COMMITTEES = ["audit", "remuneration", "nomination", "esg"] as const;

function toNum(n: unknown) {
  if (n == null) return 0;
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}
function toNumOrNull(n: unknown) {
  if (n == null) return null;
  const v = Number(n);
  return Number.isFinite(v) ? v : null;
}
function fmtPct(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(1)}%`;
}
function mean(nums: number[]) {
  if (!nums.length) return null;
  const s = nums.reduce((a, b) => a + b, 0);
  return s / nums.length;
}
function median(nums: number[]) {
  if (!nums.length) return null;
  const a = [...nums].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function DateField({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  readOnly?: boolean;
}) {
  // ensure the input always receives either "" or YYYY-MM-DD
  const v =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)
      ? value.slice(0, 10)
      : "";
  return (
    <label className="block">
      <div className="mb-1 text-sm text-gray-700">{label}</div>
      <input
        type="date"
        value={v}
        onChange={(e) => {
          const next = e.target.value; // already YYYY-MM-DD or ""
          onChange(next ? next : undefined);
        }}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
        disabled={readOnly}
      />
    </label>
  );
}


/* ============================ Component ============================ */

export function GovernanceBodyCard({ value, onChange }: Props) {
  const directors = value.directors ?? [];
  const totalMeetings = value.meetingsHeldTotal ?? null;

  /* -------- Derived metrics -------- */
  const boardSize = directors.length;

  const independentCount = useMemo(
    () => directors.filter((d) => d.independence === "independent").length,
    [directors]
  );
  const womenCount = useMemo(
    () => directors.filter((d) => d.gender === "woman").length,
    [directors]
  );

  const independentPct = boardSize ? (independentCount / boardSize) * 100 : null;
  const womenPct = boardSize ? (womenCount / boardSize) * 100 : null;

  const tenureNumbers = useMemo(
    () =>
      directors
        .map((d) => toNumOrNull(d.tenureYears))
        .filter((n): n is number => Number.isFinite(n as number) && (n as number) >= 0),
    [directors]
  );
  const tenureAvg = mean(tenureNumbers);
  const tenureMed = median(tenureNumbers);

  // Attendance overall
  const attendanceOverallPct = useMemo(() => {
    let sumHeld = 0;
    let sumAtt = 0;
    directors.forEach((d) => {
      const held =
        d.meetingsHeld != null ? toNum(d.meetingsHeld) : toNum(totalMeetings);
      const att = d.meetingsAttended != null ? toNum(d.meetingsAttended) : 0;
      if (held > 0) {
        sumHeld += held;
        sumAtt += Math.min(att, held);
      }
    });
    if (sumHeld <= 0) return null;
    return (sumAtt / sumHeld) * 100;
  }, [directors, totalMeetings]);

  const chairCeoSplitFlag = value.chairCeoRoles === "separate";

  const committeeCoverage = useMemo(() => {
    const set = new Set<string>();
    directors.forEach((d) => (d.committees ?? []).forEach((c) => set.add(c)));
    return {
      audit: set.has("audit"),
      remuneration: set.has("remuneration"),
      nomination: set.has("nomination"),
      esg: set.has("esg"),
    };
  }, [directors]);

  /* -------- RowList handlers -------- */
  const addDirector = () =>
    onChange({
      directors: [
        ...directors,
        {
          id: uid(),
          fullName: "",
          // ⬇️ start all selects empty (undefined)
          role: undefined,
          independence: undefined,
          gender: undefined,
          ageBand: undefined,
          nationality: "",
          tenureYears: null,
          appointedAt: "",
          committees: undefined, // empty means no chips checked yet
          meetingsHeld: null,
          meetingsAttended: null,
        },
      ],
    });

  const updateDirector = (i: number, patch: Partial<DirectorRow>) => {
    const next = directors.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    onChange({ directors: next });
  };

  const removeDirector = (i: number) => {
    const next = directors.slice();
    next.splice(i, 1);
    onChange({ directors: next });
  };

  /* -------- Evaluation helpers -------- */
  const evalVal: BoardEvaluationValue = value.boardEvaluation ?? {};
  const evalNeedsType = evalVal.conducted === "yes" && !evalVal.type;
  const evalNeedsDate = evalVal.conducted === "yes" && !evalVal.date?.trim();

  /* -------- Simple per-row validation flags -------- */
  const rowAttnHint = (row: DirectorRow): string | undefined => {
    const held =
      row.meetingsHeld != null ? toNum(row.meetingsHeld) : toNum(totalMeetings);
    const att = row.meetingsAttended != null ? toNum(row.meetingsAttended) : 0;
    if (held > 0 && att > held) return "Attended cannot exceed Held";
    return undefined;
  };

  /* ============================ Render ============================ */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-lg font-semibold text-transparent">
          Governance Body & Composition
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Define the highest governance body, list directors, capture meetings and evaluation, and see composition metrics.
        </p>
      </div>

      {/* Body info */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Body & period" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <TextField
            label="Highest governance body"
            value={value.highestBodyName ?? ""}
            onChange={(v) => onChange({ highestBodyName: v ?? "" })}
            placeholder="Board of Directors"
          />
          <SelectField
            label="Chair & CEO roles"
            value={value.chairCeoRoles ?? undefined}        // ⬅ empty when undefined
            options={CHAIRSPLIT as unknown as readonly string[]}
            onChange={(v) =>
              onChange({
                chairCeoRoles: (v as "separate" | "combined" | undefined) ?? undefined,
              })
            }
            allowEmpty                                         // ⬅ allow clearing
          />
          <NumberField
            label="Meetings held (period)"
            value={value.meetingsHeldTotal ?? ""}
            min={0}
            onChange={(n) => onChange({ meetingsHeldTotal: n ?? null })}
          />
        </div>
      </div>

      {/* Directors list */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Directors" />
        <RowList
          rows={directors}
          onAdd={() => addDirector()}
          onRemove={(i) => removeDirector(i)}
          onUpdate={(i, patch) => updateDirector(i, patch)}
          render={(row, update) => {
            const hint = rowAttnHint(row);
            const committees = new Set(row.committees ?? []);
            const setCommittee = (key: (typeof COMMITTEES)[number], on: boolean) => {
              const next = new Set(committees);
              if (on) next.add(key);
              else next.delete(key);
              // ⬇️ if empty, set undefined (keeps “no committees selected” truly empty)
              const arr = Array.from(next) as DirectorRow["committees"];
              update({ committees: arr!.length ? arr! : undefined });
            };

            return (
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-3">
                <TextField
                  label="Full name"
                  value={row.fullName}
                  onChange={(v) => update({ fullName: v ?? "" })}
                />
                <SelectField
                  label="Role"
                  value={row.role ?? undefined}
                  options={ROLES as unknown as readonly string[]}
                  onChange={(v) => update({ role: (v as DirectorRow["role"] | undefined) ?? undefined })}
                  allowEmpty
                />
                <SelectField
                  label="Independence"
                  value={row.independence ?? undefined}
                  options={INDEP as unknown as readonly string[]}
                  onChange={(v) =>
                    update({
                      independence: (v as DirectorRow["independence"] | undefined) ?? undefined,
                    })
                  }
                  allowEmpty
                />
                <SelectField
                  label="Gender"
                  value={row.gender ?? undefined}
                  options={GENDER as unknown as readonly string[]}
                  onChange={(v) => update({ gender: (v as DirectorRow["gender"] | undefined) ?? undefined })}
                  allowEmpty
                />
                <SelectField
                  label="Age band"
                  value={row.ageBand ?? undefined}
                  options={AGE as unknown as readonly string[]}
                  onChange={(v) => update({ ageBand: (v as DirectorRow["ageBand"] | undefined) ?? undefined })}
                  allowEmpty
                />
                <TextField
                  label="Nationality (optional)"
                  value={row.nationality ?? ""}
                  onChange={(v) => update({ nationality: v ?? "" })}
                />

                <NumberField
                  label="Tenure (years)"
                  value={row.tenureYears ?? ""}
                  min={0}
                  onChange={(n) => update({ tenureYears: n ?? null })}
                />
                <DateField
                  label="Appointment date"
                  value={row.appointedAt}
                  onChange={(v) => update({ appointedAt: v })}
                />


                {/* Committees checkboxes */}
                <div className="lg:col-span-3">
                  <div className="text-xs text-gray-700 mb-1">Committees</div>
                  <div className="flex flex-wrap gap-3">
                    {COMMITTEES.map((c) => {
                      const checked = committees.has(c);
                      const label =
                        c === "esg"
                          ? "ESG/Sustainability"
                          : c.charAt(0).toUpperCase() + c.slice(1);
                      return (
                        <label
                          key={c}
                          className="inline-flex items-center gap-2 text-sm text-gray-800"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={checked}
                            onChange={(e) => setCommittee(c, e.target.checked)}
                          />
                          {label}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <NumberField
                  label="Meetings held (dir.)"
                  value={row.meetingsHeld ?? ""}
                  min={0}
                  onChange={(n) => update({ meetingsHeld: n ?? null })}
                  hint={!row.meetingsHeld ? "Falls back to period total" : undefined}
                />
                <NumberField
                  label="Meetings attended"
                  value={row.meetingsAttended ?? ""}
                  min={0}
                  onChange={(n) => update({ meetingsAttended: n ?? null })}
                  hint={hint}
                />

                {/* Row chips */}
                <div className="lg:col-span-2 flex items-end">
                  <div className="w-full rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
                    <div className="flex flex-wrap gap-2">
                      <Chip
                        label="Independent"
                        value={row.independence === "independent" ? "Yes" : row.independence === "non-independent" ? "No" : "—"}
                      />
                      <Chip label="Gender" value={row.gender ?? "—"} />
                      <Chip
                        label="Committees"
                        value={String((row.committees ?? []).length)}
                      />
                    </div>
                  </div>
                </div>
              </div>

            );
          }}
        />
      </div>

      {/* Evaluation */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Board evaluation" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectField
            label="Conducted?"
            value={evalVal.conducted ?? undefined}                 // ⬅ empty until chosen
            options={["yes", "no"]}
            onChange={(v) =>
              onChange({
                boardEvaluation: {
                  conducted: (v as "yes" | "no" | undefined) ?? undefined,
                  type: evalVal.type,
                  date: evalVal.date,
                },
              })
            }
            allowEmpty
          />
          <SelectField
            label="Type"
            value={evalVal.type ?? undefined}                      // ⬅ empty until chosen
            options={["internal", "external"]}
            onChange={(v) =>
              onChange({
                boardEvaluation: {
                  conducted: evalVal.conducted,
                  type: (v as "internal" | "external" | undefined) ?? undefined,
                  date: evalVal.date,
                },
              })
            }
            allowEmpty
          />
          <DateField
            label="Date"
            value={evalVal.date}
            onChange={(v) =>
              onChange({
                boardEvaluation: {
                  conducted: evalVal.conducted,
                  type: evalVal.type,
                  date: v, 
                },
              })
            }
          />

        </div>
        {evalVal.conducted === "yes" && (evalNeedsType || evalNeedsDate) && (
          <p className="mt-2 text-xs text-red-600">
            When an evaluation is conducted, please provide the type and date.
          </p>
        )}
      </div>

      {/* Summary metrics */}
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <div className="flex flex-wrap gap-2">
          <Chip label="Board size" value={String(boardSize)} />
          <Chip label="Independent" value={fmtPct(independentPct)} />
          <Chip label="Women" value={fmtPct(womenPct)} />
          <Chip label="Tenure avg" value={tenureAvg == null ? "—" : tenureAvg.toFixed(1)} />
          <Chip label="Tenure median" value={tenureMed == null ? "—" : tenureMed.toFixed(1)} />
          <Chip label="Attendance overall" value={fmtPct(attendanceOverallPct)} />
          <Chip label="Chair/CEO split" value={chairCeoSplitFlag ? "Yes" : "No"} />
          <Chip label="Audit" value={committeeCoverage.audit ? "✓" : "—"} />
          <Chip label="Remuneration" value={committeeCoverage.remuneration ? "✓" : "—"} />
          <Chip label="Nomination" value={committeeCoverage.nomination ? "✓" : "—"} />
          <Chip
            label="ESG/Sustainability"
            value={committeeCoverage.esg ? "✓" : "—"}
          />
        </div>
      </div>

      <Divider />
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <span className="text-gray-700">
          <u>Attendance</u>: uses director-level “held” if provided, else the period total.
          Computed as Σ attended ÷ Σ held × 100.
        </span>
      </div>
    </div>
  );
}
