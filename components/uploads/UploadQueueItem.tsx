"use client"
import { X, RotateCcw, FileText, ImageIcon, FileSpreadsheet } from "lucide-react"
import { cn } from "@/lib/utils"
import { UploadProgressBar } from "./UploadProgressBar"
import { StatusBadge, type UploadStatus } from "./StatusBadge"
import { Button } from "@/components/ui/button"

interface UploadQueueItemProps {
  file: File
  progress: number
  status: UploadStatus
  year?: number
  type?: string
  error?: string
  onCancel?: () => void
  onRemove?: () => void
  onRetry?: () => void
  className?: string
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase()

  switch (extension) {
    case "pdf":
      return FileText
    case "png":
    case "jpg":
    case "jpeg":
      return ImageIcon
    case "csv":
    case "xlsx":
    case "xls":
      return FileSpreadsheet
    default:
      return FileText
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

export function UploadQueueItem({
  file,
  progress,
  status,
  year,
  type,
  error,
  onCancel,
  onRemove,
  onRetry,
  className,
}: UploadQueueItemProps) {
  const FileIcon = getFileIcon(file.name)
  const canCancel = status === "queued" || status === "uploading"
  const canRetry = status === "failed"
  const canRemove = status === "completed" || status === "failed"

  return (
    <div
      className={cn(
        "group relative p-4 rounded-xl border transition-all duration-200",
        "bg-white/50 backdrop-blur-sm border-gray-200/50",
        "hover:bg-white/70 hover:shadow-md hover:border-gray-300/50",
        status === "failed" && "border-red-200 bg-red-50/50",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <FileIcon className="w-5 h-5 text-gray-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                {file.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                {type && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{type}</span>
                  </>
                )}
                {year && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{year}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={status} />

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {canRetry && onRetry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRetry}
                    className="h-8 w-8 p-0 hover:bg-blue-100"
                    aria-label="Retry upload"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}

                {canCancel && onCancel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="h-8 w-8 p-0 hover:bg-red-100"
                    aria-label="Cancel upload"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}

                {canRemove && onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemove}
                    className="h-8 w-8 p-0 hover:bg-red-100"
                    aria-label="Remove from queue"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {(status === "uploading" || status === "verifying") && (
            <div className="mb-2">
              <UploadProgressBar
                progress={progress}
                status={status === "uploading" ? "uploading" : "uploading"}
                size="sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {status === "uploading" ? `Uploading... ${progress}%` : "Verifying..."}
              </p>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 mt-1" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
