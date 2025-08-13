"use client"

import { useState, useMemo } from "react"
import { AuthShell } from "@/components/auth/AuthShell"
import { GradientText } from "@/components/auth/GradientText"
import { AuthTabs } from "@/components/auth/AuthTabs"
import { LoginForm } from "@/components/auth/LoginForm"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { AuthFooterNote } from "@/components/auth/AuthFooterNote"
import { useLoginMutation, useRegisterMutation } from "@/hooks/use-auth-mutations"

type FieldErrors = Record<string, string[]>

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")

  // --- Server error plumbing for Login ---
  const [loginSummaryErrors, setLoginSummaryErrors] = useState<string[]>([])
  const [loginFieldErrors, setLoginFieldErrors] = useState<FieldErrors>({})

  const loginMutation = useLoginMutation({
    setTopLevelError: (msg) => setLoginSummaryErrors((prev) => (msg ? [msg, ...prev] : prev)),
    setSummaryErrors: setLoginSummaryErrors,
    setFieldError: (field, message) =>
      setLoginFieldErrors((prev) => ({
        ...prev,
        [field]: [message],
      })),
  })

  const handleLogin = async (data: Parameters<typeof loginMutation.mutateAsync>[0]) => {
    // Clear old server errors before a new attempt
    setLoginSummaryErrors([])
    setLoginFieldErrors({})
    await loginMutation.mutateAsync(data)
  }

  // --- Server error plumbing for Register ---
  const [registerSummaryErrors, setRegisterSummaryErrors] = useState<string[]>([])
  const [registerFieldErrors, setRegisterFieldErrors] = useState<FieldErrors>({})

  const registerMutation = useRegisterMutation({
    setTopLevelError: (msg) => setRegisterSummaryErrors((prev) => (msg ? [msg, ...prev] : prev)),
    setSummaryErrors: setRegisterSummaryErrors,
    setFieldError: (field, message) =>
      setRegisterFieldErrors((prev) => ({
        ...prev,
        [field]: [message],
      })),
  })

  const handleRegister = async (data: Parameters<typeof registerMutation.mutateAsync>[0]) => {
    setRegisterSummaryErrors([])
    setRegisterFieldErrors({})
    await registerMutation.mutateAsync(data)
  }

  const isSubmitting = useMemo(
    () => (activeTab === "login" ? loginMutation.isPending : registerMutation.isPending),
    [activeTab, loginMutation.isPending, registerMutation.isPending],
  )

  const logo = (
    <div className="text-center">
      <img
        src="/logo.webp"
        alt="180Pi Logo"
        className="mx-auto h-16 w-auto"
      />
    </div>
  )


  return (
    <AuthShell logo={logo}>
      <div className="space-y-6">
        <div className="text-center">
          <GradientText as="h2" className="text-xl mb-2">
            {activeTab === "login" ? "Welcome back" : "Join 180Pi"}
          </GradientText>
          <p className="text-gray-600 text-sm">
            {activeTab === "login"
              ? "Sign in to access your ESG dashboard"
              : "Start your climate-intelligent investment journey"}
          </p>
        </div>

        <AuthTabs activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === "login" ? (
            <LoginForm
              onSubmit={handleLogin}
              isSubmitting={isSubmitting}
              serverSummaryErrors={loginSummaryErrors}
              serverFieldErrors={loginFieldErrors}
            />
          ) : (
            <RegisterForm
              onSubmit={handleRegister}
              isSubmitting={isSubmitting}
              serverSummaryErrors={registerSummaryErrors}
              serverFieldErrors={registerFieldErrors}
            />
          )}
        </AuthTabs>

        {/* <AuthFooterNote> */}
          {/* By continuing, you agree to our{" "}
          <a href="/terms" className="text-blue-600 hover:text-blue-800 smooth-transition">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue-600 hover:text-blue-800 smooth-transition">
            Privacy Policy
          </a> */}
        {/* </AuthFooterNote> */}
      </div>
    </AuthShell>
  )
}
