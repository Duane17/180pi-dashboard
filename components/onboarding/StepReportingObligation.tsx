"use client";

import { SelectInput } from "./SelectInput";
import { CalendarCheck } from "lucide-react";

export type ReportingObligation = "SUBJECT" | "VOLUNTARY";

interface StepReportingObligationData {
  reportingObligation: ReportingObligation | "";
}

interface StepReportingObligationProps {
  data: StepReportingObligationData;
  onChange: (data: StepReportingObligationData) => void;
  errors?: Partial<Record<keyof StepReportingObligationData, string>>;
}

const reportingOptions: { value: ReportingObligation; label: string }[] = [
  { value: "SUBJECT", label: "Subject to reporting (investors / banks request)" },
  { value: "VOLUNTARY", label: "Not subject to reporting (spontaneous / voluntary)" },
];

export function StepReportingObligation({
  data,
  onChange,
  errors,
}: StepReportingObligationProps) {
  const handleSelect = (value: string) => {
    onChange({ reportingObligation: (value as ReportingObligation) || "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Is your company subject to reporting?</h2>
        <p className="text-[#4a4a4a]">
          Let us know if you must report upon request, or if your disclosure is voluntary.
        </p>
      </div>

      <div className="space-y-6">
        <SelectInput
          label="Reporting obligation"
          placeholder="Select your reporting status"
          options={reportingOptions}
          value={data.reportingObligation}
          onChange={(e) => handleSelect(e.target.value)}
          error={errors?.reportingObligation}
          required
          helperText="This affects deadlines, supporting evidence requirements, and guidance we provide."
        />
      </div>

      {/* Informational helper card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CalendarCheck className="text-white w-3 h-3" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Why we ask</h4>
            <p className="text-sm text-blue-800">
              If you’re subject to reporting, you’ll need to meet external deadlines and evidence 
              standards. Voluntary reporters have more flexibility, but may still follow best practices 
              to stay ahead of stakeholder expectations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
