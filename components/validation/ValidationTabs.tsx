"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ValidationList } from "./ValidationList"
import type { ValidationIssue } from "./ValidationSummaryModal"

interface ValidationTabsProps {
  issues: ValidationIssue[]
  onNavigateToField?: (issueId: string) => void
  className?: string
}

type TabValue = "all" | "errors" | "warnings" | "info"

export function ValidationTabs({ issues, onNavigateToField, className }: ValidationTabsProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("all")

  const errorCount = issues.filter((issue) => issue.level === "error").length
  const warningCount = issues.filter((issue) => issue.level === "warning").length
  const infoCount = issues.filter((issue) => issue.level === "info").length

  const filteredIssues = issues.filter((issue) => {
    switch (activeTab) {
      case "errors":
        return issue.level === "error"
      case "warnings":
        return issue.level === "warning"
      case "info":
        return issue.level === "info"
      default:
        return true
    }
  })

  const tabs = [
    { value: "all" as const, label: "All", count: issues.length },
    { value: "errors" as const, label: "Errors", count: errorCount },
    { value: "warnings" as const, label: "Warnings", count: warningCount },
    { value: "info" as const, label: "Info", count: infoCount },
  ]

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Tab buttons */}
      <div className="flex border-b border-gray-200/50 bg-gray-50/30">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200",
              "border-b-2 border-transparent",
              "hover:bg-white/50 hover:text-[#1a1a1a]",
              "focus:outline-none focus:ring-2 focus:ring-[#3270a1]/50 focus:ring-inset",
              activeTab === tab.value
                ? ["border-b-2 border-[#3270a1] bg-white text-[#1a1a1a]", "shadow-sm"]
                : "text-[#4a4a4a]",
            )}
            role="tab"
            aria-selected={activeTab === tab.value}
            aria-controls={`validation-panel-${tab.value}`}
            disabled={tab.count === 0}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full",
                  activeTab === tab.value
                    ? "bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white"
                    : "bg-gray-200 text-[#4a4a4a]",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        <div
          id={`validation-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`validation-tab-${activeTab}`}
          className="h-full"
        >
          <ValidationList items={filteredIssues} onNavigateToField={onNavigateToField} />
        </div>
      </div>
    </div>
  )
}
