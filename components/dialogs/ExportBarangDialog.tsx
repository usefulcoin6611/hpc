"use client"

import { DialogWrapper } from "@/components/ui/dialog-wrapper"
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
      
      // Prepare data for export (only Kode Barang and Nama Barang)
      const exportData = data.map(item => ({
        'Kode Barang': item.kode,
        'Nama Barang': item.nama
      }))
      
      const headers = ['Kode Barang', 'Nama Barang']
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
    <DialogWrapper open={isOpen} onOpenChange={onClose}>
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Pilih format file untuk export data master barang (Kode Barang dan Nama Barang)
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
    </DialogWrapper>
  )
} 