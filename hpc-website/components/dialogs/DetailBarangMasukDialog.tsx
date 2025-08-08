"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Printer, Download } from "lucide-react"
import { IncomingItemDetail, IncomingItemWithDetails } from "@/types/barang-masuk"

interface DetailBarangMasukDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedItem: IncomingItemWithDetails | null
}

interface FlattenedRow {
  rowNumber: number
  tanggal: string
  kodeBarang: string
  namaBarang: string
  qty: number
  noSeri: string
  kodeKedatangan: string
  keterangan: string
}

export function DetailBarangMasukDialog({
  isOpen,
  onOpenChange,
  selectedItem,
}: DetailBarangMasukDialogProps) {
  // Generate flattened table data
  const generateFlattenedData = (): FlattenedRow[] => {
    if (!selectedItem) return []
    
    const flattenedData: FlattenedRow[] = []
    let rowNumber = 1
    
    selectedItem.details.forEach((detail) => {
      if (detail.units && detail.units.length > 0) {
        detail.units.forEach((unit) => {
          flattenedData.push({
            rowNumber,
            tanggal: selectedItem.tanggal,
            kodeBarang: '-', // Placeholder since kodeBarang is not in the type
            namaBarang: detail.namaBarang,
            qty: 1,
            noSeri: unit.noSeri || '-',
            kodeKedatangan: selectedItem.kodeKedatangan,
            keterangan: unit.keterangan || '-',
          })
          rowNumber++
        })
      } else {
        // If no units, create one row with default values
        flattenedData.push({
          rowNumber,
          tanggal: selectedItem.tanggal,
          kodeBarang: '-', // Placeholder since kodeBarang is not in the type
          namaBarang: detail.namaBarang,
          qty: detail.jumlah,
          noSeri: '-',
          kodeKedatangan: selectedItem.kodeKedatangan,
          keterangan: '-',
        })
        rowNumber++
      }
    })
    
    return flattenedData
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow && selectedItem) {
      const flattenedData = generateFlattenedData()
      
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Detail Barang Masuk - ${selectedItem.kodeKedatangan}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 20px; }
            .info-row { display: flex; margin-bottom: 5px; }
            .info-label { font-weight: bold; width: 150px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Detail Barang Masuk</h2>
            <h3>${selectedItem.kodeKedatangan}</h3>
          </div>
          
          <div class="info">
            <div class="info-row">
              <span class="info-label">Tanggal:</span>
              <span>${selectedItem.tanggal}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Nama Supplier:</span>
              <span>${selectedItem.namaSupplier}</span>
            </div>
            <div class="info-row">
              <span class="info-label">No Form:</span>
              <span>${selectedItem.noForm}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span>${selectedItem.status}</span>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Kode Barang</th>
                <th>Nama Barang</th>
                <th>Qty</th>
                <th>No Seri</th>
                <th>Kode Kedatangan</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${flattenedData.map(row => `
                <tr>
                  <td>${row.rowNumber}</td>
                  <td>${row.tanggal}</td>
                  <td>${row.kodeBarang}</td>
                  <td>${row.namaBarang}</td>
                  <td>${row.qty}</td>
                  <td>${row.noSeri}</td>
                  <td>${row.kodeKedatangan}</td>
                  <td>${row.keterangan}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `
      
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleDownloadPDF = () => {
    // For now, we'll use the same print functionality
    // In a real implementation, you might want to use a library like jsPDF
    handlePrint()
  }

  const flattenedData = generateFlattenedData()

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[768px] max-h-[90vh] overflow-y-auto modal-scrollbar">
        <DialogHeader>
          <DialogTitle>Detail Barang Masuk</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai transaksi barang masuk ini.</DialogDescription>
        </DialogHeader>
        {selectedItem && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Tanggal</Label>
                <p className="font-medium text-gray-800">{selectedItem.tanggal}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Kode Kedatangan</Label>
                <p className="font-medium text-gray-800">{selectedItem.kodeKedatangan}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Nama Supplier</Label>
                <p className="text-gray-800">{selectedItem.namaSupplier}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">No Form</Label>
                <p className="text-gray-800">{selectedItem.noForm}</p>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Status</Label>
              <p className="text-gray-800">{selectedItem.status}</p>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Detail Barang</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="rounded-xl"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="rounded-xl"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-soft">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="py-2 text-center text-xs font-medium text-gray-600">No</TableHead>
                    <TableHead className="py-2 text-xs font-medium text-gray-600">Tanggal</TableHead>
                    <TableHead className="py-2 text-xs font-medium text-gray-600">Kode Barang</TableHead>
                    <TableHead className="py-2 text-xs font-medium text-gray-600">Nama Barang</TableHead>
                    <TableHead className="py-2 text-center text-xs font-medium text-gray-600">Qty</TableHead>
                    <TableHead className="py-2 text-xs font-medium text-gray-600">No Seri</TableHead>
                    <TableHead className="py-2 text-xs font-medium text-gray-600">Kode Kedatangan</TableHead>
                    <TableHead className="py-2 text-xs font-medium text-gray-600">Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flattenedData.map((row) => (
                    <TableRow key={row.rowNumber}>
                      <TableCell className="text-center text-sm text-gray-600">{row.rowNumber}</TableCell>
                      <TableCell className="text-sm text-gray-800">{row.tanggal}</TableCell>
                      <TableCell className="text-sm text-gray-600">{row.kodeBarang}</TableCell>
                      <TableCell className="text-sm text-gray-800">{row.namaBarang}</TableCell>
                      <TableCell className="text-center text-sm text-gray-600">{row.qty}</TableCell>
                      <TableCell className="text-sm text-gray-600">{row.noSeri}</TableCell>
                      <TableCell className="text-sm text-gray-600">{row.kodeKedatangan}</TableCell>
                      <TableCell className="text-sm text-gray-600">{row.keterangan}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="rounded-xl">
              Tutup
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 