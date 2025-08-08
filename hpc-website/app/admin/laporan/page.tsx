"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Download, FileText, PieChart, ChevronRight, LineChart, Printer } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { useLaporanInventaris } from "@/hooks/use-laporan-inventaris"

// Jenis laporan yang tersedia
const reportTypes = [
  {
    id: "inventory",
    name: "Laporan Inventaris",
    icon: <BarChart className="h-5 w-5" />,
    description: "Laporan stok barang dan inventaris gudang",
  },
]

// Data kode barang untuk dropdown
const itemCodes = [
  { value: "70790030035", label: "70790030035 - HUNTER Tire Changer TCX 45" },
  { value: "70790020019", label: "70790020019 - HUNTER Smart Weight Pro" },
  { value: "70790030012", label: "70790030012 - HUNTER Hawkeye Elite" },
  { value: "MTR-001", label: "MTR-001 - Motor Penggerak" },
  { value: "GRB-002", label: "GRB-002 - Gearbox Transmisi" },
  { value: "BRG-003", label: "BRG-003 - Bearing Industrial" },
]

// Data periode untuk dropdown
const periods = [
  { value: "all", label: "Semua Periode" },
  { value: "today", label: "Hari Ini" },
  { value: "yesterday", label: "Kemarin" },
  { value: "this-week", label: "Minggu Ini" },
  { value: "last-week", label: "Minggu Lalu" },
  { value: "this-month", label: "Bulan Ini" },
  { value: "last-month", label: "Bulan Lalu" },
  { value: "this-year", label: "Tahun Ini" },
]

export default function LaporanPage() {
  // Form state
  const [selectedItemCode, setSelectedItemCode] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  
  // Hook untuk data inventaris
  const { inventoryData, loading, fetchInventoryReport } = useLaporanInventaris()

  // Auto-fetch data on page load
  useEffect(() => {
    fetchInventoryReport({ period: selectedPeriod })
  }, [])

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    fetchInventoryReport({ period })
  }

  // Get period display text
  const getPeriodDisplayText = (period: string) => {
    const periodData = periods.find(p => p.value === period)
    return periodData ? periodData.label : "Semua Periode"
  }

  const handleDownloadExcel = () => {
    // Convert data to Excel format
    const headers = ['No', 'Kode Barang', 'Nama Barang', 'Total Qty', 'Qty Ready', 'Qty Not Ready']
    const csvContent = [
      headers.join(','),
      ...inventoryData.map(item => [
        item.id,
        item.kodeBarang,
        `"${item.namaBarang}"`,
        item.totalQty,
        item.qtyReady,
        item.qtyNotReady
      ].join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `laporan-inventaris-${getPeriodDisplayText(selectedPeriod).toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadCSV = () => {
    // Convert data to CSV format
    const headers = ['No', 'Kode Barang', 'Nama Barang', 'Total Qty', 'Qty Ready', 'Qty Not Ready']
    const csvContent = [
      headers.join(','),
      ...inventoryData.map(item => [
        item.id,
        item.kodeBarang,
        `"${item.namaBarang}"`,
        item.totalQty,
        item.qtyReady,
        item.qtyNotReady
      ].join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `laporan-inventaris-${getPeriodDisplayText(selectedPeriod).toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="h-screen flex flex-col animate-fadeIn">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 space-y-6 pb-6 pt-4 lg:pt-0">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
          <p className="text-muted-foreground">
            Generate dan kelola berbagai jenis laporan untuk monitoring sistem inventaris.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 min-h-0">
        <div className="h-full overflow-y-auto">
          <div className="space-y-6 p-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Laporan Inventaris</CardTitle>
                <p className="text-sm text-gray-500">Laporan stok barang dan inventaris gudang</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Periode Laporan</label>
                    <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                      <SelectTrigger className="w-full rounded-xl border-gray-200">
                        <SelectValue placeholder="Pilih periode" />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map((period) => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Period Info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Periode yang dipilih:</span> {getPeriodDisplayText(selectedPeriod)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Menampilkan {inventoryData.length} item inventaris
                  </p>
                </div>

                <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-800">Preview Laporan</h3>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleDownloadExcel}
                          className="h-8 rounded-lg bg-primary px-3 text-xs font-medium text-white hover:bg-primary-dark"
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Download Excel
                        </Button>
                        <Button 
                          onClick={handleDownloadCSV}
                          className="h-8 rounded-lg bg-green-600 px-3 text-xs font-medium text-white hover:bg-green-700"
                        >
                          <FileText className="mr-1 h-3 w-3" />
                          Download CSV
                        </Button>
                        <Button 
                          onClick={handlePrint}
                          className="h-8 rounded-lg bg-amber-500 px-3 text-xs font-medium text-white hover:bg-amber-600"
                        >
                          <Printer className="mr-1 h-3 w-3" />
                          Print
                        </Button>
                      </div>
                    </div>

                    {/* Desktop table view */}
                    <div className="hidden lg:block rounded-xl border border-gray-300 bg-white overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-sky-100">
                            <TableHead className="w-12 rounded-tl-xl py-3 text-center font-medium text-gray-700">No</TableHead>
                            <TableHead className="py-3 font-medium text-gray-700">Kode Barang</TableHead>
                            <TableHead className="py-3 font-medium text-gray-700">Nama Barang</TableHead>
                            <TableHead className="py-3 text-center font-medium text-gray-700">Total Qty</TableHead>
                            <TableHead className="py-3 text-center font-medium text-gray-700">Qty Ready</TableHead>
                            <TableHead className="rounded-tr-xl py-3 text-center font-medium text-gray-700">Qty Not Ready</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8">
                                <div className="text-gray-500">Loading...</div>
                              </TableCell>
                            </TableRow>
                          ) : inventoryData.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8">
                                <div className="text-gray-500">Tidak ada data inventaris untuk periode ini</div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            inventoryData.map((item, index) => (
                              <TableRow key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                                <TableCell className="text-center font-medium text-gray-600">{index + 1}</TableCell>
                                <TableCell className="text-gray-800">{item.kodeBarang}</TableCell>
                                <TableCell className="text-gray-800">{item.namaBarang}</TableCell>
                                <TableCell className="text-center text-gray-800">{item.totalQty}</TableCell>
                                <TableCell className="text-center text-gray-800">{item.qtyReady}</TableCell>
                                <TableCell className="text-center text-gray-800">{item.qtyNotReady}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile card view */}
                    <div className="grid gap-4 lg:hidden">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-gray-500">Loading...</div>
                        </div>
                      ) : inventoryData.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-gray-500">Tidak ada data inventaris untuk periode ini</div>
                        </div>
                      ) : (
                        inventoryData.map((item, index) => (
                          <div key={item.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="font-medium text-gray-800">#{index + 1}</span>
                              <span className="text-sm text-gray-500">{item.kodeBarang}</span>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs text-gray-500">Nama Barang</p>
                                <p className="text-sm text-gray-800">{item.namaBarang}</p>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500">Total Qty</p>
                                  <p className="text-sm font-medium text-gray-800">{item.totalQty}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Qty Ready</p>
                                  <p className="text-sm font-medium text-green-600">{item.qtyReady}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Qty Not Ready</p>
                                  <p className="text-sm font-medium text-red-600">{item.qtyNotReady}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
