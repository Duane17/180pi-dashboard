"use client"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface YearSelectorProps {
  value?: number
  onChange: (year: number) => void
  years?: number[]
  placeholder?: string
  className?: string
}

export function YearSelector({
  value,
  onChange,
  years = [2024, 2023, 2022, 2021, 2020],
  placeholder = "Select year",
  className,
}: YearSelectorProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm",
          "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2",
          "focus:ring-gradient-to-r focus:from-[#8dcddb] focus:via-[#3270a1] focus:to-[#7e509c]",
          "hover:border-gray-300 transition-colors",
          "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
        )}
      >
        <option value="">{placeholder}</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  )
}
