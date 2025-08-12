"use client"

import type React from "react"

import { forwardRef, useEffect, useRef } from "react"
import { Loader2, Check, AlertTriangle, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  state?: "idle" | "loading" | "success" | "error" | "disabled"
  size?: "sm" | "md"
  onClick?: () => void
}

export const ValidationButton = forwardRef<HTMLButtonElement, ValidationButtonProps>(
  ({ state = "idle", size = "md", className, children, onClick, ...props }, ref) => {
    const isDisabled = state === "disabled" || state === "loading"
    const previousStateRef = useRef(state)

    useEffect(() => {
      if (previousStateRef.current !== state) {
        const announcements = {
          loading: "Validation started",
          success: "Validation completed successfully",
          error: "Validation completed with issues",
          idle: "Ready to validate",
          disabled: "Validation unavailable",
        }

        const announcement = announcements[state]
        if (announcement) {
          // Create temporary element for screen reader announcement
          const liveRegion = document.createElement("div")
          liveRegion.setAttribute("aria-live", "polite")
          liveRegion.setAttribute("aria-atomic", "true")
          liveRegion.className = "sr-only"
          liveRegion.textContent = announcement
          document.body.appendChild(liveRegion)

          setTimeout(() => {
            document.body.removeChild(liveRegion)
          }, 1000)
        }

        previousStateRef.current = state
      }
    }, [state])

    const getIcon = () => {
      switch (state) {
        case "loading":
          return <Loader2 className="w-4 h-4 animate-spin" />
        case "success":
          return <Check className="w-4 h-4" />
        case "error":
          return <AlertTriangle className="w-4 h-4" />
        default:
          return size === "sm" ? <ShieldCheck className="w-4 h-4" /> : null
      }
    }

    const getButtonText = () => {
      if (children) return children

      switch (state) {
        case "loading":
          return "Validating..."
        case "success":
          return "Validated"
        case "error":
          return "Validation Failed"
        default:
          return "Validate Data"
      }
    }

    const getAriaLabel = () => {
      const baseLabel = "Validate data - runs non-blocking checks on your current entries"

      switch (state) {
        case "loading":
          return `${baseLabel}. Currently validating, please wait`
        case "success":
          return `${baseLabel}. Validation completed successfully`
        case "error":
          return `${baseLabel}. Validation found issues, click to view details`
        case "disabled":
          return `${baseLabel}. Currently unavailable`
        default:
          return baseLabel
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        onClick={onClick}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 font-medium rounded-md overflow-hidden",
          "transition-all duration-200 ease-out",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          size === "sm" ? "px-3 py-2 text-sm" : "px-6 py-3 text-base",
          state === "idle" && [
            "bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c]",
            "text-white shadow-lg",
            "hover:shadow-xl hover:scale-105",
            "focus:ring-[#3270a1]/50",
            "active:scale-95",
          ],
          state === "loading" && [
            "bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c]",
            "text-white shadow-lg opacity-80 cursor-not-allowed",
          ],
          state === "success" && ["bg-gradient-to-r from-green-400 to-green-600", "text-white shadow-lg"],
          state === "error" && ["bg-gradient-to-r from-red-400 to-red-600", "text-white shadow-lg"],
          state === "disabled" && ["bg-gray-200 text-gray-400 cursor-not-allowed"],
          className
        )}
        title="Runs non-blocking checks on your current entries"
        aria-label={getAriaLabel()}
        aria-describedby="validation-help"
        {...props}
      >
        {getIcon()}
        <span className="relative z-10">{getButtonText()}</span>

        {/* Smooth gradient pan overlay */}
        {state === "idle" && (
          <div
            className="absolute inset-0 rounded-md bg-gradient-to-r from-[#7e509c] via-[#3270a1] to-[#8dcddb]
                      opacity-0 group-hover:opacity-100
                      bg-[length:200%_200%] group-hover:bg-[position:100%_0]
                      transition-all duration-500 ease-out"
          />
        )}
      </button>

    )
  },
)

ValidationButton.displayName = "ValidationButton"
