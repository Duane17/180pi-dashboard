"use client"

import { useState } from "react"
import { LandingShell } from "@/components/landing/LandingShell"
import { Hero } from "@/components/landing/Hero"
import { KpiGridLite } from "@/components/landing/KpiGridLite"
import { QuickActions } from "@/components/landing/QuickActions"
import { Upload, FileText, TrendingUp, Users } from "lucide-react"

export default function HomePage() {
  const [selectedYear, setSelectedYear] = useState(2024)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  // Mock KPI data
  const kpiData = [
    {
      key: "scope1",
      label: "Scope 1",
      value: 245,
      unit: "tCO₂e",
      delta: -12,
    },
    {
      key: "scope2",
      label: "Scope 2 (location-based)",
      value: 1834,
      unit: "tCO₂e",
      delta: -8,
    },
    {
      key: "energy",
      label: "Energy",
      value: 3420,
      unit: "MWh",
      delta: 5,
    },
    {
      key: "water",
      label: "Water",
      value: 12500,
      unit: "m³",
      delta: -3,
    },
    {
      key: "waste",
      label: "Waste",
      value: 89,
      unit: "tonnes",
      delta: -15,
    },
    {
      key: "workforce",
      label: "Workforce (FTE)",
      value: "245 (42% women)",
      unit: "",
      delta: 8,
    },
  ]

  const quickActions = [
    {
      label: "Enter Essentials",
      icon: Upload,
      href: "/upload/data",
    },
    {
      label: "Upload Evidence",
      icon: FileText,
      href: "/upload/evidence",
    },
    {
      label: "Generate Report",
      icon: TrendingUp,
      href: "/reports",
    },
    {
      label: "Bridge Investors",
      icon: Users,
      href: "/investors",
    },
  ]

  const handleRetry = () => {
    setIsError(false)
    setIsLoading(true)
    // Simulate retry
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <LandingShell>
      <Hero />

      <KpiGridLite
        year={selectedYear}
        items={kpiData}
        isLoading={isLoading}
        isError={isError}
        onRetry={handleRetry}
        onYearChange={setSelectedYear}
        yearOptions={[2024, 2023, 2022, 2021]}
      />

      <QuickActions items={quickActions} />
    </LandingShell>
  )
}
