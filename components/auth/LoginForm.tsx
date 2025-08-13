"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FormTextInput } from "./FormTextInput"
import { PasswordInput } from "./PasswordInput"
import { SubmitButton } from "./SubmitButton"
import { ValidationSummary } from "./ValidationSummary"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
  isSubmitting?: boolean
  serverSummaryErrors?: string[]
  serverFieldErrors?: Record<string, string[]>
}

export function LoginForm({
  onSubmit,
  isSubmitting = false,
  serverSummaryErrors = [],
  serverFieldErrors = {},
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, touchedFields },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  })

  // Apply server field errors
  useEffect(() => {
    Object.entries(serverFieldErrors).forEach(([field, messages]) => {
      if (!messages || messages.length === 0) return
      setError(field as keyof LoginFormData, { type: "server", message: messages[0] })
    })
  }, [serverFieldErrors, setError])

  const watchedEmail = watch("email")
  const watchedPassword = watch("password")

  const clientErrors = Object.values(errors)
    .map((e) => e?.message)
    .filter(Boolean) as string[]

  const summaryErrors = [...serverSummaryErrors, ...clientErrors]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <ValidationSummary errors={summaryErrors} />

      <FormTextInput
        id="login-email"
        label="Email address"
        type="email"
        placeholder="Enter your email"
        error={errors.email?.message}
        showValidation={touchedFields.email}
        isValid={touchedFields.email && !errors.email && !!watchedEmail}
        required
        {...register("email")}
      />

      <PasswordInput
        id="login-password"
        label="Password"
        placeholder="Enter your password"
        error={errors.password?.message}
        showValidation={touchedFields.password}
        isValid={touchedFields.password && !errors.password && !!watchedPassword}
        required
        {...register("password")}
      />

      <div className="flex items-center justify-between">
        {/* <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" className="custom-checkbox" {...register("rememberMe")} />
          <span className="text-gray-700">Remember me</span>
        </label> */}

        {/* <a href="/auth/forgot" className="text-sm text-blue-600 hover:text-blue-800 smooth-transition">
          Forgot password?
        </a> */}
      </div>

      <SubmitButton isLoading={isSubmitting} type="submit">
        Sign In
      </SubmitButton>
    </form>
  )
}
