import type React from "react"
import { forwardRef } from "react"
import { ChevronDown } from "lucide-react"

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectInputProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label: string
  options: SelectOption[]
  error?: string
  helperText?: string
  placeholder?: string
  required?: boolean
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, options, error, helperText, placeholder, required, className, ...props }, ref) => {
    const selectId = props.id || `select-${label.toLowerCase().replace(/\s+/g, "-")}`

    return (
      <div className="space-y-2">
        <label htmlFor={selectId} className="block text-sm font-medium text-[#1a1a1a]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-4 py-3 bg-white border border-gray-200 rounded-lg
              text-[#1a1a1a]
              shadow-inner
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-2 focus:ring-transparent focus:border-transparent
              focus:gradient-border
              hover:border-gray-300
              disabled:bg-gray-50 disabled:text-gray-400
              appearance-none cursor-pointer
              ${error ? "border-red-300 focus:border-red-300" : ""}
              ${className || ""}
            `}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4a4a4a] pointer-events-none" />
        </div>

        {error && (
          <p id={`${selectId}-error`} className="text-sm text-red-600" role="alert" aria-live="polite">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${selectId}-helper`} className="text-sm text-[#4a4a4a]">
            {helperText}
          </p>
        )}
      </div>
    )
  },
)

SelectInput.displayName = "SelectInput"
