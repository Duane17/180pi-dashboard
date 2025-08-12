"use client"
import { TrendingUp, TrendingDown } from "lucide-react"
import { TrendSparkline } from "./TrendSparkline"

interface KpiCardProps {
  title: string
  value: string | number
  unit: string
  delta?: {
    value: number
    isPositive: boolean
    period: string
  }
  sparklineData?: number[]
  isLoading?: boolean
}

export function KpiCard({ title, value, unit, delta, sparklineData, isLoading = false }: KpiCardProps) {
  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-white/20 animate-pulse">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/20 hover:border-[#3270a1]/30 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[#4a4a4a] leading-tight">{title}</h3>
      </div>

      {/* Value */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold gradient-text">{value}</span>
          <span className="text-sm font-medium text-[#4a4a4a]">{unit}</span>
        </div>
      </div>

      {/* Delta */}
      {delta && (
        <div className="mb-4">
          <div className="flex items-center gap-1">
            {delta.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={`text-xs font-medium ${delta.isPositive ? "text-green-600" : "text-red-600"}`}>
              {delta.isPositive ? "+" : ""}
              {delta.value}%
            </span>
            <span className="text-xs text-[#4a4a4a]">vs {delta.period}</span>
          </div>
        </div>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="h-12">
          <TrendSparkline data={sparklineData} />
        </div>
      )}
    </div>
  )
}
