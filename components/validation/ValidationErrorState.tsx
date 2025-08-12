"use client"

import { AlertTriangle, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationErrorStateProps {
  onRetry?: () => void
  className?: string
}

export function ValidationErrorState({ onRetry, className }: ValidationErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-6 text-center", className)}>
      {/* Error illustration */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-100 to-orange-100 flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-red-600" />
      </div>

      {/* Error message */}
      <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">Validation Failed</h3>

      <p className="text-sm text-[#4a4a4a] max-w-md leading-relaxed mb-6">
        We encountered an error while running validation checks on your data. This might be due to a temporary issue.
      </p>

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            "inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-md",
            "bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c]",
            "text-white shadow-lg",
            "hover:shadow-xl hover:scale-105 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-[#3270a1]/50 focus:ring-offset-2",
            "active:scale-95",
          )}
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      )}

      {/* Additional help */}
      <div className="mt-6 p-4 bg-red-50/50 rounded-lg border border-red-200/50 max-w-md">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-sm font-medium text-red-800 mb-1">Troubleshooting</p>
            <p className="text-xs text-red-700">
              If the problem persists, please check your internet connection or contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
