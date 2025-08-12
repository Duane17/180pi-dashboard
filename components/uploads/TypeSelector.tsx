"use client"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EvidenceType {
  label: string
  value: string
}

interface TypeSelectorProps {
  value?: string
  onChange: (type: string) => void
  types?: EvidenceType[]
  placeholder?: string
  className?: string
}

const defaultTypes: EvidenceType[] = [
  { label: "Utility Bill", value: "utility-bill" },
  { label: "HR Report", value: "hr-report" },
  { label: "Audit Report", value: "audit-report" },
  { label: "Financial Statement", value: "financial-statement" },
  { label: "Sustainability Report", value: "sustainability-report" },
  { label: "Other", value: "other" },
]

export function TypeSelector({
  value,
  onChange,
  types = defaultTypes,
  placeholder = "Select type",
  className,
}: TypeSelectorProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm",
          "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2",
          "focus:ring-gradient-to-r focus:from-[#8dcddb] focus:via-[#3270a1] focus:to-[#7e509c]",
          "hover:border-gray-300 transition-colors",
          "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
        )}
      >
        <option value="">{placeholder}</option>
        {types.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  )
}
