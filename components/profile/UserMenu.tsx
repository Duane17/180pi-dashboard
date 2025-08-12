"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { ChevronDown, User, Settings, LogOut, Building2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { RoleBadge } from "./RoleBadge"
import { cn } from "@/lib/utils"

interface UserMenuProps {
  currentUser: {
    id: string
    name: string
    email: string
    role: "admin" | "member" | "viewer"
    avatarUrl?: string
  }
  onProfile?: () => void
  onSettings?: () => void
  onSwitchCompany?: () => void
  onSignOut: () => void
  showPresenceIndicator?: boolean
  className?: string
}

export function UserMenu({
  currentUser,
  onProfile,
  onSettings,
  onSwitchCompany,
  onSignOut,
  showPresenceIndicator = false,
  className,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuItemsRef = useRef<(HTMLDivElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState(-1)

  // Track image load state so we can reliably fall back to initials
  const hasAvatarUrl = Boolean(currentUser.avatarUrl && currentUser.avatarUrl.trim().length > 0)
  const [imgOk, setImgOk] = useState<boolean>(hasAvatarUrl)

  useEffect(() => {
    // Reset imgOk whenever the avatarUrl changes
    setImgOk(Boolean(currentUser.avatarUrl && currentUser.avatarUrl.trim().length > 0))
  }, [currentUser.avatarUrl])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setFocusedIndex((prev) => {
          const nextIndex = prev < menuItemsRef.current.length - 1 ? prev + 1 : 0
          menuItemsRef.current[nextIndex]?.focus()
          return nextIndex
        })
        break
      case "ArrowUp":
        e.preventDefault()
        setFocusedIndex((prev) => {
          const nextIndex = prev > 0 ? prev - 1 : menuItemsRef.current.length - 1
          menuItemsRef.current[nextIndex]?.focus()
          return nextIndex
        })
        break
      case "Escape":
        e.preventDefault()
        setIsOpen(false)
        triggerRef.current?.focus()
        break
      case "Enter":
      case " ":
        if (focusedIndex >= 0) {
          e.preventDefault()
          menuItemsRef.current[focusedIndex]?.click()
        }
        break
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1)
    }
  }, [isOpen])

  // Menu items — trimmed down
const menuItems = [
    {
      icon: User,
      label: "Profile",
      action: () => {
        window.location.href = "/settings" // navigate to /settings
      },
    },
    ...(onSwitchCompany
      ? [
          {
            icon: Building2,
            label: "Switch Company",
            action: onSwitchCompany,
            separator: true,
          },
        ]
      : []),
    {
      icon: LogOut,
      label: "Sign out",
      action: onSignOut,
      danger: true,
      separator: true,
    },
  ]


  const UserAvatar = () => (
    <div className="relative">
      <Avatar className="h-8 w-8 ring-2 ring-transparent group-focus:ring-[#3270a1]/30 transition-all duration-200">
        {/* Only render the image when we actually have a URL and it hasn't failed */}
        {hasAvatarUrl && imgOk && (
          <AvatarImage
            src={currentUser.avatarUrl!}
            alt={currentUser.name}
            onError={() => setImgOk(false)}
            className="object-cover"
          />
        )}
        {/* Always available fallback (gradient + initials) when no image or failed to load */}
        {(!hasAvatarUrl || !imgOk) && (
          <AvatarFallback className="bg-gradient-to-br from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white text-xs font-medium">
            {getInitials(currentUser.name)}
          </AvatarFallback>
        )}
      </Avatar>
      {showPresenceIndicator && (
        <div
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-gradient-to-r from-[#8dcddb] to-[#3270a1] rounded-full border-2 border-white"
          aria-hidden="true"
        />
      )}
    </div>
  )

  const UserInfo = ({ showEmail = true }: { showEmail?: boolean }) => (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        {hasAvatarUrl && imgOk && (
          <AvatarImage
            src={currentUser.avatarUrl!}
            alt={currentUser.name}
            onError={() => setImgOk(false)}
            className="object-cover"
          />
        )}
        {(!hasAvatarUrl || !imgOk) && (
          <AvatarFallback className="bg-gradient-to-br from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white font-medium">
            {getInitials(currentUser.name)}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1a1a1a] truncate">{currentUser.name}</p>
        {showEmail && <p className="text-xs text-[#4a4a4a] truncate">{currentUser.email}</p>}
        <div className="mt-1">
          <RoleBadge role={currentUser.role} variant="gradient-border" />
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop dropdown menu */}
      <div className="hidden sm:block">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <button
              ref={triggerRef}
              className={cn(
                "flex items-center gap-3 p-2 text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-white/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3270a1]/20 focus:bg-white/30",
                "group relative",
                className,
              )}
              aria-label={`User menu for ${currentUser.name}`}
              aria-expanded={isOpen}
              aria-haspopup="menu"
              onKeyDown={handleKeyDown}
            >
              <UserAvatar />

              {/* User info - hidden on mobile */}
              <div className="hidden sm:flex flex-col items-start min-w-0">
                <span className="text-sm font-medium text-[#1a1a1a] truncate max-w-32">
                  {currentUser.name}
                </span>
                <span className="text-xs text-[#4a4a4a] truncate max-w-32">
                  {currentUser.email}
                </span>
              </div>

              <span className="sr-only">Role: {currentUser.role}</span>

              <ChevronDown
                className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}
                aria-hidden="true"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 glass-card border-white/20 backdrop-blur-xl"
            role="menu"
            aria-labelledby="user-menu-trigger"
            onKeyDown={handleKeyDown}
          >
            {/* User header */}
            <div className="px-3 py-2 border-b border-white/10">
              <UserInfo />
            </div>

            {/* Menu items */}
            <div className="py-1">
              {menuItems.map((item, index) => (
                <div key={item.label}>
                  {item.separator && index > 0 && <DropdownMenuSeparator className="bg-white/20" />}
                  <DropdownMenuItem
                    ref={(el) => (menuItemsRef.current[index] = el)}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer transition-colors duration-200",
                      item.danger
                        ? "text-red-600 focus:bg-red-50 hover:bg-red-50/50"
                        : "focus:bg-white/50 hover:bg-white/30",
                    )}
                    role="menuitem"
                    onSelect={() => {
                      item.action()
                      setIsOpen(false)
                    }}
                    onFocus={() => setFocusedIndex(index)}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </DropdownMenuItem>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile sheet */}
      <div className="sm:hidden">
        <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2 p-2 text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-white/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3270a1]/20 focus:bg-white/30",
                "group relative",
                className,
              )}
              aria-label={`User menu for ${currentUser.name}`}
              aria-expanded={isMobileSheetOpen}
              aria-haspopup="menu"
            >
              <UserAvatar />
              <span className="sr-only">Role: {currentUser.role}</span>
            </button>
          </SheetTrigger>

          <SheetContent side="bottom" className="glass-card border-white/20 backdrop-blur-xl">
            <SheetHeader className="border-b border-white/10 pb-4">
              <SheetTitle className="sr-only">User Menu</SheetTitle>
              <UserInfo showEmail={true} />
            </SheetHeader>

            <div className="py-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 text-left",
                    item.danger
                      ? "text-red-600 hover:bg-red-50/50 focus:bg-red-50"
                      : "text-[#1a1a1a] hover:bg-white/30 focus:bg-white/50",
                  )}
                  onClick={() => {
                    item.action()
                    setIsMobileSheetOpen(false)
                  }}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
