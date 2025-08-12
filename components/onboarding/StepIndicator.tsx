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

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isClickable = onStepClick && (isCompleted || stepNumber <= currentStep)

          return (
            <li key={step.id} className="flex-1">
              <div className="flex items-center">
                <button
                  onClick={() => isClickable && onStepClick(stepNumber)}
                  disabled={!isClickable}
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                    ${
                      isCompleted
                        ? "bg-gradient-to-br from-[#8dcddb] via-[#3270a1] to-[#7e509c] border-transparent text-white"
                        : isCurrent
                          ? "border-[#3270a1] bg-white text-[#3270a1] shadow-lg"
                          : "border-gray-300 bg-white text-gray-400"
                    }
                    ${isClickable ? "cursor-pointer hover:scale-105" : "cursor-default"}
                  `}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${step.title}${isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </button>

                <div className="ml-4 min-w-0 flex-1">
                  <p className={`text-sm font-medium ${isCurrent ? "text-[#1a1a1a]" : "text-[#4a4a4a]"}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-[#4a4a4a]">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`
                    flex-1 h-0.5 mx-4 transition-colors duration-200
                    ${isCompleted ? "bg-gradient-to-r from-[#8dcddb] to-[#3270a1]" : "bg-gray-200"}
                  `}
                  />
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
