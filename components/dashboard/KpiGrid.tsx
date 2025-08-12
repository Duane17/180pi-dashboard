"use client"
import { KpiCard } from "./KpiCard"

interface KpiData {
  id: string
  title: string
  value: string | number
  unit: string
  delta?: {
    value: number
    isPositive: boolean
    period: string
  }
  sparklineData?: number[]
}

interface KpiGridProps {
  kpis: KpiData[]
  isLoading?: boolean
}

export function KpiGrid({ kpis, isLoading = false }: KpiGridProps) {
  if (isLoading) {
    // Show loading skeleton
    const skeletonKpis = Array.from({ length: 7 }, (_, i) => ({
      id: `skeleton-${i}`,
      title: "",
      value: "",
      unit: "",
    }))

    return (
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4"
        role="region"
        aria-label="Loading KPI metrics"
      >
        {skeletonKpis.map((kpi) => (
          <KpiCard key={kpi.id} {...kpi} isLoading={true} />
        ))}
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4"
      role="region"
      aria-label="Key Performance Indicators"
    >
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} {...kpi} />
      ))}
    </div>
  )
}
