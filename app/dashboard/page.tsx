"use client"
import { useState, useEffect, useMemo } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { KpiGrid } from "@/components/dashboard/KpiGrid"
import { YearSelector } from "@/components/dashboard/YearSelector"
import { GhgByScopeChart } from "@/components/dashboard/Charts/GhgByScopeChart"
import { EssentialsTrendChart } from "@/components/dashboard/Charts/EssentialsTrendChart"
import { GenderSplitDonut } from "@/components/dashboard/Charts/GenderSplitDonut"
import { ErrorState } from "@/components/dashboard/ErrorState"
import { ValidationButton } from "@/components/validation/ValidationButton"
import { ValidationSummaryModal, type ValidationIssue } from "@/components/validation/ValidationSummaryModal"
import { RoleGuard } from "@/components/rbac/RoleGuard"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useLogoutMutation } from "@/hooks/use-auth-mutations"

// Mock data for demonstration
const mockKpiData = {
  "2024": [
    {
      id: "ghg-scope1",
      title: "GHG Scope 1",
      value: "1,245",
      unit: "tCO₂e",
      delta: { value: -8.2, isPositive: false, period: "2023" },
      sparklineData: [1420, 1380, 1350, 1290, 1245],
    },
    {
      id: "ghg-scope2",
      title: "GHG Scope 2 (Location-based)",
      value: "2,890",
      unit: "tCO₂e",
      delta: { value: -12.5, isPositive: false, period: "2023" },
      sparklineData: [3200, 3100, 3050, 2950, 2890],
    },
    {
      id: "energy",
      title: "Energy Consumption",
      value: "4,567",
      unit: "MWh",
      delta: { value: 3.2, isPositive: true, period: "2023" },
      sparklineData: [4200, 4300, 4400, 4500, 4567],
    },
    {
      id: "water",
      title: "Water Use",
      value: "12,340",
      unit: "m³",
      delta: { value: -5.8, isPositive: false, period: "2023" },
      sparklineData: [13500, 13200, 12800, 12500, 12340],
    },
    {
      id: "waste",
      title: "Waste Generated",
      value: "89.5",
      unit: "tonnes",
      delta: { value: -15.3, isPositive: false, period: "2023" },
      sparklineData: [110, 105, 98, 92, 89.5],
    },
    {
      id: "workforce",
      title: "Workforce Size",
      value: "1,247",
      unit: "FTE",
      delta: { value: 8.7, isPositive: true, period: "2023" },
      sparklineData: [1100, 1150, 1200, 1220, 1247],
    },
    {
      id: "gender",
      title: "Gender Diversity",
      value: "42.3",
      unit: "% women",
      delta: { value: 2.1, isPositive: true, period: "2023" },
      sparklineData: [38, 39, 40, 41, 42.3],
    },
  ],
  "2023": [
    {
      id: "ghg-scope1",
      title: "GHG Scope 1",
      value: "1,356",
      unit: "tCO₂e",
      sparklineData: [1500, 1450, 1400, 1380, 1356],
    },
    // ... other years would have similar data
  ],
}

const mockGhgData = [
  { year: "2020", scope1: 1500, scope2: 3500, scope3: 8200 },
  { year: "2021", scope1: 1420, scope2: 3300, scope3: 7800 },
  { year: "2022", scope1: 1380, scope2: 3200, scope3: 7500 },
  { year: "2023", scope1: 1356, scope2: 3100, scope3: 7200 },
  { year: "2024", scope1: 1245, scope2: 2890, scope3: 6800 },
]

const mockTrendData = [
  { year: "2020", energy: 4200, water: 13500, waste: 110 },
  { year: "2021", energy: 4300, water: 13200, waste: 105 },
  { year: "2022", energy: 4400, water: 12800, waste: 98 },
  { year: "2023", energy: 4500, water: 12500, waste: 92 },
  { year: "2024", energy: 4567, water: 12340, waste: 89.5 },
]

const mockGenderData = [
  { name: "Women", value: 42.3, color: "#8dcddb" },
  { name: "Men", value: 57.7, color: "#3270a1" },
]

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState("2024")
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [validationState, setValidationState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [validationModalOpen, setValidationModalOpen] = useState(false)
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const [announcement, setAnnouncement] = useState("")
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth()
  const logout = useLogoutMutation()
  const router = useRouter()


  const shellUser = useMemo(
    () =>
      authUser
        ? {
            id: authUser.id,
            name: authUser.name,
            email: authUser.email,
            role: "admin" as const,
          }
        : undefined,
    [authUser]
  )

  // Redirect to /auth if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth")
    }
  }, [authLoading, isAuthenticated, router])


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setAnnouncement("Dashboard data loaded successfully")
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return null // Avoid flicker while deciding
  }

  const handleValidateData = async () => {
    setValidationState("loading")
    setAnnouncement("Validating data...")

    // Simulate validation process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock validation results - in real app, this would come from API
    const mockIssues: ValidationIssue[] = [
      {
        id: "energy-2024",
        level: "warning",
        message:
          "Energy consumption increased by 15% compared to previous year. Consider reviewing efficiency measures.",
        fieldPath: "energyConsumption",
        year: 2024,
      },
      {
        id: "water-missing",
        level: "error",
        message: "Water usage data is incomplete for Q4 2024.",
        fieldPath: "waterUse",
        year: 2024,
      },
    ]

    setValidationIssues(mockIssues)
    setValidationState(mockIssues.length > 0 ? "error" : "success")
    setValidationModalOpen(true)
    setAnnouncement(`Validation completed with ${mockIssues.length} issues found`)
  }

  const handleValidationRerun = async () => {
    setValidationModalOpen(false)
    await handleValidateData()
  }

  const handleNavigateToField = (issueId: string) => {
    // Mock navigation - in real app, this would navigate to the specific field
    console.log("Navigate to field for issue:", issueId)
    setAnnouncement("Navigating to field...")
    setValidationModalOpen(false)
  }

  const handleRetry = () => {
    setIsError(false)
    setIsLoading(true)
    setAnnouncement("Retrying data load...")
    setTimeout(() => {
      setIsLoading(false)
      setAnnouncement("Dashboard data loaded successfully")
    }, 1000)
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    setAnnouncement(`Switched to ${year} data`)
  }

  const currentKpis = mockKpiData[selectedYear as keyof typeof mockKpiData] || mockKpiData["2024"]

  // const mockUser = {
  //   id: "1",
  //   name: "Maha Chairi",
  //   email: "Maha@180pi.com",
  //   role: "admin" as const,
  //   permissions: ["dashboard.view", "data.validate", "reports.generate"],
  // }

  if (isError) {
    return (
      <AppShell
        currentUser={shellUser}
        onProfile={() => console.log("Navigate to profile")}
        onSettings={() => console.log("Navigate to settings")}
        onSwitchCompany={() => console.log("Switch company")}
        onSignOut={() => logout.mutate()}
      >
        <div className="max-w-2xl mx-auto mt-12">
          <ErrorState
            title="Dashboard Unavailable"
            description="We're having trouble loading your Sustainability Intelligence dashboard. Please check your connection and try again."
            onRetry={handleRetry}
          />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      currentUser={shellUser}
      onProfile={() => console.log("Navigate to profile")}
      onSettings={() => console.log("Navigate to settings")}
      onSwitchCompany={() => console.log("Switch company")}
      onSignOut={() => logout.mutate()}
    >
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">Sustainability Intelligence Dashboard</h1>
            <p className="text-[#4a4a4a] mt-1 text-sm md:text-base">
              Monitor your environmental, social, and governance metrics
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <YearSelector
              selectedYear={selectedYear}
              onYearChange={handleYearChange}
              availableYears={["2024", "2023", "2022", "2021", "2020"]}
              disabled={isLoading}
            />

            <RoleGuard allowed={["admin", "member"]} user={shellUser}>
              <ValidationButton state={validationState} onClick={handleValidateData} disabled={isLoading} size="md" />
            </RoleGuard>
          </div>
        </div>

        <section aria-labelledby="kpi-heading">
          <div className="mb-4 md:mb-6">
            <h2 id="kpi-heading" className="text-lg md:text-xl font-semibold text-[#1a1a1a] mb-2">
              Company in Numbers
            </h2>
            <p className="text-[#4a4a4a] text-sm md:text-base">Key performance indicators for {selectedYear}</p>
          </div>

          <KpiGrid kpis={currentKpis} isLoading={isLoading} />
        </section>

        <section aria-labelledby="charts-heading">
          <div className="mb-4 md:mb-6">
            <h2 id="charts-heading" className="text-lg md:text-xl font-semibold text-[#1a1a1a] mb-2">
              Essential Metrics
            </h2>
            <p className="text-[#4a4a4a] text-sm md:text-base">Detailed analysis and trends over time</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
            <div className="xl:col-span-2">
              <GhgByScopeChart data={mockGhgData} isLoading={isLoading} onRetry={handleRetry} />
            </div>

            <EssentialsTrendChart
              data={mockTrendData}
              isLoading={isLoading}
              onRetry={handleRetry}
              selectedMetrics={["energy", "water", "waste"]}
            />

            <GenderSplitDonut data={mockGenderData} isLoading={isLoading} onRetry={handleRetry} totalEmployees={1247} />
          </div>
        </section>

        <section className="pt-6 md:pt-8 border-t border-gray-100" aria-labelledby="actions-heading">
          <div className="text-center">
            <h3 id="actions-heading" className="sr-only">
              Additional Actions
            </h3>
            <p className="text-[#4a4a4a] mb-4 text-sm md:text-base">Need to update your metrics or generate reports?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <RoleGuard allowed={["admin", "member"]} user={shellUser}>
                <Link
                  href="/upload/data"
                  className="px-4 md:px-6 py-2 bg-white border border-gray-300 text-[#1a1a1a] font-medium rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3270a1]/20 inline-block"
                >
                  Upload New Data
                </Link>
              </RoleGuard>

              <RoleGuard permissions={["reports.generate"]} user={shellUser}>
                <Link
                  href="/reports"
                  className="px-4 md:px-6 py-2 bg-white border border-gray-300 text-[#1a1a1a] font-medium rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3270a1]/20 inline-block"
                >
                  Generate Report
                </Link>
              </RoleGuard>
            </div>
          </div>
        </section>

        <ValidationSummaryModal
          open={validationModalOpen}
          onClose={() => setValidationModalOpen(false)}
          issues={validationIssues}
          onRerun={handleValidationRerun}
          onNavigateToField={handleNavigateToField}
          isLoading={validationState === "loading"}
          isError={false}
        />
      </div>
    </AppShell>
  )
}
