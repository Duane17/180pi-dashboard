"use client"
import { useState } from "react"
import { Grid, List } from "lucide-react"
import { EvidenceListItem, type EvidenceItem } from "./EvidenceListItem"
import { EmptyState } from "./EmptyState"
import { ErrorState } from "./ErrorState"
import { LoadingSkeleton } from "./LoadingSkeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EvidenceListProps {
  items: EvidenceItem[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  onPreview: (item: EvidenceItem) => void
  onDownload: (item: EvidenceItem) => void
  onDelete: (item: EvidenceItem) => void
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
  className?: string
}

export function EvidenceList({
  items,
  isLoading = false,
  isError = false,
  onRetry,
  onPreview,
  onDownload,
  onDelete,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  className,
}: EvidenceListProps) {
  const [viewMode, setViewMode] = useState<"table" | "card">("table")

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <LoadingSkeleton rows={5} />
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className={className}>
        <ErrorState
          title="Failed to Load Files"
          description="We're having trouble loading your evidence files. Please try again."
          onRetry={onRetry}
        />
      </div>
    )
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          title="No evidence files found"
          description="Upload evidence documents to support your Sustainability Intelligence metrics and reporting."
          actionLabel="Upload Evidence"
          onAction={() => (window.location.href = "/upload/evidence")}
        />
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {items.length} {items.length === 1 ? "file" : "files"}
        </h3>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className={cn(
              "h-8 w-8 p-0",
              viewMode === "table" && "bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c]",
            )}
            aria-label="Table view"
          >
            <List className="w-4 h-4" />
          </Button>

          <Button
            variant={viewMode === "card" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("card")}
            className={cn(
              "h-8 w-8 p-0 md:hidden",
              viewMode === "card" && "bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c]",
            )}
            aria-label="Card view"
          >
            <Grid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* List content */}
      {viewMode === "table" ? (
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <EvidenceListItem
                  key={item.id}
                  item={item}
                  onPreview={onPreview}
                  onDownload={onDownload}
                  onDelete={onDelete}
                  viewMode="table"
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 md:hidden">
          {items.map((item) => (
            <EvidenceListItem
              key={item.id}
              item={item}
              onPreview={onPreview}
              onDownload={onDownload}
              onDelete={onDelete}
              viewMode="card"
            />
          ))}
        </div>
      )}

      {/* Mobile table fallback */}
      <div className="md:hidden block">
        <div className="grid gap-4">
          {items.map((item) => (
            <EvidenceListItem
              key={item.id}
              item={item}
              onPreview={onPreview}
              onDownload={onDownload}
              onDelete={onDelete}
              viewMode="card"
            />
          ))}
        </div>
      </div>

      {/* Load more button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="border-gray-300 hover:border-gray-400 bg-transparent"
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  )
}
