"use client";

import { useEffect, useMemo, useState } from "react";
import type { EnvironmentValues } from "@/types/esg-wizard.types";
import {
  ENERGY_PURCHASED_TYPES,
  QUANTITY_UNITS_ENERGY,
  YES_NO,
  FUEL_USES,
  FUEL_TYPES,
  FUEL_UNITS,
  SELF_GEN_SOURCES,
  ENERGY_SOLD_TYPES,
  INTENSITY_DENOMINATORS,
} from "@/constants/esg.constants";
import { COUNTRIES } from "@/constants/foundational.constants";
import {
  EnergyCategory,
  toEnergyCategory,
  toMWhFromEnergy,
  fuelToMWh,
} from "@/utils/energy";
import {
  Divider,
  SectionHeader,
  RowList,
  NumberField,
  TextField,
  SelectField,
} from "@/components/upload/env/ui";
import {
  readCoreImpactData,
  tryReadNote,
  formatNumber,
} from "@/utils/core-impact";
import type {
  PurchasedEnergyRow,
  FuelRow,
  SelfGenRow,
  EnergySoldRow,
  IntensityState,
  CoreImpactPayload,
} from "@/types/env-resources.types";

type Props = {
  value: EnvironmentValues["resourceConsumption"];
  onChange: (patch: Partial<EnvironmentValues["resourceConsumption"]>) => void;
  errors?: Partial<Record<keyof EnvironmentValues["resourceConsumption"], string>>;
};

export function ResourceConsumptionCard({ value, onChange, errors }: Props) {
  // Hydrate local, detailed rows from coreImpactData; fall back to empty sets
  const initial = readCoreImpactData(value.coreImpactData) ?? {
    purchased: [] as PurchasedEnergyRow[],
    fuels: [] as FuelRow[],
    selfGen: [] as SelfGenRow[],
    sold: [] as EnergySoldRow[],
    intensity: {} as IntensityState,
  };

  const [purchased, setPurchased] = useState<PurchasedEnergyRow[]>(initial.purchased);
  const [fuels, setFuels] = useState<FuelRow[]>(initial.fuels);
  const [selfGen, setSelfGen] = useState<SelfGenRow[]>(initial.selfGen);
  const [sold, setSold] = useState<EnergySoldRow[]>(initial.sold);
  const [intensity, setIntensity] = useState<IntensityState>(initial.intensity ?? {});

  // Purchased energy → MWh
  const purchasedMWh = useMemo(() => {
    return purchased.reduce((acc, r) => {
      const explicit = r.volumeKWh ?? null;
      const fromQty = r.unit ? toMWhFromEnergy(r.quantity ?? 0, r.unit) : 0;
      const mwh = explicit != null && Number.isFinite(explicit) ? explicit / 1000 : fromQty;
      return acc + (Number.isFinite(mwh) ? mwh : 0);
    }, 0);
  }, [purchased]);


  // Fuels → MWh (via NCV * quantity / 1000)
  const fuelsMWh = useMemo(() => {
    return fuels.reduce((acc, r) => {
      const fType =
        r.renewable === "Yes" ? (r.renewableSubtype ?? r.fuelType) : (r.nonRenewableSubtype ?? r.fuelType);
      if (!r.unit || !fType) return acc;          // ← guard when empty
      const mwh = fuelToMWh(r.quantity ?? 0, r.unit, fType);
      return acc + (Number.isFinite(mwh) ? mwh : 0);
    }, 0);
  }, [fuels]);


  // Self-generated → use ONLY self-consumed for consumption total
  const selfGenConsumedMWh = useMemo(() => {
    return selfGen.reduce((acc, r) => {
      const mwh = (r.selfConsumedKWh ?? 0) / 1000;
      return acc + (Number.isFinite(mwh) ? mwh : 0);
    }, 0);
  }, [selfGen]);

  const totalEnergyMWh = useMemo(
    () => purchasedMWh + fuelsMWh + selfGenConsumedMWh,
    [purchasedMWh, fuelsMWh, selfGenConsumedMWh]
  );

  // Intensity
  const energyIntensity = useMemo(() => {
    const denom = intensity.denominatorValue ?? null;
    if (!denom || denom <= 0) return null;
    return totalEnergyMWh / denom;
  }, [totalEnergyMWh, intensity]);

  // Sync back to schema
  useEffect(() => {
    const electricity: Array<{ category: EnergyCategory; type: string; mwh: number }> =
      purchased.map((r) => ({
        category: toEnergyCategory(r.renewable),
        type: r.energyType,
        mwh:
          r.volumeKWh != null && Number.isFinite(r.volumeKWh)
            ? r.volumeKWh / 1000
            : toMWhFromEnergy(r.quantity ?? 0, r.unit),
      }));

    const fuelsRows: Array<{ category: EnergyCategory; type: string; mwh: number }> =
      fuels.map((r) => {
        const fType =
          r.renewable === "Yes"
            ? (r.renewableSubtype ?? r.fuelType)
            : (r.nonRenewableSubtype ?? r.fuelType);
        return {
          category: toEnergyCategory(r.renewable),
          type: fType,
          mwh: fuelToMWh(r.quantity ?? 0, r.unit, fType),
        };
      });

    const selfGeneratedRows: Array<{ category: EnergyCategory; type: string; mwh: number }> =
      selfGen.map((r) => ({
        category: r.fuelBased === "Yes" ? "non_renewable" : "renewable",
        type: r.source,
        mwh: (r.selfConsumedKWh ?? 0) / 1000,
      }));

    const payload: CoreImpactPayload = {
      purchased,
      fuels,
      selfGen,
      sold,
      intensity,
      note: tryReadNote(value.coreImpactData),
    };

    onChange({
      electricity,
      fuels: fuelsRows,
      selfGenerated: selfGeneratedRows,
      coreImpactData: payload, // schema accepts object or string; use object
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchased, fuels, selfGen, sold, intensity]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-medium text-gray-900">Energy & Resource Consumption</h3>
        <p className="text-sm text-gray-600">
          Record purchased energy, fuels, self-generation, and optional intensity. Totals in MWh are computed automatically.
        </p>
      </div>

      <Divider />

      {/* Purchased energy */}
      <SectionHeader title="Purchased energy" subtitle="Electricity, district heat, steam, cooling" />
      <RowList
        rows={purchased}
        onAdd={() =>
          setPurchased((r) => [
            ...r,
            {
              energyType: undefined as any,
              quantity: null,
              unit: undefined as any,
              country: undefined,
              supplierFactorKgCO2ePerKWh: null,
              hasCertificates: undefined as any,
              volumeKWh: null,
              renewable: undefined as any,
            },
          ])
        }
        onUpdate={(i, patch) =>
          setPurchased((rows) =>
            rows.map((row, idx) => (idx === i ? { ...row, ...patch } : row))
          )
        }
        onRemove={(i) => setPurchased((rows) => rows.filter((_, idx) => idx !== i))}
        render={(row, update) => (
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-3">
            {/* Row 1 */}
            <SelectField
              label="Energy type"
              value={row.energyType}
              options={ENERGY_PURCHASED_TYPES}
              onChange={(v) =>
                update({
                  energyType: v as PurchasedEnergyRow["energyType"] | undefined,
                })
              }
              allowEmpty
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
              onChange={(v) => update({ unit: v as PurchasedEnergyRow["unit"] })}
              allowEmpty
            />

            {/* Row 2 */}
            <SelectField
              label="Country/Region"
              value={row.country ?? ""}
              options={COUNTRIES.map((c) => c.label) as readonly string[]}
              onChange={(v) => update({ country: v })}
              allowEmpty
            />
            <NumberField
              label="Supplier factor (kg CO₂e/kWh)"
              value={row.supplierFactorKgCO2ePerKWh ?? ""}
              min={0}
              onChange={(n) => update({ supplierFactorKgCO2ePerKWh: n })}
            />
            <SelectField
              label="Certificates / green tariff / PPA?"
              value={row.hasCertificates}
              options={YES_NO}
              onChange={(v) =>
                update({ hasCertificates: v as "Yes" | "No" | undefined })
              }
              allowEmpty
            />

            {/* Row 3 */}
            <NumberField
              label="Volume (kWh)"
              value={row.volumeKWh ?? ""}
              min={0}
              onChange={(n) => update({ volumeKWh: n })}
              hint="If blank, kWh is derived from Quantity × Unit."
            />
            <SelectField
              label="Renewable source?"
              value={row.renewable}
              options={YES_NO}
              onChange={(v) =>
                update({ renewable: v as "Yes" | "No" | undefined })
              }
              allowEmpty
            />
            <div /> {/* filler to keep the last row balanced */}
          </div>
        )}
      />


      <Divider />

      {/* Fuels consumed */}
      <SectionHeader
        title="Fuels consumed"
        subtitle="Energy from fuels is computed using default NCV factors (editable later)"
      />
      <RowList
        rows={fuels}
        onAdd={() =>
          setFuels((r) => [
            ...r,
            {
              use: undefined as any,
              fuelType: undefined as any,
              quantity: null,
              unit: undefined as any,
              renewable: undefined as any,
              nonRenewableSubtype: undefined as any,
            },
          ])
        }
        onUpdate={(i, patch) =>
          setFuels((rows) =>
            rows.map((row, idx) => (idx === i ? { ...row, ...patch } : row))
          )
        }
        onRemove={(i) => setFuels((rows) => rows.filter((_, idx) => idx !== i))}
        render={(row, update) => {
          const isRenew = row.renewable === "Yes";
          return (
            <>
              {/* Inputs grid: 3 rows × 3 cols */}
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-3">
                <div className="min-w-0">
                  <SelectField
                    label="Use"
                    value={row.use}
                    options={FUEL_USES}
                    onChange={(v) => update({ use: v as FuelRow["use"] })}
                    allowEmpty
                  />
                </div>

                <div className="min-w-0">
                  <SelectField
                    label="Fuel type"
                    value={row.fuelType}
                    options={FUEL_TYPES}
                    onChange={(v) => update({ fuelType: v as FuelRow["fuelType"] })}
                    allowEmpty
                  />
                </div>

                <div className="min-w-0">
                  <NumberField
                    label="Quantity"
                    value={row.quantity ?? ""}
                    min={0}
                    onChange={(n) => update({ quantity: n })}
                  />
                </div>

                <div className="min-w-0">
                  <SelectField
                    label="Unit"
                    value={row.unit}
                    options={FUEL_UNITS}
                    onChange={(v) => update({ unit: v as FuelRow["unit"] })}
                    allowEmpty
                  />
                </div>

                <div className="min-w-0">
                  <SelectField
                    label="Renewable?"
                    value={row.renewable}
                    options={YES_NO}
                    onChange={(v) =>
                      update({ renewable: v as "Yes" | "No" | undefined })
                    }
                    allowEmpty
                  />
                </div>

                <div className="min-w-0">
                  {isRenew ? (
                    <SelectField
                      label="Renewable subtype"
                      value={row.renewableSubtype}
                      options={["biomass", "biogas"] as const}
                      onChange={(v) =>
                        update({
                          renewableSubtype: v as "biomass" | "biogas" | undefined,
                          nonRenewableSubtype: undefined,
                        })
                      }
                      allowEmpty
                    />
                  ) : (
                    <SelectField
                      label="Non-renewable subtype"
                      value={row.nonRenewableSubtype}
                      options={
                        ["diesel", "petrol", "natural_gas", "LPG", "coal", "kerosene"] as const
                      }
                      onChange={(v) =>
                        update({
                          nonRenewableSubtype:
                            v as FuelRow["nonRenewableSubtype"] | undefined,
                          renewableSubtype: undefined,
                        })
                      }
                      allowEmpty
                    />
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-600">
                Est. Energy:{" "}
                <strong>
                  {formatNumber(
                    fuelToMWh(
                      row.quantity ?? 0,
                      row.unit,
                      row.renewable === "Yes"
                        ? row.renewableSubtype ?? row.fuelType
                        : row.nonRenewableSubtype ?? row.fuelType
                    )
                  )}{" "}
                  MWh
                </strong>
              </div>
            </>
          );
        }}
      />


      <Divider />

      {/* Self-generated electricity */}
      <SectionHeader title="Self-generated electricity" />
      <RowList
        rows={selfGen}
        onAdd={() =>
          setSelfGen((r) => [
            ...r,
            {
              source: undefined as any,
              grossKWh: null,
              selfConsumedKWh: null,
              exportedKWh: null,
              fuelBased: undefined as any,
            },
          ])
        }
        onUpdate={(i, patch) =>
          setSelfGen((rows) =>
            rows.map((row, idx) => (idx === i ? { ...row, ...patch } : row))
          )
        }
        onRemove={(i) => setSelfGen((rows) => rows.filter((_, idx) => idx !== i))}
        render={(row, update) => (
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-3">
            {/* Row 1 */}
            <SelectField
              label="Source"
              value={row.source}
              options={SELF_GEN_SOURCES}
              onChange={(v) =>
                update({ source: v as SelfGenRow["source"] | undefined })
              }
              allowEmpty
            />
            <NumberField
              label="Gross generation (kWh)"
              value={row.grossKWh ?? ""}
              min={0}
              onChange={(n) => update({ grossKWh: n })}
            />
            <NumberField
              label="Self-consumed (kWh)"
              value={row.selfConsumedKWh ?? ""}
              min={0}
              onChange={(n) => update({ selfConsumedKWh: n })}
            />

            {/* Row 2 */}
            <NumberField
              label="Exported/sold (kWh)"
              value={row.exportedKWh ?? ""}
              min={0}
              onChange={(n) => update({ exportedKWh: n })}
            />
            <SelectField
              label="Fuel-based?"
              value={row.fuelBased}
              options={YES_NO}
              onChange={(v) =>
                update({ fuelBased: v as "Yes" | "No" | undefined })
              }
              allowEmpty
            />
            <div /> {/* filler to balance last row */}
          </div>
        )}
      />


      <Divider />

      {/* Energy sold (optional) */}
      <SectionHeader title="Energy sold (optional)" />
      <RowList
        rows={sold}
        onAdd={() => setSold((r) => [...r, { type: undefined as any, kWh: null }])}
        onUpdate={(i, patch) =>
          setSold((rows) => rows.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))
        }
        onRemove={(i) => setSold((rows) => rows.filter((_, idx) => idx !== i))}
        render={(row, update) => (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <SelectField
              label="Type"
              value={row.type}
              options={ENERGY_SOLD_TYPES}
              onChange={(v) => update({ type: v as EnergySoldRow["type"] | undefined })}
              allowEmpty
            />
            <NumberField
              label="kWh"
              value={row.kWh ?? ""}
              min={0}
              onChange={(n) => update({ kWh: n })}
            />
          </div>
        )}
      />

      <Divider />

      {/* Energy intensity (optional) */}
      <SectionHeader title="Energy intensity (optional)" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <SelectField
          label="Denominator"
          value={intensity.denominatorType}
          options={INTENSITY_DENOMINATORS}
          onChange={(v) =>
            setIntensity((s) => ({ ...s, denominatorType: v as IntensityState["denominatorType"] | undefined }))
          }
          allowEmpty
        />
        <NumberField
          label="Denominator value"
          value={intensity.denominatorValue ?? ""}
          min={0}
          onChange={(n) => setIntensity((s) => ({ ...s, denominatorValue: n }))}
        />
        <TextField
          label="Denominator unit / note"
          value={intensity.denominatorUnitNote ?? ""}
          placeholder="e.g., MWK, m², units"
          onChange={(v) => setIntensity((s) => ({ ...s, denominatorUnitNote: v }))}
        />
        <div className="sm:col-span-3 lg:col-span-2 flex items-end">
          <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40 w-full">
            <div className="text-gray-700">Energy intensity</div>
            <div className="font-medium text-gray-900">
              {energyIntensity == null
                ? "—"
                : `${formatNumber(energyIntensity)} MWh / ${intensity.denominatorType ?? "unit"}`}
            </div>
          </div>
        </div>
      </div>

      {/* Notes box retained for compatibility */}
      <div className="rounded-2xl border border-gray-200/70 bg-white/60 p-4 backdrop-blur-sm">
        <label className="mb-1 block text-sm text-gray-700">Core climate impact data (notes)</label>
        <textarea
          className="w-full rounded-lg border border-gray-300/70 bg-white/70 p-2 outline-none ring-0 focus:border-gray-400 focus:outline-none"
          rows={3}
          placeholder="Additional notes, assumptions, conversion sources…"
          value={value.coreImpactData && tryReadNote(value.coreImpactData)}
          onChange={(e) => {
            // Keep JSON/object payload; append note (non-breaking)
            const parsed =
              readCoreImpactData(value.coreImpactData) ?? {
                purchased: [],
                fuels: [],
                selfGen: [],
                sold: [],
              };
            (parsed as any).note = e.target.value || undefined;
            onChange({ coreImpactData: parsed });
          }}
        />
      </div>

      {/* Totals */}
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <div className="flex flex-wrap gap-4">
          <span className="text-gray-700">
            Purchased:&nbsp;
            <strong className="text-gray-900">{formatNumber(purchasedMWh)} MWh</strong>
          </span>
          <span className="text-gray-700">
            Fuels:&nbsp;
            <strong className="text-gray-900">{formatNumber(fuelsMWh)} MWh</strong>
          </span>
          <span className="text-gray-700">
            Self-consumed:&nbsp;
            <strong className="text-gray-900">{formatNumber(selfGenConsumedMWh)} MWh</strong>
          </span>
          <span className="text-gray-700">
            <u>Total energy (MWh)</u>:&nbsp;
            <strong className="text-gray-900">{formatNumber(totalEnergyMWh)} MWh</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
