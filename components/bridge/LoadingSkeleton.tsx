import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  count?: number
  view?: "grid" | "list"
  className?: string
}

export function LoadingSkeleton({ count = 6, view = "grid", className }: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i)

  if (view === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {skeletons.map((index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/60 backdrop-blur-sm p-6 animate-pulse"
          >
            {/* Logo */}
            <div className="h-12 w-12 rounded-lg bg-gray-200" />

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
                <div className="h-6 w-20 bg-gray-200 rounded-full" />
                <div className="h-6 w-18 bg-gray-200 rounded-full" />
              </div>
            </div>

            {/* Match Score */}
            <div className="h-12 w-12 bg-gray-200 rounded-full" />

            {/* Actions */}
            <div className="flex gap-2">
              <div className="h-9 w-20 bg-gray-200 rounded" />
              <div className="h-9 w-16 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {skeletons.map((index) => (
        <div key={index} className="rounded-2xl border border-gray-100 bg-white/60 backdrop-blur-sm p-6 animate-pulse">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="h-10 w-10 bg-gray-200 rounded-lg" />
            <div className="h-8 w-8 bg-gray-200 rounded-full" />
          </div>

          {/* Title */}
          <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />

          {/* Subtitle */}
          <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
            <div className="h-6 w-14 bg-gray-200 rounded-full" />
          </div>

          {/* Description */}
          <div className="space-y-2 mb-6">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-4/5 bg-gray-200 rounded" />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <div className="h-9 flex-1 bg-gray-200 rounded" />
            <div className="h-9 w-16 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
