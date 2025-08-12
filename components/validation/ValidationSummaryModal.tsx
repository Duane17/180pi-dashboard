"use client"

import { useEffect, useRef } from "react"
import { X, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { ValidationTabs } from "./ValidationTabs"
import { ValidationSummaryChips } from "./ValidationSummaryChips"
import { ValidationEmptyState } from "./ValidationEmptyState"
import { ValidationErrorState } from "./ValidationErrorState"
import { ValidationLoadingState } from "./ValidationLoadingState"

export interface ValidationIssue {
  id: string
  level: "error" | "warning" | "info"
  message: string
  fieldPath?: string
  year?: number
}

interface ValidationSummaryModalProps {
  open: boolean
  onClose: () => void
  issues: ValidationIssue[]
  onRerun?: () => void
  onNavigateToField?: (issueId: string) => void
  isLoading?: boolean
  isError?: boolean
  className?: string
}

export function ValidationSummaryModal({
  open,
  onClose,
  issues,
  onRerun,
  onNavigateToField,
  isLoading = false,
  isError = false,
  className,
}: ValidationSummaryModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Focus management
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
      modalRef.current?.focus()
    } else {
      previousFocusRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "r":
        case "R":
          if (e.ctrlKey || e.metaKey) return // Don't interfere with browser shortcuts
          if (onRerun && !isLoading) {
            e.preventDefault()
            onRerun()
          }
          break
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [open, onClose, onRerun, isLoading])

  // Focus trap
  useEffect(() => {
    if (!open) return

    const modal = modalRef.current
    if (!modal) return

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    modal.addEventListener("keydown", handleTabKey)
    return () => modal.removeEventListener("keydown", handleTabKey)
  }, [open])

  if (!open) return null

  const errorCount = issues.filter((issue) => issue.level === "error").length
  const warningCount = issues.filter((issue) => issue.level === "warning").length
  const infoCount = issues.filter((issue) => issue.level === "info").length
  const totalCount = issues.length

  const getStatusMessage = () => {
    if (isLoading) return "Running validation checks, please wait"
    if (isError) return "Validation failed due to an error"
    if (totalCount === 0) return "All validation checks passed successfully"

    const parts = []
    if (errorCount > 0) parts.push(`${errorCount} error${errorCount !== 1 ? "s" : ""}`)
    if (warningCount > 0) parts.push(`${warningCount} warning${warningCount !== 1 ? "s" : ""}`)
    if (infoCount > 0) parts.push(`${infoCount} info message${infoCount !== 1 ? "s" : ""}`)

    return `Validation completed with ${parts.join(", ")}`
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-black/50 backdrop-blur-sm",
        className,
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="validation-modal-title"
      aria-describedby="validation-modal-description"
    >
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {getStatusMessage()}
      </div>

      <div
        ref={modalRef}
        className={cn(
          "relative w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden",
          "bg-white/90 backdrop-blur-xl border border-white/20",
          "shadow-2xl shadow-[#3270a1]/10",
          "focus:outline-none focus:ring-2 focus:ring-[#3270a1]/50",
        )}
        tabIndex={-1}
      >
        {/* Header with gradient accent */}
        <div className="relative p-6 border-b border-gray-200/50">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c]" />

          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h2
                id="validation-modal-title"
                className="text-xl font-semibold bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] bg-clip-text text-transparent"
              >
                Validation Results
              </h2>
              <p id="validation-modal-description" className="text-sm text-[#4a4a4a] mt-1">
                {isLoading
                  ? "Running validation checks..."
                  : isError
                    ? "Failed to run validation"
                    : totalCount === 0
                      ? "All checks passed successfully"
                      : `Found ${totalCount} issue${totalCount !== 1 ? "s" : ""} that need attention`}
              </p>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3270a1]/50"
              aria-label="Close validation results"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Summary chips */}
          {!isLoading && !isError && (
            <div className="mt-4">
              <ValidationSummaryChips
                totalCount={totalCount}
                errorCount={errorCount}
                warningCount={warningCount}
                infoCount={infoCount}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden" style={{ maxHeight: "calc(90vh - 200px)" }}>
          {isLoading ? (
            <ValidationLoadingState />
          ) : isError ? (
            <ValidationErrorState onRetry={onRerun} />
          ) : totalCount === 0 ? (
            <ValidationEmptyState />
          ) : (
            <div className="h-full flex flex-col">
              <ValidationTabs issues={issues} onNavigateToField={onNavigateToField} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200/50 bg-gray-50/50">
          <div className="text-xs text-[#4a4a4a] hidden sm:block">
            {onRerun && !isLoading && (
              <span>
                Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">R</kbd> to re-run
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#4a4a4a] hover:text-[#1a1a1a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3270a1]/50 rounded-md"
            >
              Close
            </button>

            {onRerun && (
              <button
                onClick={onRerun}
                disabled={isLoading}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md",
                  "border-2 border-transparent bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] bg-clip-border",
                  "text-transparent bg-clip-text",
                  "hover:shadow-lg hover:scale-105 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-[#3270a1]/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                )}
                style={{
                  background:
                    "linear-gradient(white, white) padding-box, linear-gradient(135deg, #8dcddb, #3270a1, #7e509c) border-box",
                }}
                aria-label="Re-run validation (Press R)"
              >
                <RotateCcw className="w-4 h-4" />
                Re-run Validation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
