"use client"
import { BarChart3, Plus } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title = "No data available",
  description = "Add your first metrics to get started with sustainability reporting",
  actionLabel = "Add Metrics",
  onAction,
}: EmptyStateProps) {
  return (
    <div className="glass-card p-12 rounded-2xl border border-white/20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#8dcddb]/10 via-[#3270a1]/10 to-[#7e509c]/10 mb-6">
        <BarChart3 className="h-8 w-8 text-[#3270a1]" />
      </div>

      <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">{title}</h3>
      <p className="text-[#4a4a4a] mb-6 max-w-sm mx-auto">{description}</p>

      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 gradient-pan"
        >
          <Plus className="h-4 w-4" />
          {actionLabel}
        </button>
      )}
    </div>
  )
}
