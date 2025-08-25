"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileEdit, Plus, Search, Upload, Eye, Trash2, Package, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddBarangMasukDialog } from "@/components/dialogs/AddBarangMasukDialog"
import { DetailBarangMasukDialog } from "@/components/dialogs/DetailBarangMasukDialog"
import { EditBarangMasukDialog } from "@/components/dialogs/EditBarangMasukDialog"
import { DeleteBarangMasukDialog } from "@/components/dialogs/DeleteBarangMasukDialog"
import { useBarangMasuk } from "@/hooks/use-barang-masuk"
import { useBarangMasukForm } from "@/hooks/use-barang-masuk-form"
import { BarangMasukData } from "@/services/barang-masuk"
import { useToast } from "@/hooks/use-toast"

export default function BarangMasukPage() {
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    // State
    searchTerm,
    isExporting,
    isImporting,
    isDetailDialogOpen,
    isEditDialogOpen,
    isAddDialogOpen,
    selectedItem,
    isLoading,
    filteredItems,
    pagination,

    // Setters
    setSearchTerm,
    page,
    limit,
    setPage,
    setLimit,
    setIsDetailDialogOpen,
    setIsEditDialogOpen,
    setIsAddDialogOpen,
    setSelectedItem,

    // Actions
    fetchBarangMasuk,
    saveBarangMasuk,
    updateBarangMasuk,
    handleExport,
    handleImportFileChange,
    handleDetailClick,
    handleDeleteItem,
  } = useBarangMasuk()

  const {
    // New form state
    newIncomingItem,
    setNewIncomingItem,
    newIncomingItemDetails,
    setNewIncomingItemDetails,

    // Edit form state
    editIncomingItem,
    setEditIncomingItem,
    editIncomingItemDetails,
    setEditIncomingItemDetails,

    // New form handlers
    handleAddDetailItem,
    handleUpdateDetailItem,
    handleRemoveDetailItem,

    // Edit form handlers
    handleAddEditDetailItem,
    handleUpdateEditDetailItem,
    handleRemoveEditDetailItem,

    // Form utilities
    resetNewForm,
    resetEditForm,
    setEditFormData,
  } = useBarangMasukForm()

  // Handle add new item
  const handleAddIncomingItem = async () => {
    if (!newIncomingItem.tanggal || !newIncomingItem.kodeKedatangan || !newIncomingItem.namaSupplier || !newIncomingItem.noForm || !newIncomingItem.status) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi",
        variant: "destructive",
      })
      return
    }

    // Filter out empty details
    const validDetails = newIncomingItemDetails.filter(detail => 
      detail.kodeBarang.trim() !== "" && detail.namaBarang.trim() !== "" && detail.jumlah > 0
    )

    // Require at least one valid detail with minimum quantity of 1
    if (validDetails.length === 0) {
      toast({
        title: "Error",
        description: "Minimal satu detail barang dengan kode barang, nama barang, dan jumlah minimal 1 harus ditambahkan",
        variant: "destructive",
      })
      return
    }

    // Prepare data for API
    const apiData: BarangMasukData = {
      tanggal: newIncomingItem.tanggal,
      kodeKedatangan: newIncomingItem.kodeKedatangan,
      namaSupplier: newIncomingItem.namaSupplier,
      noForm: newIncomingItem.noForm,
      status: newIncomingItem.status,
      details: validDetails.map(detail => ({
        kodeBarang: detail.kodeBarang,
        namaBarang: detail.namaBarang,
        jumlah: detail.jumlah,
        units: detail.units?.map(unit => ({
          noSeri: unit.noSeri || '',
          lokasi: unit.lokasi || '',
          keterangan: unit.keterangan || ''
        })) || []
      }))
    }

    // Save to API
    const success = await saveBarangMasuk(apiData)
    
    if (success) {
      // Reset form
      resetNewForm()
      setIsAddDialogOpen(false)
      
      // Refresh data
      fetchBarangMasuk()
    }
  }

  // Handle update item
  const handleUpdateItem = async () => {
    if (!selectedItem) return

    if (!editIncomingItem.tanggal || !editIncomingItem.kodeKedatangan || !editIncomingItem.namaSupplier || !editIncomingItem.noForm || !editIncomingItem.status) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi",
        variant: "destructive",
      })
      return
    }

    // Filter out empty details
    const validDetails = editIncomingItemDetails.filter(detail => 
      detail.kodeBarang.trim() !== "" && detail.namaBarang.trim() !== "" && detail.jumlah > 0
    )

    // Require at least one valid detail with minimum quantity of 1
    if (validDetails.length === 0) {
      toast({
        title: "Error",
        description: "Minimal satu detail barang dengan kode barang, nama barang, dan jumlah minimal 1 harus ditambahkan",
        variant: "destructive",
      })
      return
    }

    // Prepare data for API
    const apiData: BarangMasukData = {
      tanggal: editIncomingItem.tanggal,
      kodeKedatangan: editIncomingItem.kodeKedatangan,
      namaSupplier: editIncomingItem.namaSupplier,
      noForm: editIncomingItem.noForm,
      status: editIncomingItem.status,
      details: validDetails.map(detail => ({
        kodeBarang: detail.kodeBarang,
        namaBarang: detail.namaBarang,
        jumlah: detail.jumlah,
        units: detail.units?.map(unit => ({
          noSeri: unit.noSeri || '',
          lokasi: unit.lokasi || '',
          keterangan: unit.keterangan || ''
        })) || []
      }))
    }

    // Update via API
    const success = await updateBarangMasuk(selectedItem.id, apiData)
    
    if (success) {
      setIsEditDialogOpen(false)
      setSelectedItem(null)
      resetEditForm()
      
      // Refresh data
      fetchBarangMasuk()
    }
  }

  // Handle edit click
  const handleEditClick = (item: any) => {
    setSelectedItem(item)
    setEditFormData(item)
    setIsEditDialogOpen(true)
  }

  // Handle delete click with confirmation
  const handleDeleteClick = (item: any) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedItem) return

    setIsDeleting(true)
    try {
      await handleDeleteItem(selectedItem.id)
      setIsDeleteDialogOpen(false)
      setSelectedItem(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 pb-8 pt-4 lg:pt-0 animate-fadeIn">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">Barang Masuk</h1>
        <div className="text-sm text-gray-500">Total: {filteredItems.length} transaksi</div>
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
              onClick={handleExport}
              disabled={isExporting || filteredItems.length === 0}
            >
              {isExporting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export Data</span>
                </>
              )}
            </Button>
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleImportFileChange}
              className="hidden"
              id="import-file-input"
              disabled={isImporting}
            />
            <Button
              className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark sm:px-4"
              onClick={() => document.getElementById("import-file-input")?.click()}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Import Data</span>
                </>
              )}
            </Button>
          </div>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari barang masuk..."
              className="w-full rounded-xl border-gray-200 bg-white pl-4 py-2 pr-10 focus:border-primary focus:ring-primary sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="grid gap-4 lg:hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada data barang masuk</h3>
            <p className="text-sm text-gray-600">
              Mulai dengan menambahkan transaksi barang masuk pertama atau import data dari file CSV/Excel
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">#{filteredItems.indexOf(item) + 1}</span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    item.status === "Diterima"
                      ? "bg-green-100 text-green-700"
                      : item.status === "Diterima Sebagian"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Tanggal</p>
                    <p className="font-medium text-gray-800">{item.tanggal}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Kode Kedatangan</p>
                    <p className="font-medium text-gray-800">{item.kodeKedatangan}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-gray-900">{item.namaSupplier}</p>
                  <p className="text-sm text-gray-600">{item.noForm}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  className="flex-1 rounded-lg bg-gray-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-600"
                  onClick={() => handleDetailClick(item)}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  Detail
                </Button>
                <Button
                  className="flex-1 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-500"
                  onClick={() => handleEditClick(item)}
                >
                  <FileEdit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  className="flex-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                  onClick={() => handleDeleteClick(item)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
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
                <TableHead className="py-3 font-medium text-gray-600">Tanggal</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Kode Kedatangan</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Nama Supplier</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">No Form</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Status</TableHead>
                <TableHead className="rounded-tr-xl py-3 text-center font-medium text-gray-600">Pengaturan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2 text-gray-600">Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <Package className="h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada data barang masuk</h3>
                      <p className="text-sm text-gray-600">
                        Mulai dengan menambahkan transaksi barang masuk pertama atau import data dari file CSV/Excel
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item, index) => (
                  <TableRow key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <TableCell className="text-center font-medium text-gray-600">{(page - 1) * (pagination?.limit || 10) + index + 1}</TableCell>
                    <TableCell className="font-medium text-gray-800">{item.tanggal}</TableCell>
                    <TableCell className="text-gray-800">{item.kodeKedatangan}</TableCell>
                    <TableCell className="text-gray-800">{item.namaSupplier}</TableCell>
                    <TableCell className="text-gray-800">{item.noForm}</TableCell>
                    <TableCell className="text-gray-600">{item.status}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          className="h-8 rounded-lg bg-gray-500 px-3 text-xs font-medium text-white hover:bg-gray-600"
                          onClick={() => handleDetailClick(item)}
                        >
                          Detail
                        </Button>
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

      {/* Pagination Controls - Center & Compact */}
      {pagination && (
        <div className="mt-4 w-full flex items-center justify-center gap-3 overflow-x-auto whitespace-nowrap px-2">
          {/* Info jumlah data */}
          {/* <div className="inline-flex items-center justify-center text-xs text-gray-600 text-center">
            {(() => {
              const total = pagination.total || 0
              const currentLimit = pagination.limit || limit || 10
              const startIndex = total > 0 ? (page - 1) * currentLimit + 1 : 0
              const endIndex = Math.min(page * currentLimit, total)
              return (
                <span>
                  Menampilkan <span className="font-medium">{startIndex}</span>–<span className="font-medium">{endIndex}</span> dari <span className="font-medium">{total}</span> data
                </span>
              )
            })()}
          </div> */}
          {/* Pager */}
          
          <Pagination className="mx-0">
          <Select
              value={String(pagination.limit || limit)}
              onValueChange={(val) => {
                const newLimit = parseInt(val)
                setPage(1)
                setLimit(newLimit)
              }}
            >
              <SelectTrigger className="h-8 w-[80px]">
                <SelectValue placeholder={String(pagination.limit || limit)} />
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
                    if (page > 1) setPage(page - 1)
                  }}
                  className={(page === 1 ? "pointer-events-none opacity-50 " : "") + "h-8"}
                />
              </PaginationItem>

              {/* Indicator */}
              <PaginationItem>
                <span className="px-2 text-xs text-gray-700">
                  Halaman <span className="font-medium">{page}</span> dari <span className="font-medium">{pagination.totalPages || 1}</span>
                </span>
              </PaginationItem>

              {/* Next */}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page < (pagination.totalPages || 1)) setPage(page + 1)
                  }}
                  className={(page >= (pagination.totalPages || 1) ? "pointer-events-none opacity-50 " : "") + "h-8"}
                />
              </PaginationItem>

              {/* Last */}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    const last = pagination.totalPages || 1
                    if (page < last) setPage(last)
                  }}
                  className={(page >= (pagination.totalPages || 1) ? "pointer-events-none opacity-50 " : "") + "h-8 px-2"}
                >
                  <ChevronsRight className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Dialogs */}
      <AddBarangMasukDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        newIncomingItem={newIncomingItem}
        setNewIncomingItem={setNewIncomingItem}
        newIncomingItemDetails={newIncomingItemDetails}
        setNewIncomingItemDetails={setNewIncomingItemDetails}
        handleAddIncomingItem={handleAddIncomingItem}
        handleAddDetailItem={handleAddDetailItem}
        handleUpdateDetailItem={handleUpdateDetailItem}
        handleRemoveDetailItem={handleRemoveDetailItem}
      />

      <DetailBarangMasukDialog
        isOpen={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        selectedItem={selectedItem}
      />

      <EditBarangMasukDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedItem={selectedItem}
        editIncomingItem={editIncomingItem}
        setEditIncomingItem={setEditIncomingItem}
        editIncomingItemDetails={editIncomingItemDetails}
        setEditIncomingItemDetails={setEditIncomingItemDetails}
        handleUpdateItem={handleUpdateItem}
        handleAddEditDetailItem={handleAddEditDetailItem}
        handleUpdateEditDetailItem={handleUpdateEditDetailItem}
        handleRemoveEditDetailItem={handleRemoveEditDetailItem}
      />

      <DeleteBarangMasukDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedItem={selectedItem}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
