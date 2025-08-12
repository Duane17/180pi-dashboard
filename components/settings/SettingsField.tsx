"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

interface SettingsFieldProps {
  label: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function SettingsField({
  label,
  description,
  error,
  required = false,
  children,
  className,
}: SettingsFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {/* Field Label */}
      <div className="flex items-center gap-1">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {required && (
          <span className="text-red-500" aria-label="Required">
            *
          </span>
        )}
      </div>

      {/* Field Description */}
      {description && <p className="text-sm text-gray-600">{description}</p>}

      {/* Field Input */}
      <div className="relative">{children}</div>

      {/* Field Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
