"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { SettingsShell } from "@/components/settings/SettingsShell"
import { SettingsNavigation } from "@/components/settings/SettingsNavigation"
import { CompanyProfileSettings } from "@/components/settings/CompanyProfileSettings"
import { UserManagementSettings } from "@/components/settings/UserManagementSettings"
import { AccountSettings } from "@/components/settings/AccountSettings"
import type { User, Role } from "@/components/rbac/types"

// Mock data for demonstration
const mockCurrentUser: User = {
  id: "user-1",
  name: "Maha Chairi",
  email: "maha@.180pi.com",
  role: "admin",
  avatarUrl: "/placeholder.svg?height=40&width=40",
}

const mockCompanyData = {
  companyName: "GreenTech Solutions Ltd",
  legalForm: "llc",
  sector: "J",
  headquartersCountry: "GB",
  employeeCount: "51-250",
  annualTurnover: "5000000",
  currency: "GBP",
  siteLocations: [
    {
      id: "site-1",
      country: "DE",
      city: "Berlin",
      description: "European Operations Center",
    },
    {
      id: "site-2",
      country: "US",
      city: "San Francisco",
      description: "R&D Facility",
    },
  ],
}

const mockTeamMembers = [
  {
    id: "user-1",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "admin" as Role,
    status: "active" as const,
    lastActive: "2024-01-15T10:30:00Z",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user-2",
    name: "Michael Chen",
    email: "michael.chen@company.com",
    role: "member" as Role,
    status: "active" as const,
    lastActive: "2024-01-14T16:45:00Z",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user-3",
    name: "Emma Rodriguez",
    email: "emma.rodriguez@company.com",
    role: "viewer" as Role,
    status: "pending" as const,
    invitedAt: "2024-01-10T09:15:00Z",
  },
  {
    id: "user-4",
    name: "David Kim",
    email: "david.kim@company.com",
    role: "member" as Role,
    status: "inactive" as const,
    lastActive: "2023-12-20T14:20:00Z",
  },
]

const mockPreferences = {
  language: "en",
  timezone: "Europe/London",
  dateFormat: "DD/MM/YYYY",
  notifications: {
    email: true,
    push: true,
    reports: true,
    updates: false,
  },
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("company")
  const [isLoading, setIsLoading] = useState(false)

  // Mock handlers - replace with real API calls
  const handleUpdateCompanyProfile = async (data: any) => {
    setIsLoading(true)
    console.log("Updating company profile:", data)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  const handleInviteUser = async (email: string, role: Role) => {
    setIsLoading(true)
    console.log("Inviting user:", { email, role })
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleUpdateUserRole = async (userId: string, role: Role) => {
    setIsLoading(true)
    console.log("Updating user role:", { userId, role })
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleRemoveUser = async (userId: string) => {
    setIsLoading(true)
    console.log("Removing user:", userId)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleResendInvite = async (userId: string) => {
    setIsLoading(true)
    console.log("Resending invite:", userId)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsLoading(false)
  }

  const handleUpdateProfile = async (data: any) => {
    setIsLoading(true)
    console.log("Updating profile:", data)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsLoading(false)
  }

  const handleChangePassword = async (data: any) => {
    setIsLoading(true)
    console.log("Changing password:", { ...data, currentPassword: "[REDACTED]", newPassword: "[REDACTED]" })
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  const handleUpdatePreferences = async (data: any) => {
    setIsLoading(true)
    console.log("Updating preferences:", data)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleUploadAvatar = async (file: File): Promise<string> => {
    setIsLoading(true)
    console.log("Uploading avatar:", file.name)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    // Return mock URL
    return "/placeholder.svg?height=80&width=80"
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "company":
        return (
          <CompanyProfileSettings data={mockCompanyData} onSave={handleUpdateCompanyProfile} isLoading={isLoading} />
        )
      case "users":
        return (
          <UserManagementSettings
            users={mockTeamMembers}
            currentUser={mockCurrentUser}
            onInviteUser={handleInviteUser}
            onUpdateUserRole={handleUpdateUserRole}
            onRemoveUser={handleRemoveUser}
            onResendInvite={handleResendInvite}
            isLoading={isLoading}
          />
        )
      case "account":
        return (
          <AccountSettings
            user={mockCurrentUser}
            preferences={mockPreferences}
            onUpdateProfile={handleUpdateProfile}
            onChangePassword={handleChangePassword}
            onUpdatePreferences={handleUpdatePreferences}
            onUploadAvatar={handleUploadAvatar}
            isLoading={isLoading}
          />
        )
      case "system":
        return (
          <div className="glass-card rounded-xl border border-gray-200/50 bg-white/80 p-8 backdrop-blur-sm text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">System Settings</h3>
            <p className="text-gray-600 mb-4">Advanced system configuration and integrations</p>
            <div className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <strong>Coming Soon:</strong> API keys, data retention policies, audit logs, and third-party integrations
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <AppShell
      user={mockCurrentUser}
      onProfile={() => setActiveSection("account")}
      onSettings={() => setActiveSection("company")}
    >
      <SettingsShell
        navigation={<SettingsNavigation activeSection={activeSection} onSectionChange={setActiveSection} />}
      >
        {renderActiveSection()}
      </SettingsShell>
    </AppShell>
  )
}
