"use client"

import type React from "react"

import { AlertCircle, AlertTriangle, Info, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ValidationIssue } from "./ValidationSummaryModal"

interface ValidationListItemProps {
  issue: ValidationIssue
  onNavigateToField?: (issueId: string) => void
  className?: string
}

const getIssueIcon = (level: ValidationIssue["level"]) => {
  switch (level) {
    case "error":
      return <AlertCircle className="w-5 h-5 text-red-500" />
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-orange-500" />
    case "info":
      return <Info className="w-5 h-5 text-blue-500" />
  }
}

const getIssueStyles = (level: ValidationIssue["level"]) => {
  switch (level) {
    case "error":
      return "border-l-red-500 bg-red-50/50"
    case "warning":
      return "border-l-orange-500 bg-orange-50/50"
    case "info":
      return "border-l-blue-500 bg-blue-50/50"
  }
}

const formatFieldReference = (fieldPath?: string, year?: number) => {
  if (!fieldPath) return null

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

  const fieldLabel = fieldLabels[fieldPath] || fieldPath
  return year ? `${fieldLabel} — year ${year}` : fieldLabel
}

const generateAriaLabel = (issue: ValidationIssue) => {
  const levelText = issue.level.charAt(0).toUpperCase() + issue.level.slice(1)
  const fieldReference = formatFieldReference(issue.fieldPath, issue.year)

  if (fieldReference) {
    return `${levelText}: ${fieldReference}. ${issue.message}`
  }

  return `${levelText}: ${issue.message}`
}

export function ValidationListItem({ issue, onNavigateToField, className }: ValidationListItemProps) {
  const fieldReference = formatFieldReference(issue.fieldPath, issue.year)
  const canNavigate = !!onNavigateToField && !!issue.fieldPath

  const handleNavigate = () => {
    if (canNavigate) {
      onNavigateToField(issue.id)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleNavigate()
    }
  }

  return (
    <div
      className={cn("p-4 border-l-4 transition-colors duration-200", getIssueStyles(issue.level), className)}
      role="listitem"
      aria-label={generateAriaLabel(issue)}
    >
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
          {getIssueIcon(issue.level)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {/* Field reference */}
              {fieldReference && (
                <p className="text-sm font-medium text-[#1a1a1a] mb-1" id={`field-${issue.id}`}>
                  {fieldReference}
                </p>
              )}

              {/* Issue message */}
              <p
                className="text-sm text-[#4a4a4a] leading-relaxed"
                id={`message-${issue.id}`}
                aria-describedby={fieldReference ? `field-${issue.id}` : undefined}
              >
                {issue.message}
              </p>
            </div>

            {/* Navigate button */}
            {canNavigate && (
              <button
                onClick={handleNavigate}
                onKeyDown={handleKeyDown}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md",
                  "text-[#3270a1] hover:text-[#1a1a1a]",
                  "hover:bg-white/80 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-[#3270a1]/50 focus:ring-offset-1",
                  "border border-[#3270a1]/20 hover:border-[#3270a1]/40",
                )}
                aria-label={`Navigate to ${fieldReference} field to fix this ${issue.level}`}
                aria-describedby={`message-${issue.id}`}
              >
                <span>Go to field</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
