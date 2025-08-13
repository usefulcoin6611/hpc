"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OptimizedSearch } from "@/components/ui/optimized-search"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Package } from "lucide-react"
import { AddBarangKeluarDialog } from "@/components/dialogs/AddBarangKeluarDialog"
import { DetailBarangKeluarDialog } from "@/components/dialogs/DetailBarangKeluarDialog"
import { EditBarangKeluarDialog } from "@/components/dialogs/EditBarangKeluarDialog"
import { useBarangKeluar } from "@/hooks/use-barang-keluar"

export default function BarangKeluarPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedBarangKeluarId, setSelectedBarangKeluarId] = useState<number | null>(null)
  const { barangKeluar, loading, createBarangKeluar, updateBarangKeluar, fetchBarangKeluar } = useBarangKeluar()

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    fetchBarangKeluar({ search: term })
  }

  const clearSearch = () => {
    setSearchTerm("")
    fetchBarangKeluar()
  }

  const handleDetailClick = (id: number) => {
    setSelectedBarangKeluarId(id)
    setShowDetailDialog(true)
  }

  const handleEditClick = (id: number) => {
    setSelectedBarangKeluarId(id)
    setShowEditDialog(true)
  }

  const handleAddBarangKeluar = async (data: {
    tanggal: Date
    deliveryNo?: string
    shipVia?: string
    tujuan: string
    keterangan: string
    items: any[]
  }) => {
    return await createBarangKeluar(data)
  }

  const handleEditBarangKeluar = async (data: {
    tanggal: Date
    deliveryNo?: string
    shipVia?: string
    tujuan: string
    keterangan: string
    items: any[]
  }) => {
    if (!selectedBarangKeluarId) return false
    
    const success = await updateBarangKeluar(selectedBarangKeluarId, data)
    if (success) {
      setShowEditDialog(false)
    }
    return success
  }

  return (
    <div className="h-screen flex flex-col animate-fadeIn">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 space-y-6 pb-6 pt-4 lg:pt-0">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Barang Keluar</h1>
          <p className="text-muted-foreground">
            Kelola data barang yang keluar dari gudang.
          </p>
          {/* Search Info */}
          {searchTerm && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Search aktif:</span>
              <Badge variant="secondary" className="text-xs">
                {searchTerm}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left side - Tambah Barang Keluar button */}
          <div className="flex flex-wrap gap-3">
            <Button 
              className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-white hover:bg-primary/90 sm:px-4"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4" />
              Tambah Barang Keluar
            </Button>
          </div>

          {/* Right side - Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <OptimizedSearch
              placeholder="no Delivery, no seri, tujuan"
              onSearch={handleSearch}
              className="max-w-md"
              variant="modern"
              size="md"
            />
            
            {/* Clear Search Button */}
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearSearch}
                className="mt-6 sm:mt-0 h-8 px-3 text-xs"
              >
                Clear Search
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Section with Table */}
      <div className="flex-1">
        {/* Mobile card view */}
        <div className="lg:hidden">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
            </div>
          ) : barangKeluar.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada data barang keluar</h3>
              <p className="text-sm text-gray-600">
                Mulai dengan menambahkan transaksi barang keluar pertama
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-4">
              {barangKeluar.map((item, index) => (
                  <div key={item.id} className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        #{item.noTransaksi}
                      </span>
                      <Badge variant={item.status === 'approved' ? 'secondary' : 'outline'}>
                        {item.status === 'approved' ? 'Disetujui' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Tanggal</p>
                          <p className="font-medium">
                            {new Date(item.tanggal).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Tujuan</p>
                          <p className="font-medium">{item.tujuan || '-'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Keterangan</p>
                        <p className="text-sm">{item.keterangan || '-'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Item</p>
                          <p className="text-sm">{item.totalItems}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="text-sm">{item.status === 'approved' ? 'Disetujui' : 'Pending'}</p>
                        </div>
                      </div>
                      {item.noSeriList && item.noSeriList.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">No Seri</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.noSeriList.map((noSeri: string, idx: number) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {noSeri}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        className="flex-1 rounded-lg bg-gray-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-600"
                        onClick={() => handleDetailClick(item.id)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Detail
                      </Button>
                      <Button 
                        className="flex-1 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-500"
                        onClick={() => handleEditClick(item.id)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Desktop table view */}
        <div className="hidden lg:block">
          {loading ? (
            <div className="rounded-xl border border-gray-100 bg-white shadow-soft">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow className="bg-sky-100">
                    <TableHead className="w-12 rounded-tl-xl py-3 text-center font-medium text-gray-600">No</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">Delivery No</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">Tanggal</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">Ship to</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">No Seri</TableHead>
                    <TableHead className="rounded-tr-xl py-3 text-center font-medium text-gray-600">Pengaturan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2 text-gray-600">Memuat data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : barangKeluar.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white shadow-soft">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow className="bg-sky-100">
                    <TableHead className="w-12 rounded-tl-xl py-3 text-center font-medium text-gray-600">No</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">Delivery No</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">Tanggal</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">Ship to</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">No Seri</TableHead>
                    <TableHead className="rounded-tr-xl py-3 text-center font-medium text-gray-600">Pengaturan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <Package className="h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada data barang keluar</h3>
                        <p className="text-sm text-gray-600">
                          Mulai dengan menambahkan transaksi barang keluar pertama
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-full rounded-xl border border-gray-100 bg-white shadow-soft">
              <div className="h-full overflow-y-auto">
                <Table>
                                  <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow className="bg-sky-100">
                    <TableHead className="w-12 rounded-tl-xl py-3 text-center font-medium text-gray-600">No</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">Delivery No</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">Tanggal</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">Ship to</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">No Seri</TableHead>
                    <TableHead className="rounded-tr-xl py-3 text-center font-medium text-gray-600">Pengaturan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {barangKeluar.map((item, index) => (
                    <TableRow key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <TableCell className="text-center font-medium text-gray-600">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">
                        {item.deliveryNo || '-'}
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-gray-800">
                        {item.tujuan || '-'}
                      </TableCell>
                      <TableCell className="text-gray-800">
                        {item.noSeriList && item.noSeriList.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.noSeriList.map((noSeri: string, idx: number) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {noSeri}
                              </span>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button 
                            className="h-8 rounded-lg bg-gray-500 px-3 text-xs font-medium text-white hover:bg-gray-600"
                            onClick={() => handleDetailClick(item.id)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Detail
                          </Button>
                          <Button 
                            className="h-8 rounded-lg bg-amber-400 px-3 text-xs font-medium text-white hover:bg-amber-500"
                            onClick={() => handleEditClick(item.id)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Barang Keluar Dialog */}
      <AddBarangKeluarDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleAddBarangKeluar}
      />

      {/* Detail Barang Keluar Dialog */}
      <DetailBarangKeluarDialog
        isOpen={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        barangKeluarId={selectedBarangKeluarId}
      />

      {/* Edit Barang Keluar Dialog */}
      <EditBarangKeluarDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        barangKeluarId={selectedBarangKeluarId}
        onSubmit={handleEditBarangKeluar}
      />
    </div>
  )
}
