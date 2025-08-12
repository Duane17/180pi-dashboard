"use client"

import { KpiCardLite } from "./KpiCardLite"
import { YearSelector } from "./YearSelector"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface KpiItem {
  key: string
  label: string
  value?: number | string
  unit?: string
  delta?: number
}

interface KpiGridLiteProps {
  year: number
  items: KpiItem[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  onYearChange?: (year: number) => void
  yearOptions?: number[]
}

export function KpiGridLite({
  year,
  items,
  isLoading,
  isError,
  onRetry,
  onYearChange,
  yearOptions = [2024, 2023, 2022, 2021],
}: KpiGridLiteProps) {
  if (isError) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Company in Numbers</h2>
          {onYearChange && <YearSelector value={year} options={yearOptions} onChange={onYearChange} />}
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-sm border border-white/20 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">Failed to load data</h3>
          <p className="text-[#4a4a4a] mb-4">There was an error loading your sustainability metrics.</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="border-[#3270a1] text-[#3270a1] bg-transparent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Company in Numbers</h2>
        {onYearChange && <YearSelector value={year} options={yearOptions} onChange={onYearChange} />}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => (
          <KpiCardLite
            key={item.key}
            label={item.label}
            value={item.value}
            unit={item.unit}
            delta={item.delta}
            isLoading={isLoading}
          />
        ))}
      </div>
    </section>
  )
}
