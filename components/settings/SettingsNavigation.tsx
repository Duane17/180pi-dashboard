"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Building2, Users, User, Settings, ChevronRight } from "lucide-react"

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  count?: number
}

interface SettingsNavigationProps {
  activeSection?: string
  onSectionChange?: (sectionId: string) => void
  className?: string
}

const navigationItems: NavigationItem[] = [
  {
    id: "company",
    label: "Company Profile",
    icon: Building2,
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
  },
  {
    id: "account",
    label: "Account Settings",
    icon: User,
  },
  {
    id: "system",
    label: "System Settings",
    icon: Settings,
  },
]

export function SettingsNavigation({ activeSection = "company", onSectionChange, className }: SettingsNavigationProps) {
  return (
    <nav className={cn("space-y-1", className)} aria-label="Settings navigation">
      <div className="mb-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-600">Manage your company and account preferences</p>
      </div>

      <div className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange?.(item.id)}
              className={cn(
                // Base styles
                "w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium rounded-lg transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/20",

                // Active state
                isActive
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-l-2 border-blue-500"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",

                // Hover effects
                !isActive && "hover:scale-[1.02]",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-blue-600" : "text-gray-500")} />
                <span>{item.label}</span>
              </div>

              {isActive && <ChevronRight className="h-4 w-4 text-blue-600" />}

              {item.count && (
                <span
                  className={cn(
                    "ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full",
                    isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600",
                  )}
                >
                  {item.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
