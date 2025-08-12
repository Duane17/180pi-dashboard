"use client"

import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormControl } from "@/components/ui/form"
import { FormNumberInput } from "./FormNumberInput"
import { SectionHeader } from "./SectionHeader"
import type { EssentialsFormData } from "./EssentialsForm"

export function EnvSection() {
  const {
    control,
    formState: { errors },
  } = useFormContext<EssentialsFormData>()

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/20">
      <SectionHeader
        title="Environment"
        description="Enter your company's environmental impact metrics for the selected reporting year"
      />

      <div className="space-y-6">
        <FormField
          control={control}
          name="ghgScope1"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FormNumberInput
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                  label="GHG Scope 1"
                  unit="tCO₂e"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  tooltip="Direct emissions from owned or controlled sources (e.g., company vehicles, on-site fuel combustion)"
                  helperText="Enter total direct greenhouse gas emissions for the selected year"
                  error={errors.ghgScope1?.message}
                  required
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="ghgScope2"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FormNumberInput
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                  label="GHG Scope 2 (location-based)"
                  unit="tCO₂e"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  tooltip="Indirect emissions from purchased electricity, steam, heating, and cooling based on grid average emission factors"
                  helperText="Enter location-based indirect emissions from energy consumption"
                  error={errors.ghgScope2?.message}
                  required
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="energyConsumption"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FormNumberInput
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                  label="Energy Consumption (Total)"
                  unit="MWh"
                  min={0}
                  step={0.1}
                  placeholder="0.0"
                  tooltip="Total energy consumed including electricity, heating, cooling, and other energy sources"
                  helperText="Enter company-level total energy consumption for the selected year"
                  error={errors.energyConsumption?.message}
                  required
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="waterUse"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FormNumberInput
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                  label="Water Use (Total)"
                  unit="m³"
                  min={0}
                  step={1}
                  placeholder="0"
                  tooltip="Total water consumption including municipal water, groundwater, and other water sources"
                  helperText="Enter total water consumption across all company operations"
                  error={errors.waterUse?.message}
                  required
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="wasteGenerated"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FormNumberInput
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                  label="Waste Generated (Total)"
                  unit="tonnes"
                  min={0}
                  step={0.1}
                  placeholder="0.0"
                  tooltip="Total waste generated including hazardous and non-hazardous waste streams"
                  helperText="Enter total waste generated across all company operations"
                  error={errors.wasteGenerated?.message}
                  required
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
