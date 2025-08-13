"use client"
import { FormTextInput } from "./FormTextInput"
import { SelectInput } from "./SelectInput"
import { Users, DollarSign, Lock, BarChart3 } from "lucide-react"

interface SizeFinancesData {
  employeeCount: string
  annualTurnover: string
  currency: string
}

interface StepSizeFinancesProps {
  data: SizeFinancesData
  onChange: (data: SizeFinancesData) => void
  errors?: Partial<Record<keyof SizeFinancesData, string>>
}

// Employee count ranges for better categorization
const employeeRanges = [
  { value: "1-10", label: "1-10 employees (Micro enterprise)" },
  { value: "11-50", label: "11-50 employees (Small enterprise)" },
  { value: "51-250", label: "51-250 employees (Medium enterprise)" },
  { value: "251-500", label: "251-500 employees" },
  { value: "501-1000", label: "501-1,000 employees" },
  { value: "1001-5000", label: "1,001-5,000 employees" },
  { value: "5001-10000", label: "5,001-10,000 employees" },
  { value: "10000+", label: "10,000+ employees (Large enterprise)" },
]

// Major world currencies
const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "SEK", label: "SEK - Swedish Krona" },
  { value: "NOK", label: "NOK - Norwegian Krone" },
  { value: "DKK", label: "DKK - Danish Krone" },
  { value: "PLN", label: "PLN - Polish Złoty" },
  { value: "CZK", label: "CZK - Czech Koruna" },
  { value: "HUF", label: "HUF - Hungarian Forint" },
  { value: "RON", label: "RON - Romanian Leu" },
  { value: "BGN", label: "BGN - Bulgarian Lev" },
  { value: "HRK", label: "HRK - Croatian Kuna" },
  { value: "RUB", label: "RUB - Russian Ruble" },
  { value: "TRY", label: "TRY - Turkish Lira" },
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "MXN", label: "MXN - Mexican Peso" },
  { value: "ARS", label: "ARS - Argentine Peso" },
  { value: "CLP", label: "CLP - Chilean Peso" },
  { value: "COP", label: "COP - Colombian Peso" },
  { value: "PEN", label: "PEN - Peruvian Sol" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "KRW", label: "KRW - South Korean Won" },
  { value: "SGD", label: "SGD - Singapore Dollar" },
  { value: "HKD", label: "HKD - Hong Kong Dollar" },
  { value: "TWD", label: "TWD - Taiwan Dollar" },
  { value: "THB", label: "THB - Thai Baht" },
  { value: "MYR", label: "MYR - Malaysian Ringgit" },
  { value: "IDR", label: "IDR - Indonesian Rupiah" },
  { value: "PHP", label: "PHP - Philippine Peso" },
  { value: "VND", label: "VND - Vietnamese Dong" },
  { value: "ZAR", label: "ZAR - South African Rand" },
  { value: "EGP", label: "EGP - Egyptian Pound" },
  { value: "MAD", label: "MAD - Moroccan Dirham" },
  { value: "NGN", label: "NGN - Nigerian Naira" },
  { value: "KES", label: "KES - Kenyan Shilling" },
  { value: "GHS", label: "GHS - Ghanaian Cedi" },
  { value: "AED", label: "AED - UAE Dirham" },
  { value: "SAR", label: "SAR - Saudi Riyal" },
  { value: "QAR", label: "QAR - Qatari Riyal" },
  { value: "KWD", label: "KWD - Kuwaiti Dinar" },
  { value: "BHD", label: "BHD - Bahraini Dinar" },
  { value: "OMR", label: "OMR - Omani Rial" },
  { value: "ILS", label: "ILS - Israeli Shekel" },
]

export function StepSizeFinances({ data, onChange, errors }: StepSizeFinancesProps) {
  const handleInputChange = (field: keyof SizeFinancesData, value: string) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  // Format number input for turnover
  const handleTurnoverChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "")
    handleInputChange("annualTurnover", numericValue)
  }

  const formatTurnoverDisplay = (value: string) => {
    if (!value) return ""
    const num = Number.parseFloat(value)
    if (isNaN(num)) return value
    return num.toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Company Size & Finances</h2>
        <p className="text-[#4a4a4a]">Help us understand the scale of your operations</p>
      </div>

      <div className="space-y-6">
        {/* Employee Count */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#3270a1]" />
            <h3 className="text-lg font-semibold text-[#1a1a1a]">Company Size</h3>
          </div>

          <SelectInput
            label="Number of Employees (FTE)"
            placeholder="Select your employee count range"
            options={employeeRanges}
            value={data.employeeCount}
            onChange={(e) => handleInputChange("employeeCount", e.target.value)}
            error={errors?.employeeCount}
            required
            helperText="Full-Time Equivalent (FTE) employees including contractors working full-time hours"
          />
        </div>

        {/* Financial Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-[#3270a1]" />
            <h3 className="text-lg font-semibold text-[#1a1a1a]">Financial Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectInput
              label="Currency"
              placeholder="Select your reporting currency"
              options={currencies}
              value={data.currency}
              onChange={(e) => handleInputChange("currency", e.target.value)}
              error={errors?.currency}
              required
              helperText="Primary currency for financial reporting"
            />

            <FormTextInput
              label="Annual Turnover"
              placeholder="Enter annual revenue"
              value={formatTurnoverDisplay(data.annualTurnover)}
              onChange={(e) => handleTurnoverChange(e.target.value)}
              error={errors?.annualTurnover}
              required
              helperText="Gross annual revenue for the most recent fiscal year"
            />
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Why We Need This</h4>
              <p className="text-sm text-blue-800">
                Company size and financial data help us provide appropriate sustainability frameworks and benchmarking relevant to
                your business scale.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lock className="text-white w-3 h-3" />
            </div>
            <div>
              <h4 className="font-medium text-green-900 mb-1">Data Security</h4>
              <p className="text-sm text-green-800">
                All financial information is encrypted and used solely for sustainability reporting calibration. We never share
                sensitive business data.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <BarChart3 className="text-white w-3 h-3" />
          </div>
          <div>
            <h4 className="font-medium text-purple-900 mb-1">Sustainability Reporting Standards</h4>
            <p className="text-sm text-purple-800">
              Based on your company size, we'll recommend appropriate Sustainability reporting frameworks such as GRI, SASB, or
              TCFD that align with regulatory requirements for your business scale.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
