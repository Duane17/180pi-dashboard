"use client";

import { useMemo } from "react";
import {
  SectionHeader,
  TextField,
  SelectField,
  RowList,
  Divider,
} from "@/components/upload/env/ui";
import { Chip } from "../social/ui/chip";

/* ============================== Types ============================== */

export type OversightBody = "board" | "committee" | "senior_executive";
export type BriefingFrequency = "every_meeting" | "quarterly" | "annually" | "ad_hoc";
export type Approver = "board" | "committee" | "executive";
export type YesNo = "yes" | "no";
export type AssuranceLevel = "none" | "limited" | "reasonable";

export type NamesRolesRow = { name: string; role: string };

export type ReportApprovalValue = {
  approver: Approver;
  approved: YesNo;
};

export type AssuranceValue = {
  level: AssuranceLevel;
  providerName?: string;
};

export type OversightValue = {
  oversightBody: OversightBody;
  namesRoles: NamesRolesRow[];
  briefingFrequency: BriefingFrequency;
  reportApproval: ReportApprovalValue;
  assurance: AssuranceValue;
};

type Props = {
  value: OversightValue;
  onChange: (patch: Partial<OversightValue>) => void;
  readOnly?: boolean;
};

/* ============================= Constants ============================ */

const OVERSIGHT_OPTS = ["board", "committee", "senior_executive"] as const;
const FREQ_OPTS = ["every_meeting", "quarterly", "annually", "ad_hoc"] as const;
const APPROVER_OPTS = ["board", "committee", "executive"] as const;
const YES_NO: readonly YesNo[] = ["yes", "no"];
const ASSURANCE_OPTS: readonly AssuranceLevel[] = ["none", "limited", "reasonable"];

/* ============================== Helpers ============================== */

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/* ============================== Component ============================== */

export function OversightCard({ value, onChange }: Props) {
  const namesRoles = value.namesRoles ?? [];

  // Derived flags
  const esgOversightPresent = useMemo(() => !!value.oversightBody, [value.oversightBody]);
  const approvalBodyRecorded = useMemo(() => !!value.reportApproval?.approver, [value.reportApproval]);

  // Handlers
  const addRow = () =>
    onChange({ namesRoles: [...namesRoles, { name: "", role: "" }] });

  const updateRow = (i: number, patch: Partial<NamesRolesRow>) => {
    const next = namesRoles.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    onChange({ namesRoles: next });
  };

  const removeRow = (i: number) => {
    const next = namesRoles.slice();
    next.splice(i, 1);
    onChange({ namesRoles: next });
  };

  const assuranceNeedsProvider = value.assurance?.level && value.assurance.level !== "none";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-lg font-semibold text-transparent">
          Oversight of Sustainability
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Record who oversees ESG impacts, how often they are briefed, who approves the report, and any assurance obtained.
        </p>
      </div>

      {/* Oversight body & frequency */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Oversight & briefing" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectField
            label="Oversight body"
            value={value.oversightBody}
            options={OVERSIGHT_OPTS as unknown as readonly string[]}
            onChange={(v) =>
              onChange({ oversightBody: (v as OversightBody) || "board" })
            }
          />
          <SelectField
            label="Briefing frequency"
            value={value.briefingFrequency}
            options={FREQ_OPTS as unknown as readonly string[]}
            onChange={(v) =>
              onChange({
                briefingFrequency: (v as BriefingFrequency) || "quarterly",
              })
            }
          />
          <div className="sm:col-span-1 flex items-end">
            <div className="w-full rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
              <div className="flex flex-wrap gap-2">
                <Chip label="Oversight present" value={esgOversightPresent ? "Yes" : "No"} />
              </div>
            </div>
          </div>
        </div>

        {/* Names & roles list */}
        <div className="mt-4">
          <SectionHeader title="People (names & roles)" />
          <RowList
            rows={namesRoles}
            onAdd={() => addRow()}
            onRemove={(i) => removeRow(i)}
            onUpdate={(i, patch) => updateRow(i, patch)}
            render={(row, update) => (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField
                  label="Name"
                  value={row.name}
                  onChange={(v) => update({ name: v ?? "" })}
                />
                <TextField
                  label="Role"
                  value={row.role}
                  onChange={(v) => update({ role: v ?? "" })}
                />
              </div>
            )}
          />
        </div>
      </div>

      {/* Report approval & Assurance */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Report approval & assurance" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectField
            label="Approver (body)"
            value={value.reportApproval?.approver ?? "board"}
            options={APPROVER_OPTS as unknown as readonly string[]}
            onChange={(v) =>
              onChange({
                reportApproval: {
                  approver: (v as Approver) || "board",
                  approved: value.reportApproval?.approved ?? "no",
                },
              })
            }
          />
          <SelectField
            label="Approved?"
            value={value.reportApproval?.approved ?? "no"}
            options={YES_NO as unknown as readonly string[]}
            onChange={(v) =>
              onChange({
                reportApproval: {
                  approver: value.reportApproval?.approver ?? "board",
                  approved: (v as YesNo) || "no",
                },
              })
            }
          />
          <div className="sm:col-span-1 flex items-end">
            <div className="w-full rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
              <div className="flex flex-wrap gap-2">
                <Chip label="Approval body recorded" value={approvalBodyRecorded ? "Yes" : "No"} />
              </div>
            </div>
          </div>

          <SelectField
            label="Assurance level"
            value={value.assurance?.level ?? "none"}
            options={ASSURANCE_OPTS as unknown as readonly string[]}
            onChange={(v) =>
              onChange({
                assurance: {
                  level: (v as AssuranceLevel) || "none",
                  providerName: value.assurance?.providerName ?? "",
                },
              })
            }
          />
          <TextField
            label="Assurance provider (optional)"
            value={value.assurance?.providerName ?? ""}
            onChange={(v) =>
              onChange({
                assurance: {
                  level: value.assurance?.level ?? "none",
                  providerName: v ?? "",
                },
              })
            }
            placeholder="Provider name"
          />
        </div>
      </div>

      {/* Summary chips */}
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <div className="flex flex-wrap gap-2">
          <Chip label="Oversight" value={value.oversightBody} />
          <Chip label="Frequency" value={value.briefingFrequency} />
          <Chip label="Approver" value={value.reportApproval?.approver ?? "—"} />
          <Chip label="Approved?" value={value.reportApproval?.approved ?? "—"} />
          <Chip label="Assurance" value={value.assurance?.level ?? "none"} />
          {value.assurance?.providerName?.trim() ? (
            <Chip label="Provider" value={value.assurance.providerName.trim()} />
          ) : null}
        </div>
      </div>

      <Divider />
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <span className="text-gray-700">
          <u>Notes</u>: Provider is optional even when assurance is limited/reasonable. Oversight present/approval recorded are UI flags.
        </span>
      </div>
    </div>
  );
}
