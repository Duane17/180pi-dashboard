"use client";

import { useEffect, useMemo, useState } from "react";
import type { EnvironmentValues } from "@/types/esg-wizard.types";

import {
  Divider,
  SectionHeader,
  RowList,
  NumberField,
  TextField,
  SelectField,
} from "@/components/upload/env/ui";
import { CheckboxWithNumber, MultiSelectChips } from "./ui/controls";
import { formatNumber } from "@/utils/core-impact";
import { toKWhFromEnergy } from "@/utils/energy";
import { safeStringify } from "@/utils/json";
import { QUANTITY_UNITS_ENERGY } from "@/constants/esg.constants";
import { COUNTRIES } from "@/constants/foundational.constants";
import {
  BOUNDARIES,
  GWP_VERSIONS,
  RECALC_REASONS,
  EF_SOURCES,
  REFRIGERANTS,
  S1_ACTIVITY_BY_CATEGORY,
  presetUnit,
  type Boundary,
  type GWPVersion,
  type EFSource,
  type Scope1Category,
  type RecalcReason,
} from "@/constants/esg.ghg.constants";

/** ----------------------------------------------------------------
 * Types
 * ---------------------------------------------------------------- */
type Props = {
  value: EnvironmentValues["ghg"];
  onChange: (patch: Partial<EnvironmentValues["ghg"]>) => void;
  errors?: Partial<Record<keyof EnvironmentValues["ghg"], string>>;
};

type Scope1Row = {
  category: Scope1Category;
  activity: string;
  quantity: number | null;
  unit: string;
  efKgPerUnit: number | null;
  refrigerant?: string;
};

type Scope2Row = {
  energyType: "Electricity" | "District heat" | "Steam" | "Cooling";
  quantity: number | null;
  unit: (typeof QUANTITY_UNITS_ENERGY)[number];
  country?: string;
  supplierName?: string;
  supplierEF_kgCO2e_per_kWh: number | null;
  contracts?: {
    eac?: { has: boolean; volumeKWh?: number | null };
    ppa?: { has: boolean; volumeKWh?: number | null };
    greenTariff?: { has: boolean; volumeKWh?: number | null };
  };
};

type Meta = {
  boundary?: Boundary;
  baseYear?: number | null;
  targetYear?: number | null;
  recalcReasons?: RecalcReason[];
  gwpVersion?: GWPVersion;
  efSource?: EFSource;
    equitySharePct?: number | null;

};

/** ----------------------------------------------------------------
 * Component
 * ---------------------------------------------------------------- */
export function GHGInventoryCard({ value, onChange, errors }: Props) {
  // Local meta state (serialized into `notes` for audit trail)
  const [meta, setMeta] = useState<Meta>({
    gwpVersion: undefined,
    recalcReasons: [],
  });

  // Scope 1 rows
  const [s1, setS1] = useState<Scope1Row[]>([]);
  // Scope 2 rows
  const [s2, setS2] = useState<Scope2Row[]>([]);

  // Derived: Scope 1 emissions (tCO2e) per row
  const s1RowsWithEmissions = useMemo(() => {
    return s1.map((r) => {
      const qty = r.quantity ?? 0;
      const ef = r.efKgPerUnit ?? 0; // kg CO2e / unit
      const kgCO2e = qty * ef;
      const tCO2e = kgCO2e / 1000;
      return { ...r, tCO2e };
    });
  }, [s1]);

  const scope1TotalTCO2e = useMemo(
    () => s1RowsWithEmissions.reduce((a, r) => a + (Number.isFinite(r.tCO2e) ? r.tCO2e : 0), 0),
    [s1RowsWithEmissions]
  );

  // Derived: Scope 2 emissions (tCO2e) per row
  const s2RowsWithEmissions = useMemo(() => {
    return s2.map((r) => {
      const qty = r.quantity ?? 0;
      const kWh = toKWhFromEnergy(qty, r.unit);
      const ef = r.supplierEF_kgCO2e_per_kWh ?? 0; // kgCO2e per kWh
      const kgCO2e = kWh * ef;
      const tCO2e = kgCO2e / 1000;
      return { ...r, tCO2e };
    });
  }, [s2]);

  const scope2TotalTCO2e = useMemo(
    () => s2RowsWithEmissions.reduce((a, r) => a + (Number.isFinite(r.tCO2e) ? r.tCO2e : 0), 0),
    [s2RowsWithEmissions]
  );

  // Equity-share scaling factor
  const equityFactor = useMemo(() => {
    if (meta.boundary === "Equity share") {
      const pct = meta.equitySharePct ?? 0;
      // clamp to [0, 100] and convert to 0–1
      return Math.max(0, Math.min(100, pct)) / 100;
    }
    return 1;
  }, [meta.boundary, meta.equitySharePct]);

  // Scaled totals (what we show & persist)
  const scope1ScaledTCO2e = useMemo(
    () => scope1TotalTCO2e * equityFactor,
    [scope1TotalTCO2e, equityFactor]
  );
  const scope2ScaledTCO2e = useMemo(
    () => scope2TotalTCO2e * equityFactor,
    [scope2TotalTCO2e, equityFactor]
  );


  const yearGuardMsg =
    meta.baseYear && meta.targetYear && meta.targetYear <= meta.baseYear
      ? "Target year must be greater than base year"
      : undefined;

  // Sync minimal values back to schema (keep schema small)
  useEffect(() => {
    const payload = {
      meta,
      scope1: s1RowsWithEmissions.map(({ tCO2e, ...rest }) => rest),
      scope1_tCO2e_raw: scope1TotalTCO2e,
      scope2: s2RowsWithEmissions.map(({ tCO2e, ...rest }) => rest),
      scope2_tCO2e_raw: scope2TotalTCO2e,
      equityFactor,
    };

    const notes = safeStringify(payload);

    onChange({
      scope1_tCO2e: scope1ScaledTCO2e,
      scope2_tCO2e: scope2ScaledTCO2e,
      notes,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    meta,
    s1RowsWithEmissions,
    scope1TotalTCO2e,
    s2RowsWithEmissions,
    scope2TotalTCO2e,
    equityFactor,
    scope1ScaledTCO2e,
    scope2ScaledTCO2e,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-medium text-gray-900">GHG Inventory</h3>
        <p className="text-sm text-gray-600">
          Define your inventory boundary, base/target years, and record Scope 1 &amp; 2 activity data. Emissions are auto-calculated.
        </p>
      </div>

      {/* Meta */}
      <SectionHeader title="Inventory settings" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          label="Boundary"
          value={meta.boundary}
          options={BOUNDARIES}
          onChange={(v) => setMeta((m) => ({ ...m, boundary: (v ?? undefined) as Boundary | undefined }))}
          allowEmpty
        />
        {meta.boundary === "Equity share" && (
          <NumberField
            label="Equity share (%)"
            value={meta.equitySharePct ?? ""}
            min={0}
            onChange={(n) => setMeta((m) => ({ ...m, equitySharePct: n ?? null }))}
        />
        )}
        <NumberField
          label="Base year"
          value={meta.baseYear ?? ""}
          min={1900}
          onChange={(n) => setMeta((m) => ({ ...m, baseYear: n ?? null }))}
        />
        <NumberField
          label="Target year"
          value={meta.targetYear ?? ""}
          min={1901}
          onChange={(n) => setMeta((m) => ({ ...m, targetYear: n ?? null }))}
        />
        <SelectField
          label="GWP version"
          value={meta.gwpVersion}
          options={GWP_VERSIONS}
          onChange={(v) => setMeta((m) => ({ ...m, gwpVersion: (v ?? undefined) as GWPVersion | undefined }))}
          allowEmpty
        />
        <SelectField
          label="Emission factor source"
          value={meta.efSource}
          options={EF_SOURCES}
          onChange={(v) => setMeta((m) => ({ ...m, efSource: (v ?? undefined) as EFSource | undefined }))}
          allowEmpty
        />
        <SelectField
          label="Recalculation reason"
          value={(meta.recalcReasons?.[0] ?? "") as any}
          options={RECALC_REASONS}
          allowEmpty
          onChange={(v) =>
            setMeta((m) => ({
              ...m,
              recalcReasons: v ? [v as RecalcReason] : [],
            }))
          }
        />
      </div>
      {yearGuardMsg && <p className="text-xs text-red-600">{yearGuardMsg}</p>}


      <Divider />

      {/* Scope 1 */}
      <SectionHeader
        title="Scope 1: Direct emissions"
        subtitle="Stationary/mobile combustion, fugitive (refrigerants), process"
      />
      <RowList
        rows={s1}
        onAdd={() =>
          setS1((r) => [
            ...r,
            {
              category: undefined as any,
              activity: undefined as any,
              quantity: null,
              unit: "" as any,
              efKgPerUnit: null,
            },
          ])
        }
        onUpdate={(i, patch) =>
          setS1((rows) => {
            const next = [...rows];
            const prev = next[i];
            let unit = patch.unit ?? prev.unit;
            let activity = patch.activity ?? prev.activity;
            let category = (patch.category ?? prev.category) as Scope1Category;

            if (patch.category && patch.category !== prev.category) {
              activity = S1_ACTIVITY_BY_CATEGORY[patch.category][0] as string;
              unit = presetUnit(activity)[0];
            }

            if (patch.activity && patch.activity !== prev.activity) {
              const allowed = presetUnit(activity);
              unit = allowed.includes(unit) ? unit : allowed[0];
            }

            next[i] = { ...prev, ...patch, category, activity, unit };

            if (next[i].category === "fugitive") {
              const isRefrig = REFRIGERANTS.includes(next[i].activity as any);
              next[i].refrigerant = isRefrig ? (next[i].activity as any) : undefined;
            } else {
              next[i].refrigerant = undefined;
            }
            return next;
          })
        }
        onRemove={(i) => setS1((rows) => rows.filter((_, idx) => idx !== i))}
        render={(row, update) => {
          const activities = row.category
            ? S1_ACTIVITY_BY_CATEGORY[row.category]
            : ([] as readonly string[]);
          const units = row.activity ? presetUnit(row.activity) : ([] as readonly string[]);
          const rowWithEmis = s1RowsWithEmissions[s1.indexOf(row)];
          return (
            <>
              {/* Inputs grid: 2 rows × 3 cols */}
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-3">
                {/* Row 1 */}
                <SelectField
                  label="Category"
                  value={row.category}
                  options={["stationary", "mobile", "fugitive", "process"] as const}
                  onChange={(v) =>
                    update({ category: (v as Scope1Category) || "stationary" })
                  }
                />
                <SelectField
                  label="Activity type"
                  value={row.activity}
                  options={activities}
                  onChange={(v) => update({ activity: (v as string) || activities[0] })}
                />
                <NumberField
                  label="Quantity"
                  value={row.quantity ?? ""}
                  min={0}
                  onChange={(n) => update({ quantity: n })}
                />

                {/* Row 2 */}
                <SelectField
                  label="Unit"
                  value={row.unit}
                  options={units}
                  onChange={(v) => update({ unit: (v as string) || units[0] })}
                />
                <NumberField
                  label="Emission factor (kgCO₂e / unit)"
                  value={row.efKgPerUnit ?? ""}
                  min={0}
                  onChange={(n) => update({ efKgPerUnit: n })}
                />
                {row.category === "fugitive" ? (
                  <SelectField
                    label="Refrigerant"
                    value={
                      row.refrigerant ??
                      (REFRIGERANTS.includes(row.activity as any)
                        ? (row.activity as any)
                        : "")
                    }
                    options={REFRIGERANTS}
                    onChange={(v) => update({ refrigerant: v as string })}
                    allowEmpty
                  />
                ) : (
                  <div /> // filler for alignment
                )}
              </div>

              <div className="text-xs text-gray-600">
                Row emissions:{" "}
                <strong>{formatNumber(rowWithEmis?.tCO2e ?? 0)} tCO₂e</strong>
              </div>
            </>
          );
        }}
      />


      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <span className="text-gray-700">Scope 1 total:&nbsp;</span>
        <strong className="text-gray-900">{formatNumber(scope1ScaledTCO2e)} tCO₂e</strong>
      </div>

      <Divider />

      {/* Scope 2 */}
      <SectionHeader
        title="Scope 2: Purchased energy"
        subtitle="Electricity, district heat, steam, cooling"
      />
      <RowList
        rows={s2}
        onAdd={() =>
          setS2((r) => [
            ...r,
            {
              energyType: undefined as any,
              quantity: null,
              unit: "" as any,
              country: undefined,
              supplierName: undefined,
              supplierEF_kgCO2e_per_kWh: null,
              contracts: {
                eac: { has: false },
                ppa: { has: false },
                greenTariff: { has: false },
              },
            },
          ])
        }
        onUpdate={(i, patch) =>
          setS2((rows) => {
            const next = [...rows];
            const prev = next[i];
            let unit = patch.unit ?? prev.unit;
            if (patch.energyType && patch.energyType !== prev.energyType) {
              unit = "kWh";
            }
            next[i] = { ...prev, ...patch, unit };
            return next;
          })
        }
        onRemove={(i) => setS2((rows) => rows.filter((_, idx) => idx !== i))}
        render={(row, update) => {
          const rowWithEmis = s2RowsWithEmissions[s2.indexOf(row)];
          const countryOptions = COUNTRIES.map((c) => c.label) as readonly string[];
          return (
            <>
              {/* Inputs grid: 2 rows × 3 cols */}
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-3">
                {/* Row 1 */}
                <SelectField
                  label="Energy type"
                  value={row.energyType}
                  options={["Electricity", "District heat", "Steam", "Cooling"] as const}
                  onChange={(v) =>
                    update({
                      energyType: (v as Scope2Row["energyType"]) || "Electricity",
                    })
                  }
                />
                <NumberField
                  label="Quantity"
                  value={row.quantity ?? ""}
                  min={0}
                  onChange={(n) => update({ quantity: n })}
                />
                <SelectField
                  label="Unit"
                  value={row.unit}
                  options={QUANTITY_UNITS_ENERGY}
                  onChange={(v) =>
                    update({ unit: (v as Scope2Row["unit"]) || "kWh" })
                  }
                />

                {/* Row 2 */}
                <SelectField
                  label="Country/Region"
                  value={row.country ?? ""}
                  options={countryOptions}
                  onChange={(v) => update({ country: v })}
                  allowEmpty
                />
                <TextField
                  label="Supplier name (optional)"
                  value={row.supplierName}
                  onChange={(v) => update({ supplierName: v })}
                  placeholder="e.g., National utility"
                />
                <NumberField
                  label="Supplier EF (kgCO₂e/kWh)"
                  value={row.supplierEF_kgCO2e_per_kWh ?? ""}
                  min={0}
                  onChange={(n) => update({ supplierEF_kgCO2e_per_kWh: n })}
                />
              </div>

              {/* Contracts area */}
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-gray-200/70 bg-white/60 p-4 backdrop-blur-sm">
                  <CheckboxWithNumber
                    stacked
                    label="Energy Attribute Certificates (RECs/GOs)"
                    has={!!row.contracts?.eac?.has}
                    volume={row.contracts?.eac?.volumeKWh ?? null}
                    onChange={(has, volumeKWh) =>
                      update({
                        contracts: { ...row.contracts, eac: { has, volumeKWh } },
                      })
                    }
                  />
                </div>
                <div className="rounded-xl border border-gray-200/70 bg-white/60 p-4 backdrop-blur-sm">
                  <CheckboxWithNumber
                    stacked
                    label="Power Purchase Agreement (PPA)"
                    has={!!row.contracts?.ppa?.has}
                    volume={row.contracts?.ppa?.volumeKWh ?? null}
                    onChange={(has, volumeKWh) =>
                      update({
                        contracts: { ...row.contracts, ppa: { has, volumeKWh } },
                      })
                    }
                  />
                </div>
                <div className="rounded-xl border border-gray-200/70 bg-white/60 p-4 backdrop-blur-sm">
                  <CheckboxWithNumber
                    stacked
                    label="Green tariff"
                    has={!!row.contracts?.greenTariff?.has}
                    volume={row.contracts?.greenTariff?.volumeKWh ?? null}
                    onChange={(has, volumeKWh) =>
                      update({
                        contracts: {
                          ...row.contracts,
                          greenTariff: { has, volumeKWh },
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="text-xs text-gray-600 mt-2">
                Row emissions:{" "}
                <strong>{formatNumber(rowWithEmis?.tCO2e ?? 0)} tCO₂e</strong>
              </div>
            </>
          );
        }}
      />


      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <span className="text-gray-700">Scope 2 total:&nbsp;</span>
        <strong className="text-gray-900">{formatNumber(scope2ScaledTCO2e)} tCO₂e</strong>
      </div>

      <Divider />

      {/* Roll-up (you can add S3 later) */}
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <span className="text-gray-700">All included (S1 + S2):&nbsp;</span>
        <strong className="text-gray-900">
            {formatNumber(scope1ScaledTCO2e + scope2ScaledTCO2e)} tCO₂e
        </strong>
      </div>
    </div>
  );
}
