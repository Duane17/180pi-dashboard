"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Loader2, Check } from "lucide-react"

interface SaveButtonProps {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  success?: boolean
  children?: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg"
}

export function SaveButton({
  onClick,
  disabled = false,
  loading = false,
  success = false,
  children = "Save Changes",
  className,
  size = "md",
}: SaveButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        // Base styles
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2",

        // Size
        sizeClasses[size],

        // State styles
        success
          ? "bg-green-500 text-white hover:bg-green-600"
          : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700",

        // Disabled state
        (disabled || loading) && "opacity-50 cursor-not-allowed",

        // Hover effects
        !disabled && !loading && "hover:scale-[1.02] hover:shadow-lg",

        className,
      )}
      aria-label={loading ? "Saving..." : success ? "Saved successfully" : "Save changes"}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {success && <Check className="h-4 w-4" />}
      <span>{loading ? "Saving..." : success ? "Saved!" : children}</span>
    </button>
  )
}
