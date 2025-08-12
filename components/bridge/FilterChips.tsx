"use client"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FilterChip {
  key: string
  label: string
}

interface FilterChipsProps {
  chips: FilterChip[]
  onRemove: (key: string) => void
  onClearAll: () => void
  className?: string
}

export function FilterChips({ chips, onRemove, onClearAll, className }: FilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Active Filters ({chips.length})</span>
        <Button
          onClick={onClearAll}
          variant="ghost"
          size="sm"
          className="h-auto p-1 text-xs text-gray-500 hover:text-gray-700"
        >
          Clear All
        </Button>
      </div>

      <div className="flex flex-wrap gap-2" role="list" aria-label="Active filters">
        {chips.map((chip) => (
          <Badge
            key={chip.key}
            variant="secondary"
            className="flex items-center gap-1 bg-gradient-to-r from-[#8dcddb]/10 to-[#7e509c]/10 border border-[#3270a1]/20 text-gray-700 hover:bg-gradient-to-r hover:from-[#8dcddb]/20 hover:to-[#7e509c]/20 transition-all duration-200"
            role="listitem"
          >
            <span className="text-xs">{chip.label}</span>
            <button
              onClick={() => onRemove(chip.key)}
              className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${chip.label} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
