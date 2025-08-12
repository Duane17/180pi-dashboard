"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AuthShell } from "@/components/auth/AuthShell"
import { GradientText } from "@/components/auth/GradientText"
import { ResetForm } from "@/components/auth/ResetForm"
import { AuthFooterNote } from "@/components/auth/AuthFooterNote"

export default function ResetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [token, setToken] = useState("")
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get token from URL parameters
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleResetPassword = async (data: any) => {
    setIsSubmitting(true)
    try {
      // TODO: Implement actual reset password logic
      console.log("Reset password data:", data)
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call
    } catch (error) {
      console.error("Reset password error:", error)
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

  // Show error if no token is provided
  if (!token && typeof window !== "undefined") {
    return (
      <AuthShell logo={logo}>
        <div className="text-center space-y-6">
          <div className="text-center">
            <GradientText as="h2" className="text-xl mb-2">
              Invalid Reset Link
            </GradientText>
            <p className="text-gray-600 text-sm mb-6">This password reset link is invalid or has expired.</p>
          </div>

          <a
            href="/auth/forgot"
            className="inline-flex items-center justify-center w-full px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg smooth-transition hover:bg-gray-50 hover:scale-105"
          >
            Request a new reset link
          </a>

          <AuthFooterNote>
            <a href="/auth" className="text-blue-600 hover:text-blue-800 smooth-transition">
              Back to sign in
            </a>
          </AuthFooterNote>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell logo={logo}>
      <div className="space-y-6">
        <div className="text-center">
          <GradientText as="h2" className="text-xl mb-2">
            Set new password
          </GradientText>
          <p className="text-gray-600 text-sm">Enter your new password below to complete the reset process</p>
        </div>

        <ResetForm token={token} onSubmit={handleResetPassword} isSubmitting={isSubmitting} />

        <AuthFooterNote>
          Remember your password?{" "}
          <a href="/auth" className="text-blue-600 hover:text-blue-800 smooth-transition">
            Sign in instead
          </a>
        </AuthFooterNote>
      </div>
    </AuthShell>
  )
}
