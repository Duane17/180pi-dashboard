"use client"

import type React from "react"

import { forwardRef } from "react"
import { HelpCircle } from "lucide-react"

interface FormNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  name: string
  label: string
  unit?: string
  helperText?: string
  error?: string
  tooltip?: string
  required?: boolean
}

export const FormNumberInput = forwardRef<HTMLInputElement, FormNumberInputProps>(
  ({ name, label, unit, helperText, error, tooltip, required, className, ...props }, ref) => {
    const inputId = `${name}-input`
    const helperId = `${name}-helper`
    const errorId = `${name}-error`

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor={inputId} className="block text-sm font-medium text-[#1a1a1a]">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {tooltip && (
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-[#4a4a4a] cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          )}
        </div>

        <div className="relative focus-within:gradient-border rounded-lg transition-all duration-200">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="number"
            className={`
              w-full px-4 py-3 bg-white border border-gray-200 rounded-lg
              text-[#1a1a1a] placeholder-[#4a4a4a]
              shadow-inner
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-0 focus:border-transparent
              hover:border-gray-300
              disabled:bg-gray-50 disabled:text-gray-400
              ${unit ? "pr-16" : ""}
              ${error ? "border-red-300 focus:border-red-300" : ""}
              ${className || ""}
            `}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          />

          {unit && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4a4a4a] text-sm font-medium pointer-events-none">
              {unit}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert" aria-live="polite">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="text-sm text-[#4a4a4a]">
            {helperText}
          </p>
        )}
      </div>
    )
  },
)

FormNumberInput.displayName = "FormNumberInput"
