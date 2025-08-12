"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationLoadingStateProps {
  className?: string
}

export function ValidationLoadingState({ className }: ValidationLoadingStateProps) {
  return (
    <div className={cn("p-6", className)}>
      {/* Loading header */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1a1a1a]">Running validation checks...</p>
            <p className="text-xs text-[#4a4a4a]">This may take a few moments</p>
          </div>
        </div>
      </div>

      {/* Skeleton rows */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 border-l-4 border-gray-200 bg-gray-50/50 rounded-r-lg animate-pulse"
          >
            {/* Icon skeleton */}
            <div className="w-5 h-5 bg-gray-300 rounded-full flex-shrink-0 mt-0.5" />

            {/* Content skeleton */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>

            {/* Button skeleton */}
            <div className="w-20 h-6 bg-gray-300 rounded flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-8 flex justify-center">
        <div className="flex items-center gap-2 text-xs text-[#4a4a4a]">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-[#3270a1] rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-[#3270a1] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
            <div className="w-2 h-2 bg-[#3270a1] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
          <span>Analyzing your data</span>
        </div>
      </div>
    </div>
  )
}
