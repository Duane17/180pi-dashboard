"use client"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onAdjustFilters?: () => void
  onClearFilters?: () => void
  hasActiveFilters?: boolean
}

export function EmptyState({ onAdjustFilters, onClearFilters, hasActiveFilters = false }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50/50 to-white p-8 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#8dcddb]/10 to-[#7e509c]/10">
        <Search className="h-8 w-8 text-gray-400" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        {hasActiveFilters ? "No matching investors found" : "Start your investor search"}
      </h3>

      <p className="mb-6 max-w-md text-sm text-gray-500">
        {hasActiveFilters
          ? "Try adjusting your criteria to find more potential matches. Consider expanding your sector focus or geographic preferences."
          : "Use the filters to find investors that match your sustainability criteria and funding needs."}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        {hasActiveFilters ? (
          <>
            <Button onClick={onClearFilters} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Clear All Filters
            </Button>
            <Button
              onClick={onAdjustFilters}
              className="bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white hover:shadow-lg hover:shadow-[#3270a1]/25 transition-all duration-200"
            >
              Adjust Criteria
            </Button>
          </>
        ) : (
          <Button
            onClick={onAdjustFilters}
            className="bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white hover:shadow-lg hover:shadow-[#3270a1]/25 transition-all duration-200"
          >
            <Filter className="mr-2 h-4 w-4" />
            Set Your Criteria
          </Button>
        )}
      </div>
    </div>
  )
}
