"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle, ArrowRight } from "lucide-react"
import { PasswordInput } from "./PasswordInput"
import { SubmitButton } from "./SubmitButton"
import { ValidationSummary } from "./ValidationSummary"

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

interface ResetFormProps {
  token?: string
  onSubmit: (data: ResetPasswordFormData) => Promise<void>
  isSubmitting?: boolean
}

export function ResetForm({ token = "", onSubmit, isSubmitting = false }: ResetFormProps) {
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
    },
  })

  const errorMessages = Object.values(errors)
    .map((error) => error.message)
    .filter(Boolean) as string[]

  const handleFormSubmit = async (data: ResetPasswordFormData) => {
    try {
      await onSubmit(data)
      setIsSuccess(true)
    } catch (error) {
      // Error handling will be managed by parent component
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Password reset successfully</h3>
          <p className="text-gray-600 text-sm">
            Your password has been updated. You can now sign in with your new password.
          </p>
        </div>

        <a
          href="/auth"
          className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 text-white font-medium rounded-lg smooth-transition-250 hover:scale-105 hover:shadow-lg"
          style={{ backgroundSize: "200% 200%" }}
        >
          Continue to sign in
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <ValidationSummary errors={errorMessages} />

      {/* Hidden token field */}
      <input type="hidden" {...register("token")} />

      <PasswordInput
        label="New password"
        placeholder="Enter your new password"
        helperText="Must be at least 8 characters with uppercase, lowercase, and number"
        error={errors.password?.message}
        {...register("password")}
      />

      <PasswordInput
        label="Confirm new password"
        placeholder="Confirm your new password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <SubmitButton isLoading={isSubmitting} type="submit">
        Reset Password
      </SubmitButton>
    </form>
  )
}
