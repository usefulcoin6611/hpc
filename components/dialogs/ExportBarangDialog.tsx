"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { exportToCSV, exportToExcel } from "@/lib/import-utils"
import { Barang } from "@/services/barang"

interface ExportBarangDialogProps {
  isOpen: boolean
  onClose: () => void
  data: Barang[]
}

export function ExportBarangDialog({
  isOpen,
  onClose,
  data
}: ExportBarangDialogProps) {
  const handleExport = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      if (data.length === 0) {
        return
      }
      
      // Prepare data for export (with ID column to match import format)
      const exportData = data.map(item => ({
        'ID': item.id,
        'Kode Barang': item.kode,
        'Nama Barang': item.nama,
        'Kategori': item.kategori || '',
        'Satuan': item.satuan || '',
        'Stok': item.stok || 0,
        'Stok Minimum': item.stokMinimum || 0,
        'Lokasi': item.lokasi || '',
        'Deskripsi': item.deskripsi || ''
      }))
      
      const headers = Object.keys(exportData[0])
      const filename = `master_barang_${new Date().toISOString().split('T')[0]}`

      if (format === 'csv') {
        exportToCSV(exportData, headers, filename)
      } else {
        exportToExcel(exportData, headers, filename)
      }
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Pilih format file untuk export data master barang
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('csv')} className="flex-1">
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => handleExport('excel')} className="flex-1">
            <FileText className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 