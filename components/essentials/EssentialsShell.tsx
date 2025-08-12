"use client"

import type React from "react"

interface EssentialsShellProps {
  year?: number
  onYearChange?: (year: number) => void
  actionSlot?: React.ReactNode
  children: React.ReactNode
}

export function EssentialsShell({ year, onYearChange, actionSlot, children }: EssentialsShellProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] bg-clip-text text-transparent">
                Essentials
              </h1>
              <p className="text-[#4a4a4a] text-sm mt-1">Environmental and Labor baseline metrics for ESG reporting</p>
            </div>
            {actionSlot && <div className="flex items-center gap-3">{actionSlot}</div>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">{children}</div>
    </div>
  )
}
