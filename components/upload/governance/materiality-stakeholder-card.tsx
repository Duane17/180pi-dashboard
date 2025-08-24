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
import { Chip } from "@/components/upload/social/ui/chip";

/* ============================== Types ============================== */

export type YesNoPlanned = "yes" | "no" | "planned";

export type StakeholderKey =
  | "employees"
  | "customers"
  | "suppliers"
  | "communities"
  | "investors"
  | "regulators"
  | "other";

export type Assessment = {
  done?: YesNoPlanned;
  method?: string;
  date?: string;
};

export type CriticalConcernsComms = {
  how: string;                 // free text
  frequency: string;           // free text (e.g., quarterly, ad hoc)
  countToBoard?: number | null;
};

export type MaterialityValue = {
  assessment: Assessment;
  stakeholderGroups: StakeholderKey[];
  otherStakeholderText?: string;
  topMaterialTopics: string[]; // tags
  criticalConcernsComms: CriticalConcernsComms;
};

type Props = {
  value: MaterialityValue;
  onChange: (patch: Partial<MaterialityValue>) => void;
  readOnly?: boolean;
};

/* ============================== Constants & helpers ============================== */

const DONE_OPTS: readonly YesNoPlanned[] = ["yes", "no", "planned"];

const FREQ_OPTS = ["every meeting", "quarterly", "ad hoc"] as const;


// Method presets come from the previous "placeholder" examples, plus an explicit "Other"
const METHOD_PRESETS = ["Double materiality screening", "Stakeholder survey"] as const;
type MethodPreset = typeof METHOD_PRESETS[number];
const METHOD_OPTS: readonly (MethodPreset | "Other")[] = [
  ...METHOD_PRESETS,
  "Other",
];

const STAKEHOLDERS: ReadonlyArray<{ key: StakeholderKey; label: string }> = [
  { key: "employees",   label: "Employees" },
  { key: "customers",   label: "Customers" },
  { key: "suppliers",   label: "Suppliers" },
  { key: "communities", label: "Communities" },
  { key: "investors",   label: "Investors" },
  { key: "regulators",  label: "Regulators" },
  { key: "other",       label: "Other" },
] as const;

function isSelected(arr: StakeholderKey[], k: StakeholderKey) {
  return arr.includes(k);
}
function toggle(arr: StakeholderKey[], k: StakeholderKey): StakeholderKey[] {
  return isSelected(arr, k) ? arr.filter((x) => x !== k) : [...arr, k];
}
function fmtStatus(done?: YesNoPlanned): "done" | "planned" | "not_done" {
  if (done === "yes") return "done";
  if (done === "planned") return "planned";
  return "not_done";
}

/* Small pill toggle that matches the frosted/glass look */
function PillToggle({
  active,
  label,
  onClick,
  disabled,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-full border px-3 py-1 text-xs transition backdrop-blur",
        active
          ? "border-transparent text-white shadow"
          : "border-gray-300/70 bg-white/70 text-gray-800 hover:bg-white/80",
      ].join(" ")}
      style={
        active
          ? {
              background:
                "linear-gradient(90deg, #3270a1 0%, #7e509c 50%, #8dcddb 100%)",
            }
          : undefined
      }
    >
      {label}
    </button>
  );
}

/* ============================== Component ============================== */

export function MaterialityStakeholderCard({ value, onChange, readOnly }: Props) {
  const assessment = value.assessment ?? {};
  const stakeholders = value.stakeholderGroups ?? [];
  const topics = value.topMaterialTopics ?? [];
  const comms = value.criticalConcernsComms ?? { how: "", frequency: "", countToBoard: null };

  // Derived
  const stakeholderGroupsCount = stakeholders.length;
  const materialityStatus = useMemo(() => fmtStatus(assessment.done), [assessment.done]);

  const needsOtherText =
    stakeholders.includes("other") && !(value.otherStakeholderText ?? "").trim();

  // --- Method preset/other derive ---
  const methodStr = (assessment.method ?? "").trim();
  const isPreset = (METHOD_PRESETS as readonly string[]).includes(methodStr);
  const methodSelectValue: MethodPreset | "Other" | undefined =
    isPreset ? (methodStr as MethodPreset) : methodStr ? "Other" : undefined;
  const showMethodOther = methodSelectValue === "Other";

  // Handlers
  const patchAssessment = (p: Partial<Assessment>) =>
    onChange({ assessment: { ...assessment, ...p } });

  const toggleStakeholder = (k: StakeholderKey) => {
    if (readOnly) return;
    onChange({ stakeholderGroups: toggle(stakeholders, k) });
  };

  const addTopic = () =>
    onChange({ topMaterialTopics: [...topics, " "] });

  const updateTopic = (i: number, nextText: string) => {
    const next = topics.map((t, idx) => (idx === i ? nextText : t));
    onChange({ topMaterialTopics: next });
  };

  const removeTopic = (i: number) => {
    const next = topics.slice();
    next.splice(i, 1);
    onChange({ topMaterialTopics: next });
  };

  const patchComms = (p: Partial<CriticalConcernsComms>) =>
    onChange({ criticalConcernsComms: { ...comms, ...p } });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-lg font-semibold text-transparent">
          Materiality & Stakeholder Engagement
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Record the status of your materiality assessment, the stakeholder groups engaged, your top
          material topics, and how critical concerns are communicated.
        </p>
      </div>

      {/* Assessment */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Materiality assessment" />
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {/* Status (default-to-empty) */}
          <SelectField
            label="Assessment status"
            value={assessment.done ?? undefined}
            options={DONE_OPTS as unknown as readonly string[]}
            onChange={(v) =>
              patchAssessment({ done: (v as YesNoPlanned | undefined) ?? undefined })
            }
            allowEmpty
          />

          {/* Method preset selector */}
          <SelectField
            label="Method"
            value={methodSelectValue ?? undefined}
            options={METHOD_OPTS as unknown as readonly string[]}
            onChange={(v) => {
              const sel = v as MethodPreset | "Other" | undefined;
              if (!sel) {
                // cleared
                patchAssessment({ method: "" });
              } else if (sel === "Other") {
                // keep existing custom text if present, else blank
                patchAssessment({ method: isPreset ? "" : methodStr });
              } else {
                // preset chosen
                patchAssessment({ method: sel });
              }
            }}
            allowEmpty
          />

          {/* Date picker */}
          <div>
            <label className="block text-sm text-gray-800 mb-1">Date</label>
            <input
              type="date"
              className="block w-full rounded-lg border border-gray-300/70 bg-white/70 px-3 py-2 text-sm text-gray-800 shadow-sm backdrop-blur focus:outline-none"
              value={assessment.date ?? ""}
              onChange={(e) => patchAssessment({ date: e.target.value ?? "" })}
              disabled={readOnly}
            />
          </div>
        </div>

        {/* Method other free text */}
        {showMethodOther && (
          <div className="mt-3 grid grid-cols-1 sm:max-w-xl">
            <TextField
              label="Method (other)"
              value={assessment.method ?? ""}
              onChange={(v) => patchAssessment({ method: v ?? "" })}
              placeholder="e.g., regulatory scoping, expert workshops"
            />
          </div>
        )}

        {/* Derived status */}
        <div className="mt-3 rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
          <div className="flex flex-wrap items-center gap-2">
            <Chip label="Materiality status" value={materialityStatus.replace("_", " ")} />
          </div>
        </div>
      </div>

      {/* Stakeholder groups */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Stakeholder groups engaged" />
        <div className="mt-3 flex flex-wrap gap-2">
          {STAKEHOLDERS.map((s) => (
            <PillToggle
              key={s.key}
              active={isSelected(stakeholders, s.key)}
              label={s.label}
              onClick={() => toggleStakeholder(s.key)}
              disabled={readOnly}
            />
          ))}
        </div>

        {/* Other text when “other” selected */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:max-w-xl">
          <TextField
            label="If 'Other', specify"
            value={value.otherStakeholderText ?? ""}
            onChange={(v) => onChange({ otherStakeholderText: v ?? "" })}
            placeholder="e.g., NGOs, media, academia"
          />
          {needsOtherText && (
            <p className="text-xs text-red-600">Please specify the “Other” stakeholder group.</p>
          )}
        </div>

        {/* Derived count */}
        <div className="mt-3 rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
          <Chip label="# groups engaged" value={`${stakeholderGroupsCount}`} />
        </div>
      </div>

      {/* Top material topics (tags) */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Top material topics" />
        <p className="mt-1 text-xs text-gray-600">
          Add topics as short tags (e.g., Climate risk, Data privacy, Human capital).
        </p>

        <RowList<string>
          rows={topics}
          onAdd={addTopic}
          onRemove={removeTopic}
          onUpdate={(i, next) => updateTopic(i, typeof next === "string" ? next : "")}
          render={(row, update) => (
            <div className="grid grid-cols-1 gap-3 sm:max-w-xl">
              <TextField
                label="Topic"
                value={row}
                onChange={(v) => update(v ?? "")}
                placeholder="Type a topic"
              />
            </div>
          )}
        />
      </div>

      {/* Critical concerns comms */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Communication of critical concerns" />

        {/* First row */}
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <TextField
            label="How"
            value={comms.how ?? ""}
            onChange={(v) => patchComms({ how: v ?? "" })}
            placeholder="e.g., formal board papers, whistleblowing reports"
          />
          <SelectField
            label="Frequency"
            value={
              comms.frequency && FREQ_OPTS.includes(comms.frequency as any)
                ? (comms.frequency as string)
                : undefined
            }
            options={FREQ_OPTS as unknown as readonly string[]}
            onChange={(v) => patchComms({ frequency: (v as string | undefined) ?? "" })}
            allowEmpty
          />
        </div>

        {/* Second row */}
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <NumberField
            label="Communications to board (count)"
            value={comms.countToBoard ?? ""}
            min={0}
            onChange={(n) => patchComms({ countToBoard: n ?? null })}
          />
          <div className="flex items-end">
            <div className="w-full rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
              <div className="flex flex-wrap gap-2">
                <Chip label="Recorded" value={comms.countToBoard != null ? "yes" : "no"} />
                <Chip label="Freq." value={comms.frequency || "—"} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Divider />
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <span className="text-gray-700">
          <u>Validation</u>: If “Other” stakeholder group is selected, please provide a short
          description. Dates are optional ISO strings.
        </span>
      </div>
    </div>
  );
}
