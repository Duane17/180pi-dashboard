"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TrendData {
  year: string
  energy?: number
  water?: number
  waste?: number
}

interface EssentialsTrendChartProps {
  data: TrendData[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  title?: string
  selectedMetrics?: ("energy" | "water" | "waste")[]
}

export function EssentialsTrendChart({
  data,
  isLoading = false,
  isError = false,
  onRetry,
  title = "Essential Metrics Trends",
  selectedMetrics = ["energy", "water", "waste"],
}: EssentialsTrendChartProps) {
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
          <p className="text-[#4a4a4a] mb-4">Failed to load trend data</p>
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
            <p className="mb-2">No trend data available</p>
            <p className="text-sm">Add historical data to see trends over time</p>
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
              {`${entry.name}: ${entry.value} ${getUnit(entry.dataKey)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const getUnit = (metric: string) => {
    switch (metric) {
      case "energy":
        return "MWh"
      case "water":
        return "m³"
      case "waste":
        return "tonnes"
      default:
        return ""
    }
  }

  const getMetricName = (metric: string) => {
    switch (metric) {
      case "energy":
        return "Energy Consumption"
      case "water":
        return "Water Use"
      case "waste":
        return "Waste Generated"
      default:
        return metric
    }
  }

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case "energy":
        return "#8dcddb"
      case "water":
        return "#3270a1"
      case "waste":
        return "#7e509c"
      default:
        return "#8dcddb"
    }
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/20">
      <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fill: "#1a1a1a", fontSize: 12 }} />
            <YAxis tick={{ fill: "#1a1a1a", fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: "#1a1a1a" }}
              iconType="line"
              formatter={(value) => <span style={{ color: "#1a1a1a" }}>{value}</span>}
            />
            {selectedMetrics.includes("energy") && (
              <Line
                type="monotone"
                dataKey="energy"
                name={getMetricName("energy")}
                stroke={getMetricColor("energy")}
                strokeWidth={3}
                dot={{ fill: getMetricColor("energy"), strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: getMetricColor("energy"), strokeWidth: 2 }}
              />
            )}
            {selectedMetrics.includes("water") && (
              <Line
                type="monotone"
                dataKey="water"
                name={getMetricName("water")}
                stroke={getMetricColor("water")}
                strokeWidth={3}
                dot={{ fill: getMetricColor("water"), strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: getMetricColor("water"), strokeWidth: 2 }}
              />
            )}
            {selectedMetrics.includes("waste") && (
              <Line
                type="monotone"
                dataKey="waste"
                name={getMetricName("waste")}
                stroke={getMetricColor("waste")}
                strokeWidth={3}
                dot={{ fill: getMetricColor("waste"), strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: getMetricColor("waste"), strokeWidth: 2 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
