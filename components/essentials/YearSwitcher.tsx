"use client"

import { useState } from "react"
import { ChevronDown, Plus } from "lucide-react"

interface YearSwitcherProps {
  value: number
  options: number[]
  onChange: (year: number) => void
  onAddYear?: () => void
  className?: string
}

export function YearSwitcher({ value, options, onChange, onAddYear, className }: YearSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative ${className || ""}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-transparent focus:gradient-border"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select reporting year"
      >
        <span className="text-[#1a1a1a] font-medium">{value}</span>
        <ChevronDown className={`w-4 h-4 text-[#4a4a4a] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="absolute top-full left-0 mt-1 w-full min-w-[120px] bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1" role="listbox">
              {options.map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    onChange(year)
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                    year === value
                      ? "bg-gradient-to-r from-[#8dcddb]/10 via-[#3270a1]/10 to-[#7e509c]/10 text-[#1a1a1a] font-medium"
                      : "text-[#1a1a1a]"
                  }`}
                  role="option"
                  aria-selected={year === value}
                >
                  {year}
                </button>
              ))}
              {onAddYear && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => {
                      onAddYear()
                      setIsOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-[#4a4a4a] flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Year
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
