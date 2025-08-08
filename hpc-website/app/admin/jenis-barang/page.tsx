"use client"
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Plus, Search, Upload, FileText, AlertTriangle, CheckCircle, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { OptimizedSearch } from "@/components/ui/optimized-search"
import { importFile, exportToCSV, exportToExcel } from "@/lib/import-utils"
import { useJenisBarang } from "@/hooks/use-jenis-barang"
import type { JenisBarang } from "@/services/jenis-barang"

export default function JenisBarangPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<JenisBarang | null>(null)
  const [importResult, setImportResult] = useState<any | null>(null)
  const { toast } = useToast()

  const {
    data,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    createJenisBarang,
    updateJenisBarang,
    deleteJenisBarang,
    importJenisBarang,
    exportJenisBarang,
    refetch
  } = useJenisBarang()

  // Form states
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: ''
  })

  // Validation rules for import
  const validationRules = [
    {
      field: 'nama',
      required: true,
      validator: (value: string) => {
        if (!value || value.trim() === '') return 'Nama jenis barang wajib diisi'
        if (value.length < 3) return 'Nama jenis barang minimal 3 karakter'
        return true
      }
    },
    {
      field: 'deskripsi',
      required: false,
      validator: (value: string) => {
        return true
      }
    }
  ]

  // Handle export
  const handleExport = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      setIsExporting(true)
      
      const exportData = await exportJenisBarang()
      if (!exportData) {
        toast({
          title: "Error",
          description: "Gagal mengambil data untuk export",
          variant: "destructive",
        })
        return
      }

      const fileName = `jenis-barang-${new Date().toISOString().split('T')[0]}`

      const headers = ['ID', 'Nama', 'Deskripsi', 'Status', 'Tanggal Dibuat', 'Tanggal Diupdate']
      if (format === 'csv') {
        exportToCSV(exportData, headers, fileName)
      } else {
        exportToExcel(exportData, headers, fileName)
      }

      toast({
        title: "Berhasil",
        description: `Data berhasil diexport ke ${format.toUpperCase()}`,
        variant: "success",
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Error",
        description: "Gagal mengexport data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Handle import file change
  const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)
      setImportResult(null)

             const headers = ['nama', 'deskripsi']
       const result = await importFile(file, headers, validationRules)
       
       if (result.success && result.data) {
         const importResult = await importJenisBarang(result.data as any[])
         setImportResult(importResult)
         setIsImportDialogOpen(false)
       } else {
         setImportResult({
           successCount: 0,
           errorCount: result.invalidRows,
           skippedCount: 0,
           errors: result.error ? [result.error] : []
         })
       }
    } catch (error) {
      console.error('Import error:', error)
      toast({
        title: "Error",
        description: "Gagal mengimport file",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  // Handle add new item
  const handleAdd = async () => {
    if (!formData.nama.trim()) {
      toast({
        title: "Error",
        description: "Nama jenis barang wajib diisi",
        variant: "destructive",
      })
      return
    }

    const success = await createJenisBarang({
      nama: formData.nama.trim(),
      deskripsi: formData.deskripsi.trim() || null
    })

    if (success) {
      setFormData({ nama: '', deskripsi: '' })
      setIsAddDialogOpen(false)
    }
  }

  // Handle edit item
  const handleEdit = async () => {
    if (!selectedItem || !formData.nama.trim()) {
      toast({
        title: "Error",
        description: "Nama jenis barang wajib diisi",
        variant: "destructive",
      })
      return
    }

    const success = await updateJenisBarang(selectedItem.id, {
      nama: formData.nama.trim(),
      deskripsi: formData.deskripsi.trim() || null
    })

    if (success) {
      setFormData({ nama: '', deskripsi: '' })
      setSelectedItem(null)
      setIsEditDialogOpen(false)
    }
  }

  // Handle delete item
  const handleDelete = async (item: JenisBarang) => {
    if (confirm(`Apakah Anda yakin ingin menghapus jenis barang "${item.nama}"?`)) {
      await deleteJenisBarang(item.id)
    }
  }

  // Handle edit click
  const handleEditClick = (item: JenisBarang) => {
    setSelectedItem(item)
    setFormData({
      nama: item.nama,
      deskripsi: item.deskripsi || ''
    })
    setIsEditDialogOpen(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({ nama: '', deskripsi: '' })
    setSelectedItem(null)
  }

  // Filtered data
  const filteredData = data?.data || []

  return (
    <div className="space-y-6 pb-8 pt-4 lg:pt-0 animate-fadeIn">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">Jenis Barang</h1>
        <div className="text-sm text-gray-500">Total: {filteredData.length} jenis barang</div>
      </div>

      <div className="h-px w-full bg-gray-200" />

      {/* Search and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari jenis barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border-gray-200 bg-white pl-4 py-2 pr-10 focus:border-primary focus:ring-primary sm:w-64"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Export Excel
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Tambah Jenis Barang
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        <div className="rounded-lg border bg-card">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">No</TableHead>
                  <TableHead>Nama Jenis Barang</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        Memuat data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-red-500">
                      Error: {error}
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Tidak ada data jenis barang
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="text-center font-medium text-gray-700 py-2 text-xs">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-gray-800 py-2">
                        {item.nama}
                      </TableCell>
                      <TableCell className="text-gray-600 py-2">
                        {item.deskripsi || '-'}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant={item.isActive ? "default" : "secondary"}>
                          {item.isActive ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 py-2 text-xs">
                        {new Date(item.createdAt).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-center py-2">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(item)}
                            className="h-8 px-3 text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item)}
                            className="h-8 px-3 text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
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
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Jenis Barang</DialogTitle>
            <DialogDescription>
              Masukkan informasi jenis barang baru
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nama">Nama Jenis Barang *</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Masukkan nama jenis barang"
              />
            </div>
            <div>
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Input
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Masukkan deskripsi (opsional)"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={resetForm}>Batal</Button>
            </DialogClose>
            <Button onClick={handleAdd}>Tambah</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Jenis Barang</DialogTitle>
            <DialogDescription>
              Edit informasi jenis barang
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nama">Nama Jenis Barang *</Label>
              <Input
                id="edit-nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Masukkan nama jenis barang"
              />
            </div>
            <div>
              <Label htmlFor="edit-deskripsi">Deskripsi</Label>
              <Input
                id="edit-deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Masukkan deskripsi (opsional)"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={resetForm}>Batal</Button>
            </DialogClose>
            <Button onClick={handleEdit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Jenis Barang</DialogTitle>
            <DialogDescription>
              Upload file Excel atau CSV untuk mengimport data jenis barang
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-file">File Excel/CSV</Label>
              <Input
                id="import-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImportFileChange}
                disabled={isImporting}
              />
            </div>
            {importResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    Berhasil: {importResult.successCount}
                  </span>
                </div>
                {importResult.errorCount > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">
                      Error: {importResult.errorCount}
                    </span>
                  </div>
                )}
                {importResult.skippedCount > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600">
                      Dilewati: {importResult.skippedCount}
                    </span>
                  </div>
                )}
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="max-h-32 overflow-y-auto">
                    {importResult.errors.map((error: string, index: number) => (
                      <div key={index} className="text-xs text-red-600">
                        {error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Tutup</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
