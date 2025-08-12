"use client"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import type React from "react"

import { cn } from "@/lib/utils"
import type { UploadStatus } from "./StatusBadge"

interface StatusCount {
  status: UploadStatus
  count: number
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface UploadStatusSummaryProps {
  statusCounts: Record<UploadStatus, number>
  totalFiles: number
  className?: string
}

export function UploadStatusSummary({ statusCounts, totalFiles, className }: UploadStatusSummaryProps) {
  const statusConfig: StatusCount[] = [
    {
      status: "verified",
      count: statusCounts.verified || 0,
      label: "Verified",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      status: "completed",
      count: statusCounts.completed || 0,
      label: "Completed",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      status: "pending",
      count: statusCounts.pending || 0,
      label: "Pending",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      status: "uploading",
      count: statusCounts.uploading || 0,
      label: "Uploading",
      icon: Clock,
      color: "text-blue-600",
    },
    {
      status: "failed",
      count: statusCounts.failed || 0,
      label: "Failed",
      icon: XCircle,
      color: "text-red-600",
    },
  ]

  const visibleStatuses = statusConfig.filter((status) => status.count > 0)

  if (totalFiles === 0) return null

  return (
    <div
      className={cn(
        "p-4 rounded-xl border bg-white/50 backdrop-blur-sm border-gray-200/50",
        "hover:bg-white/70 transition-colors",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Upload Status Summary</h3>
        <span className="text-xs text-gray-500">{totalFiles} total files</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {visibleStatuses.map((status) => {
          const Icon = status.icon
          return (
            <div key={status.status} className="flex items-center gap-2">
              <Icon className={cn("w-4 h-4", status.color)} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{status.count}</p>
                <p className="text-xs text-gray-500 truncate">{status.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>
            {Math.round((((statusCounts.verified || 0) + (statusCounts.completed || 0)) / totalFiles) * 100)}% complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(((statusCounts.verified || 0) + (statusCounts.completed || 0)) / totalFiles) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
