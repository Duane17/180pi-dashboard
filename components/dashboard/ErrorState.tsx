"use client"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  isRetrying?: boolean
}

export function ErrorState({
  title = "Unable to load data",
  description = "There was an error loading your ESG metrics. Please try again.",
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <div className="glass-card p-12 rounded-2xl border border-red-200/50 text-center" role="alert" aria-live="polite">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-6">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>

      <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">{title}</h3>
      <p className="text-[#4a4a4a] mb-6 max-w-sm mx-auto">{description}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-[#1a1a1a] font-medium rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
          {isRetrying ? "Retrying..." : "Try Again"}
        </button>
      )}
    </div>
  )
}
