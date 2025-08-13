"use client"
import { Upload, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: "upload" | "files"
  className?: string
}

export function EmptyState({
  title = "No files uploaded yet",
  description = "Upload evidence documents to support your sustainability metrics and reporting.",
  actionLabel = "Upload Evidence",
  onAction,
  icon = "files",
  className,
}: EmptyStateProps) {
  const Icon = icon === "upload" ? Upload : FileText

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      <p className="text-sm text-gray-600 max-w-md mb-6">{description}</p>

      {onAction && (
        <Button
          onClick={onAction}
          className="bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          <Upload className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
