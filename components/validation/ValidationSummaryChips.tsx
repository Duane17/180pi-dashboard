"use client"

import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationSummaryChipsProps {
  totalCount: number
  errorCount: number
  warningCount: number
  infoCount?: number
  className?: string
}

export function ValidationSummaryChips({
  totalCount,
  errorCount,
  warningCount,
  infoCount = 0,
  className,
}: ValidationSummaryChipsProps) {
  const chips = [
    {
      label: "Total Checks",
      count: totalCount,
      icon: totalCount === 0 ? CheckCircle : AlertCircle,
      variant: totalCount === 0 ? "success" : "neutral",
    },
    ...(errorCount > 0
      ? [
          {
            label: "Errors",
            count: errorCount,
            icon: AlertCircle,
            variant: "error" as const,
          },
        ]
      : []),
    ...(warningCount > 0
      ? [
          {
            label: "Warnings",
            count: warningCount,
            icon: AlertTriangle,
            variant: "warning" as const,
          },
        ]
      : []),
    ...(infoCount > 0
      ? [
          {
            label: "Info",
            count: infoCount,
            icon: Info,
            variant: "info" as const,
          },
        ]
      : []),
  ]

  const getChipStyles = (variant: string) => {
    switch (variant) {
      case "success":
        return "bg-green-50 text-green-700 border-green-200"
      case "error":
        return "bg-red-50 text-red-700 border-red-200"
      case "warning":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "info":
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-gray-50 text-[#4a4a4a] border-gray-200"
    }
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {chips.map((chip) => {
        const Icon = chip.icon
        return (
          <div
            key={chip.label}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
              getChipStyles(chip.variant),
            )}
          >
            <Icon className="w-3 h-3" />
            <span>{chip.count}</span>
            <span className="text-xs opacity-75">{chip.label}</span>
          </div>
        )
      })}
    </div>
  )
}
