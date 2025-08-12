"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface SettingsSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

export function SettingsSection({ title, description, children, className, actions }: SettingsSectionProps) {
  return (
    <div className={cn("glass-card rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-sm", className)}>
      {/* Section Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
        {actions && <div className="ml-4 flex-shrink-0">{actions}</div>}
      </div>

      {/* Section Content */}
      <div className="space-y-6">{children}</div>
    </div>
  )
}
