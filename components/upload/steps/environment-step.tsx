"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import type { ESGWizardValues, EnvironmentValues } from "@/types/esg-wizard.types";
import { WaterFlowsPayload, WaterFlowsPatch } from "@/types/env-water.types";
import { GHGInventoryCard } from "@/components/upload/env/ghg-inventory-card";
import { ResourceConsumptionCard } from "@/components/upload/env/resource-consumption-card";
import { WaterFlowsCard } from "@/components/upload/env/waterflows-card";
import { WasteCard } from "../env/waste-card";

// ⬇️ NEW: import your Biodiversity card (and its payload type if you want strict typing)
import { BiodiversityCard, type BiodiversityPayload } from "@/components/upload/env/biodiversity-card";

export function EnvironmentStep() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ESGWizardValues>();

  const env = watch("environment") as EnvironmentValues;

  // --- Error mapping helpers (RHF error trees → flat strings per field) ---
  const ghgErr = (errors.environment as any)?.ghg ?? {};
  const rcErr = (errors.environment as any)?.resourceConsumption ?? {};
  const waterErr = (errors.environment as any)?.water ?? {};
  const targetsErr = (errors.environment as any)?.targets as
    | Array<Record<string, { message?: string }>>
    | undefined;

  const ghgErrors = useMemo(
    () => ({
      year: ghgErr?.year?.message as string | undefined,
      scope1_tCO2e: ghgErr?.scope1_tCO2e?.message as string | undefined,
      scope2_tCO2e: ghgErr?.scope2_tCO2e?.message as string | undefined,
      scope3_tCO2e: ghgErr?.scope3_tCO2e?.message as string | undefined,
      methodology: ghgErr?.methodology?.message as string | undefined,
      notes: ghgErr?.notes?.message as string | undefined,
    }),
    [ghgErr]
  );

  const rcErrors = useMemo(
    () => ({
      recordedAt: rcErr?.recordedAt?.message as string | undefined,
      energyMWh: rcErr?.energyMWh?.message as string | undefined,
      waterM3: rcErr?.waterM3?.message as string | undefined,
      wasteTonnes: rcErr?.wasteTonnes?.message as string | undefined,
    }),
    [rcErr]
  );

  const waterErrors = useMemo(() => {
    const mapRows = (rows: any[] | undefined) =>
      Array.isArray(rows)
        ? rows.map((row) => ({
            source: row?.source?.message as string | undefined,
            destination: row?.destination?.message as string | undefined,
            quality: row?.quality?.message as string | undefined,
            method: row?.method?.message as string | undefined,
            unit: row?.unit?.message as string | undefined,
            quantity: row?.quantity?.message as string | undefined,
            period: row?.period?.message as string | undefined,
            reuseFlag: row?.reuseFlag?.message as string | undefined, // if card exposes this
          }))
        : undefined;

    return {
      note: waterErr?.note?.message as string | undefined,
      withdrawals: mapRows(waterErr?.withdrawals),
      discharges: mapRows(waterErr?.discharges),
    };
  }, [waterErr]);

  const targetErrors = useMemo(() => {
    if (!targetsErr) return undefined;
    return targetsErr.map((row) => ({
      baseline: row?.baseline?.message as string | undefined,
      target: row?.target?.message as string | undefined,
      unit: row?.unit?.message as string | undefined,
      dueDate: row?.dueDate?.message as string | undefined,
      category: row?.category?.message as string | undefined,
    }));
  }, [targetsErr]);

  // Normalize water payload (stable shape for the card)
  const waterValue: WaterFlowsPayload = {
    note: env.water?.note,
    withdrawals: env.water?.withdrawals ?? [],
    discharges: env.water?.discharges ?? [],
  };

  // ⬇️ NEW: Normalize biodiversity payload (stable shape for the card)
  const biodiversityValue: BiodiversityPayload = {
    sites: env.biodiversity?.sites ?? [],
    impacts: env.biodiversity?.impacts ?? [],
    note: env.biodiversity?.note,
  };

  const wasteValue = {
    rows: env.waste?.rows ?? [],
    note: env.waste?.note,
  };

  // --- Patchers ---
  const onChangeGHG = (patch: Partial<EnvironmentValues["ghg"]>) => {
    setValue(
      "environment.ghg",
      { ...env.ghg, ...patch },
      { shouldDirty: true, shouldTouch: true }
    );
  };

  const onChangeRC = (patch: Partial<EnvironmentValues["resourceConsumption"]>) => {
    setValue(
      "environment.resourceConsumption",
      { ...env.resourceConsumption, ...patch },
      { shouldDirty: true, shouldTouch: true }
    );
  };

  const onChangeWater = (patch: WaterFlowsPatch) => {
    setValue(
      "environment.water",
      { ...waterValue, ...patch }, // merge with normalized value
      { shouldDirty: true, shouldTouch: true }
    );
  };

  // ⬇️ NEW: Biodiversity patcher — merges into normalized biodiversityValue
  const onChangeBiodiversity = (patch: Partial<BiodiversityPayload>) => {
    setValue(
      "environment.biodiversity",
      { ...biodiversityValue, ...patch },
      { shouldDirty: true, shouldTouch: true }
    );
  };

  const onChangeWaste = (patch: Partial<typeof wasteValue>) => {
    setValue(
      "environment.waste",
      { ...wasteValue, ...patch },
      { shouldDirty: true, shouldTouch: true }
    );
  };

  const onChangeTargets = (next: NonNullable<EnvironmentValues["targets"]>) => {
    setValue("environment.targets", next, { shouldDirty: true, shouldTouch: true });
  };

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div>
        <h2 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">
          Environment
        </h2>
        <p className="mt-1 text-sm text-gray-700">
          Provide your emissions, resource consumption, water flows, biodiversity context, and any targets you track.
        </p>
      </div>


      {/* GHG inventory */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <GHGInventoryCard value={env.ghg} onChange={onChangeGHG} errors={ghgErrors} />
      </div>
      
      {/* Resource consumption */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <ResourceConsumptionCard
          value={env.resourceConsumption}
          onChange={onChangeRC}
          errors={rcErrors}
        />
      </div>

      {/* Water flows */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <WaterFlowsCard value={waterValue} onChange={onChangeWater} />
        {/* If you add a water errors prop later, pass waterErrors here */}
      </div>

      {/* ⬇️ NEW: Biodiversity */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <BiodiversityCard value={biodiversityValue} onChange={onChangeBiodiversity} />
      </div>

      {/* Waste */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <WasteCard value={wasteValue} onChange={onChangeWaste} />
      </div>
    </div>
  );
}
