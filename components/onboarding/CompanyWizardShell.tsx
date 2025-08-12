import type React from "react"

interface CompanyWizardShellProps {
  children: React.ReactNode
  currentStep: number
  totalSteps: number
  title: string
  subtitle?: string
}

export function CompanyWizardShell({ children, currentStep, totalSteps, title, subtitle }: CompanyWizardShellProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo Slot */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8dcddb] via-[#3270a1] to-[#7e509c] flex items-center justify-center">
              <span className="text-white font-bold text-lg">π</span>
            </div>
            <span className="text-2xl font-bold text-[#1a1a1a]">180Pi</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-card p-8 rounded-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">{title}</h1>
            {subtitle && <p className="text-[#4a4a4a] text-lg">{subtitle}</p>}
          </div>

          {/* Step Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[#4a4a4a]">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-[#4a4a4a]">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
