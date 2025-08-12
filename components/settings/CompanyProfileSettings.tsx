"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SettingsSection } from "./SettingsSection"
import { SettingsField } from "./SettingsField"
import { SaveButton } from "./SaveButton"
import { DiscardButton } from "./DiscardButton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, X, MapPin } from "lucide-react"

// Validation schema
const companyProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  legalForm: z.string().min(1, "Legal form is required"),
  sector: z.string().min(1, "Primary sector is required"),
  headquartersCountry: z.string().min(1, "Headquarters country is required"),
  employeeCount: z.string().min(1, "Employee count is required"),
  annualTurnover: z.string().min(1, "Annual turnover is required"),
  currency: z.string().min(1, "Currency is required"),
  siteLocations: z
    .array(
      z.object({
        id: z.string(),
        country: z.string().min(1, "Country is required"),
        city: z.string().min(1, "City is required"),
        description: z.string().optional(),
      }),
    )
    .optional(),
})

type CompanyProfileData = z.infer<typeof companyProfileSchema>

interface SiteLocation {
  id: string
  country: string
  city: string
  description?: string
}

interface CompanyProfileSettingsProps {
  data?: CompanyProfileData
  onSave?: (data: CompanyProfileData) => Promise<void>
  onDiscard?: () => void
  isLoading?: boolean
  className?: string
}

// Data constants from onboarding components
const legalForms = [
  { value: "llc", label: "Limited Liability Company (LLC)" },
  { value: "corporation", label: "Corporation" },
  { value: "partnership", label: "Partnership" },
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "cooperative", label: "Cooperative" },
  { value: "nonprofit", label: "Non-Profit Organization" },
  { value: "other", label: "Other" },
]

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
]

const countries = [
  { value: "US", label: "United States of America" },
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "NL", label: "Netherlands" },
  { value: "BE", label: "Belgium" },
  { value: "CH", label: "Switzerland" },
  { value: "AT", label: "Austria" },
  { value: "SE", label: "Sweden" },
  { value: "NO", label: "Norway" },
  { value: "DK", label: "Denmark" },
  { value: "FI", label: "Finland" },
]

const employeeRanges = [
  { value: "1-10", label: "1-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-250", label: "51-250" },
  { value: "251-500", label: "251-500" },
  { value: "501-1000", label: "501-1,000" },
  { value: "1001-5000", label: "1,001-5,000" },
  { value: "5001-10000", label: "5,001-10,000" },
  { value: "10000+", label: "10,000+" },
]

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "SEK", label: "SEK - Swedish Krona" },
  { value: "NOK", label: "NOK - Norwegian Krone" },
  { value: "DKK", label: "DKK - Danish Krone" },
]

export function CompanyProfileSettings({
  data,
  onSave,
  onDiscard,
  isLoading = false,
  className,
}: CompanyProfileSettingsProps) {
  const [saveState, setSaveState] = useState<"idle" | "loading" | "success">("idle")
  const [siteLocations, setSiteLocations] = useState<SiteLocation[]>(data?.siteLocations || [])

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<CompanyProfileData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: data?.companyName || "",
      legalForm: data?.legalForm || "",
      sector: data?.sector || "",
      headquartersCountry: data?.headquartersCountry || "",
      employeeCount: data?.employeeCount || "",
      annualTurnover: data?.annualTurnover || "",
      currency: data?.currency || "",
      siteLocations: data?.siteLocations || [],
    },
  })

  const handleSave = async (formData: CompanyProfileData) => {
    if (!onSave) return

    setSaveState("loading")
    try {
      await onSave({ ...formData, siteLocations })
      setSaveState("success")
      setTimeout(() => setSaveState("idle"), 2000)
    } catch (error) {
      setSaveState("idle")
      console.error("Save error:", error)
    }
  }

  const handleDiscard = () => {
    reset()
    setSiteLocations(data?.siteLocations || [])
    setSaveState("idle")
    onDiscard?.()
  }

  const addSiteLocation = () => {
    const newSite: SiteLocation = {
      id: `site-${Date.now()}`,
      country: "",
      city: "",
      description: "",
    }
    setSiteLocations([...siteLocations, newSite])
  }

  const updateSiteLocation = (id: string, field: keyof SiteLocation, value: string) => {
    setSiteLocations((sites) => sites.map((site) => (site.id === id ? { ...site, [field]: value } : site)))
  }

  const removeSiteLocation = (id: string) => {
    setSiteLocations((sites) => sites.filter((site) => site.id !== id))
  }

  return (
    <form onSubmit={handleSubmit(handleSave)} className={className}>
      <SettingsSection
        title="Company Profile"
        description="Manage your company's basic information and locations"
        actions={
          <div className="flex items-center gap-3">
            <DiscardButton onClick={handleDiscard} disabled={!isDirty || saveState === "loading"} />
            <SaveButton
              type="submit"
              disabled={!isDirty}
              loading={saveState === "loading"}
              success={saveState === "success"}
            />
          </div>
        }
      >
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingsField
            label="Company Name"
            description="The official registered name of your company"
            error={errors.companyName?.message}
            required
          >
            <Input {...register("companyName")} placeholder="Enter company name" className="w-full" />
          </SettingsField>

          <SettingsField
            label="Legal Form"
            description="Your company's legal structure"
            error={errors.legalForm?.message}
            required
          >
            <Select
              value={watch("legalForm")}
              onValueChange={(value) => setValue("legalForm", value, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select legal form" />
              </SelectTrigger>
              <SelectContent>
                {legalForms.map((form) => (
                  <SelectItem key={form.value} value={form.value}>
                    {form.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsField>

          <SettingsField
            label="Primary Sector (NACE)"
            description="Your primary business activity classification"
            error={errors.sector?.message}
            required
          >
            <Select value={watch("sector")} onValueChange={(value) => setValue("sector", value, { shouldDirty: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {naceSectors.map((sector) => (
                  <SelectItem key={sector.value} value={sector.value}>
                    {sector.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsField>

          <SettingsField
            label="Headquarters Country"
            description="Country where your main office is located"
            error={errors.headquartersCountry?.message}
            required
          >
            <Select
              value={watch("headquartersCountry")}
              onValueChange={(value) => setValue("headquartersCountry", value, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsField>
        </div>

        {/* Size & Financial Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <SettingsField
            label="Employee Count"
            description="Number of full-time equivalent employees"
            error={errors.employeeCount?.message}
            required
          >
            <Select
              value={watch("employeeCount")}
              onValueChange={(value) => setValue("employeeCount", value, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {employeeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsField>

          <SettingsField
            label="Currency"
            description="Primary currency for financial reporting"
            error={errors.currency?.message}
            required
          >
            <Select
              value={watch("currency")}
              onValueChange={(value) => setValue("currency", value, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsField>

          <SettingsField
            label="Annual Turnover"
            description="Total annual revenue"
            error={errors.annualTurnover?.message}
            required
          >
            <Input {...register("annualTurnover")} type="number" placeholder="Enter amount" className="w-full" />
          </SettingsField>
        </div>

        {/* Site Locations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Additional Site Locations</h3>
              <p className="text-sm text-gray-600">Add other locations where your company operates</p>
            </div>
            <Button
              type="button"
              onClick={addSiteLocation}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </div>

          {siteLocations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No additional locations added</p>
            </div>
          ) : (
            <div className="space-y-4">
              {siteLocations.map((site) => (
                <div key={site.id} className="glass-card p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Site Location</h4>
                    <Button
                      type="button"
                      onClick={() => removeSiteLocation(site.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingsField label="Country" required>
                      <Select
                        value={site.country}
                        onValueChange={(value) => updateSiteLocation(site.id, "country", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </SettingsField>

                    <SettingsField label="City" required>
                      <Input
                        value={site.city}
                        onChange={(e) => updateSiteLocation(site.id, "city", e.target.value)}
                        placeholder="Enter city name"
                      />
                    </SettingsField>
                  </div>

                  <SettingsField label="Description" className="mt-4">
                    <Input
                      value={site.description || ""}
                      onChange={(e) => updateSiteLocation(site.id, "description", e.target.value)}
                      placeholder="Optional description (e.g., Manufacturing facility, Sales office)"
                    />
                  </SettingsField>
                </div>
              ))}
            </div>
          )}
        </div>
      </SettingsSection>
    </form>
  )
}
