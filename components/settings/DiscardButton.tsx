"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface DiscardButtonProps {
  onClick?: () => void
  disabled?: boolean
  children?: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "outline" | "ghost"
}

export function DiscardButton({
  onClick,
  disabled = false,
  children = "Discard Changes",
  className,
  size = "md",
  variant = "outline",
}: DiscardButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }

  const variantClasses = {
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base styles
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2",

        // Size
        sizeClasses[size],

        // Variant
        variantClasses[variant],

        // Disabled state
        disabled && "opacity-50 cursor-not-allowed",

        // Hover effects
        !disabled && "hover:scale-[1.02]",

        className,
      )}
      aria-label="Discard changes"
    >
      <X className="h-4 w-4" />
      <span>{children}</span>
    </button>
  )
}
