"use client"

import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormControl } from "@/components/ui/form"
import { FormNumberInput } from "./FormNumberInput"
import { SectionHeader } from "./SectionHeader"
import type { EssentialsFormData } from "./EssentialsForm"

export function LaborSection() {
  const {
    control,
    formState: { errors },
  } = useFormContext<EssentialsFormData>()

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/20">
      <SectionHeader
        title="Labor"
        description="Enter your company's workforce and diversity metrics for the selected reporting year"
      />

      <div className="space-y-6">
        <FormField
          control={control}
          name="workforceSize"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FormNumberInput
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value, 10) : undefined)}
                  label="Workforce Size (FTE)"
                  unit="FTE"
                  min={0}
                  step={1}
                  placeholder="0"
                  tooltip="Full-time equivalent employees including permanent, temporary, and contract workers"
                  helperText="Enter total workforce size as full-time equivalents (e.g., 150 for 150 FTE)"
                  error={errors.workforceSize?.message}
                  required
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="genderDiversityOverall"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FormNumberInput
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                  label="Gender Diversity (Overall, % women)"
                  unit="%"
                  min={0}
                  max={100}
                  step={0.1}
                  placeholder="0.0"
                  tooltip="Percentage of women in the total workforce across all levels and departments"
                  helperText="Enter percentage of women in overall workforce (e.g., 45.5 for 45.5%)"
                  error={errors.genderDiversityOverall?.message}
                  required
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="genderDiversityManagement"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FormNumberInput
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                  label="Gender Diversity (Management, % women)"
                  unit="%"
                  min={0}
                  max={100}
                  step={0.1}
                  placeholder="0.0"
                  tooltip="Percentage of women in management and leadership positions (optional but recommended)"
                  helperText="Enter percentage of women in management roles (optional field)"
                  error={errors.genderDiversityManagement?.message}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
