import { cn } from "@/lib/utils"

interface RoleBadgeProps {
  role: "admin" | "member" | "viewer"
  variant?: "gradient-text" | "gradient-border"
  className?: string
}

export function RoleBadge({ role, variant = "gradient-text", className }: RoleBadgeProps) {
  const roleLabels = {
    admin: "Admin",
    member: "Member",
    viewer: "Viewer",
  }

  const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-xl text-xs font-medium transition-all duration-200"

  const variantClasses = {
    "gradient-text":
      "bg-white/10 backdrop-blur-sm border border-white/20 bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] bg-clip-text text-transparent",
    "gradient-border":
      "bg-white/5 backdrop-blur-sm text-[#1a1a1a] border border-transparent bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] bg-clip-border",
  }

  return (
    <span
      className={cn(baseClasses, variantClasses[variant], className)}
      role="status"
      aria-label={`User role: ${roleLabels[role]}`}
    >
      {roleLabels[role]}
    </span>
  )
}
