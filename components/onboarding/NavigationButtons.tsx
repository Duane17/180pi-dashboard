"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface NavigationButtonsProps {
  onBack?: () => void
  onNext?: () => void
  onSubmit?: () => void
  backLabel?: string
  nextLabel?: string
  submitLabel?: string
  isFirstStep?: boolean
  isLastStep?: boolean
  isLoading?: boolean
  canProceed?: boolean
}

export function NavigationButtons({
  onBack,
  onNext,
  onSubmit,
  backLabel = "Back",
  nextLabel = "Next",
  submitLabel = "Complete Setup",
  isFirstStep = false,
  isLastStep = false,
  isLoading = false,
  canProceed = true,
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep || isLoading}
        className={`
          inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium
          transition-all duration-200 ease-out
          ${
            isFirstStep || isLoading
              ? "text-gray-400 cursor-not-allowed"
              : "text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-gray-50 active:scale-95"
          }
        `}
        aria-label={isFirstStep ? "Back (disabled - first step)" : backLabel}
      >
        <ChevronLeft className="w-4 h-4" />
        {backLabel}
      </button>

      {/* Next/Submit Button */}
      <button
        type={isLastStep ? "submit" : "button"}
        onClick={isLastStep ? onSubmit : onNext}
        disabled={!canProceed || isLoading}
        className={`
          inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium
          transition-all duration-200 ease-out
          ${
            !canProceed || isLoading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white hover:shadow-lg hover:scale-105 active:scale-95 gradient-pan"
          }
        `}
        aria-label={isLoading ? "Processing..." : isLastStep ? submitLabel : nextLabel}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : isLastStep ? (
          submitLabel
        ) : (
          <>
            {nextLabel}
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  )
}
