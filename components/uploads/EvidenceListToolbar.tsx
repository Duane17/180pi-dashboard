"use client"
import { Search, SlidersHorizontal } from "lucide-react"
import { YearSelector } from "./YearSelector"
import { TypeSelector, type EvidenceType } from "./TypeSelector"
import { cn } from "@/lib/utils"

export type SortOption = "newest" | "oldest" | "name-asc" | "name-desc" | "size-asc" | "size-desc"

interface EvidenceListToolbarProps {
  searchQuery?: string
  onSearchChange: (query: string) => void
  selectedYear?: number
  onYearChange: (year: number | undefined) => void
  selectedType?: string
  onTypeChange: (type: string) => void
  sortBy?: SortOption
  onSortChange: (sort: SortOption) => void
  yearOptions?: number[]
  typeOptions?: EvidenceType[]
  className?: string
}

const sortOptions = [
  { label: "Newest First", value: "newest" as SortOption },
  { label: "Oldest First", value: "oldest" as SortOption },
  { label: "Name A-Z", value: "name-asc" as SortOption },
  { label: "Name Z-A", value: "name-desc" as SortOption },
  { label: "Size (Smallest)", value: "size-asc" as SortOption },
  { label: "Size (Largest)", value: "size-desc" as SortOption },
]

export function EvidenceListToolbar({
  searchQuery = "",
  onSearchChange,
  selectedYear,
  onYearChange,
  selectedType = "",
  onTypeChange,
  sortBy = "newest",
  onSortChange,
  yearOptions = [2024, 2023, 2022, 2021, 2020],
  typeOptions,
  className,
}: EvidenceListToolbarProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm",
            "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2",
            "focus:ring-gradient-to-r focus:from-[#8dcddb] focus:via-[#3270a1] focus:to-[#7e509c]",
            "hover:border-gray-300 transition-colors",
            "placeholder:text-gray-500",
          )}
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="w-full sm:w-48">
            <YearSelector
              value={selectedYear}
              onChange={(year) => onYearChange(year)}
              years={yearOptions}
              placeholder="All years"
            />
          </div>

          <div className="w-full sm:w-48">
            <TypeSelector value={selectedType} onChange={onTypeChange} types={typeOptions} placeholder="All types" />
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="w-full sm:w-48">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className={cn(
                "w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm",
                "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2",
                "focus:ring-gradient-to-r focus:from-[#8dcddb] focus:via-[#3270a1] focus:to-[#7e509c]",
                "hover:border-gray-300 transition-colors",
              )}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
