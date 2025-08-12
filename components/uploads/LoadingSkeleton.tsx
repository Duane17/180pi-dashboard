"use client"
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  rows?: number
  className?: string
}

export function LoadingSkeleton({ rows = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="p-4 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200" />

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-48" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-20" />
              </div>

              <div className="h-2 bg-gray-200 rounded-full w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
