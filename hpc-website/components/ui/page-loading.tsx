import { LoadingSpinner, LoadingSkeleton } from "@/components/ui/loading"

interface PageLoadingProps {
  variant?: "default" | "table" | "form" | "dashboard"
  title?: string
  description?: string
  className?: string
}

export function PageLoading({ 
  variant = "default", 
  title = "",
  description = "",
  className = "" 
}: PageLoadingProps) {
  const variants = {
    default: (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <LoadingSpinner size="lg" text={title} />
        {description && (
          <p className="mt-4 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    ),
    table: (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="h-px w-full bg-gray-200" />

        {/* Action Buttons Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="h-10 w-32 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-10 w-32 animate-pulse rounded-xl bg-gray-200" />
          </div>
          <div className="relative w-full sm:w-auto">
            <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200 sm:w-64" />
          </div>
        </div>

        {/* Table Skeleton */}
        <LoadingSkeleton variant="table" />
      </div>
    ),
    form: (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="h-px w-full bg-gray-200" />

        {/* Form Skeleton */}
        <LoadingSkeleton variant="form" />
      </div>
    ),
    dashboard: (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="h-px w-full bg-gray-200" />

        {/* Dashboard Content Skeleton */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
                </div>
                <div className="mt-2 h-8 w-1/3 animate-pulse rounded bg-gray-200" />
                <div className="mt-1 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>

          {/* Content Cards */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border p-4">
              <div className="mb-4 h-6 w-1/3 animate-pulse rounded bg-gray-200" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="mb-4 h-6 w-1/3 animate-pulse rounded bg-gray-200" />
              <div className="flex h-[300px] items-center justify-center">
                <LoadingSpinner size="lg" text="Memuat Statistik" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 pb-8 pt-4 lg:pt-0 ${className}`}>
      {variants[variant]}
    </div>
  )
} 