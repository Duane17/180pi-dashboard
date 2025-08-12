"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface YearSelectorProps {
  value: number
  options: number[]
  onChange: (year: number) => void
}

export function YearSelector({ value, options, onChange }: YearSelectorProps) {
  return (
    <Select value={value.toString()} onValueChange={(val) => onChange(Number.parseInt(val))}>
      <SelectTrigger className="w-32 rounded-md border-[#3270a1]/20 focus:ring-2 focus:ring-[#3270a1] focus:border-[#3270a1]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
