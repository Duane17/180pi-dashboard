import { cn } from "@/lib/utils"

interface MatchScoreBadgeProps {
  score: number // 0-100
  size?: "sm" | "md" | "lg"
  className?: string
}

export function MatchScoreBadge({ score, size = "md", className }: MatchScoreBadgeProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-base",
  }

  const strokeWidth = size === "sm" ? 2 : size === "md" ? 3 : 4
  const radius = size === "sm" ? 14 : size === "md" ? 21 : 28
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      {/* Background Circle */}
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress Circle with Gradient */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8dcddb" />
            <stop offset="50%" stopColor="#3270a1" />
            <stop offset="100%" stopColor="#7e509c" />
          </linearGradient>
        </defs>
      </svg>

      {/* Score Text */}
      <span className="relative font-semibold text-gray-900" aria-label={`Match ${score}%`}>
        {score}%
      </span>
    </div>
  )
}
