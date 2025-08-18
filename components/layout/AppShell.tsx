import { useState } from "react"
import type React from "react"

import { Topbar } from "./Topbar"
import { Sidebar } from "./Sidebar"
import { SkipNavigation } from "./SkipNavigation"

interface AppShellProps {
  children: React.ReactNode
  currentUser?: {
    id: string
    name: string
    email: string
    role: "admin" | "member" | "viewer"
    avatarUrl?: string
  }
  onProfile?: () => void
  onSettings?: () => void
  onSwitchCompany?: () => void
  onSignOut?: () => void
}

export function AppShell({ children, currentUser, onProfile, onSettings, onSwitchCompany, onSignOut }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const mockUser = {
    id: "1",
    name: "Maha Chairi",
    email: "maha@180pi.com",
    role: "admin" as const,
    avatarUrl: undefined,
  }

  const user = currentUser || mockUser

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut()
    } else {
      // Mock sign out action
      console.log("Sign out clicked")
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <SkipNavigation />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          currentUser={user}
          onProfile={onProfile}
          onSettings={onSettings}
          onSwitchCompany={onSwitchCompany}
          onSignOut={handleSignOut}
        />

        {/* Page content */}
        <main id="main-content" className="py-6" role="main">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}