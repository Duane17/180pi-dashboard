"use client"

import { useState, useMemo } from "react"
import { AuthShell } from "@/components/auth/AuthShell"
import { GradientText } from "@/components/auth/GradientText"
import { AuthTabs } from "@/components/auth/AuthTabs"
import { LoginForm } from "@/components/auth/LoginForm"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { useLoginMutation, useRegisterMutation } from "@/hooks/use-auth-mutations"
import { isApiErrorResponse, mapIssuesToMessages } from "@/types/api"

type FieldErrors = Record<string, string[]>

// --- Normalize Zod's { [k]: string[] | undefined } -> { [k]: string[] } ---
function normalizeFieldErrors(
  input?: Record<string, string[] | undefined>
): FieldErrors {
  if (!input) return {}
  const out: FieldErrors = {}
  for (const [key, val] of Object.entries(input)) {
    if (Array.isArray(val) && val.length > 0) {
      out[key] = val
    }
    // If you prefer to keep keys with empty arrays, use:
    // else out[key] = []
  }
  return out
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")

  // ---------- Login error state ----------
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
    setLoginSummaryErrors([])
    setLoginFieldErrors({})
    try {
      await loginMutation.mutateAsync(data)
    } catch (err: unknown) {
      if (isApiErrorResponse(err)) {
        const fieldErrors = normalizeFieldErrors(err.issues?.fieldErrors) // <<< fix
        setLoginFieldErrors(fieldErrors)
        const detailList = mapIssuesToMessages(err.issues)
        setLoginSummaryErrors([err.message, ...detailList])
      } else {
        setLoginSummaryErrors(["Unable to sign in. Please try again."])
      }
    }
  }

  // ---------- Register error state ----------
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
    try {
      await registerMutation.mutateAsync(data)
    } catch (err: unknown) {
      if (isApiErrorResponse(err)) {
        const fieldErrors = normalizeFieldErrors(err.issues?.fieldErrors) // <<< fix
        setRegisterFieldErrors(fieldErrors)
        const detailList = mapIssuesToMessages(err.issues)
        setRegisterSummaryErrors([err.message, ...detailList])
      } else {
        setRegisterSummaryErrors(["Unable to create your account. Please try again."])
      }
    }
  }

  // Clear all errors when switching tabs
  const clearAllErrors = () => {
    setLoginSummaryErrors([])
    setLoginFieldErrors({})
    setRegisterSummaryErrors([])
    setRegisterFieldErrors({})
  }

  const onTabChange = (tab: "login" | "register") => {
    setActiveTab(tab)
    clearAllErrors()
  }

  const isSubmitting = useMemo(
    () => (activeTab === "login" ? loginMutation.isPending : registerMutation.isPending),
    [activeTab, loginMutation.isPending, registerMutation.isPending],
  )

  const logo = (
    <div className="text-center">
      <img src="/logo.webp" alt="180Pi Logo" className="mx-auto h-16 w-auto" />
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
              ? "Sign in to access your Sustainability Intelligence dashboard"
              : "Start your climate-intelligent investment journey"}
          </p>
        </div>

        <AuthTabs activeTab={activeTab} onTabChange={onTabChange}>
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
      </div>
    </AuthShell>
  )
}
