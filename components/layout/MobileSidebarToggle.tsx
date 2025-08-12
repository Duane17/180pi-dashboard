"use client"
import { Menu } from "lucide-react"

interface MobileSidebarToggleProps {
  onClick: () => void
}

export function MobileSidebarToggle({ onClick }: MobileSidebarToggleProps) {
  return (
    <button
      type="button"
      className="lg:hidden p-2 text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-white/50 rounded-lg transition-all duration-200"
      onClick={onClick}
      aria-label="Open sidebar"
    >
      <Menu className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}
