import type React from "react"
import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  isLoading?: boolean
  variant?: "primary" | "outline"
}

export function SubmitButton({
  children,
  isLoading = false,
  variant = "primary",
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const isPrimary = variant === "primary"

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "w-full px-6 py-3 rounded-lg font-medium smooth-transition-250",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "hover:scale-105 active:scale-95",
        isPrimary && [
          "text-white shadow-lg",
          "bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600",
          "hover:gradient-pan",
          !disabled && !isLoading && "hover:shadow-xl",
        ],
        !isPrimary && ["text-gray-700 bg-white gradient-border", "hover:bg-gray-50"],
        className,
      )}
      style={isPrimary ? { backgroundSize: "200% 200%" } : undefined}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  )
}
