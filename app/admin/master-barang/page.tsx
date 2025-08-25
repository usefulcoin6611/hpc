"use client"
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Plus, Search, Upload, AlertTriangle, Package } from "lucide-react"
import { OptimizedSearch } from "@/components/ui/optimized-search"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronsLeft, ChevronsRight } from "lucide-react"
import { useBarang } from "@/hooks/use-barang"
import { AddBarangDialog } from "@/components/dialogs/AddBarangDialog"
import { EditBarangDialog } from "@/components/dialogs/EditBarangDialog"
import { DeleteBarangDialog } from "@/components/dialogs/DeleteBarangDialog"
import { ImportBarangDialog } from "@/components/dialogs/ImportBarangDialog"
import { ExportBarangDialog } from "@/components/dialogs/ExportBarangDialog"
import { Barang } from "@/services/barang"

export default function MasterBarangPage() {
  // Use custom hook for barang management
  const {
    data,
    loading,
    error,
    searchTerm,
    sortedFilteredItems,
    setSearchTerm,
    refetch,
    createBarang,
    updateBarang,
    deleteBarang,
    importBarang,
    page,
    limit,
    setPage,
    setLimit,
  } = useBarang()

  const total = data?.pagination?.total || 0
  const totalPages = data?.pagination?.totalPages || 1
  const currentLimit = data?.pagination?.limit || limit || 10
  const startIndex = total > 0 ? (page - 1) * currentLimit + 1 : 0
  const endIndex = Math.min(page * currentLimit, total)

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Barang | null>(null)

  // Handle edit click
  const handleEditClick = (item: Barang) => {
    setSelectedItem(item)
    setIsEditDialogOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (item: Barang) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }

  // Add loading state display
  if (loading) {
    return (
      <div className="space-y-6 pb-8 pt-4 lg:pt-0 animate-fadeIn">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Master Barang</h1>
          <p className="text-muted-foreground">
            Kelola data master barang dalam sistem inventaris.
          </p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-muted-foreground">Memuat data barang...</p>
          </div>
        </div>
      </div>
    )
  }

  // Add error state display
  if (error) {
    return (
      <div className="space-y-6 pb-8 pt-4 lg:pt-0 animate-fadeIn">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Master Barang</h1>
          <p className="text-muted-foreground">
            Kelola data master barang dalam sistem inventaris.
          </p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-semibold">Error</h3>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button 
              onClick={() => refetch()} 
              className="mt-4"
              variant="outline"
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8 pt-4 lg:pt-0 animate-fadeIn">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">Master Barang</h1>
        <div className="text-sm text-gray-500">Total: {sortedFilteredItems.length} barang</div>
      </div>

      <div className="h-px w-full bg-gray-200" />

      {/* Button Tambah Data, Export/Import dan Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Button Tambah Data - Rata Kiri */}
        <Button
          className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 sm:px-4"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Tambah Data</span>
        </Button>

        {/* Export/Import dan Search - Rata Kanan */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-3">
            <Button
              className="rounded-xl bg-success px-3 py-2 text-sm font-medium text-white hover:bg-success/90 sm:px-4"
              onClick={() => setIsExportDialogOpen(true)}
              disabled={sortedFilteredItems.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              <span>Export Data</span>
            </Button>
            <Button
              className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark sm:px-4"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              <span>Import Data</span>
            </Button>
          </div>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Cari barang..."
              className="w-full rounded-xl border-gray-200 bg-white pl-4 py-2 pr-10 focus:border-primary focus:ring-primary sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="grid gap-4 lg:hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        ) : sortedFilteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada data barang</h3>
            <p className="text-sm text-gray-600">
              Mulai dengan menambahkan barang pertama atau import data dari file CSV/Excel
            </p>
          </div>
        ) : (
          sortedFilteredItems.map((item, index) => (
            <div key={item.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">#{index + 1}</span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Kode Barang</p>
                  <p className="font-medium text-gray-800">{item.kode}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nama Barang</p>
                  <p className="font-medium text-gray-800">{item.nama}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  className="flex-1 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-500"
                  onClick={() => handleEditClick(item)}
                >
                  Edit
                </Button>
                <Button
                  className="flex-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                  onClick={() => handleDeleteClick(item)}
                >
                  Hapus
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-soft lg:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-sky-100">
                <TableHead className="w-12 rounded-tl-xl py-3 text-center font-medium text-gray-600">No</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Kode Barang</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Nama Barang</TableHead>
                <TableHead className="rounded-tr-xl py-3 text-center font-medium text-gray-600">Pengaturan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2 text-gray-600">Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : sortedFilteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <Package className="h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada data barang</h3>
                      <p className="text-sm text-gray-600">
                        Mulai dengan menambahkan barang pertama atau import data dari file CSV/Excel
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedFilteredItems.map((item, index) => (
                  <TableRow key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <TableCell className="text-center font-medium text-gray-600">{(page - 1) * (data?.pagination?.limit || 10) + index + 1}</TableCell>
                    <TableCell className="font-medium text-gray-800">{item.kode}</TableCell>
                    <TableCell className="text-gray-800">{item.nama}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          className="h-8 rounded-lg bg-amber-400 px-3 text-xs font-medium text-white hover:bg-amber-500"
                          onClick={() => handleEditClick(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          className="h-8 rounded-lg bg-red-500 px-3 text-xs font-medium text-white hover:bg-red-600"
                          onClick={() => handleDeleteClick(item)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls - Redesigned */}
      {data?.pagination && (
        <div className="mt-4 w-full flex items-center justify-center gap-3 overflow-x-auto whitespace-nowrap px-2">
          {/* Info jumlah data */}
        

          {/* Page size + controls */}
          <div className="flex flex-nowrap items-center justify-center gap-2">
            {/* Page size selector */}
            <div className="flex items-center gap-2 text-xs">
              
              <Select
                value={String(currentLimit)}
                onValueChange={(val) => {
                  const newLimit = parseInt(val)
                  // Reset ke halaman 1 saat limit berubah
                  setPage(1)
                  setLimit(newLimit)
                }}
              >
                
                <SelectTrigger className="h-8 w-[80px]">
                  <SelectValue placeholder={String(currentLimit)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <span className="text-gray-600">baris</span>
            </div>

            {/* Pager */}
            <Pagination className="mx-0">
              <PaginationContent>
                {/* First */}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page > 1) setPage(1)
                    }}
                    className={(page === 1 ? "pointer-events-none opacity-50 " : "") + "h-8 px-2"}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </PaginationLink>
                </PaginationItem>

                {/* Prev */}
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (data.pagination.hasPrev) setPage(page - 1)
                    }}
                    className={( !data.pagination.hasPrev ? "pointer-events-none opacity-50 " : "") + "h-8"}
                  />
                </PaginationItem>

                {/* Current page indicator (simple) */}
                <PaginationItem>
                  <span className="px-2 text-xs text-gray-700">
                    Halaman <span className="font-medium">{page}</span> dari <span className="font-medium">{totalPages}</span>
                  </span>
                </PaginationItem>

                {/* Next */}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (data.pagination.hasNext) setPage(page + 1)
                    }}
                    className={( !data.pagination.hasNext ? "pointer-events-none opacity-50 " : "") + "h-8"}
                  />
                </PaginationItem>

                {/* Last */}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page < totalPages) setPage(totalPages)
                    }}
                    className={(page === totalPages ? "pointer-events-none opacity-50 " : "") + "h-8 px-2"}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AddBarangDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={createBarang}
      />

      <EditBarangDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setSelectedItem(null)
        }}
        onSubmit={updateBarang}
        barang={selectedItem}
      />

      <DeleteBarangDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedItem(null)
        }}
        onConfirm={deleteBarang}
        barang={selectedItem}
      />

      <ImportBarangDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={importBarang}
      />

      <ExportBarangDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        data={sortedFilteredItems}
      />
    </div>
  )
}
