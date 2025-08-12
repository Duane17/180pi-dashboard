"use client"

import { useState } from "react"
import { AuthShell } from "@/components/auth/AuthShell"
import { GradientText } from "@/components/auth/GradientText"
import { AuthTabs } from "@/components/auth/AuthTabs"
import { LoginForm } from "@/components/auth/LoginForm"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { AuthFooterNote } from "@/components/auth/AuthFooterNote"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (data: any) => {
    setIsSubmitting(true)
    try {
      // TODO: Implement actual login logic
      console.log("Login data:", data)
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (data: any) => {
    setIsSubmitting(true)
    try {
      // TODO: Implement actual registration logic
      console.log("Register data:", data)
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call
    } catch (error) {
      console.error("Registration error:", error)
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
            <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} />
          ) : (
            <RegisterForm onSubmit={handleRegister} isSubmitting={isSubmitting} />
          )}
        </AuthTabs>

        <AuthFooterNote>
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-blue-600 hover:text-blue-800 smooth-transition">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue-600 hover:text-blue-800 smooth-transition">
            Privacy Policy
          </a>
        </AuthFooterNote>
      </div>
    </AuthShell>
  )
}
