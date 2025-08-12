import type React from "react"
import { forwardRef } from "react"

interface FormTextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  required?: boolean
}

export const FormTextInput = forwardRef<HTMLInputElement, FormTextInputProps>(
  ({ label, error, helperText, required, className, ...props }, ref) => {
    const inputId = props.id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`

    return (
      <div className="space-y-2">
        <label htmlFor={inputId} className="block text-sm font-medium text-[#1a1a1a]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-3 bg-white border border-gray-200 rounded-lg
              text-[#1a1a1a] placeholder-[#4a4a4a]
              shadow-inner
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-2 focus:ring-transparent focus:border-transparent
              focus:gradient-border
              hover:border-gray-300
              disabled:bg-gray-50 disabled:text-gray-400
              ${error ? "border-red-300 focus:border-red-300" : ""}
              ${className || ""}
            `}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert" aria-live="polite">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-[#4a4a4a]">
            {helperText}
          </p>
        )}
      </div>
    )
  },
)

FormTextInput.displayName = "FormTextInput"
