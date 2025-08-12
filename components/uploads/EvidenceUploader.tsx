"use client"
import { useState, useCallback } from "react"
import { Upload, Trash2 } from "lucide-react"
import { EvidenceDropzone } from "./EvidenceDropzone"
import { EvidenceFilters } from "./EvidenceFilters"
import { UploadQueueItem } from "./UploadQueueItem"
import { UploadStatusSummary } from "./UploadStatusSummary"
import { EmptyState } from "./EmptyState"
import { LoadingSkeleton } from "./LoadingSkeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { EvidenceType } from "./TypeSelector"
import type { UploadStatus } from "./StatusBadge"

interface QueuedFile {
  id: string
  file: File
  progress: number
  status: UploadStatus
  year?: number
  type?: string
  error?: string
}

interface EvidenceUploaderProps {
  yearOptions?: number[]
  defaultYear?: number
  onYearChange?: (year: number) => void
  typeOptions?: EvidenceType[]
  onTypeChange?: (type: string) => void
  onSelectFiles?: (files: File[]) => void
  onRequestPresign?: (file: File) => Promise<{ uploadUrl: string; fileId: string }>
  onUploadToStorage?: (file: File, uploadUrl: string, onProgress: (progress: number) => void) => Promise<void>
  onNotifyBackendComplete?: (fileId: string, metadata: any) => Promise<void>
  isUploading?: boolean
  isVerifying?: boolean
  acceptedTypes?: string[]
  maxFileSize?: number
  maxFiles?: number
  className?: string
}

export function EvidenceUploader({
  yearOptions = [2024, 2023, 2022, 2021, 2020],
  defaultYear = new Date().getFullYear(),
  onYearChange,
  typeOptions,
  onTypeChange,
  onSelectFiles,
  onRequestPresign,
  onUploadToStorage,
  onNotifyBackendComplete,
  isUploading = false,
  isVerifying = false,
  acceptedTypes,
  maxFileSize,
  maxFiles,
  className,
}: EvidenceUploaderProps) {
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear)
  const [selectedType, setSelectedType] = useState<string>("")
  const [uploadQueue, setUploadQueue] = useState<QueuedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  const [errorAnnouncement, setErrorAnnouncement] = useState("")

  const handleYearChange = useCallback(
    (year: number) => {
      setSelectedYear(year)
      onYearChange?.(year)
    },
    [onYearChange],
  )

  const handleTypeChange = useCallback(
    (type: string) => {
      setSelectedType(type)
      onTypeChange?.(type)
    },
    [onTypeChange],
  )

  const handleSelectFiles = useCallback(
    (files: File[]) => {
      const newFiles: QueuedFile[] = files.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: "queued" as UploadStatus,
        year: selectedYear,
        type: selectedType || undefined,
      }))

      setUploadQueue((prev) => [...prev, ...newFiles])
      setAnnouncement(`${files.length} ${files.length === 1 ? "file" : "files"} added to upload queue`)
      onSelectFiles?.(files)
    },
    [selectedYear, selectedType, onSelectFiles],
  )

  const handleCancelUpload = useCallback((fileId: string) => {
    setUploadQueue((prev) => {
      const file = prev.find((item) => item.id === fileId)
      if (file) {
        setAnnouncement(`Upload cancelled for ${file.file.name}`)
      }
      return prev.filter((item) => item.id !== fileId)
    })
  }, [])

  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadQueue((prev) => {
      const file = prev.find((item) => item.id === fileId)
      if (file) {
        setAnnouncement(`${file.file.name} removed from queue`)
      }
      return prev.filter((item) => item.id !== fileId)
    })
  }, [])

  const handleRetryUpload = useCallback((fileId: string) => {
    setUploadQueue((prev) => {
      const file = prev.find((item) => item.id === fileId)
      if (file) {
        setAnnouncement(`Retrying upload for ${file.file.name}`)
      }
      return prev.map((item) =>
        item.id === fileId ? { ...item, status: "queued" as UploadStatus, error: undefined } : item,
      )
    })
  }, [])

  const handleClearQueue = useCallback(() => {
    const count = uploadQueue.length
    setUploadQueue([])
    setAnnouncement(`Upload queue cleared. ${count} ${count === 1 ? "file" : "files"} removed`)
  }, [uploadQueue.length])

  const handleUpload = useCallback(async () => {
    if (!onRequestPresign || !onUploadToStorage || !onNotifyBackendComplete) {
      setErrorAnnouncement("Upload handlers not configured")
      return
    }

    setIsProcessing(true)
    const queuedFiles = uploadQueue.filter((item) => item.status === "queued")
    setAnnouncement(`Starting upload of ${queuedFiles.length} ${queuedFiles.length === 1 ? "file" : "files"}`)

    try {
      for (const queuedFile of queuedFiles) {
        try {
          // Update status to uploading
          setUploadQueue((prev) =>
            prev.map((item) => (item.id === queuedFile.id ? { ...item, status: "uploading" as UploadStatus } : item)),
          )

          // Request presigned URL
          const { uploadUrl, fileId } = await onRequestPresign(queuedFile.file)

          // Upload to storage with progress tracking
          await onUploadToStorage(queuedFile.file, uploadUrl, (progress) => {
            setUploadQueue((prev) => prev.map((item) => (item.id === queuedFile.id ? { ...item, progress } : item)))
          })

          // Update status to verifying
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === queuedFile.id ? { ...item, status: "verifying" as UploadStatus, progress: 100 } : item,
            ),
          )

          // Notify backend of completion
          await onNotifyBackendComplete(fileId, {
            originalName: queuedFile.file.name,
            size: queuedFile.file.size,
            type: queuedFile.type,
            year: queuedFile.year,
          })

          // Update status to completed
          setUploadQueue((prev) =>
            prev.map((item) => (item.id === queuedFile.id ? { ...item, status: "completed" as UploadStatus } : item)),
          )

          setAnnouncement(`${queuedFile.file.name} uploaded successfully`)
        } catch (error) {
          // Update status to failed
          const errorMessage = error instanceof Error ? error.message : "Upload failed"
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === queuedFile.id
                ? {
                    ...item,
                    status: "failed" as UploadStatus,
                    error: errorMessage,
                  }
                : item,
            ),
          )
          setErrorAnnouncement(`Upload failed for ${queuedFile.file.name}: ${errorMessage}`)
        }
      }

      const completedCount = uploadQueue.filter((item) => item.status === "completed").length
      setAnnouncement(
        `Upload complete. ${completedCount} ${completedCount === 1 ? "file" : "files"} uploaded successfully`,
      )
    } finally {
      setIsProcessing(false)
    }
  }, [uploadQueue, onRequestPresign, onUploadToStorage, onNotifyBackendComplete])

  const statusCounts = uploadQueue.reduce(
    (counts, item) => {
      counts[item.status] = (counts[item.status] || 0) + 1
      return counts
    },
    {} as Record<UploadStatus, number>,
  )

  const hasQueuedFiles = uploadQueue.some((item) => item.status === "queued")
  const hasFiles = uploadQueue.length > 0

  return (
    <div className={cn("space-y-6", className)}>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {errorAnnouncement}
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] mb-2">
          Upload Evidence
        </h1>
        <p className="text-gray-600">Attach documents that support your metrics</p>
      </div>

      {/* Filters */}
      <EvidenceFilters
        selectedYear={selectedYear}
        selectedType={selectedType}
        onYearChange={handleYearChange}
        onTypeChange={handleTypeChange}
        yearOptions={yearOptions}
        typeOptions={typeOptions}
      />

      {/* Dropzone */}
      <EvidenceDropzone
        onSelectFiles={handleSelectFiles}
        acceptedTypes={acceptedTypes}
        maxFileSize={maxFileSize}
        maxFiles={maxFiles}
        disabled={isProcessing || isUploading}
      />

      {hasFiles && <UploadStatusSummary statusCounts={statusCounts} totalFiles={uploadQueue.length} />}

      {/* Upload Queue */}
      {hasFiles ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Upload Queue ({uploadQueue.length})</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearQueue}
              disabled={isProcessing || isUploading}
              className="text-gray-600 hover:text-gray-800 bg-transparent"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Queue
            </Button>
          </div>

          <div className="space-y-3">
            {uploadQueue.map((queuedFile) => (
              <UploadQueueItem
                key={queuedFile.id}
                file={queuedFile.file}
                progress={queuedFile.progress}
                status={queuedFile.status}
                year={queuedFile.year}
                type={queuedFile.type}
                error={queuedFile.error}
                onCancel={() => handleCancelUpload(queuedFile.id)}
                onRemove={() => handleRemoveFile(queuedFile.id)}
                onRetry={() => handleRetryUpload(queuedFile.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No files selected"
          description="Use the dropzone above to select files for upload."
          icon="upload"
        />
      )}

      {/* Actions */}
      {hasFiles && (
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
          <Button
            onClick={handleUpload}
            disabled={!hasQueuedFiles || isProcessing || isUploading}
            className="bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isProcessing || isUploading
              ? "Uploading..."
              : `Upload ${uploadQueue.filter((f) => f.status === "queued").length} Files`}
          </Button>
        </div>
      )}

      {/* Loading/Error States */}
      {isVerifying && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Verifying uploads...</h3>
          <LoadingSkeleton rows={2} />
        </div>
      )}
    </div>
  )
}
