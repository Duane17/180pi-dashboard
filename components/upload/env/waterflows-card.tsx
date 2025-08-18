"use client";

import React from "react";
import type {
  WaterFlowsPayload,
  WaterFlowsPatch,
  WithdrawalRow,
  DischargeRow,
  WaterPeriod,
} from "@/types/env-water.types";
import {
  WATER_SOURCES,
  WATER_QUALITY,
  WATER_UNITS,
  MEASUREMENT_METHODS,
  DISCHARGE_DESTINATIONS,
  TREATMENT_LEVELS,
  YES_NO,
} from "@/constants/esg.water.constants";

export interface WaterFlowsCardProps {
  value: WaterFlowsPayload;
  onChange: (patch: WaterFlowsPatch) => void;
  readOnly?: boolean;
}

export function WaterFlowsCard({ value, onChange, readOnly }: WaterFlowsCardProps) {
  // Row adders
  const addWithdrawal = () => {
    const newRow: WithdrawalRow = {
      source: "Surface water",
      quality: "Freshwater",
      unit: "m3",
      method: "Meter",
      period: { mode: "month", month: "" },
    };
    onChange({ withdrawals: [...(value.withdrawals ?? []), newRow] });
  };

  const addDischarge = () => {
    const newRow: DischargeRow = {
      destination: "Surface water",
      quality: "Freshwater",
      treatmentLevel: "None",
      sentToOtherOrgForReuse: "No",
      unit: "m3",
      method: "Meter",
      period: { mode: "month", month: "" },
    };
    onChange({ discharges: [...(value.discharges ?? []), newRow] });
  };

  // Row updaters
  const updateWithdrawal = (i: number, patch: Partial<WithdrawalRow>) => {
    const next = [...(value.withdrawals ?? [])];
    next[i] = { ...next[i], ...patch };
    onChange({ withdrawals: next });
  };
  const removeWithdrawal = (i: number) => {
    if (readOnly) return;
    const next = [...(value.withdrawals ?? [])];
    next.splice(i, 1);
    onChange({ withdrawals: next });
  };

  const updateDischarge = (i: number, patch: Partial<DischargeRow>) => {
    const next = [...(value.discharges ?? [])];
    next[i] = { ...next[i], ...patch };
    onChange({ discharges: next });
  };
  const removeDischarge = (i: number) => {
    if (readOnly) return;
    const next = [...(value.discharges ?? [])];
    next.splice(i, 1);
    onChange({ discharges: next });
  };

  return (
    <div className="space-y-8">
      {/* Withdrawals */}
      <section>
        <CardHeader title="Water withdrawal" subtitle="Record sources, quantities, and methods" />

        {(value.withdrawals ?? []).length === 0 && <EmptyState text="No withdrawals recorded yet." />}

        <div className="space-y-4">
          {(value.withdrawals ?? []).map((row, i) => (
            <RowCard key={`w-${i}`}>
              {/* Row 1: core attributes */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <LabeledSelect
                  className="lg:col-span-3"
                  label="Source"
                  value={row.source}
                  onChange={(v) => updateWithdrawal(i, { source: v as WithdrawalRow["source"] })}
                  options={WATER_SOURCES}
                  disabled={readOnly}
                />
                <LabeledSelect
                  className="lg:col-span-2"
                  label="Quality"
                  value={row.quality}
                  onChange={(v) => updateWithdrawal(i, { quality: v as WithdrawalRow["quality"] })}
                  options={WATER_QUALITY}
                  disabled={readOnly}
                />
                <LabeledNumber
                  className="lg:col-span-3"
                  label="Quantity"
                  value={row.quantity ?? ""}
                  min={0}
                  onChange={(n) => updateWithdrawal(i, { quantity: n })}
                  disabled={readOnly}
                />
                <LabeledSelect
                  className="lg:col-span-2"
                  label="Unit"
                  value={row.unit}
                  onChange={(v) => updateWithdrawal(i, { unit: v as WithdrawalRow["unit"] })}
                  options={WATER_UNITS.map((u) => u.value)}
                  renderLabel={(v) => WATER_UNITS.find((x) => x.value === v)?.label ?? v}
                  disabled={readOnly}
                />
                <div className="hidden lg:block lg:col-span-2" />
              </div>

              {/* Row 2: method + period */}
              <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-12">
                <LabeledSelect
                  className="lg:col-span-3"
                  label="Measurement method"
                  value={row.method}
                  onChange={(v) => updateWithdrawal(i, { method: v as WithdrawalRow["method"] })}
                  options={MEASUREMENT_METHODS}
                  disabled={readOnly}
                />
                <PeriodEditor
                  className="lg:col-span-3"
                  label="Period"
                  period={row.period}
                  onChange={(p) => updateWithdrawal(i, { period: p })}
                  disabled={readOnly}
                />
              </div>

              {!readOnly && <RowActions onRemove={() => removeWithdrawal(i)} />}
            </RowCard>
          ))}
        </div>

        {!readOnly && <AddButton onClick={addWithdrawal} label="+ Add withdrawal" />}
      </section>

      {/* Discharges */}
      <section>
        <CardHeader title="Water discharge" subtitle="Destinations, treatment, and method" />

        {(value.discharges ?? []).length === 0 && <EmptyState text="No discharges recorded yet." />}

        <div className="space-y-4">
          {(value.discharges ?? []).map((row, i) => (
            <RowCard key={`d-${i}`}>
              {/* Row 1: core attributes */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <LabeledSelect
                  className="lg:col-span-3"
                  label="Destination"
                  value={row.destination}
                  onChange={(v) => updateDischarge(i, { destination: v as DischargeRow["destination"] })}
                  options={DISCHARGE_DESTINATIONS}
                  disabled={readOnly}
                />
                <LabeledSelect
                  className="lg:col-span-2"
                  label="Quality"
                  value={row.quality}
                  onChange={(v) => updateDischarge(i, { quality: v as DischargeRow["quality"] })}
                  options={WATER_QUALITY}
                  disabled={readOnly}
                />
                <LabeledSelect
                  className="lg:col-span-3"
                  label="Treatment level (advanced)"
                  value={row.treatmentLevel}
                  onChange={(v) =>
                    updateDischarge(i, { treatmentLevel: v as DischargeRow["treatmentLevel"] })
                  }
                  options={TREATMENT_LEVELS}
                  disabled={readOnly}
                />
                <LabeledSelect
                  className="lg:col-span-2"
                  label="Sent for reuse?"
                  value={row.sentToOtherOrgForReuse ?? "No"}
                  onChange={(v) =>
                    updateDischarge(i, {
                      sentToOtherOrgForReuse: v as DischargeRow["sentToOtherOrgForReuse"],
                    })
                  }
                  options={YES_NO}
                  disabled={readOnly}
                />
                <div className="hidden lg:block lg:col-span-2" />
              </div>

              {/* Row 2: quantity/unit + method + period */}
              <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-12">
                <LabeledNumber
                  className="lg:col-span-3"
                  label="Quantity"
                  value={row.quantity ?? ""}
                  min={0}
                  onChange={(n) => updateDischarge(i, { quantity: n })}
                  disabled={readOnly}
                />
                <LabeledSelect
                  className="lg:col-span-2"
                  label="Unit"
                  value={row.unit}
                  onChange={(v) => updateDischarge(i, { unit: v as DischargeRow["unit"] })}
                  options={WATER_UNITS.map((u) => u.value)}
                  renderLabel={(v) => WATER_UNITS.find((x) => x.value === v)?.label ?? v}
                  disabled={readOnly}
                />
                <LabeledSelect
                  className="lg:col-span-3"
                  label="Measurement method"
                  value={row.method}
                  onChange={(v) => updateDischarge(i, { method: v as DischargeRow["method"] })}
                  options={MEASUREMENT_METHODS}
                  disabled={readOnly}
                />
                <PeriodEditor
                  className="lg:col-span-4"
                  label="Period"
                  period={row.period}
                  onChange={(p) => updateDischarge(i, { period: p })}
                  disabled={readOnly}
                />
              </div>

              {!readOnly && <RowActions onRemove={() => removeDischarge(i)} />}
            </RowCard>
          ))}
        </div>

        {!readOnly && <AddButton onClick={addDischarge} label="+ Add discharge" />}
      </section>
    </div>
  );
}

/* ============================== UI helpers =============================== */

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-2">
      <h3 className="font-medium text-gray-900">{title}</h3>
      {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
    </div>
  );
}

function RowCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/30 bg-white/50 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
      <div className="mb-4 h-px w-full bg-gradient-to-r from-[#3270a1]/0 via-[#7e509c]/25 to-[#8dcddb]/0" />
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-sm text-gray-600 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
      {text}
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 rounded-lg px-3 py-1.5 text-sm font-medium text-white shadow hover:shadow-md"
      style={{ background: "linear-gradient(90deg, #3270a1 0%, #7e509c 50%, #8dcddb 100%)" }}
    >
      {label}
    </button>
  );
}

function RowActions({ onRemove }: { onRemove: () => void }) {
  return (
    <div className="mt-4 flex justify-end">
      <button
        type="button"
        onClick={onRemove}
        className="rounded-lg border border-gray-300/70 bg-white/60 px-3 py-1.5 text-sm text-gray-800 shadow-sm backdrop-blur-sm transition hover:bg-white/80"
      >
        Remove
      </button>
    </div>
  );
}

/* ----------------------------- Labeled fields ---------------------------- */

function LabeledSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled,
  renderLabel,
  className,
}: {
  label: string;
  value: T | string | undefined;
  onChange: (v: string) => void;
  options: readonly T[] | string[];
  disabled?: boolean;
  renderLabel?: (v: string) => string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm text-gray-700">{label}</label>
      <select
        className="h-10 w-full rounded-lg border border-gray-300/70 bg-white/70 px-2 outline-none ring-0 focus:border-gray-400 focus:outline-none disabled:opacity-60"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map((o) => {
          const key = String(o);
          return (
            <option key={key} value={key}>
              {renderLabel ? renderLabel(key) : key}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function LabeledNumber({
  label,
  value,
  onChange,
  min,
  disabled,
  className,
}: {
  label: string;
  value: number | string;
  onChange: (n: number | null) => void;
  min?: number;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm text-gray-700">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        className="h-10 w-full rounded-lg border border-gray-300/70 bg-white/70 px-2 outline-none ring-0 focus:border-gray-400 focus:outline-none disabled:opacity-60"
        value={value === null ? "" : value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? null : Number(v));
        }}
        disabled={disabled}
      />
    </div>
  );
}

/* ------------------------------ Period editor ---------------------------- */

function PeriodEditor({
  label,
  period,
  onChange,
  disabled,
  className,
}: {
  label: string;
  period: WaterPeriod;
  onChange: (p: WaterPeriod) => void;
  disabled?: boolean;
  className?: string;
}) {
  const isMonth = period.mode === "month";

  return (
    <div className={className}>
      <label className="mb-1 block text-sm text-gray-700">{label}</label>

      {/* Segmented toggle */}
      <div className="mb-2 inline-flex rounded-lg border border-gray-300/70 bg-white/70 p-0.5 text-xs shadow-sm backdrop-blur">
        <button
          type="button"
          onClick={() => !disabled && onChange({ mode: "month", month: "" })}
          className={[
            "px-2 py-1 rounded-md",
            isMonth
              ? "bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] text-white"
              : "text-gray-800",
          ].join(" ")}
          disabled={disabled}
        >
          Month
        </button>
        <button
          type="button"
          onClick={() => !disabled && onChange({ mode: "range", startDate: "", endDate: "" })}
          className={[
            "px-2 py-1 rounded-md",
            !isMonth
              ? "bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] text-white"
              : "text-gray-800",
          ].join(" ")}
          disabled={disabled}
        >
          Range
        </button>
      </div>

      {isMonth ? (
        <input
          type="month"
          className="h-10 w-full rounded-lg border border-gray-300/70 bg-white/70 px-2 outline-none ring-0 focus:border-gray-400 focus:outline-none disabled:opacity-60"
          value={period.month ?? ""}
          onChange={(e) => onChange({ mode: "month", month: e.target.value })}
          disabled={disabled}
        />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-gray-600">Start date</label>
            <input
              type="date"
              className="h-10 w-full rounded-lg border border-gray-300/70 bg-white/70 px-2 outline-none ring-0 focus:border-gray-400 focus:outline-none disabled:opacity-60"
              value={period.startDate ?? ""}
              onChange={(e) =>
                onChange({ mode: "range", startDate: e.target.value, endDate: period.endDate })
              }
              disabled={disabled}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">End date</label>
            <input
              type="date"
              className="h-10 w-full rounded-lg border border-gray-300/70 bg-white/70 px-2 outline-none ring-0 focus:border-gray-400 focus:outline-none disabled:opacity-60"
              value={period.endDate ?? ""}
              onChange={(e) =>
                onChange({ mode: "range", startDate: (period as any).startDate, endDate: e.target.value })
              }
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}
