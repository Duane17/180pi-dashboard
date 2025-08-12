"use client"

import type React from "react"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form } from "@/components/ui/form"

const essentialsSchema = z.object({
  // Environment fields
  ghgScope1: z.number().min(0, "Must be non-negative").optional(),
  ghgScope2: z.number().min(0, "Must be non-negative").optional(),
  energyConsumption: z.number().min(0, "Must be non-negative").optional(),
  waterUse: z.number().min(0, "Must be non-negative").optional(),
  wasteGenerated: z.number().min(0, "Must be non-negative").optional(),

  // Labor fields
  workforceSize: z.number().int().min(0, "Must be a non-negative integer").optional(),
  genderDiversityOverall: z.number().min(0).max(100, "Must be between 0 and 100").optional(),
  genderDiversityManagement: z.number().min(0).max(100, "Must be between 0 and 100").optional(),
})

export type EssentialsFormData = z.infer<typeof essentialsSchema>

interface EssentialsFormProps {
  defaultValues?: Partial<EssentialsFormData>
  year: number
  onSubmit?: (data: EssentialsFormData) => Promise<void>
  onSaveDraft?: (data: EssentialsFormData) => Promise<void>
  onValidate?: (data: EssentialsFormData) => Promise<{ field?: string; message: string }[]>
  isSubmitting?: boolean
  isSaving?: boolean
  isValidating?: boolean
  children: React.ReactNode
}

export function EssentialsForm({
  defaultValues,
  year,
  onSubmit,
  onSaveDraft,
  onValidate,
  isSubmitting = false,
  isSaving = false,
  isValidating = false,
  children,
}: EssentialsFormProps) {
  const form = useForm<EssentialsFormData>({
    resolver: zodResolver(essentialsSchema),
    defaultValues: defaultValues || {},
    mode: "onChange",
  })

  const handleSubmit = async (data: EssentialsFormData) => {
    if (onSubmit) {
      await onSubmit(data)
    }
  }

  const handleSaveDraft = async () => {
    const data = form.getValues()
    if (onSaveDraft) {
      await onSaveDraft(data)
    }
  }

  const handleValidate = async () => {
    const data = form.getValues()
    if (onValidate) {
      const issues = await onValidate(data)
      // Clear existing errors
      form.clearErrors()
      // Set new errors
      issues.forEach((issue) => {
        if (issue.field) {
          form.setError(issue.field as keyof EssentialsFormData, {
            message: issue.message,
          })
        }
      })
      return issues
    }
    return []
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {children}
      </form>
    </Form>
  )
}
