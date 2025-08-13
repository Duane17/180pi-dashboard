"use client";
import { SelectInput } from "./SelectInput";

interface BasicsData {
  companyName: string;
  legalForm: string;
  sector: string;
}

interface StepBasicsProps {
  data: BasicsData;
  onChange: (data: BasicsData) => void;
  errors?: Partial<Record<keyof BasicsData, string>>;
}

// Common legal forms for companies
const legalForms = [
  { value: "llc", label: "Limited Liability Company (LLC)" },
  { value: "corporation", label: "Corporation" },
  { value: "partnership", label: "Partnership" },
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "cooperative", label: "Cooperative" },
  { value: "nonprofit", label: "Non-Profit Organization" },
  { value: "other", label: "Other" },
];

// Simplified NACE codes for major sectors
const naceSectors = [
  { value: "A", label: "A - Agriculture, forestry and fishing" },
  { value: "B", label: "B - Mining and quarrying" },
  { value: "C", label: "C - Manufacturing" },
  { value: "D", label: "D - Electricity, gas, steam and air conditioning supply" },
  { value: "E", label: "E - Water supply; sewerage, waste management" },
  { value: "F", label: "F - Construction" },
  { value: "G", label: "G - Wholesale and retail trade" },
  { value: "H", label: "H - Transportation and storage" },
  { value: "I", label: "I - Accommodation and food service activities" },
  { value: "J", label: "J - Information and communication" },
  { value: "K", label: "K - Financial and insurance activities" },
  { value: "L", label: "L - Real estate activities" },
  { value: "M", label: "M - Professional, scientific and technical activities" },
  { value: "N", label: "N - Administrative and support service activities" },
  { value: "O", label: "O - Public administration and defence" },
  { value: "P", label: "P - Education" },
  { value: "Q", label: "Q - Human health and social work activities" },
  { value: "R", label: "R - Arts, entertainment and recreation" },
  { value: "S", label: "S - Other service activities" },
  { value: "T", label: "T - Household activities" },
  { value: "U", label: "U - Extraterritorial organisations and bodies" },
];

export function StepBasics({ data, onChange, errors }: StepBasicsProps) {
  const handleInputChange = (field: keyof BasicsData, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Company Basics</h2>
        <p className="text-[#4a4a4a]">Let&apos;s start with some basic information about your company</p>
      </div>

      <div className="space-y-6">
        {/* Company Name (read-only from registration/auth) */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[#1a1a1a]">Company Name</label>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-[#1a1a1a]">
            {data.companyName || "—"}
          </div>
          <p className="text-xs text-[#4a4a4a]">This was set during registration.</p>
        </div>

        <SelectInput
          label="Legal Form"
          placeholder="Select your company's legal structure"
          options={legalForms}
          value={data.legalForm}
          onChange={(e) => handleInputChange("legalForm", e.target.value)}
          error={errors?.legalForm}
          required
          helperText="Choose the legal structure that best describes your company"
        />

        <SelectInput
          label="Primary Sector (NACE Code)"
          placeholder="Select your primary business sector"
          options={naceSectors}
          value={data.sector}
          onChange={(e) => handleInputChange("sector", e.target.value)}
          error={errors?.sector}
          required
          helperText="Select the NACE code that best represents your primary business activity"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
        <div>
            <h4 className="font-medium text-blue-900 mb-1">About NACE Codes</h4>
            <p className="text-sm text-blue-800">
              NACE (Nomenclature of Economic Activities) codes are used to classify business activities across the
              European Union. This helps us provide more accurate sustainability reporting tailored to your industry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
