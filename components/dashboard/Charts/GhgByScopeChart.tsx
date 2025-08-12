"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface GhgData {
  year: string
  scope1: number
  scope2: number
  scope3?: number
}

interface GhgByScopeChartProps {
  data: GhgData[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  title?: string
}

export function GhgByScopeChart({
  data,
  isLoading = false,
  isError = false,
  onRetry,
  title = "GHG Emissions by Scope",
}: GhgByScopeChartProps) {
  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-white/20 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-red-200/50 text-center">
        <div className="py-12">
          <p className="text-[#4a4a4a] mb-4">Failed to load chart data</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-white border border-gray-300 text-[#1a1a1a] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-white/20">
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-[#4a4a4a]">
          <div className="text-center">
            <p className="mb-2">No emissions data available</p>
            <p className="text-sm">Add your GHG data to see the breakdown by scope</p>
          </div>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 rounded-lg border border-white/20 shadow-lg">
          <p className="font-medium text-[#1a1a1a] mb-2">{`Year: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value} tCO₂e`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/20">
      <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fill: "#1a1a1a", fontSize: 12 }} />
            <YAxis tick={{ fill: "#1a1a1a", fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: "#1a1a1a" }}
              iconType="rect"
              formatter={(value) => <span style={{ color: "#1a1a1a" }}>{value}</span>}
            />
            <Bar dataKey="scope1" name="Scope 1" fill="#8dcddb" radius={[2, 2, 0, 0]} />
            <Bar dataKey="scope2" name="Scope 2" fill="#3270a1" radius={[2, 2, 0, 0]} />
            {data.some((d) => d.scope3) && <Bar dataKey="scope3" name="Scope 3" fill="#7e509c" radius={[2, 2, 0, 0]} />}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
