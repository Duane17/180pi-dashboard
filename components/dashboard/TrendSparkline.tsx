"use client"
import { useMemo } from "react"

interface TrendSparklineProps {
  data: number[]
  width?: number
  height?: number
  strokeWidth?: number
  className?: string
}

export function TrendSparkline({
  data,
  width = 200,
  height = 48,
  strokeWidth = 2,
  className = "",
}: TrendSparklineProps) {
  const pathData = useMemo(() => {
    if (!data || data.length < 2) return ""

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })

    return `M ${points.join(" L ")}`
  }, [data, width, height])

  const isPositiveTrend = useMemo(() => {
    if (!data || data.length < 2) return true
    return data[data.length - 1] >= data[0]
  }, [data])

  if (!data || data.length < 2) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-xs text-[#4a4a4a]">No trend data</div>
      </div>
    )
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        preserveAspectRatio="none"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8dcddb" />
            <stop offset="50%" stopColor="#3270a1" />
            <stop offset="100%" stopColor="#7e509c" />
          </linearGradient>
          <linearGradient id="sparkline-area" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="url(#sparkline-gradient)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="url(#sparkline-gradient)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={`${pathData} L ${width},${height} L 0,${height} Z`} fill="url(#sparkline-area)" />

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="url(#sparkline-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />

        {/* End point */}
        <circle
          cx={width}
          cy={
            height -
            ((data[data.length - 1] - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * height
          }
          r="2"
          fill={isPositiveTrend ? "#10b981" : "#ef4444"}
          className="drop-shadow-sm"
        />
      </svg>
    </div>
  )
}
