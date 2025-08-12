"use client"
import { Search, Bell } from "lucide-react"
import { MobileSidebarToggle } from "./MobileSidebarToggle"
import { UserMenu } from "@/components/profile/UserMenu"

interface TopbarProps {
  onMenuClick: () => void
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

export function Topbar({ onMenuClick, currentUser, onProfile, onSettings, onSwitchCompany, onSignOut }: TopbarProps) {
  const mockUser = {
    id: "1",
    name: "Mahai Chairi",
    email: "Mahai@180pi.com",
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
    <header className="sticky top-0 z-30 glass-card border-b border-white/20 backdrop-blur-xl" role="banner">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <MobileSidebarToggle onClick={onMenuClick} />
        {/* Search */}
        <div className="flex-1 max-w-lg mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a4a4a]" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search metrics, reports..."
              aria-label="Search metrics and reports"
              aria-describedby="search-help"
              className="w-full rounded-lg border border-gray-200 bg-white/50 pl-10 pr-4 py-2 text-sm placeholder:text-[#4a4a4a] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#3270a1]/20 focus:bg-white transition-all duration-200"
              disabled
            />
            <div id="search-help" className="sr-only">
              Search functionality is currently disabled
            </div>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3 ml-auto pr-2">
          {/* Notifications */}
          <button
            className="relative p-2 text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-white/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3270a1]/20"
            aria-label="Notifications (1 unread)"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                // Handle notification click
              }
            }}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span
              className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-[#8dcddb] to-[#3270a1] rounded-full"
              aria-hidden="true"
            ></span>
          </button>

          <UserMenu
            currentUser={user}
            onProfile={onProfile}
            onSettings={onSettings}
            onSwitchCompany={onSwitchCompany}
            onSignOut={handleSignOut}
            showPresenceIndicator={true}
          />
        </div>

      </div>
    </header>
  )
}
