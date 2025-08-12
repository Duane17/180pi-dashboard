import { TrendingUp, TrendingDown } from "lucide-react"

interface KpiCardLiteProps {
  label: string
  value?: number | string
  unit?: string
  delta?: number
  isLoading?: boolean
}

export function KpiCardLite({ label, value, unit, delta, isLoading }: KpiCardLiteProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-sm border border-white/20 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-3"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    )
  }

  const formatValue = (val: number | string | undefined) => {
    if (val === undefined || val === null) return "—"
    if (typeof val === "number") {
      return val.toLocaleString()
    }
    return val
  }

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return "text-red-600"
    if (delta < 0) return "text-green-600"
    return "text-[#4a4a4a]"
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-sm border border-white/20 p-6 transition-all duration-200 hover:shadow-lg">
      <div className="text-sm font-medium text-[#4a4a4a] mb-2">{label}</div>

      <div className="text-3xl font-bold bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] bg-clip-text text-transparent mb-1">
        {formatValue(value)}
        {unit && <span className="text-lg text-[#4a4a4a] ml-1">{unit}</span>}
      </div>

      {delta !== undefined && delta !== 0 && (
        <div className={`flex items-center text-sm ${getDeltaColor(delta)}`}>
          {delta > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {Math.abs(delta)}%
        </div>
      )}
    </div>
  )
}
