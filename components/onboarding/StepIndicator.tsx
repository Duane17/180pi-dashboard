"use client"
import { Check } from "lucide-react"

interface Step {
  id: number
  title: string
  description: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
}

/**
 * Top-aligned step indicator:
 *  ● number/check
 *  title
 *  description
 * with a single progress line running behind all dots.
 */
export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  const total = steps.length
  const pct = Math.max(0, Math.min(100, ((currentStep - 1) / (total - 1)) * 100))

  return (
    <nav aria-label="Progress" className="mb-8">
      <div className="relative">
        {/* Base track */}
        <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200 rounded-full" aria-hidden />
        {/* Progress fill */}
        <div
          className="absolute left-0 top-5 h-1 bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
          aria-hidden
        />

        <ol className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep
            const isClickable = !!onStepClick && (isCompleted || isCurrent)

            return (
              <li key={step.id} className="flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(stepNumber)}
                  disabled={!isClickable}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${step.title}${isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}`}
                  className={[
                    "relative z-[1] flex h-10 w-10 items-center justify-center rounded-full border-2 transition-transform duration-200",
                    isCompleted
                      ? "bg-gradient-to-br from-[#8dcddb] via-[#3270a1] to-[#7e509c] border-transparent text-white"
                      : isCurrent
                      ? "border-[#3270a1] bg-white text-[#3270a1] shadow-lg"
                      : "border-gray-300 bg-white text-gray-400",
                    isClickable ? "hover:scale-105 cursor-pointer" : "cursor-default",
                  ].join(" ")}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <span className="text-sm font-semibold">{stepNumber}</span>}
                </button>

                <div className="mt-3 min-w-0">
                  <p className={`text-sm font-medium ${isCurrent ? "text-[#1a1a1a]" : "text-[#4a4a4a]"}`}>
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs text-[#4a4a4a]">{step.description}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Small meta row like your shell shows (“Step X of Y” + percent) */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-[#4a4a4a]">
          Step {currentStep} of {steps.length}
        </span>
        <span className="text-sm font-medium text-[#4a4a4a]">
          {Math.round(((currentStep - 1) / (steps.length - 1 || 1)) * 100)}% Complete
        </span>
      </div>
    </nav>
  )
}
