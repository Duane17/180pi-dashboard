"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/AppShell" // ✅ Import the app shell
import { EssentialsShell } from "@/components/essentials/EssentialsShell"
import { YearSwitcher } from "@/components/essentials/YearSwitcher"
import { EssentialsForm, type EssentialsFormData } from "@/components/essentials/EssentialsForm"
import { EnvSection } from "@/components/essentials/EnvSection"
import { LaborSection } from "@/components/essentials/LaborSection"
import { ValidationSummary } from "@/components/essentials/ValidationSummary"
import { SaveToast } from "@/components/essentials/SaveToast"
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { ErrorState } from "@/components/dashboard/ErrorState"
import { RoleGuard } from "@/components/rbac/RoleGuard"

// Mock data
const mockFormData: Record<number, Partial<EssentialsFormData>> = {
  2024: {
    ghgScope1: 1245.5,
    ghgScope2: 2890.2,
    energyConsumption: 4567.8,
    waterUse: 12340,
    wasteGenerated: 89.5,
    workforceSize: 1247,
    genderDiversityOverall: 42.3,
    genderDiversityManagement: 38.5,
  },
  2023: {
    ghgScope1: 1356.2,
    ghgScope2: 3100.5,
    energyConsumption: 4500.0,
    waterUse: 12500,
    wasteGenerated: 92.0,
    workforceSize: 1147,
    genderDiversityOverall: 41.2,
    genderDiversityManagement: 36.8,
  },
}

const availableYears = [2024, 2023, 2022, 2021, 2020]

interface ValidationIssue {
  field?: string
  message: string
}

export default function EssentialsDataPage() {
  const [selectedYear, setSelectedYear] = useState(2024)
  const [formData, setFormData] = useState<Partial<EssentialsFormData>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const [lastSaved, setLastSaved] = useState<Date | undefined>()
  const [showSaveToast, setShowSaveToast] = useState(false)
  const [saveToastMessage, setSaveToastMessage] = useState("")

  // Mock user for RBAC
  const mockUser = {
    id: "1",
    name: "Maha Chairi",
    email: "Maha@180pi.com",
    role: "admin" as const,
    permissions: ["data.edit", "data.validate", "data.submit"],
  }

  const canEditData = mockUser.role === "admin" || mockUser.role === "member"

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setIsError(false)
      try {
        await new Promise((resolve) => setTimeout(resolve, 800))
        const yearData = mockFormData[selectedYear] || {}
        setFormData(yearData)
      } catch {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [selectedYear])

  const handleYearChange = (year: number) => {
    setSelectedYear(year)
    setValidationIssues([])
  }

  const handleValidate = async () => {
    setIsValidating(true)
    setValidationIssues([])

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const issues: ValidationIssue[] = []

      if (!formData.ghgScope1 || formData.ghgScope1 <= 0)
        issues.push({ field: "ghgScope1", message: "GHG Scope 1 emissions are required and must be greater than 0" })

      if (!formData.ghgScope2 || formData.ghgScope2 <= 0)
        issues.push({ field: "ghgScope2", message: "GHG Scope 2 emissions are required and must be greater than 0" })

      if (!formData.workforceSize || formData.workforceSize <= 0)
        issues.push({ field: "workforceSize", message: "Workforce size is required and must be greater than 0" })

      if (
        formData.genderDiversityOverall &&
        (formData.genderDiversityOverall < 0 || formData.genderDiversityOverall > 100)
      ) {
        issues.push({
          field: "genderDiversityOverall",
          message: "Gender diversity percentage must be between 0 and 100",
        })
      }

      if (issues.length === 0) issues.push({ message: "All required fields are complete and valid" })

      setValidationIssues(issues)
    } finally {
      setIsValidating(false)
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      mockFormData[selectedYear] = { ...formData }
      setLastSaved(new Date())
      setSaveToastMessage("Draft saved successfully")
      setShowSaveToast(true)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async (data: EssentialsFormData) => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setFormData(data)
      setSaveToastMessage("Data submitted successfully")
      setShowSaveToast(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setIsError(false)
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setFormData(mockFormData[selectedYear] || {})
    }, 800)
  }

  return (
    <AppShell currentUser={mockUser}>
      {isLoading ? (
        <EssentialsShell
          year={selectedYear}
          actionSlot={
            <div className="flex items-center gap-3">
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-28 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
          }
        >
          <div className="space-y-8">
            <LoadingSkeleton />
            <LoadingSkeleton />
          </div>
        </EssentialsShell>
      ) : isError ? (
        <EssentialsShell year={selectedYear}>
          <div className="max-w-2xl mx-auto mt-12">
            <ErrorState
              title="Failed to Load Data"
              description="We're having trouble loading your essentials data."
              onRetry={handleRetry}
            />
          </div>
        </EssentialsShell>
      ) : !canEditData ? (
        <EssentialsShell year={selectedYear}>
          <div className="max-w-2xl mx-auto mt-12">
            <EmptyState
              title="Access Restricted"
              description="You don't have permission to edit essentials data."
            />
          </div>
        </EssentialsShell>
      ) : (
        <EssentialsShell
          year={selectedYear}
          onYearChange={handleYearChange}
          actionSlot={
            <div className="flex items-center gap-3">
              <YearSwitcher
                value={selectedYear}
                options={availableYears}
                onChange={handleYearChange}
              />
            </div>
          }
        >
          <div className="space-y-6">
            {validationIssues.length > 0 && (
              <ValidationSummary issues={validationIssues} onDismiss={() => setValidationIssues([])} />
            )}

            <RoleGuard permissions={["data.edit"]} user={mockUser}>
              <EssentialsForm
                defaultValues={formData}
                year={selectedYear}
                onSubmit={handleSubmit}
                onSaveDraft={handleSaveDraft}
                onValidate={async (data) => {
                  setFormData(data)
                  await handleValidate()
                  return validationIssues
                }}
                isSubmitting={isSubmitting}
                isSaving={isSaving}
                isValidating={isValidating}
              >
                <div className="space-y-6">
                  <EnvSection />
                  <LaborSection />
                </div>
              </EssentialsForm>
            </RoleGuard>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <RoleGuard permissions={["data.validate"]} user={mockUser}>
                <button
                  onClick={handleValidate}
                  disabled={isValidating}
                  className="px-4 py-2 bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isValidating ? "Validating..." : "Validate"}
                </button>
              </RoleGuard>
              <RoleGuard permissions={["data.edit"]} user={mockUser}>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 text-[#1a1a1a] font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Draft"}
                </button>
              </RoleGuard>
            </div>
          </div>
          <SaveToast show={showSaveToast} message={saveToastMessage} onClose={() => setShowSaveToast(false)} />
        </EssentialsShell>
      )}
    </AppShell>
  )
}
