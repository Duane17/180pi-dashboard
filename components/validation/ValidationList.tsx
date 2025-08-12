"use client"

import { ValidationListItem } from "./ValidationListItem"
import type { ValidationIssue } from "./ValidationSummaryModal"

interface ValidationListProps {
  items: ValidationIssue[]
  onNavigateToField?: (issueId: string) => void
  className?: string
}

export function ValidationList({ items, onNavigateToField, className }: ValidationListProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-[#4a4a4a]">
        <p className="text-sm">No issues found in this category.</p>
      </div>
    )
  }

  return (
    <div className={`overflow-auto h-full ${className || ""}`}>
      <div className="divide-y divide-gray-200/50">
        {items.map((item) => (
          <ValidationListItem key={item.id} issue={item} onNavigateToField={onNavigateToField} />
        ))}
      </div>
    </div>
  )
}
