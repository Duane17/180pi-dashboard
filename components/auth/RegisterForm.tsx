"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FormTextInput } from "./FormTextInput"
import { PasswordInput } from "./PasswordInput"
import { SubmitButton } from "./SubmitButton"
import { ValidationSummary } from "./ValidationSummary"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>
  isSubmitting?: boolean
}

export function RegisterForm({ onSubmit, isSubmitting = false }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur", // Enable real-time validation
  })

  const watchedFields = watch()

  const errorMessages = Object.values(errors)
    .map((error) => error.message)
    .filter(Boolean) as string[]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <ValidationSummary errors={errorMessages} />

      <FormTextInput
        id="register-name"
        label="Full name"
        type="text"
        placeholder="Enter your full name"
        error={errors.name?.message}
        showValidation={touchedFields.name}
        isValid={touchedFields.name && !errors.name && !!watchedFields.name}
        required
        {...register("name")}
      />

      <FormTextInput
        id="register-email"
        label="Email address"
        type="email"
        placeholder="Enter your email"
        error={errors.email?.message}
        showValidation={touchedFields.email}
        isValid={touchedFields.email && !errors.email && !!watchedFields.email}
        required
        {...register("email")}
      />

      <PasswordInput
        id="register-password"
        label="Password"
        placeholder="Create a strong password"
        helperText="Must be at least 8 characters with uppercase, lowercase, and number"
        error={errors.password?.message}
        showValidation={touchedFields.password}
        isValid={touchedFields.password && !errors.password && !!watchedFields.password}
        showStrengthIndicator={true}
        required
        {...register("password")}
      />

      <FormTextInput
        id="register-company"
        label="Company name"
        type="text"
        placeholder="Enter your company name"
        error={errors.companyName?.message}
        showValidation={touchedFields.companyName}
        isValid={touchedFields.companyName && !errors.companyName && !!watchedFields.companyName}
        required
        {...register("companyName")}
      />

      <SubmitButton isLoading={isSubmitting} type="submit">
        Create Account
      </SubmitButton>
    </form>
  )
}
