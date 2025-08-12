import type React from "react"
import { cn } from "@/lib/utils"

interface BridgeShellProps {
  children?: React.ReactNode
  filtersSlot?: React.ReactNode
  resultsSlot?: React.ReactNode
  className?: string
}

export function BridgeShell({ children, filtersSlot, resultsSlot, className }: BridgeShellProps) {
  return (
    <div className={cn("min-h-screen bg-white", className)}>
      {/* Hero Section */}
      <div className="border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] bg-clip-text text-transparent">
                Bridge — Investor Matching
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Connect with investors who meet your sustainability criteria.
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-sm text-gray-500">
              Your data privacy is protected. Matching is based on publicly available criteria and your preferences.
              Direct contact requires mutual consent and verified credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters Column */}
          <div className="lg:col-span-1">{filtersSlot}</div>

          {/* Results Column */}
          <div className="lg:col-span-3">{resultsSlot}</div>
        </div>
      </div>

      {/* Additional Content */}
      {children}
    </div>
  )
}
