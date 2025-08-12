"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface SettingsShellProps {
  children: React.ReactNode
  navigation?: React.ReactNode
  className?: string
}

export function SettingsShell({ children, navigation, className }: SettingsShellProps) {
  return (
    <div className={cn("min-h-screen bg-white", className)}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Settings Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">{navigation}</div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
