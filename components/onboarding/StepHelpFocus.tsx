"use client";

import { SelectInput } from "./SelectInput";
import { Compass } from "lucide-react";

export type HelpFocus =
  | "FOOTPRINT"
  | "DISCLOSURE"
  | "REPORT_PREP"
  | "TARGETS_REDUCTION"
  | "SUPPLY_CHAIN"
  | "FINANCED"
  | "CREDITS_CLEAN_POWER";

interface StepHelpFocusData {
  helpFocus: HelpFocus | "";
}

interface StepHelpFocusProps {
  data: StepHelpFocusData;
  onChange: (data: StepHelpFocusData) => void;
  errors?: Partial<Record<keyof StepHelpFocusData, string>>;
}

/** Options for the Help Focus single-select */
const helpFocusOptions: { value: HelpFocus; label: string }[] = [
  { value: "FOOTPRINT",            label: "Measuring my carbon footprint" },
  { value: "DISCLOSURE",           label: "Reporting or disclosing emissions" },
  { value: "REPORT_PREP",          label: "Preparing for sustainability reporting" },
  { value: "TARGETS_REDUCTION",    label: "Setting targets and reducing emissions" },
  { value: "SUPPLY_CHAIN",         label: "Measure, report and act on supply-chain emissions" },
  { value: "FINANCED",             label: "Measure, report and act on financed emissions" },
  { value: "CREDITS_CLEAN_POWER",  label: "Purchasing carbon removal credits / switching to clean power" },
];

export function StepHelpFocus({ data, onChange, errors }: StepHelpFocusProps) {
  const handleSelect = (value: string) => {
    // Narrow the string to HelpFocus | "" for type-safety
    onChange({ helpFocus: (value as HelpFocus) || "" });
  };

  return (
    <div className="space-y-6">
      {/* Header (matches existing step styling) */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">How can we help you first?</h2>
        <p className="text-[#4a4a4a]">
          Choose the primary outcome you want to achieve. You can change this later.
        </p>
      </div>

      <div className="space-y-6">
        {/* Single-select control using shared SelectInput */}
        <SelectInput
          label="Primary help focus"
          placeholder="Select what you want to do first"
          options={helpFocusOptions}
          value={data.helpFocus}
          onChange={(e) => handleSelect(e.target.value)}
          error={errors?.helpFocus}
          required
          helperText="We’ll personalize your experience and recommended modules."
        />
      </div>

      {/* Informational helper card to match your previous step aesthetic */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Compass className="text-white w-3 h-3" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Personalized onboarding</h4>
            <p className="text-sm text-blue-800">
              Your selection helps us tailor the onboarding flow, surface the most relevant tools,
              and suggest a quick-start checklist aligned to your goals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
