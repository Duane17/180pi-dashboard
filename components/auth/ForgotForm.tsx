"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, ArrowLeft } from "lucide-react"
import { FormTextInput } from "./FormTextInput"
import { SubmitButton } from "./SubmitButton"
import { ValidationSummary } from "./ValidationSummary"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

interface ForgotFormProps {
  onSubmit: (data: ForgotPasswordFormData) => Promise<void>
  isSubmitting?: boolean
}

export function ForgotForm({ onSubmit, isSubmitting = false }: ForgotFormProps) {
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const errorMessages = Object.values(errors)
    .map((error) => error.message)
    .filter(Boolean) as string[]

  const handleFormSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await onSubmit(data)
      setSubmittedEmail(data.email)
      setIsSuccess(true)
    } catch (error) {
      // Error handling will be managed by parent component
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-green-600" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your inbox</h3>
          <p className="text-gray-600 text-sm">
            We've sent password reset instructions to{" "}
            <span className="font-medium text-gray-900">{submittedEmail}</span>
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-gray-500">Didn't receive the email? Check your spam folder or try again.</p>

          <button
            onClick={() => setIsSuccess(false)}
            className="text-sm text-blue-600 hover:text-blue-800 smooth-transition"
          >
            Try a different email address
          </button>
        </div>

        <a
          href="/auth"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 smooth-transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <ValidationSummary errors={errorMessages} />

      <FormTextInput
        label="Email address"
        type="email"
        placeholder="Enter your email address"
        helperText="We'll send you a link to reset your password"
        error={errors.email?.message}
        {...register("email")}
      />

      <SubmitButton isLoading={isSubmitting} type="submit">
        Send Reset Link
      </SubmitButton>

      <div className="text-center">
        <a
          href="/auth"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 smooth-transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </a>
      </div>
    </form>
  )
}
