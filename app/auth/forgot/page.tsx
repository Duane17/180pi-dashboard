"use client"

import { useState } from "react"
import { AuthShell } from "@/components/auth/AuthShell"
import { GradientText } from "@/components/auth/GradientText"
import { ForgotForm } from "@/components/auth/ForgotForm"
import { AuthFooterNote } from "@/components/auth/AuthFooterNote"

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleForgotPassword = async (data: any) => {
    setIsSubmitting(true)
    try {
      // TODO: Implement actual forgot password logic
      console.log("Forgot password data:", data)
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call
    } catch (error) {
      console.error("Forgot password error:", error)
      throw error // Re-throw to prevent success state
    } finally {
      setIsSubmitting(false)
    }
  }

  const logo = (
    <div className="text-center">
      <GradientText as="h1" className="text-3xl font-bold mb-2">
        180Pi
      </GradientText>
      <p className="text-gray-600 text-sm">Climate-intelligent investment simulation</p>
    </div>
  )

  return (
    <AuthShell logo={logo}>
      <div className="space-y-6">
        <div className="text-center">
          <GradientText as="h2" className="text-xl mb-2">
            Reset your password
          </GradientText>
          <p className="text-gray-600 text-sm">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <ForgotForm onSubmit={handleForgotPassword} isSubmitting={isSubmitting} />

        <AuthFooterNote>
          Need help?{" "}
          <a href="/support" className="text-blue-600 hover:text-blue-800 smooth-transition">
            Contact support
          </a>
        </AuthFooterNote>
      </div>
    </AuthShell>
  )
}
