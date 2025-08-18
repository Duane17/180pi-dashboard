"use client";

import { useMemo } from "react";
import {
  Divider,
  SectionHeader,
  RowList,
  NumberField,
  TextField,
  SelectField,
} from "@/components/upload/env/ui";

import {
  WASTE_STREAMS,
  WASTE_HAZARD_CLASSES,
  WASTE_STATES,
  WASTE_ROUTES,
  WASTE_METHODS_DIVERTED,
  WASTE_METHODS_DISPOSAL,
  WASTE_DESTINATIONS,
  WASTE_UNITS,
  WASTE_MEASUREMENT_METHODS,
} from "@/constants/esg.waste.constants";

import type { ESGWizardValues } from "@/types/esg-wizard.types";

// Infer types from schema through the global types
type WasteValues =
  NonNullable<ESGWizardValues["environment"]["waste"]>;
type WasteRow = WasteValues["rows"][number];

type Props = {
  value: WasteValues;
  onChange: (patch: Partial<WasteValues>) => void;
  readOnly?: boolean;
};

export function WasteCard({ value, onChange, readOnly }: Props) {
  const rows = value?.rows ?? [];

  const addRow = () => {
    if (readOnly) return;
    const next: WasteRow = {
      stream: "Paper & cardboard",
      hazardClass: "Non-hazardous",
      physicalState: "Solid",
      managementRoute: "Diverted from disposal",
      managementMethod: "Recycling",
      destination: "Off-site",
      quantity: null,
      unit: "kg",
      measurementMethod: "Weighbridge",
      otherStreamText: undefined,
    };
    onChange({ rows: [...rows, next] });
  };

  const updateRow = (i: number, patch: Partial<WasteRow>) => {
    const next = [...rows];
    next[i] = {
      ...next[i],
      ...patch,
      // keep method valid for route on every change
      managementMethod:
        (patch.managementRoute ?? next[i].managementRoute) === "Diverted from disposal"
          ? (WASTE_METHODS_DIVERTED as readonly string[]).includes(
              (patch.managementMethod ?? next[i].managementMethod) as string
            )
            ? (patch.managementMethod ?? next[i].managementMethod)
            : "Recycling"
          : (WASTE_METHODS_DISPOSAL as readonly string[]).includes(
              (patch.managementMethod ?? next[i].managementMethod) as string
            )
            ? (patch.managementMethod ?? next[i].managementMethod)
            : "Landfill",
    };
    onChange({ rows: next });
  };

  const removeRow = (i: number) => {
    if (readOnly) return;
    const next = [...rows];
    next.splice(i, 1);
    onChange({ rows: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-900">Waste</h3>
        <p className="text-sm text-gray-600">
          Record generated waste, the management route/method, and measurement details.
        </p>
      </div>

      <SectionHeader title="Waste inventory" />
      <RowList
        rows={rows}
        onAdd={addRow}
        onUpdate={(i, patch) => updateRow(i, patch)}
        onRemove={removeRow}
        render={(row, update) => {
          const methodsForRoute =
            row.managementRoute === "Diverted from disposal"
              ? WASTE_METHODS_DIVERTED
              : WASTE_METHODS_DISPOSAL;

          return (
            <>
              {/* Inputs grid: 2-up small, 3-up md, 6-up lg */}
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <div className="min-w-0 md:col-span-1 lg:col-span-2">
                  <SelectField
                    label="Waste stream"
                    value={row.stream}
                    options={WASTE_STREAMS}
                    onChange={(v) => {
                      const stream = (v as WasteRow["stream"]) || "Paper & cardboard";
                      update({ stream, otherStreamText: stream === "Other (specify)" ? (row.otherStreamText ?? "") : undefined });
                    }}
                  />
                  {row.stream === "Other (specify)" && (
                    <div className="mt-2">
                      <TextField
                        label="Specify stream"
                        value={row.otherStreamText ?? ""}
                        onChange={(txt) => update({ otherStreamText: txt })}
                      />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <SelectField
                    label="Hazard class"
                    value={row.hazardClass}
                    options={WASTE_HAZARD_CLASSES}
                    onChange={(v) => update({ hazardClass: v as WasteRow["hazardClass"] })}
                  />
                </div>

                <div className="min-w-0">
                  <SelectField
                    label="Physical state"
                    value={row.physicalState}
                    options={WASTE_STATES}
                    onChange={(v) => update({ physicalState: v as WasteRow["physicalState"] })}
                  />
                </div>

                <div className="min-w-0">
                  <SelectField
                    label="Route"
                    value={row.managementRoute}
                    options={WASTE_ROUTES}
                    onChange={(v) =>
                      update({
                        managementRoute: v as WasteRow["managementRoute"],
                        // reset method to a valid default for the route
                        managementMethod:
                          v === "Diverted from disposal" ? "Recycling" : "Landfill",
                      })
                    }
                  />
                </div>

                <div className="min-w-0">
                  <SelectField
                    label="Method"
                    value={row.managementMethod}
                    options={methodsForRoute}
                    onChange={(v) => update({ managementMethod: v as WasteRow["managementMethod"] })}
                  />
                </div>

                <div className="min-w-0">
                  <SelectField
                    label="Destination"
                    value={row.destination}
                    options={WASTE_DESTINATIONS}
                    onChange={(v) => update({ destination: v as WasteRow["destination"] })}
                  />
                </div>

                <div className="min-w-0">
                  <NumberField
                    label="Quantity"
                    min={0}
                    value={row.quantity ?? ""}
                    onChange={(n) => update({ quantity: n })}
                  />
                </div>

                <div className="min-w-0">
                  <SelectField
                    label="Unit"
                    value={row.unit}
                    options={WASTE_UNITS}
                    onChange={(v) => update({ unit: v as WasteRow["unit"] })}
                  />
                </div>

                <div className="min-w-0 md:col-span-1 lg:col-span-2">
                  <SelectField
                    label="Measurement method"
                    value={row.measurementMethod}
                    options={WASTE_MEASUREMENT_METHODS}
                    onChange={(v) =>
                      update({ measurementMethod: v as WasteRow["measurementMethod"] })
                    }
                  />
                </div>
              </div>
            </>
          );
        }}
      />

      <div className="rounded-2xl border border-white/30 bg-white/50 p-4 backdrop-blur-sm">
        <label className="mb-1 block text-sm text-gray-700">Notes</label>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-gray-300/70 bg-white/70 p-2 outline-none ring-0 focus:border-gray-400 focus:outline-none"
          placeholder="Assumptions, segregations, EWC codes, etc."
          value={value?.note ?? ""}
          onChange={(e) => onChange({ note: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}
