"use client"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  onRetry?: () => void
  title?: string
  message?: string
  isRetrying?: boolean
}

export function ErrorState({
  onRetry,
  title = "Unable to load investors",
  message = "We're having trouble connecting to our investor database. Please check your connection and try again.",
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-gradient-to-br from-red-50/50 to-white p-8 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>

      <p className="mb-6 max-w-md text-sm text-gray-500">{message}</p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={onRetry}
          disabled={isRetrying}
          className="bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white hover:shadow-lg hover:shadow-[#3270a1]/25 transition-all duration-200 disabled:opacity-50"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </>
          )}
        </Button>
      </div>

      <div className="mt-6 text-xs text-gray-400">
        <p>If the problem persists, please contact support or try again later.</p>
      </div>
    </div>
  )
}
