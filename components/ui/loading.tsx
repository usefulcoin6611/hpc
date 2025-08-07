import React from "react"
import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { LoadingProps } from "@/types"

// Loading Spinner Component
export function LoadingSpinner({ 
  size = "md", 
  className = "",
  text = "Memuat..."
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  )
}

// Loading Skeleton Component
export function LoadingSkeleton({ 
  variant = "default",
  className = ""
}: {
  variant?: "default" | "card" | "table" | "form"
  className?: string
}) {
  const variants = {
    default: (
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ),
    card: (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ),
    table: (
      <div className="space-y-3">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    ),
    form: (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-10 w-1/4" />
      </div>
    )
  }

  return (
    <div className={cn("animate-pulse", className)}>
      {variants[variant]}
    </div>
  )
}

// Page Loading Component
export function PageLoading({ 
  title = "",
  description = "",
  className = ""
}: {
  title?: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("flex min-h-[400px] flex-col items-center justify-center", className)}>
      <LoadingSpinner size="lg" text={title} />
      {description && (
        <p className="mt-4 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

// Table Loading Component
export function TableLoading({ 
  rows = 5,
  columns = 4,
  className = ""
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex gap-4 border-b pb-2">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-1/4" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-1/4" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Card Loading Component
export function CardLoading({ 
  cards = 3,
  className = ""
}: {
  cards?: number
  className?: string
}) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <LoadingSkeleton variant="card" />
        </div>
      ))}
    </div>
  )
}

// Dashboard Loading Component
export function DashboardLoading({ className = "" }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="mt-2 h-8 w-1/3" />
            <Skeleton className="mt-1 h-3 w-1/2" />
          </div>
        ))}
      </div>

      {/* Content Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-4">
          <Skeleton className="mb-4 h-6 w-1/3" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <Skeleton className="mb-4 h-6 w-1/3" />
          <div className="flex h-[300px] items-center justify-center">
            <LoadingSpinner size="lg" text="Memuat Statistik" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Inline Loading Component
export function InlineLoading({ 
  size = "sm",
  text,
  className = ""
}: {
  size?: "sm" | "md"
  text?: string
  className?: string
}) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Loader2 className={cn(
        "animate-spin text-primary",
        size === "sm" ? "h-3 w-3" : "h-4 w-4"
      )} />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  )
}

// Button Loading Component
export function ButtonLoading({ 
  text = "Memuat...",
  className = ""
}: {
  text?: string
  className?: string
}) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{text}</span>
    </div>
  )
} 