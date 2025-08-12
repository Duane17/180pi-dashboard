"use client"
import { AlertCircle, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load your files. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      <p className="text-sm text-gray-600 max-w-md mb-6">{description}</p>

      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="border-gray-300 hover:border-gray-400 bg-transparent">
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  )
}
