"use client"

import React, { useState, useCallback, useMemo } from "react"
import { Search, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-performance"
import { cn } from "@/lib/utils"

interface OptimizedSearchProps {
  placeholder?: string
  onSearch: (query: string) => void
  debounceDelay?: number
  className?: string
  showClearButton?: boolean
  initialValue?: string
  disabled?: boolean
  loading?: boolean
  variant?: "default" | "modern" | "minimal"
  size?: "sm" | "md" | "lg"
}

export function OptimizedSearch({
  placeholder = "Cari barang...",
  onSearch,
  debounceDelay = 300,
  className,
  showClearButton = true,
  initialValue = "",
  disabled = false,
  loading = false,
  variant = "modern",
  size = "md",
}: OptimizedSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)

  // Debounced search function
  const debouncedSearch = useDebounce(onSearch, debounceDelay)

  // Memoized search handler
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    debouncedSearch(value)
  }, [debouncedSearch])

  // Memoized clear handler
  const handleClear = useCallback(() => {
    setSearchTerm("")
    onSearch("")
  }, [onSearch])

  // Memoized focus handlers
  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])

  // Memoized input props
  const inputProps = useMemo(() => ({
    value: searchTerm,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value),
    onFocus: handleFocus,
    onBlur: handleBlur,
    disabled: disabled || loading,
  }), [searchTerm, handleSearchChange, handleFocus, handleBlur, disabled, loading])

  // Size variants
  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-10 text-sm",
    lg: "h-12 text-base"
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  }

  const paddingClasses = {
    sm: "pl-3 pr-8",
    md: "pl-3 pr-10", 
    lg: "pl-3 pr-12"
  }

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case "modern":
        return {
          container: "group relative",
          input: cn(
            "w-full rounded-xl border border-gray-200 bg-white transition-all duration-300",
            "placeholder:text-gray-400 placeholder:font-medium",
            "focus:border-blue-500 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
            "hover:border-gray-300",
            loading && "animate-pulse"
          ),
          icon: cn(
            "transition-all duration-300",
            isFocused ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
          ),
          loading: "text-blue-500"
        }
      case "minimal":
        return {
          container: "relative",
          input: cn(
            "w-full border-0 border-b-2 bg-transparent rounded-none transition-all duration-200",
            "placeholder:text-gray-400",
            "focus:border-blue-500 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
            "hover:border-gray-300"
          ),
          icon: cn(
            "transition-colors duration-200",
            isFocused ? "text-blue-500" : "text-gray-400"
          ),
          loading: "text-blue-500"
        }
      default:
        return {
          container: "relative",
          input: cn(
            "w-full rounded-md border border-gray-200 transition-all duration-200",
            "placeholder:text-gray-400",
            "focus:border-blue-500 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
            "hover:border-gray-300"
          ),
          icon: cn(
            "transition-colors duration-200",
            isFocused ? "text-blue-500" : "text-gray-400"
          ),
          loading: "text-blue-500"
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className={cn("relative", className)}>
      <div className={styles.container}>
        {/* Search Icon */}
        <div className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 z-10",
          size === "lg" && "right-4"
        )}>
          <Search className={cn(
            "pointer-events-none",
            iconSizes[size],
            styles.icon
          )} />
        </div>
        
        {/* Input */}
        <Input
          placeholder={placeholder}
          className={cn(
            styles.input,
            sizeClasses[size],
            paddingClasses[size],
            "transition-all duration-300",
            "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
            loading ? "pr-16" : showClearButton && searchTerm ? "pr-16" : "pr-12"
          )}
          {...inputProps}
        />
        
        {/* Loading Spinner */}
        {loading && (
          <div className={cn(
            "absolute right-8 top-1/2 -translate-y-1/2 z-20",
            size === "lg" && "right-10"
          )}>
            <div className={cn(
              "animate-spin rounded-full border-2 border-primary/20 border-t-primary",
              size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"
            )} />
          </div>
        )}
        
        {/* Clear Button */}
        {showClearButton && searchTerm && !loading && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "absolute right-8 top-1/2 -translate-y-1/2 p-0 hover:bg-muted/50 z-20",
              "transition-all duration-200 hover:scale-110",
              size === "sm" ? "h-6 w-6" : size === "md" ? "h-7 w-7" : "h-8 w-8",
              size === "lg" && "right-10"
            )}
            onClick={handleClear}
            disabled={disabled}
          >
            <X className={cn(
              "transition-colors duration-200",
              size === "sm" ? "h-2.5 w-2.5" : size === "md" ? "h-3 w-3" : "h-4 w-4"
            )} />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
    </div>
  )
}

// Advanced Search Component with Filters
interface AdvancedSearchProps extends OptimizedSearchProps {
  filters?: {
    key: string
    label: string
    options: { value: string; label: string }[]
  }[]
  onFilterChange?: (filters: Record<string, string>) => void
  activeFilters?: Record<string, string>
}

export function AdvancedSearch({
  filters = [],
  onFilterChange,
  activeFilters = {},
  ...searchProps
}: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState(activeFilters)

  const handleFilterChange = useCallback((key: string, value: string) => {
    const newFilters = { ...localFilters }
    if (value) {
      newFilters[key] = value
    } else {
      delete newFilters[key]
    }
    setLocalFilters(newFilters)
    onFilterChange?.(newFilters)
  }, [localFilters, onFilterChange])

  const clearAllFilters = useCallback(() => {
    setLocalFilters({})
    onFilterChange?.({})
  }, [onFilterChange])

  const hasActiveFilters = useMemo(() => {
    return Object.keys(localFilters).length > 0
  }, [localFilters])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <OptimizedSearch {...searchProps} />
        </div>
        
        {filters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "shrink-0 transition-all duration-200",
              "hover:bg-primary/5 hover:border-primary/30",
              hasActiveFilters && "bg-primary/10 border-primary/30 text-primary"
            )}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {hasActiveFilters && (
              <span className="ml-2 rounded-full bg-primary text-primary-foreground text-xs px-2 py-0.5 font-medium">
                {Object.keys(localFilters).length}
              </span>
            )}
          </Button>
        )}
      </div>

      {isExpanded && filters.length > 0 && (
        <div className="p-6 border-2 border-dashed border-muted-foreground/20 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Pencarian
            </h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear All
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {filter.label}
                </label>
                <select
                  value={localFilters[filter.key] || ""}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full p-3 border-2 rounded-lg bg-background/50 backdrop-blur-sm text-sm transition-all duration-200 hover:border-muted-foreground/30 focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Semua {filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 