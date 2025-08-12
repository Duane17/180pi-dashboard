"use client"
import { Search, Grid3X3, List, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface InvestorToolbarProps {
  query: string
  onQueryChange: (query: string) => void
  sort: string
  onSortChange: (sort: string) => void
  view: "grid" | "list"
  onViewChange: (view: "grid" | "list") => void
  savedView?: string
  onSavedViewChange?: (view: string) => void
  resultsCount?: number
  className?: string
}

const sortOptions = [
  { value: "match", label: "Best Match" },
  { value: "newest", label: "Newest" },
  { value: "aum", label: "AUM (High to Low)" },
  { value: "alpha", label: "Alphabetical" },
]

const savedViews = [
  { value: "all", label: "All Investors" },
  { value: "climate", label: "Climate Focused" },
  { value: "impact", label: "Impact Investors" },
  { value: "early-stage", label: "Early Stage" },
]

export function InvestorToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  view,
  onViewChange,
  savedView,
  onSavedViewChange,
  resultsCount,
  className,
}: InvestorToolbarProps) {
  const currentSort = sortOptions.find((option) => option.value === sort)
  const currentSavedView = savedViews.find((option) => option.value === savedView)

  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      {/* Left Side - Search and Results Count */}
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search investors..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-10 bg-white/60 backdrop-blur-sm border-gray-200 focus:border-[#3270a1] focus:ring-[#3270a1]/20"
          />
        </div>

        {resultsCount !== undefined && (
          <div className="text-sm text-gray-600" aria-live="polite">
            {resultsCount} {resultsCount === 1 ? "investor" : "investors"}
          </div>
        )}
      </div>

      {/* Right Side - Controls */}
      <div className="flex items-center gap-2">
        {/* Saved Views */}
        {onSavedViewChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white/60 backdrop-blur-sm border-gray-200">
                {currentSavedView?.label || "All Investors"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {savedViews.map((option) => (
                <DropdownMenuItem key={option.value} onClick={() => onSavedViewChange(option.value)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-white/60 backdrop-blur-sm border-gray-200">
              {currentSort?.label || "Sort"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sortOptions.map((option) => (
              <DropdownMenuItem key={option.value} onClick={() => onSortChange(option.value)}>
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Toggle */}
        <div className="flex rounded-lg border border-gray-200 bg-white/60 backdrop-blur-sm p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange("grid")}
            className={cn(
              "h-8 w-8 p-0",
              view === "grid"
                ? "bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900",
            )}
            aria-label="Grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange("list")}
            className={cn(
              "h-8 w-8 p-0",
              view === "list"
                ? "bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900",
            )}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
