"use client"
import { YearSelector } from "./YearSelector"
import { TypeSelector, type EvidenceType } from "./TypeSelector"
import { cn } from "@/lib/utils"

interface EvidenceFiltersProps {
  selectedYear?: number
  selectedType?: string
  onYearChange: (year: number) => void
  onTypeChange: (type: string) => void
  yearOptions?: number[]
  typeOptions?: EvidenceType[]
  className?: string
}

export function EvidenceFilters({
  selectedYear,
  selectedType,
  onYearChange,
  onTypeChange,
  yearOptions = [2024, 2023, 2022, 2021, 2020],
  typeOptions,
  className,
}: EvidenceFiltersProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-4", className)}>
      <div className="flex-1">
        <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Year
        </label>
        <YearSelector value={selectedYear} onChange={onYearChange} years={yearOptions} placeholder="All years" />
      </div>

      <div className="flex-1">
        <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Evidence Type
        </label>
        <TypeSelector value={selectedType} onChange={onTypeChange} types={typeOptions} placeholder="All types" />
      </div>
    </div>
  )
}
