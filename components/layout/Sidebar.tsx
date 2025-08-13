"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import {
  X,
  Handshake,
  Upload,
  FileText,
  Settings,
  Files,
  LayoutDashboard,
  Gauge,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Upload", href: "/upload/data", icon: Upload },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Pathfinder", href: "#", icon: Gauge },
  { name: "Bridge", href: "/bridge", icon: Handshake },
  { name: "Library", href: "#", icon: BookOpen },
  // { name: "Uploads", href: "/uploads", icon: Files },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const pathname = usePathname()

  const renderNavLinks = () => (
    <ul role="list" className="-mx-2 space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <li key={item.name}>
            <Link
              href={item.href}
              className={cn(
                "group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200 ease-out",
                isActive
                  ? "bg-gradient-to-r from-[#8dcddb]/10 via-[#3270a1]/10 to-[#7e509c]/10 text-[#1a1a1a] border border-[#3270a1]/20"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-[#8dcddb]/5 hover:via-[#3270a1]/5 hover:to-[#7e509c]/5 hover:text-[#1a1a1a] hover:border hover:border-[#3270a1]/10"
              )}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive
                    ? "text-[#3270a1]"
                    : hoveredItem === item.href
                    ? "text-[#3270a1]"
                    : "text-gray-500"
                )}
                aria-hidden="true"
              />
              <span className="flex-1">{item.name}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="glass-card border-r border-white/20 flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
          {/* Logo */}
          <div className="flex h-20 shrink-0 items-center gap-3">
            <Image
              src="/logo.webp"
              alt="180Pi Logo"
              height={48}
              width={0}
              priority
              className="w-auto h-12"
            />
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>{renderNavLinks()}</li>
              {/* Footer */}
              <li className="mt-auto">
                <div className="text-xs text-[#4a4a4a] border-t border-white/20 pt-4">
                  <p>180Pi - Sustainability Intelligence Platform</p>
                  <p>Version 1.0.0</p>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 z-50 flex w-64 flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="glass-card border-r border-white/20 flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="180Pi Logo"
                width={32}
                height={32}
                priority
              />
              <span className="text-xl font-bold text-[#1a1a1a]">180Pi</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-white/50 rounded-lg transition-all duration-200"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>{renderNavLinks()}</li>
              {/* Footer */}
              <li className="mt-auto">
                <div className="text-xs text-[#4a4a4a] border-t border-white/20 pt-4">
                  <p>180Pi - Sustainability Intelligence Platform</p>
                  <p>Version 1.0.0</p>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}
