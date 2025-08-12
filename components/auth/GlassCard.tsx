import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: ReactNode
  className?: string
}

export function GlassCard({ children, className }: GlassCardProps) {
  return <div className={cn("glass-card rounded-2xl p-6 smooth-transition-250", className)}>{children}</div>
}
