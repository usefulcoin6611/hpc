import { TableLoading, CardLoading } from "@/components/ui/loading"

export default function ApproverLoading() {
  return (
    <div className="space-y-6 pb-8 pt-4 lg:pt-0">
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
      <div className="hidden lg:block">
        <TableLoading rows={8} columns={6} />
      </div>

      {/* Mobile Card Skeleton */}
      <div className="grid gap-4 lg:hidden">
        <CardLoading cards={5} />
      </div>
    </div>
  )
} 