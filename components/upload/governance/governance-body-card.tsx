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
  role: "chair" | "member" | "vice_chair" | "executive" | "non_executive";
  independence: "independent" | "non-independent";
  gender?: "woman" | "man" | "undisclosed";
  ageBand?: "<30" | "30–50" | ">50";
  nationality?: string;
  tenureYears?: number | null;
  appointedAt?: string; // ISO text
  committees?: Array<"audit" | "remuneration" | "nomination" | "esg">;
  meetingsHeld?: number | null;     // optional per-director override
  meetingsAttended?: number | null; // optional per-director
};

export type BoardEvaluationValue = {
  conducted: "yes" | "no";
  type?: "internal" | "external";
  date?: string;
};

export type GovernanceBodyValue = {
  highestBodyName: string;
  chairCeoRoles: "separate" | "combined";
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
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
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
        .map((d) => (d.tenureYears == null ? null : Number(d.tenureYears)))
        .filter((n): n is number => Number.isFinite(n) && n! >= 0),
    [directors]
  );
  const tenureAvg = mean(tenureNumbers);
  const tenureMed = median(tenureNumbers);

  // Attendance overall: per director use their held if present, else meetingsHeldTotal
  const attendanceOverallPct = useMemo(() => {
    let sumHeld = 0;
    let sumAtt = 0;
    directors.forEach((d) => {
      const held = d.meetingsHeld != null ? toNum(d.meetingsHeld) : toNum(totalMeetings);
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
          role: "member",
          independence: "non-independent",
          gender: "undisclosed",
          ageBand: undefined,
          nationality: "",
          tenureYears: null,
          appointedAt: "",
          committees: [],
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
  const evalVal = value.boardEvaluation ?? { conducted: "no" as const };
  const evalNeedsType = evalVal.conducted === "yes" && !evalVal.type;
  const evalNeedsDate = evalVal.conducted === "yes" && !evalVal.date?.trim();

  /* -------- Simple per-row validation flags -------- */
  const rowAttnHint = (row: DirectorRow): string | undefined => {
    const held = row.meetingsHeld != null ? toNum(row.meetingsHeld) : toNum(totalMeetings);
    const att = row.meetingsAttended != null ? toNum(row.meetingsAttended) : 0;
    if (held > 0 && att > held) return "Attended cannot exceed Held";
    return undefined;
    // (hard validation lives in Zod; this is just UX)
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

      {/* Highest body + chair/CEO roles + meetings total */}
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
            value={value.chairCeoRoles}
            options={CHAIRSPLIT as unknown as readonly string[]}
            onChange={(v) =>
              onChange({
                chairCeoRoles: (v as "separate" | "combined") || "separate",
              })
            }
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
              update({ committees: Array.from(next) as DirectorRow["committees"] });
            };

            return (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                <TextField
                  label="Full name"
                  value={row.fullName}
                  onChange={(v) => update({ fullName: v ?? "" })}
                />
                <SelectField
                  label="Role"
                  value={row.role}
                  options={ROLES as unknown as readonly string[]}
                  onChange={(v) => update({ role: (v as DirectorRow["role"]) || "member" })}
                />
                <SelectField
                  label="Independence"
                  value={row.independence}
                  options={INDEP as unknown as readonly string[]}
                  onChange={(v) =>
                    update({
                      independence:
                        (v as DirectorRow["independence"]) || "non-independent",
                    })
                  }
                />
                <SelectField
                  label="Gender"
                  value={row.gender ?? "undisclosed"}
                  options={GENDER as unknown as readonly string[]}
                  onChange={(v) =>
                    update({ gender: (v as DirectorRow["gender"]) || "undisclosed" })
                  }
                />
                <SelectField
                  label="Age band"
                  value={row.ageBand ?? ""}
                  options={AGE as unknown as readonly string[]}
                  onChange={(v) => update({ ageBand: (v as DirectorRow["ageBand"]) || undefined })}
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
                <TextField
                  label="Appointment date (ISO)"
                  value={row.appointedAt ?? ""}
                  onChange={(v) => update({ appointedAt: v ?? "" })}
                  placeholder="YYYY-MM-DD"
                />

                {/* Committees checkboxes */}
                <div className="sm:col-span-3">
                  <div className="text-xs text-gray-700 mb-1">Committees</div>
                  <div className="flex flex-wrap gap-3">
                    {COMMITTEES.map((c) => {
                      const checked = committees.has(c);
                      return (
                        <label key={c} className="inline-flex items-center gap-2 text-sm text-gray-800">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={checked}
                            onChange={(e) => setCommittee(c, e.target.checked)}
                          />
                          {c}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Meetings per-director */}
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
                <div className="sm:col-span-2 flex items-end">
                  <div className="w-full rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
                    <div className="flex flex-wrap gap-2">
                      <Chip label="Indep." value={row.independence === "independent" ? "Yes" : "No"} />
                      <Chip label="Gender" value={row.gender ?? "—"} />
                      <Chip label="Committees" value={(row.committees ?? []).length.toString()} />
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
            value={evalVal.conducted}
            options={["yes", "no"]}
            onChange={(v) =>
              onChange({
                boardEvaluation: {
                  conducted: (v as "yes" | "no") || "no",
                  type: evalVal.type,
                  date: evalVal.date,
                },
              })
            }
          />
          <SelectField
            label="Type"
            value={evalVal.type ?? ""}
            options={["internal", "external"]}
            onChange={(v) =>
              onChange({
                boardEvaluation: {
                  conducted: evalVal.conducted,
                  type: (v as "internal" | "external") || undefined,
                  date: evalVal.date,
                },
              })
            }
          />
          <TextField
            label="Date (ISO)"
            value={evalVal.date ?? ""}
            onChange={(v) =>
              onChange({
                boardEvaluation: {
                  conducted: evalVal.conducted,
                  type: evalVal.type,
                  date: v ?? "",
                },
              })
            }
            placeholder="YYYY-MM-DD"
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
          <Chip label="ESG" value={committeeCoverage.esg ? "✓" : "—"} />
        </div>
      </div>

      <Divider />
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <span className="text-gray-700">
          <u>Attendance</u>: uses director-level “held” if provided, else the period total. Computed as Σ attended ÷ Σ held × 100.
        </span>
      </div>
    </div>
  );
}
