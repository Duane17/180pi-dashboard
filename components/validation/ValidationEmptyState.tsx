"use client"

import { CheckCircle, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationEmptyStateProps {
  className?: string
}

export function ValidationEmptyState({ className }: ValidationEmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-6 text-center", className)}>
      {/* Success illustration */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Success message */}
      <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">All good for the selected year!</h3>

      <p className="text-sm text-[#4a4a4a] max-w-md leading-relaxed">
        Your data has passed all validation checks. No issues were found that require your attention.
      </p>

      {/* Additional context */}
      <div className="mt-6 p-4 bg-green-50/50 rounded-lg border border-green-200/50 max-w-md">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-sm font-medium text-green-800 mb-1">Validation Complete</p>
            <p className="text-xs text-green-700">
              All required fields contain valid data and meet the platform's quality standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
