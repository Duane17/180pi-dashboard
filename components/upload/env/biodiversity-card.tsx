"use client";

import { useState, useMemo } from "react";
import {
  Divider,
  SectionHeader,
  RowList,
  NumberField,
  TextField,
  SelectField,
} from "@/components/upload/env/ui";

/* --------------------------------- Types --------------------------------- */

type BiodiversitySite = {
  latitude?: number | null;
  longitude?: number | null;
  areaHectares?: number | null;
  habitat?: (typeof HABITATS)[number];
  designation?: {
    protectedArea?: boolean;
    kba?: boolean;
    ramsar?: boolean;
    natura2000?: boolean;
    other?: boolean;
    otherText?: string;
  };
};

type BiodiversityImpact = {
  activity: (typeof ACTIVITIES)[number];
  receptor: (typeof RECEPTORS)[number];
  proximity: (typeof PROXIMITIES)[number];
  severity?: number | null;        // 1–5
  extent?: number | null;          // 1–5
  irreversibility?: number | null; // 1–5
  mitigation?: {
    avoid?: boolean;
    minimize?: boolean;
    restore?: boolean;
    offset?: boolean;
  };
};

export type BiodiversityPayload = {
  sites: BiodiversitySite[];
  impacts: BiodiversityImpact[];
  note?: string;
};

type Props = {
  value: BiodiversityPayload;
  onChange: (patch: Partial<BiodiversityPayload>) => void;
  readOnly?: boolean;
};

/* ------------------------------- Constants ------------------------------- */

const HABITATS = [
  "Forest",
  "Grassland",
  "Wetland",
  "Freshwater",
  "Marine–coastal",
  "Agricultural mosaic",
  "Urban–brownfield",
  "Other",
] as const;

const ACTIVITIES = [
  "New construction",
  "Expansion",
  "Quarrying",
  "Water abstraction",
  "Effluent discharge",
  "Traffic/noise/light",
  "Vegetation clearance",
  "Other",
] as const;

const RECEPTORS = ["Habitat", "Species", "Ecosystem service"] as const;

const PROXIMITIES = ["Inside", "≤1 km", "1–5 km", ">5 km"] as const;

const ONE_TO_FIVE = [1, 2, 3, 4, 5] as const;

/* --------------------------------- Card ---------------------------------- */

export function BiodiversityCard({ value, onChange, readOnly }: Props) {
  const sites = value.sites ?? [];
  const impacts = value.impacts ?? [];

  const addSite = () => {
    if (readOnly) return;
    const next: BiodiversitySite = {
      latitude: null,
      longitude: null,
      areaHectares: null,
      habitat: undefined,
      designation: {},
    };
    onChange({ sites: [...sites, next] });
  };

  const updateSite = (i: number, patch: Partial<BiodiversitySite>) => {
    const next = [...sites];
    next[i] = { ...next[i], ...patch };
    onChange({ sites: next });
  };

  const removeSite = (i: number) => {
    if (readOnly) return;
    const next = [...sites];
    next.splice(i, 1);
    onChange({ sites: next });
  };

  const addImpact = () => {
    if (readOnly) return;
    const next: BiodiversityImpact = {
      activity: undefined as any,
      receptor: undefined as any,
      proximity: undefined as any,
      severity: null,
      extent: null,
      irreversibility: null,
      mitigation: {},
    };
    onChange({ impacts: [...impacts, next] });
  };

  const updateImpact = (i: number, patch: Partial<BiodiversityImpact>) => {
    const next = [...impacts];
    next[i] = { ...next[i], ...patch };
    onChange({ impacts: next });
  };

  const removeImpact = (i: number) => {
    if (readOnly) return;
    const next = [...impacts];
    next.splice(i, 1);
    onChange({ impacts: next });
  };

  const significanceHelp =
    "Score each 1–5: Severity (magnitude of effect), Extent (spatial scale), Irreversibility (difficulty to reverse).";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-medium text-gray-900">Biodiversity</h3>
        <p className="text-sm text-gray-600">
          Capture site context and track potential biodiversity impacts with mitigation applied.
        </p>
      </div>

      {/* Sites & locations */}
      <SectionHeader title="Sites & locations" />
      <RowList
        rows={sites}
        onAdd={addSite}
        onUpdate={(i, patch) => updateSite(i, patch)}
        onRemove={removeSite}
        render={(row, update) => {
          const d = row.designation ?? {};
          return (
            <>
              {/* 4-up grid on large screens, 2-up on small for better balance */}
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                <NumberField
                  label="Latitude (decimal)"
                  value={row.latitude ?? ""}
                  onChange={(n) => update({ latitude: n })}
                />
                <NumberField
                  label="Longitude (decimal)"
                  value={row.longitude ?? ""}
                  onChange={(n) => update({ longitude: n })}
                />
                <NumberField
                  label="Operational footprint (ha)"
                  value={row.areaHectares ?? ""}
                  min={0}
                  onChange={(n) => update({ areaHectares: n })}
                />
                <SelectField
                  label="Primary habitat / land cover"
                  value={row.habitat}
                  options={HABITATS}
                  onChange={(v) => update({ habitat: v as BiodiversitySite["habitat"] | undefined })}
                />
              </div>

              {/* Designations */}
              <div className="mt-4 rounded-xl border border-white/30 bg-white/50 p-4 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
                <div className="mb-3 text-gray-700">Any known designation at site?</div>

                {/* 4 columns on lg; let “Other + Specify” span 2 columns */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <CheckboxLine
                    label="Protected area"
                    checked={!!d.protectedArea}
                    onChange={(b) => update({ designation: { ...d, protectedArea: b } })}
                    disabled={readOnly}
                  />
                  <CheckboxLine
                    label="Key Biodiversity Area"
                    checked={!!d.kba}
                    onChange={(b) => update({ designation: { ...d, kba: b } })}
                    disabled={readOnly}
                  />
                  <CheckboxLine
                    label="Ramsar wetland"
                    checked={!!d.ramsar}
                    onChange={(b) => update({ designation: { ...d, ramsar: b } })}
                    disabled={readOnly}
                  />
                  <CheckboxLine
                    label="Natura 2000"
                    checked={!!d.natura2000}
                    onChange={(b) => update({ designation: { ...d, natura2000: b } })}
                    disabled={readOnly}
                  />

                  {/* Other + Specify: wide cell, shrink-friendly */}
                  <div className="sm:col-span-2 lg:col-span-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0"
                        checked={!!d.other}
                        onChange={(e) =>
                          update({ designation: { ...d, other: e.target.checked } })
                        }
                        disabled={readOnly}
                      />
                      <span className="shrink-0 text-gray-800">Other</span>
                      <input
                        type="text"
                        className="w-full min-w-0 rounded-lg border border-gray-300/70 bg-white/70 p-2 text-sm outline-none ring-0 focus:border-gray-400 focus:outline-none disabled:opacity-60"
                        placeholder="Specify"
                        value={d.otherText ?? ""}
                        onChange={(e) =>
                          update({ designation: { ...d, otherText: e.target.value } })
                        }
                        disabled={readOnly || !d.other}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          );
        }}
      />

      <Divider />

    {/* Impacts register */}
    <SectionHeader title="Biodiversity impacts register" />
    <RowList
    rows={impacts}
    onAdd={addImpact}
    onUpdate={(i, patch) => updateImpact(i, patch)}
    onRemove={removeImpact}
    render={(row, update) => {
        const mit = row.mitigation ?? {};
        return (
        <>
            {/* Inputs grid: 2 rows × 3 cols */}
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="min-w-0">
                <SelectField
                  label="Activity"
                  value={row.activity}
                  options={ACTIVITIES}
                  onChange={(v) =>
                    update({ activity: v as BiodiversityImpact["activity"] | undefined })
                  }
                />
              </div>

              <div className="min-w-0">
                <SelectField
                  label="Receptor"
                  value={row.receptor}
                  options={RECEPTORS}
                  onChange={(v) =>
                    update({ receptor: v as BiodiversityImpact["receptor"] | undefined })
                  }
                />
              </div>

              <div className="min-w-0">
                <SelectField
                  label="Proximity to sensitive area"
                  value={row.proximity}
                  options={PROXIMITIES}
                  onChange={(v) =>
                    update({ proximity: v as BiodiversityImpact["proximity"] | undefined })
                  }
                />
              </div>

              <div className="min-w-0">
                <SelectField
                  label="Severity (1–5)"
                  value={(row.severity ?? "") as any}
                  options={ONE_TO_FIVE.map(String) as unknown as readonly string[]}
                  onChange={(v) => update({ severity: v ? Number(v) : null })}
                  allowEmpty
                />
              </div>

              <div className="min-w-0">
                <SelectField
                  label="Extent (1–5)"
                  value={(row.extent ?? "") as any}
                  options={ONE_TO_FIVE.map(String) as unknown as readonly string[]}
                  onChange={(v) => update({ extent: v ? Number(v) : null })}
                  allowEmpty
                />
              </div>

              <div className="min-w-0">
                <SelectField
                  label="Irreversibility (1–5)"
                  value={(row.irreversibility ?? "") as any}
                  options={ONE_TO_FIVE.map(String) as unknown as readonly string[]}
                  onChange={(v) =>
                    update({ irreversibility: v ? Number(v) : null })
                  }
                  allowEmpty
                />
              </div>
            </div>


            <p className="mt-2 text-xs text-gray-600">{significanceHelp}</p>

            {/* Mitigation hierarchy: grid (not flex), shrink-safe, no overflow */}
            <div className="mt-3 rounded-xl border border-white/30 bg-white/50 p-4 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
            <div className="mb-2 text-gray-700">Mitigation hierarchy applied</div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
                <CheckboxLine
                label="Avoid"
                checked={!!mit.avoid}
                onChange={(b) => update({ mitigation: { ...mit, avoid: b } })}
                disabled={readOnly}
                />
                <CheckboxLine
                label="Minimize"
                checked={!!mit.minimize}
                onChange={(b) => update({ mitigation: { ...mit, minimize: b } })}
                disabled={readOnly}
                />
                <CheckboxLine
                label="Restore"
                checked={!!mit.restore}
                onChange={(b) => update({ mitigation: { ...mit, restore: b } })}
                disabled={readOnly}
                />
                <CheckboxLine
                label="Offset"
                checked={!!mit.offset}
                onChange={(b) => update({ mitigation: { ...mit, offset: b } })}
                disabled={readOnly}
                />
            </div>
            </div>
        </>
        );
    }}
    />


      {/* Optional notes box */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-4 backdrop-blur-sm">
        <label className="mb-1 block text-sm text-gray-700">Notes</label>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-gray-300/70 bg-white/70 p-2 outline-none ring-0 focus:border-gray-400 focus:outline-none"
          placeholder="Assumptions, methods, references…"
          value={value.note ?? ""}
          onChange={(e) => onChange({ note: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}

/* ----------------------------- Tiny helpers ----------------------------- */

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
