"use client"
import { Check, Clock, AlertCircle, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

export type UploadStatus = "queued" | "uploading" | "verifying" | "completed" | "failed" | "verified" | "pending"

interface StatusBadgeProps {
  status: UploadStatus
  className?: string
}

const statusConfig = {
  queued: {
    label: "Queued",
    icon: Clock,
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  uploading: {
    label: "Uploading",
    icon: Upload,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  verifying: {
    label: "Verifying",
    icon: Clock,
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  completed: {
    label: "Completed",
    icon: Check,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  verified: {
    label: "Verified",
    icon: Check,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
        config.className,
        className,
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}
