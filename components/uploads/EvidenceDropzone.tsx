"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface EvidenceDropzoneProps {
  onSelectFiles: (files: File[]) => void
  acceptedTypes?: string[]
  maxFileSize?: number // in bytes
  maxFiles?: number
  disabled?: boolean
  className?: string
}

export function EvidenceDropzone({
  onSelectFiles,
  acceptedTypes = [".pdf", ".png", ".jpg", ".jpeg", ".csv", ".xlsx"],
  maxFileSize = 25 * 1024 * 1024, // 25MB
  maxFiles = 10,
  disabled = false,
  className,
}: EvidenceDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      setError(null)

      if (files.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`)
        return []
      }

      const validFiles: File[] = []
      const errors: string[] = []

      for (const file of files) {
        // Check file size
        if (file.size > maxFileSize) {
          errors.push(`${file.name}: File too large (max ${Math.round(maxFileSize / 1024 / 1024)}MB)`)
          continue
        }

        // Check file type
        const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
        if (!acceptedTypes.some((type) => type.toLowerCase() === fileExtension)) {
          errors.push(`${file.name}: File type not supported`)
          continue
        }

        validFiles.push(file)
      }

      if (errors.length > 0) {
        setError(errors.join(", "))
      }

      return validFiles
    },
    [acceptedTypes, maxFileSize, maxFiles],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragOver(true)
      }
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      const validFiles = validateFiles(files)

      if (validFiles.length > 0) {
        onSelectFiles(validFiles)
      }
    },
    [disabled, validateFiles, onSelectFiles],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      const validFiles = validateFiles(files)

      if (validFiles.length > 0) {
        onSelectFiles(validFiles)
      }

      // Reset input
      e.target.value = ""
    },
    [validateFiles, onSelectFiles],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !disabled) {
        e.preventDefault()
        const input = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement
        input?.click()
      }
    },
    [disabled],
  )

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-all duration-200",
          "bg-white/15 backdrop-blur-sm shadow-lg",
          "hover:shadow-xl hover:scale-[1.01]",
          isDragOver &&
            !disabled &&
            "border-transparent bg-gradient-to-br from-[#8dcddb] via-[#3270a1] to-[#7e509c] p-0.5",
          !isDragOver && "border-gray-200/50",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Upload evidence files"
        aria-describedby="dropzone-description"
      >
        <div
          className={cn(
            "flex flex-col items-center justify-center p-8 md:p-12 rounded-2xl",
            isDragOver && !disabled && "bg-white",
          )}
        >
          <input
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={handleFileSelect}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            aria-hidden="true"
          />

          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
              "bg-gradient-to-br from-[#8dcddb] via-[#3270a1] to-[#7e509c]",
            )}
          >
            <Upload className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isDragOver ? "Drop files here" : "Upload Evidence"}
          </h3>

          <p className="text-sm text-gray-600 text-center mb-4" id="dropzone-description">
            Drag and drop files here, or{" "}
            <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#3270a1] to-[#7e509c]">
              click to browse
            </span>
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FileText className="w-4 h-4" />
            <span>
              {acceptedTypes.join(", ").toUpperCase()} • Max {Math.round(maxFileSize / 1024 / 1024)}MB • Up to{" "}
              {maxFiles} files
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2" role="alert">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
