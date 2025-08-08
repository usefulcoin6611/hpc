"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Download, FileSpreadsheet } from "lucide-react"
import { barangKeluarService } from "@/services/barang-keluar"
import jsPDF from 'jspdf'

interface DetailBarangKeluarItem {
  id: number
  jumlah: number
  barang: {
    id: number
    kode: string
    nama: string
    satuan: string
  }
  detailBarangMasukNoSeri?: {
    id: number
    noSeri: string
  } | null
}

interface BarangKeluarDetail {
  id: number
  tanggal: string
  noTransaksi: string
  deliveryNo?: string
  shipVia?: string
  tujuan: string
  keterangan: string
  totalItems: number
  detailBarangKeluar: DetailBarangKeluarItem[]
}

interface DetailBarangKeluarDialogProps {
  isOpen: boolean
  onClose: () => void
  barangKeluarId: number | null
}

export function DetailBarangKeluarDialog({
  isOpen,
  onClose,
  barangKeluarId
}: DetailBarangKeluarDialogProps) {
  const [barangKeluar, setBarangKeluar] = useState<BarangKeluarDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch barang keluar detail when dialog opens
  useEffect(() => {
    if (isOpen && barangKeluarId) {
      fetchBarangKeluarDetail()
    }
  }, [isOpen, barangKeluarId])

  const fetchBarangKeluarDetail = async () => {
    if (!barangKeluarId) return

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await barangKeluarService.getById(barangKeluarId)
      if (response.success) {
        setBarangKeluar(response.data)
      } else {
        setError('Gagal mengambil detail barang keluar')
      }
    } catch (error) {
      console.error('Error fetching barang keluar detail:', error)
      setError('Terjadi kesalahan saat mengambil detail barang keluar')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setBarangKeluar(null)
    setError(null)
    onClose()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDownloadPDF = () => {
    if (!barangKeluar) return
    
    // Create new PDF document
    const doc = new jsPDF()
    
    // Set font
    doc.setFont('helvetica')
    
    // Title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Detail Barang Keluar', 20, 20)
    
    // Reset font
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    
    // Header information
    let yPosition = 40
    
    doc.setFont('helvetica', 'bold')
    doc.text('Informasi Pengiriman:', 20, yPosition)
    doc.setFont('helvetica', 'normal')
    yPosition += 10
    
    doc.text(`Ship to: ${barangKeluar.tujuan || '-'}`, 20, yPosition)
    yPosition += 8
    
    doc.text(`Description: ${barangKeluar.keterangan || '-'}`, 20, yPosition)
    yPosition += 8
    
    doc.text(`Delivery No: ${barangKeluar.deliveryNo || '-'}`, 20, yPosition)
    yPosition += 8
    
    doc.text(`Tanggal: ${formatDate(barangKeluar.tanggal)}`, 20, yPosition)
    yPosition += 8
    
    doc.text(`Ship Via: ${barangKeluar.shipVia || '-'}`, 20, yPosition)
    yPosition += 15
    
    // Items table header
    doc.setFont('helvetica', 'bold')
    doc.text('Daftar Barang:', 20, yPosition)
    yPosition += 10
    
    // Table headers
    const tableHeaders = ['No Seri', 'Item', 'Item Description', 'Qty']
    const columnWidths = [30, 40, 80, 20]
    let xPosition = 20
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    tableHeaders.forEach((header, index) => {
      doc.text(header, xPosition, yPosition)
      xPosition += columnWidths[index]
    })
    
    yPosition += 8
    
    // Table data
    doc.setFont('helvetica', 'normal')
    barangKeluar.detailBarangKeluar.forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }
      
      xPosition = 20
      doc.text(item.detailBarangMasukNoSeri?.noSeri || '-', xPosition, yPosition)
      xPosition += columnWidths[0]
      
      doc.text(item.barang.kode, xPosition, yPosition)
      xPosition += columnWidths[1]
      
      // Handle long item descriptions
      const description = item.barang.nama
      if (description.length > 30) {
        doc.text(description.substring(0, 30) + '...', xPosition, yPosition)
      } else {
        doc.text(description, xPosition, yPosition)
      }
      xPosition += columnWidths[2]
      
      doc.text(item.jumlah.toString(), xPosition, yPosition)
      
      yPosition += 6
    })
    
    // Footer
    doc.setFont('helvetica', 'bold')
    doc.text(`Total Items: ${barangKeluar.totalItems}`, 20, yPosition + 10)
    
    // Save the PDF
    doc.save(`barang-keluar-${barangKeluar.noTransaksi}.pdf`)
  }

  const handleExportExcel = () => {
    if (!barangKeluar) return
    
    // Prepare data for Excel export
    const excelData = [
      ['Detail Barang Keluar'],
      [''],
      ['Ship to:', barangKeluar.tujuan || '-'],
      ['Description:', barangKeluar.keterangan || '-'],
      ['Delivery No:', barangKeluar.deliveryNo || '-'],
      ['Tanggal:', formatDate(barangKeluar.tanggal)],
      ['Ship Via:', barangKeluar.shipVia || '-'],
      [''],
      ['Daftar Barang:'],
      ['No Seri', 'Item', 'Item Description', 'Qty']
    ]

    // Add items data
    barangKeluar.detailBarangKeluar.forEach((item, index) => {
      excelData.push([
        item.detailBarangMasukNoSeri?.noSeri || '-',
        item.barang.kode,
        item.barang.nama,
        item.jumlah.toString()
      ])
    })

    // Convert to CSV and download
    const csvContent = excelData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `barang-keluar-${barangKeluar.noTransaksi}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }



  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Barang Keluar</DialogTitle>
          <DialogDescription>
            Informasi detail pengiriman barang keluar
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <span>Memuat detail barang keluar...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : barangKeluar ? (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="space-y-4">
              {/* Main row - Ship to, Description, and stacked fields on the right */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              {/* Left Column - Ship to */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Ship to</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md border h-[180px] flex items-start">
                  <p className="text-gray-900">{barangKeluar.tujuan || '-'}</p>
                </div>
              </div>

              {/* Middle Column - Description */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md border h-[180px] flex items-start">
                  <p className="text-gray-900">{barangKeluar.keterangan || '-'}</p>
                </div>
              </div>

              {/* Right Column - Stacked fields */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Delivery No</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    <p className="text-gray-900">{barangKeluar.deliveryNo || '-'}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Tanggal</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    <p className="text-gray-900">{formatDate(barangKeluar.tanggal)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Ship Via</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    <p className="text-gray-900">{barangKeluar.shipVia || '-'}</p>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Daftar Barang</h3>
                <div className="text-sm text-gray-600">
                  Total: {barangKeluar.totalItems} item
                </div>
              </div>

              {barangKeluar.detailBarangKeluar.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Tidak ada barang dalam transaksi ini</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>No Seri</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Item Description</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {barangKeluar.detailBarangKeluar.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono">
                            {item.detailBarangMasukNoSeri?.noSeri || '-'}
                          </TableCell>
                          <TableCell className="font-mono">
                            {item.barang.kode}
                          </TableCell>
                          <TableCell>
                            {item.barang.nama}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.jumlah}
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Empty rows for aesthetics */}
                      {Array.from({ length: Math.max(0, 3 - barangKeluar.detailBarangKeluar.length) }).map((_, index) => (
                        <TableRow key={`empty-${index}`} className="h-12">
                          <TableCell className="border-b border-gray-100"></TableCell>
                          <TableCell className="border-b border-gray-100"></TableCell>
                          <TableCell className="border-b border-gray-100"></TableCell>
                          <TableCell className="border-b border-gray-100"></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Footer with Download and Export buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t mt-6">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 