"use client"

import type React from "react"

import { forwardRef, useState } from "react"
import { CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormTextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  showValidation?: boolean
  isValid?: boolean
}

export const FormTextInput = forwardRef<HTMLInputElement, FormTextInputProps>(
  ({ label, error, helperText, showValidation = false, isValid = false, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const hasError = !!error
    const showSuccess = showValidation && isValid && !hasError && !isFocused

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900" htmlFor={props.id}>
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="relative">
          <input
            ref={ref}
            className={cn(
              "w-full px-4 py-3 bg-white border rounded-lg",
              "shadow-inner smooth-transition-250 input-focus-gradient",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-0",
              !hasError && !showSuccess && "border-gray-200 focus:border-transparent",
              hasError && "input-error",
              showSuccess && "input-success",
              className,
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={hasError}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            {...props}
          />

          {showValidation && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {hasError && <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />}
              {showSuccess && <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${props.id}-error`}
            className="text-sm text-red-600 flex items-start gap-1"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${props.id}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  },
)

FormTextInput.displayName = "FormTextInput"
