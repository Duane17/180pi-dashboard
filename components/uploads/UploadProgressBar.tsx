"use client"
import { cn } from "@/lib/utils"

interface UploadProgressBarProps {
  progress: number // 0-100
  status?: "uploading" | "completed" | "failed"
  size?: "sm" | "md"
  className?: string
}

export function UploadProgressBar({ progress, status = "uploading", size = "md", className }: UploadProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress))

  return (
    <div className={cn("relative overflow-hidden rounded-full", className)}>
      <div
        className={cn(
          "w-full rounded-full transition-all duration-200",
          size === "sm" ? "h-1.5" : "h-2",
          status === "failed" ? "bg-red-100" : "bg-gray-100",
        )}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Upload progress: ${clampedProgress}%`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            status === "completed" && "bg-green-500",
            status === "failed" && "bg-red-500",
            status === "uploading" && "bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c]",
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {status === "uploading" && clampedProgress > 0 && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      )}
    </div>
  )
}
