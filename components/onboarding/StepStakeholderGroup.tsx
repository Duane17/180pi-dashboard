"use client";

import { SelectInput } from "./SelectInput";
import { Users } from "lucide-react";

export type StakeholderGroup =
  | "INVESTOR_ASSET_FINANCIAL_RATING"
  | "AUDITOR_CONSULTANT"
  | "NGO_ADVOCACY"
  | "MEDIA_JOURNALIST"
  | "REGULATOR_POLICYMAKER_STANDARD_SETTER"
  | "DATA_PROVIDER"
  | "ACADEMIC_RESEARCH"
  | "EMPLOYEE"
  | "CONSUMER"
  | "CONCERNED_CITIZEN";

interface StepStakeholderGroupData {
  stakeholderGroup: StakeholderGroup | "";
}

interface StepStakeholderGroupProps {
  data: StepStakeholderGroupData;
  onChange: (data: StepStakeholderGroupData) => void;
  errors?: Partial<Record<keyof StepStakeholderGroupData, string>>;
}

const stakeholderOptions: { value: StakeholderGroup; label: string }[] = [
  { value: "INVESTOR_ASSET_FINANCIAL_RATING", label: "Investor / Asset Manager / Financial Analyst / Rating Provider" },
  { value: "AUDITOR_CONSULTANT", label: "Auditor / Consultant" },
  { value: "NGO_ADVOCACY", label: "NGO / Advocacy Group" },
  { value: "MEDIA_JOURNALIST", label: "Media / Journalist" },
  { value: "REGULATOR_POLICYMAKER_STANDARD_SETTER", label: "Regulator / Policymaker / Standard Setter" },
  { value: "DATA_PROVIDER", label: "Data Provider" },
  { value: "ACADEMIC_RESEARCH", label: "Academic / Research Institution" },
  { value: "EMPLOYEE", label: "Employee" },
  { value: "CONSUMER", label: "Consumer" },
  { value: "CONCERNED_CITIZEN", label: "Concerned Citizen" },
];

export function StepStakeholderGroup({
  data,
  onChange,
  errors,
}: StepStakeholderGroupProps) {
  const handleSelect = (value: string) => {
    onChange({ stakeholderGroup: (value as StakeholderGroup) || "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">
          Which interest group do you belong to?
        </h2>
        <p className="text-[#4a4a4a]">
          Choose the group you represent so we can tailor insights and recommendations.
        </p>
      </div>

      {/* Selector */}
      <div className="space-y-6">
        <SelectInput
          label="Stakeholder group"
          placeholder="Select your stakeholder group"
          options={stakeholderOptions}
          value={data.stakeholderGroup}
          onChange={(e) => handleSelect(e.target.value)}
          error={errors?.stakeholderGroup}
          required
          helperText="Understanding your role improves relevance of insights."
        />
      </div>

      {/* Helper Card */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Users className="text-white w-3 h-3" />
          </div>
          <div>
            <h4 className="font-medium text-green-900 mb-1">Why we ask</h4>
            <p className="text-sm text-green-800">
              Your perspective shapes which modules, disclosures, and benchmarks we surface first—
              whether you’re investing, auditing, reporting, or simply exploring climate impact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
