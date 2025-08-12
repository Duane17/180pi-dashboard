"use client"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface GenderData {
  name: string
  value: number
  color: string
}

interface GenderSplitDonutProps {
  data: GenderData[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  title?: string
  totalEmployees?: number
}

export function GenderSplitDonut({
  data,
  isLoading = false,
  isError = false,
  onRetry,
  title = "Gender Diversity",
  totalEmployees,
}: GenderSplitDonutProps) {
  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-white/20 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-full mx-auto w-64"></div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-red-200/50 text-center">
        <div className="py-12">
          <p className="text-[#4a4a4a] mb-4">Failed to load gender data</p>
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
            <p className="mb-2">No gender data available</p>
            <p className="text-sm">Add workforce demographics to see diversity metrics</p>
          </div>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="glass-card p-3 rounded-lg border border-white/20 shadow-lg">
          <p className="font-medium text-[#1a1a1a]">{data.name}</p>
          <p className="text-sm text-[#4a4a4a]">{`${data.value}% of workforce`}</p>
          {totalEmployees && (
            <p className="text-xs text-[#4a4a4a]">{`~${Math.round((data.value / 100) * totalEmployees)} employees`}</p>
          )}
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="#1a1a1a"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#1a1a1a]">{title}</h3>
        {totalEmployees && (
          <div className="text-right">
            <p className="text-sm text-[#4a4a4a]">Total Workforce</p>
            <p className="text-lg font-semibold gradient-text">{totalEmployees}</p>
          </div>
        )}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ color: "#1a1a1a" }}
              iconType="circle"
              formatter={(value) => <span style={{ color: "#1a1a1a" }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Additional stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm font-medium text-[#1a1a1a]">{item.name}</span>
            </div>
            <p className="text-lg font-semibold gradient-text">{item.value}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}
