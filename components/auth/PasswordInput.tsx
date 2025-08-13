"use client"

import type React from "react"

import { forwardRef, useState } from "react"
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  showValidation?: boolean
  isValid?: boolean
  showStrengthIndicator?: boolean
}
 
const calculatePasswordStrength = (password: string): { score: number; feedback: string[] } => {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push("At least 8 characters")

  if (/[a-z]/.test(password)) score += 1
  else feedback.push("One lowercase letter")

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push("One uppercase letter")

  if (/\d/.test(password)) score += 1
  else feedback.push("One number")

  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  else feedback.push("One special character")

  return { score, feedback }
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      error,
      helperText,
      showValidation = false,
      isValid = false,
      showStrengthIndicator = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [strength, setStrength] = useState({ score: 0, feedback: [] })

    const hasError = !!error
    const showSuccess = showValidation && isValid && !hasError && !isFocused

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showStrengthIndicator) {
        setStrength(calculatePasswordStrength(e.target.value))
      }
      props.onChange?.(e)
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900" htmlFor={props.id}>
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={cn(
              "w-full px-4 py-3 pr-20 bg-white border rounded-lg",
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
            onChange={handlePasswordChange}
            aria-invalid={hasError}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            {...props}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {showValidation && (
              <>
                {hasError && <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />}
                {showSuccess && <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />}
              </>
            )}

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 smooth-transition p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {showStrengthIndicator && props.value && (
          <div className="space-y-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    strength.score >= level
                      ? strength.score <= 2
                        ? "bg-red-400"
                        : strength.score <= 3
                          ? "bg-yellow-400"
                          : "bg-green-400"
                      : "bg-gray-200",
                  )}
                />
              ))}
            </div>
            {strength.feedback.length > 0 && (
              <p className="text-xs text-gray-500">Missing: {strength.feedback.join(", ")}</p>
            )}
          </div>
        )}

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

PasswordInput.displayName = "PasswordInput"
