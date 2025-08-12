"use client"
import { Edit2, Building, MapPin, Users, CheckCircle } from "lucide-react"

interface BasicsData {
  companyName: string
  legalForm: string
  sector: string
}

interface SiteLocation {
  id: string
  country: string
  city: string
  description: string
}

interface LocationData {
  headquartersCountry: string
  siteLocations: SiteLocation[]
}

interface SizeFinancesData {
  employeeCount: string
  annualTurnover: string
  currency: string
}

interface ReviewData {
  basics: BasicsData
  location: LocationData
  sizeFinances: SizeFinancesData
}

interface StepReviewProps {
  data: ReviewData
  onEdit: (step: number) => void
  isSubmitting?: boolean
}

// Helper function to get readable labels
const getLegalFormLabel = (value: string) => {
  const forms: Record<string, string> = {
    llc: "Limited Liability Company (LLC)",
    corporation: "Corporation",
    partnership: "Partnership",
    sole_proprietorship: "Sole Proprietorship",
    cooperative: "Cooperative",
    nonprofit: "Non-Profit Organization",
    other: "Other",
  }
  return forms[value] || value
}

const getSectorLabel = (value: string) => {
  const sectors: Record<string, string> = {
    A: "A - Agriculture, forestry and fishing",
    B: "B - Mining and quarrying",
    C: "C - Manufacturing",
    D: "D - Electricity, gas, steam and air conditioning supply",
    E: "E - Water supply; sewerage, waste management",
    F: "F - Construction",
    G: "G - Wholesale and retail trade",
    H: "H - Transportation and storage",
    I: "I - Accommodation and food service activities",
    J: "J - Information and communication",
    K: "K - Financial and insurance activities",
    L: "L - Real estate activities",
    M: "M - Professional, scientific and technical activities",
    N: "N - Administrative and support service activities",
    O: "O - Public administration and defence",
    P: "P - Education",
    Q: "Q - Human health and social work activities",
    R: "R - Arts, entertainment and recreation",
    S: "S - Other service activities",
    T: "T - Household activities",
    U: "U - Extraterritorial organisations and bodies",
  }
  return sectors[value] || value
}

const getCountryLabel = (code: string) => {
  // This would typically come from the same countries array used in StepLocation
  // For brevity, showing a few examples
  const countries: Record<string, string> = {
    US: "United States of America",
    GB: "United Kingdom",
    DE: "Germany",
    FR: "France",
    IT: "Italy",
    ES: "Spain",
    NL: "Netherlands",
    BE: "Belgium",
    CH: "Switzerland",
    AT: "Austria",
    SE: "Sweden",
    NO: "Norway",
    DK: "Denmark",
    FI: "Finland",
    // Add more as needed
  }
  return countries[code] || code
}

const getEmployeeRangeLabel = (value: string) => {
  const ranges: Record<string, string> = {
    "1-10": "1-10 employees (Micro enterprise)",
    "11-50": "11-50 employees (Small enterprise)",
    "51-250": "51-250 employees (Medium enterprise)",
    "251-500": "251-500 employees",
    "501-1000": "501-1,000 employees",
    "1001-5000": "1,001-5,000 employees",
    "5001-10000": "5,001-10,000 employees",
    "10000+": "10,000+ employees (Large enterprise)",
  }
  return ranges[value] || value
}

export function StepReview({ data, onEdit, isSubmitting = false }: StepReviewProps) {
  const formatTurnover = (value: string, currency: string) => {
    if (!value) return "Not specified"
    const num = Number.parseFloat(value)
    if (isNaN(num)) return value
    return `${currency} ${num.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Review Your Information</h2>
        <p className="text-[#4a4a4a]">Please review all details before completing your setup</p>
      </div>

      <div className="space-y-6">
        {/* Company Basics */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-[#3270a1]" />
              <h3 className="text-lg font-semibold text-[#1a1a1a]">Company Basics</h3>
            </div>
            <button
              type="button"
              onClick={() => onEdit(1)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#3270a1] hover:text-[#7e509c] hover:bg-blue-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#4a4a4a]">Company Name:</span>
              <span className="font-medium text-[#1a1a1a]">{data.basics.companyName || "Not specified"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4a4a4a]">Legal Form:</span>
              <span className="font-medium text-[#1a1a1a]">{getLegalFormLabel(data.basics.legalForm)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4a4a4a]">Primary Sector:</span>
              <span className="font-medium text-[#1a1a1a]">{getSectorLabel(data.basics.sector)}</span>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#3270a1]" />
              <h3 className="text-lg font-semibold text-[#1a1a1a]">Locations</h3>
            </div>
            <button
              type="button"
              onClick={() => onEdit(2)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#3270a1] hover:text-[#7e509c] hover:bg-blue-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#4a4a4a]">Headquarters:</span>
              <span className="font-medium text-[#1a1a1a]">
                {getCountryLabel(data.location.headquartersCountry) || "Not specified"}
              </span>
            </div>
            {data.location.siteLocations.length > 0 && (
              <div>
                <span className="text-[#4a4a4a] block mb-2">Additional Sites:</span>
                <div className="space-y-2">
                  {data.location.siteLocations.map((site) => (
                    <div key={site.id} className="ml-4 p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-[#1a1a1a]">
                        {site.city}, {getCountryLabel(site.country)}
                      </div>
                      {site.description && <div className="text-sm text-[#4a4a4a] mt-1">{site.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.location.siteLocations.length === 0 && (
              <div className="flex justify-between">
                <span className="text-[#4a4a4a]">Additional Sites:</span>
                <span className="font-medium text-[#4a4a4a]">None</span>
              </div>
            )}
          </div>
        </div>

        {/* Size & Finances */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-[#3270a1]" />
              <h3 className="text-lg font-semibold text-[#1a1a1a]">Size & Finances</h3>
            </div>
            <button
              type="button"
              onClick={() => onEdit(3)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#3270a1] hover:text-[#7e509c] hover:bg-blue-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#4a4a4a]">Employees:</span>
              <span className="font-medium text-[#1a1a1a]">
                {getEmployeeRangeLabel(data.sizeFinances.employeeCount) || "Not specified"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4a4a4a]">Currency:</span>
              <span className="font-medium text-[#1a1a1a]">{data.sizeFinances.currency || "Not specified"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4a4a4a]">Annual Turnover:</span>
              <span className="font-medium text-[#1a1a1a]">
                {formatTurnover(data.sizeFinances.annualTurnover, data.sizeFinances.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Message */}
      <div className="bg-gradient-to-r from-[#8dcddb]/10 via-[#3270a1]/10 to-[#7e509c]/10 border border-[#3270a1]/20 rounded-lg p-6 mt-8">
        <div className="flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-[#3270a1] flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-[#1a1a1a] mb-2">Ready to Complete Setup</h4>
            <p className="text-[#4a4a4a] mb-4">
              Once you submit this information, we'll create your personalized ESG reporting dashboard and begin
              analyzing your company's sustainability profile based on your industry, size, and locations.
            </p>
            <div className="text-sm text-[#4a4a4a]">
              <strong>Next steps after submission:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Access your customized ESG dashboard</li>
                <li>Begin data collection for your first sustainability report</li>
                <li>Explore climate impact simulations for your investment decisions</li>
                <li>Connect with our ESG experts for personalized guidance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
