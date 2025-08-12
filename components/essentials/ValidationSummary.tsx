"use client"

import { useState } from "react"
import { AlertTriangle, X, AlertCircle } from "lucide-react"

interface ValidationIssue {
  field?: string
  message: string
}

interface ValidationSummaryProps {
  issues: ValidationIssue[]
  onDismiss?: () => void
  className?: string
}

export function ValidationSummary({ issues, onDismiss, className }: ValidationSummaryProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (issues.length === 0 || isDismissed) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  const fieldIssues = issues.filter((issue) => issue.field)
  const generalIssues = issues.filter((issue) => !issue.field)

  return (
    <div
      className={`glass-card p-6 rounded-2xl border border-orange-200/50 ${className || ""}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-[#1a1a1a]">Validation Summary</h3>
            <p className="text-sm text-[#4a4a4a]">
              {issues.length} issue{issues.length !== 1 ? "s" : ""} found. Please review and correct before submitting.
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="text-[#4a4a4a] hover:text-[#1a1a1a] transition-colors p-1"
            aria-label="Dismiss validation summary"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Field-specific issues */}
        {fieldIssues.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-[#1a1a1a] mb-2">Field Issues:</h4>
            <ul className="space-y-2">
              {fieldIssues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-[#1a1a1a]">{getFieldLabel(issue.field!)}: </span>
                    <span className="text-[#4a4a4a]">{issue.message}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* General issues */}
        {generalIssues.length > 0 && (
          <div>
            {fieldIssues.length > 0 && <div className="border-t border-gray-200 pt-4" />}
            <h4 className="text-sm font-medium text-[#1a1a1a] mb-2">General Issues:</h4>
            <ul className="space-y-2">
              {generalIssues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4a4a4a]">{issue.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function getFieldLabel(fieldName: string): string {
  const fieldLabels: Record<string, string> = {
    ghgScope1: "GHG Scope 1",
    ghgScope2: "GHG Scope 2",
    energyConsumption: "Energy Consumption",
    waterUse: "Water Use",
    wasteGenerated: "Waste Generated",
    workforceSize: "Workforce Size",
    genderDiversityOverall: "Gender Diversity (Overall)",
    genderDiversityManagement: "Gender Diversity (Management)",
  }

  return fieldLabels[fieldName] || fieldName
}
