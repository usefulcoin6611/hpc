"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { ChevronsLeft, ChevronsRight } from "lucide-react"
import { Input } from "@/components/ui/input"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Download, FileText, PieChart, ChevronRight, LineChart, Printer, Search, X } from "lucide-react"
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
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  
  // Hook untuk data inventaris
  const { inventoryData, loading, fetchInventoryReport } = useLaporanInventaris()

  // Filter data berdasarkan search term
  const filteredData = inventoryData.filter(item => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      item.kodeBarang.toLowerCase().includes(searchLower) ||
      item.namaBarang.toLowerCase().includes(searchLower)
    )
  })

  // Pagination for preview table
  const total = filteredData.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const currentPage = Math.min(page, totalPages)
  const startIndex = total > 0 ? (currentPage - 1) * limit + 1 : 0
  const endIndex = Math.min(currentPage * limit, total)
  const pageItems = filteredData.slice((currentPage - 1) * limit, (currentPage - 1) * limit + limit)

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
      ...filteredData.map(item => [
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
      ...filteredData.map(item => [
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
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    
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
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-medium text-gray-800">Preview Laporan</h3>
                        
                        {/* Search Box */}
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="kode barang / nama barang"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 rounded-lg border-gray-200 bg-white pl-3 pr-10 py-2 focus:border-primary focus:ring-primary"
                          />
                          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          {searchTerm && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSearchTerm("")}
                              className="absolute right-8 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-gray-100"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Search Results Info */}
                        {searchTerm && (
                          <div className="text-sm text-gray-600">
                            {filteredData.length} dari {inventoryData.length} item
                          </div>
                        )}
                      </div>
                      
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
                          ) : filteredData.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8">
                                <div className="text-gray-500">
                                  {searchTerm 
                                    ? `Tidak ada data yang cocok dengan pencarian "${searchTerm}"`
                                    : "Tidak ada data inventaris untuk periode ini"
                                  }
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            pageItems.map((item, index) => (
                              <TableRow key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                                <TableCell className="text-center font-medium text-gray-600">{(currentPage - 1) * limit + index + 1}</TableCell>
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

                    {/* Pagination Controls - Center & Compact */}
                    {total > 0 && (
                      <div className="mt-4 w-full flex items-center justify-center gap-3 overflow-x-auto whitespace-nowrap px-2">
                        {/* Info jumlah data */}
                        <div className="inline-flex items-center text-xs text-gray-600 text-center">
                          Menampilkan <span className="mx-1 font-medium">{startIndex}</span>–<span className="mx-1 font-medium">{endIndex}</span> dari <span className="ml-1 font-medium">{total}</span> data
                        </div>

                        {/* Page size selector */}
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <Select
                            value={String(limit)}
                            onValueChange={(val) => {
                              const newLimit = parseInt(val)
                              setPage(1)
                              setLimit(newLimit)
                            }}
                          >
                            <SelectTrigger className="h-8 w-[80px]">
                              <SelectValue placeholder={String(limit)} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
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
                                  if (currentPage > 1) setPage(1)
                                }}
                                className={(currentPage === 1 ? "pointer-events-none opacity-50 " : "") + "h-8 px-2"}
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
                                  if (currentPage > 1) setPage(currentPage - 1)
                                }}
                                className={(currentPage === 1 ? "pointer-events-none opacity-50 " : "") + "h-8"}
                              />
                            </PaginationItem>

                            {/* Indicator */}
                            <PaginationItem>
                              <span className="px-2 text-xs text-gray-700">
                                Halaman <span className="font-medium">{currentPage}</span> dari <span className="font-medium">{totalPages}</span>
                              </span>
                            </PaginationItem>

                            {/* Next */}
                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (currentPage < totalPages) setPage(currentPage + 1)
                                }}
                                className={(currentPage >= totalPages ? "pointer-events-none opacity-50 " : "") + "h-8"}
                              />
                            </PaginationItem>

                            {/* Last */}
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (currentPage < totalPages) setPage(totalPages)
                                }}
                                className={(currentPage >= totalPages ? "pointer-events-none opacity-50 " : "") + "h-8 px-2"}
                              >
                                <ChevronsRight className="h-4 w-4" />
                              </PaginationLink>
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}

                    {/* Mobile card view */}
                    <div className="grid gap-4 lg:hidden">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-gray-500">Loading...</div>
                        </div>
                      ) : filteredData.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-gray-500">
                            {searchTerm 
                              ? `Tidak ada data yang cocok dengan pencarian "${searchTerm}"`
                              : "Tidak ada data inventaris untuk periode ini"
                            }
                          </div>
                        </div>
                      ) : (
                        filteredData.map((item, index) => (
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
