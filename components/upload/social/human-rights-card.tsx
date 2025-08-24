"use client";

import { useMemo } from "react";
import {
  SectionHeader,
  Divider,
  SelectField,
  TextField,
  RowList,
} from "@/components/upload/env/ui";

/** ---------------------------- Types (UI value) --------------------------- */
/** Aligns with SocialSchema.humanRights */
export type HumanRightsIncidentTopic =
  | "childLabour"
  | "forcedLabour"
  | "humanTrafficking"
  | "discrimination"
  | "healthAndSafety"
  | "other";

export type HumanRightsIncident = {
  topic: HumanRightsIncidentTopic;
  confirmed?: "yes" | "no";
  description?: string | null;
};

export type HumanRightsValue = {
  policyExists?: "yes" | "no" | null;
  policyCovers?: {
    childLabour?: boolean;
    forcedLabour?: boolean;
    humanTrafficking?: boolean;
    discrimination?: boolean;
    healthAndSafety?: boolean;
    other?: boolean;
    otherText?: string;
  };
  grievanceMechanism?: "yes" | "no" | null;
  incidents?: HumanRightsIncident[];
};

type Props = {
  value: HumanRightsValue;
  onChange: (patch: Partial<HumanRightsValue>) => void;
  readOnly?: boolean;
};

/** ------------------------------- Constants ------------------------------ */
const YES_NO = ["yes", "no"] as const;

const TOPICS: ReadonlyArray<{ value: HumanRightsIncidentTopic; label: string }> = [
  { value: "childLabour",      label: "Child labour" },
  { value: "forcedLabour",     label: "Forced labour" },
  { value: "humanTrafficking", label: "Human trafficking" },
  { value: "discrimination",   label: "Discrimination" },
  { value: "healthAndSafety",  label: "Health & safety" },
  { value: "other",            label: "Other" },
] as const;

/** --------------------------------- Card --------------------------------- */
export function HumanRightsCard({ value, onChange, readOnly }: Props) {
  const covers    = value.policyCovers ?? {};
  const incidents = value.incidents ?? [];
  const showCoverage = value.policyExists === "yes"; // ← only show checkboxes if Yes

  const otherNeedsText = covers.other === true && !covers.otherText?.trim();

  // Patch helpers (always write defined shapes)
  const patchCovers = (p: Partial<NonNullable<HumanRightsValue["policyCovers"]>>) =>
    onChange({ policyCovers: { ...(value.policyCovers ?? {}), ...p } });

  // Centralized setter so we can clear coverage when policy is not "yes"
  const setPolicyExists = (next: "yes" | "no" | null) => {
    if (next === "yes") {
      onChange({ policyExists: next });
    } else {
      // If policy is "no" or cleared, also clear the coverage block for data hygiene
      onChange({ policyExists: next, policyCovers: undefined });
    }
  };

  const addIncident = () => {
    if (readOnly) return;
    const next: HumanRightsIncident = {
      topic: "discrimination",
      confirmed: undefined,
      description: null,
    };
    onChange({ incidents: [...incidents, next] });
  };

  const updateIncident = (i: number, patch: Partial<HumanRightsIncident>) => {
    const next = incidents.map((row, idx) => (idx === i ? { ...row, ...patch } : row));
    onChange({ incidents: next });
  };

  const removeIncident = (i: number) => {
    if (readOnly) return;
    const next = incidents.slice();
    next.splice(i, 1);
    onChange({ incidents: next });
  };

  const incidentsHelp = useMemo(
    () =>
      "Record confirmed incidents by topic. If 'Other' is selected and confirmed 'Yes', a short description is recommended.",
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-medium text-gray-900">Human rights</h3>
        <p className="text-sm text-gray-600">
          Indicate policy presence and coverage, grievance mechanisms, and any confirmed incidents this period.
        </p>
      </div>

      {/* Policy presence */}
      <SectionHeader title="Policy" />
      <div className="grid grid-cols-1 gap-3 sm:max-w-lg">
        <SelectField
          label="Policy exists?"
          value={(value.policyExists ?? "") as any}
          options={YES_NO as unknown as readonly string[]}
          onChange={(v) => setPolicyExists(((v as string) || null) as "yes" | "no" | null)}
          allowEmpty
        />
      </div>

      {/* Coverage (checkbox matrix) → only renders if policyExists === 'yes' */}
      {showCoverage && (
        <div className="rounded-2xl border border-white/30 bg-white/50 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
          <div className="text-sm font-medium text-gray-900">Policy coverage (tick all that apply)</div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <CheckboxLine
              label="Child labour"
              checked={!!covers.childLabour}
              onChange={(b) => patchCovers({ childLabour: b })}
              disabled={readOnly}
            />
            <CheckboxLine
              label="Forced labour"
              checked={!!covers.forcedLabour}
              onChange={(b) => patchCovers({ forcedLabour: b })}
              disabled={readOnly}
            />
            <CheckboxLine
              label="Human trafficking"
              checked={!!covers.humanTrafficking}
              onChange={(b) => patchCovers({ humanTrafficking: b })}
              disabled={readOnly}
            />
            <CheckboxLine
              label="Discrimination"
              checked={!!covers.discrimination}
              onChange={(b) => patchCovers({ discrimination: b })}
              disabled={readOnly}
            />
            <CheckboxLine
              label="Health & safety"
              checked={!!covers.healthAndSafety}
              onChange={(b) => patchCovers({ healthAndSafety: b })}
              disabled={readOnly}
            />
            {/* Other + Specify row */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!covers.other}
                onChange={(e) => patchCovers({ other: e.target.checked })}
                disabled={readOnly}
              />
              <span className="text-gray-800 text-sm">Other</span>
              <input
                type="text"
                className="ml-2 flex-1 rounded-lg border border-gray-300/70 bg-white/70 p-2 text-sm outline-none ring-0 focus:border-gray-400 focus:outline-none disabled:opacity-60"
                placeholder="Specify"
                value={covers.otherText ?? ""}
                onChange={(e) => patchCovers({ otherText: e.target.value })}
                disabled={readOnly || !covers.other}
              />
            </div>
          </div>

          {/* Soft validation hint */}
          {otherNeedsText && (
            <p className="mt-2 text-xs text-red-600">
              Please specify the “Other” coverage topic.
            </p>
          )}
        </div>
      )}

      {/* Grievance mechanism */}
      <SectionHeader title="Grievance mechanism" />
      <div className="grid grid-cols-1 gap-3 sm:max-w-lg">
        <SelectField
          label="Mechanism in place?"
          value={(value.grievanceMechanism ?? "") as any}
          options={YES_NO as unknown as readonly string[]}
          onChange={(v) => onChange({ grievanceMechanism: (v as "yes" | "no") || null })}
          allowEmpty
        />
      </div>

      <Divider />

      {/* Incidents */}
      <SectionHeader title="Incidents this period" />
      <p className="text-xs text-gray-600">{incidentsHelp}</p>
      <RowList
        rows={incidents}
        onAdd={addIncident}
        onUpdate={(i, patch) => updateIncident(i, patch)}
        onRemove={removeIncident}
        render={(row, update) => {
          const isOther = row.topic === "other";
          const isConfirmed = row.confirmed === "yes";
          return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-7">
              <SelectField
                label="Topic"
                value={row.topic}
                options={TOPICS.map((t) => t.label) as unknown as readonly string[]}
                onChange={(label) => {
                  const found = TOPICS.find((t) => t.label === label);
                  update({ topic: (found?.value ?? "discrimination") as HumanRightsIncidentTopic });
                }}
              />
              <SelectField
                label="Confirmed?"
                value={row.confirmed ?? undefined}
                options={YES_NO as unknown as readonly string[]}
                onChange={(v) => update({ confirmed: (v as "yes" | "no" | undefined) ?? undefined })}
                allowEmpty
              />
              
              {/* Description spans the remaining width on larger screens */}
              <div className="sm:col-span-2 lg:col-span-4">
                <TextField
                  label="Short description (optional)"
                  value={row.description ?? undefined}
                  onChange={(v) => update({ description: v || null })}
                />
                {isOther && isConfirmed && (
                  <p className="mt-1 text-xs text-gray-600">
                    Recommended to describe 'Other' incidents that are confirmed.
                  </p>
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}

/** --------------------------- Local tiny checkbox ------------------------- */
function CheckboxLine({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (b: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-800">
      <input
        type="checkbox"
        className="h-4 w-4"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      {label}
    </label>
  );
}
