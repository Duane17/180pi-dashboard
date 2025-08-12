"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AuthTabsProps {
  activeTab: "login" | "register"
  onTabChange: (tab: "login" | "register") => void
  children: ReactNode
}

interface AuthTabProps {
  value: "login" | "register"
  label: string
  isActive: boolean
  onClick: () => void
}

function AuthTab({ label, isActive, onClick }: AuthTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-3 px-4 text-sm font-medium rounded-lg smooth-transition",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        isActive
          ? ["gradient-text bg-gradient-to-r from-teal-50 to-purple-50", "border border-transparent"]
          : ["text-gray-500 hover:text-gray-700", "hover:bg-gray-50"],
      )}
      role="tab"
      aria-selected={isActive}
    >
      {label}
    </button>
  )
}

export function AuthTabs({ activeTab, onTabChange, children }: AuthTabsProps) {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-gray-50 rounded-lg" role="tablist">
        <AuthTab value="login" label="Sign In" isActive={activeTab === "login"} onClick={() => onTabChange("login")} />
        <AuthTab
          value="register"
          label="Sign Up"
          isActive={activeTab === "register"}
          onClick={() => onTabChange("register")}
        />
      </div>
      <div role="tabpanel">{children}</div>
    </div>
  )
}
