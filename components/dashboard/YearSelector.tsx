"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface YearSelectorProps {
  selectedYear: string
  onYearChange: (year: string) => void
  availableYears?: string[]
  disabled?: boolean
}

export function YearSelector({ selectedYear, onYearChange, availableYears, disabled = false }: YearSelectorProps) {
  // Default to last 5 years if no years provided
  const defaultYears = availableYears || ["2024", "2023", "2022", "2021", "2020"]

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="year-selector" className="text-sm font-medium text-[#4a4a4a]">
        Year:
      </label>
      <Select value={selectedYear} onValueChange={onYearChange} disabled={disabled}>
        <SelectTrigger
          id="year-selector"
          className="w-24 h-9 glass-card border-white/20 focus:border-[#3270a1]/50 focus:ring-2 focus:ring-[#3270a1]/20"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="glass-card border-white/20">
          {defaultYears.map((year) => (
            <SelectItem key={year} value={year} className="hover:bg-white/50 focus:bg-white/50">
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
