import { DashboardLoading } from "@/components/ui/loading"

export default function LaporanLoading() {
  return (
    <div className="space-y-6 pb-8 pt-4 lg:pt-0">
      {/* Header Skeleton */}
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="h-px w-full bg-gray-200" />

      {/* Dashboard Loading */}
      <DashboardLoading />
    </div>
  )
} 