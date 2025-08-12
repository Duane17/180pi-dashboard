"use client"
import Link from "next/link"
import type React from "react"

import type { LucideIcon } from "lucide-react"

interface NavItemProps {
  href: string
  icon: LucideIcon
  current?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export function NavItem({ href, icon: Icon, current = false, children, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200 ease-out
        ${
          current
            ? "bg-gradient-to-r from-[#8dcddb]/10 via-[#3270a1]/10 to-[#7e509c]/10 text-[#1a1a1a] border border-[#3270a1]/20"
            : "text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-white/50"
        }
      `}
      aria-current={current ? "page" : undefined}
    >
      <Icon
        className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
          current ? "text-[#3270a1]" : "text-[#4a4a4a] group-hover:text-[#1a1a1a]"
        }`}
        aria-hidden="true"
      />
      {children}
    </Link>
  )
}
