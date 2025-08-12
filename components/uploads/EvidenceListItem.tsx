"use client"
import { Eye, Download, Trash2, FileText, ImageIcon, FileSpreadsheet, Calendar, HardDrive } from "lucide-react"
import { StatusBadge, type UploadStatus } from "./StatusBadge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EvidenceItem {
  id: string
  name: string
  type: string
  year: number
  size: number
  status: UploadStatus
  uploadedAt: Date
  url?: string
}

interface EvidenceListItemProps {
  item: EvidenceItem
  onPreview: (item: EvidenceItem) => void
  onDownload: (item: EvidenceItem) => void
  onDelete: (item: EvidenceItem) => void
  viewMode?: "table" | "card"
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

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function EvidenceListItem({
  item,
  onPreview,
  onDownload,
  onDelete,
  viewMode = "table",
  className,
}: EvidenceListItemProps) {
  const FileIcon = getFileIcon(item.name)

  if (viewMode === "card") {
    return (
      <div
        className={cn(
          "group p-4 rounded-xl border transition-all duration-200",
          "bg-white/50 backdrop-blur-sm border-gray-200/50",
          "hover:bg-white/70 hover:shadow-md hover:border-gray-300/50",
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
                <p className="text-sm font-medium text-gray-900 truncate" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>{item.type}</span>
                  <span>•</span>
                  <span>{item.year}</span>
                  <span>•</span>
                  <span>{formatFileSize(item.size)}</span>
                </div>
              </div>
              <StatusBadge status={item.status} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(item.uploadedAt)}</span>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreview(item)}
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                  aria-label="Preview file"
                >
                  <Eye className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownload(item)}
                  className="h-8 w-8 p-0 hover:bg-green-100"
                  aria-label="Download file"
                >
                  <Download className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item)}
                  className="h-8 w-8 p-0 hover:bg-red-100"
                  aria-label="Delete file"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Table row view
  return (
    <tr className={cn("group hover:bg-gray-50/50 transition-colors", className)}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <FileIcon className="w-4 h-4 text-gray-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate" title={item.name}>
              {item.name}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-sm text-gray-600">{item.type}</td>

      <td className="px-4 py-3 text-sm text-gray-600">{item.year}</td>

      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(item.uploadedAt)}</td>

      <td className="px-4 py-3 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <HardDrive className="w-3 h-3" />
          {formatFileSize(item.size)}
        </div>
      </td>

      <td className="px-4 py-3">
        <StatusBadge status={item.status} />
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPreview(item)}
            className="h-8 w-8 p-0 hover:bg-blue-100"
            aria-label="Preview file"
          >
            <Eye className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(item)}
            className="h-8 w-8 p-0 hover:bg-green-100"
            aria-label="Download file"
          >
            <Download className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item)}
            className="h-8 w-8 p-0 hover:bg-red-100"
            aria-label="Delete file"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}
