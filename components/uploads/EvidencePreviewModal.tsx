"use client"
import { useEffect, useRef } from "react"
import { X, Download, FileText, Calendar, HardDrive, Tag, Clock } from "lucide-react"
import { StatusBadge } from "./StatusBadge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { EvidenceItem } from "./EvidenceListItem"

interface EvidencePreviewModalProps {
  open: boolean
  item: EvidenceItem | null
  onClose: () => void
  onDownload: (item: EvidenceItem) => void
  className?: string
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
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

const getFileExtension = (fileName: string): string => {
  return fileName.split(".").pop()?.toLowerCase() || ""
}

const isPreviewableImage = (fileName: string): boolean => {
  const ext = getFileExtension(fileName)
  return ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)
}

const isPreviewablePDF = (fileName: string): boolean => {
  const ext = getFileExtension(fileName)
  return ext === "pdf"
}

export function EvidencePreviewModal({ open, item, onClose, onDownload, className }: EvidencePreviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Focus management
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
      modalRef.current?.focus()
    } else {
      previousFocusRef.current?.focus()
    }
  }, [open])

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [open, onClose])

  // Focus trap
  useEffect(() => {
    if (!open) return

    const modal = modalRef.current
    if (!modal) return

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    modal.addEventListener("keydown", handleTabKey)
    return () => modal.removeEventListener("keydown", handleTabKey)
  }, [open])

  if (!open || !item) return null

  const canPreviewImage = isPreviewableImage(item.name)
  const canPreviewPDF = isPreviewablePDF(item.name)
  const canPreview = canPreviewImage || canPreviewPDF

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-black/50 backdrop-blur-sm",
        className,
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        ref={modalRef}
        className={cn(
          "relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden",
          "bg-white/90 backdrop-blur-xl border border-white/20",
          "shadow-2xl shadow-black/10",
          "focus:outline-none",
        )}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="min-w-0 flex-1">
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900 truncate">
              {item.name}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <span>{item.type}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{item.year}</span>
              </div>
              <div className="flex items-center gap-1">
                <HardDrive className="w-4 h-4" />
                <span>{formatFileSize(item.size)}</span>
              </div>
              <StatusBadge status={item.status} />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto" style={{ maxHeight: "calc(90vh - 140px)" }}>
          {canPreview ? (
            <div className="p-6">
              {canPreviewImage && (
                <div className="flex justify-center">
                  <img
                    src={item.url || "/placeholder.svg"}
                    alt={item.name}
                    className="max-w-full max-h-96 rounded-lg shadow-lg"
                    onError={(e) => {
                      // Fallback to metadata view if image fails to load
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}

              {canPreviewPDF && (
                <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src={item.url}
                    className="w-full h-full border-0"
                    title={`Preview of ${item.name}`}
                    onError={() => {
                      // Fallback handled by browser
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            // Metadata view for non-previewable files
            <div className="p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-2">Preview not available</h3>
                <p className="text-sm text-gray-600 mb-6">
                  This file type cannot be previewed in the browser. Download the file to view its contents.
                </p>

                <Button
                  onClick={() => onDownload(item)}
                  className="bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          )}

          {/* File Details */}
          <div className="border-t border-gray-200/50 p-6 bg-gray-50/50">
            <h4 className="text-sm font-medium text-gray-900 mb-4">File Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">File Name:</span>
                <p className="font-medium text-gray-900 break-all">{item.name}</p>
              </div>

              <div>
                <span className="text-gray-500">File Size:</span>
                <p className="font-medium text-gray-900">{formatFileSize(item.size)}</p>
              </div>

              <div>
                <span className="text-gray-500">Evidence Type:</span>
                <p className="font-medium text-gray-900">{item.type}</p>
              </div>

              <div>
                <span className="text-gray-500">Reporting Year:</span>
                <p className="font-medium text-gray-900">{item.year}</p>
              </div>

              <div>
                <span className="text-gray-500">Upload Status:</span>
                <div className="mt-1">
                  <StatusBadge status={item.status} />
                </div>
              </div>

              <div>
                <span className="text-gray-500">Uploaded:</span>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <p className="font-medium text-gray-900">{formatDate(item.uploadedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200/50 bg-gray-50/50">
          <Button variant="outline" onClick={onClose} className="border-gray-300 hover:border-gray-400 bg-transparent">
            Close
          </Button>

          <Button
            onClick={() => onDownload(item)}
            className="bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}
