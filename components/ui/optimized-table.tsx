"use client"

import React, { useMemo, useCallback, memo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface OptimizedTableProps<T> {
  data: T[]
  columns: {
    key: string
    header: string
    render?: (item: T, index: number) => React.ReactNode
    width?: string
    sortable?: boolean
  }[]
  itemHeight?: number
  containerHeight?: number
  className?: string
  onRowClick?: (item: T, index: number) => void
  selectedRow?: number | null
  loading?: boolean
  emptyMessage?: string
}

// Memoized Table Row Component
const TableRowComponent = memo(<T extends Record<string, any>>({
  item,
  index,
  columns,
  onRowClick,
  isSelected,
  itemHeight,
}: {
  item: T
  index: number
  columns: OptimizedTableProps<T>['columns']
  onRowClick?: (item: T, index: number) => void
  isSelected: boolean
  itemHeight: number
}) => {
  const handleClick = useCallback(() => {
    onRowClick?.(item, index)
  }, [item, index, onRowClick])

  return (
    <TableRow
      className={cn(
        "cursor-pointer transition-colors hover:bg-muted/50",
        isSelected && "bg-primary/10",
        onRowClick && "cursor-pointer"
      )}
      onClick={handleClick}
      style={{ height: itemHeight }}
    >
      {columns.map((column) => (
        <TableCell
          key={column.key}
          className={cn(
            "p-3",
            column.width && `w-[${column.width}]`
          )}
        >
          {column.render ? column.render(item, index) : item[column.key]}
        </TableCell>
      ))}
    </TableRow>
  )
})

TableRowComponent.displayName = 'TableRowComponent'

// Memoized Table Header Component
const TableHeaderComponent = memo(({
  columns,
}: {
  columns: {
    key: string
    header: string
    render?: (item: any, index: number) => React.ReactNode
    width?: string
    sortable?: boolean
  }[]
}) => {
  return (
    <TableHeader>
      <TableRow>
        {columns.map((column) => (
          <TableHead
            key={column.key}
            className={cn(
              "p-3 font-semibold",
              column.width && `w-[${column.width}]`,
              column.sortable && "cursor-pointer hover:bg-muted/50"
            )}
          >
            {column.header}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  )
})

TableHeaderComponent.displayName = 'TableHeaderComponent'

// Main Optimized Table Component
function OptimizedTable<T extends Record<string, any>>({
  data,
  columns,
  itemHeight = 60,
  containerHeight = 400,
  className,
  onRowClick,
  selectedRow,
  loading = false,
  emptyMessage = "Tidak ada data",
}: OptimizedTableProps<T>) {
  // Memoize filtered data
  const filteredData = useMemo(() => data, [data])
  
  // Memoize empty state
  const isEmpty = useMemo(() => data.length === 0, [data.length])

  // Memoize loading state
  const showLoading = useMemo(() => loading && data.length === 0, [loading, data.length])

  if (showLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <div
        className="overflow-auto"
        style={{ height: containerHeight }}
      >
        <Table>
          <TableHeaderComponent columns={columns} />
          <TableBody>
            {filteredData.map((item, index) => (
              <TableRowComponent
                key={`${index}-${JSON.stringify(item)}`}
                item={item as any}
                index={index}
                columns={columns as any}
                onRowClick={onRowClick as any}
                isSelected={selectedRow === index}
                itemHeight={itemHeight}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Export with proper typing
export { OptimizedTable }
export type { OptimizedTableProps } 