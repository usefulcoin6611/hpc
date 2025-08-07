"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileEdit, Plus, Search, Eye, Download, Loader2, Filter } from "lucide-react"
import { EditPDIDialog } from "@/components/dialogs/EditPDIDialog"
import { EditInspeksiDialog } from "@/components/dialogs/EditInspeksiDialog"
import { EditPindahLokasiDialog } from "@/components/dialogs/EditPindahLokasiDialog"
import { EditPaintingDialog } from "@/components/dialogs/EditPaintingDialog"
import { EditQCDialog } from "@/components/dialogs/EditQCDialog"
import { EditAssemblyDialog } from "@/components/dialogs/EditAssemblyDialog"
import { useLembarKerja } from "@/hooks/use-lembar-kerja"

export default function UpdateLembarKerjaPage() {
  const [editPDIOpen, setEditPDIOpen] = useState(false)
  const [editInspeksiOpen, setEditInspeksiOpen] = useState(false)
  const [editPindahLokasiOpen, setEditPindahLokasiOpen] = useState(false)
  const [editPaintingOpen, setEditPaintingOpen] = useState(false)
  const [editQCOpen, setEditQCOpen] = useState(false)
  const [editAssemblyOpen, setEditAssemblyOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<any>(null)
  const [selectedNoSeri, setSelectedNoSeri] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loadedDialogData, setLoadedDialogData] = useState<any>(null)
  
  // Filter states
  const [namaBarangFilter, setNamaBarangFilter] = useState<string>("")
  const [kodeBarangFilter, setKodeBarangFilter] = useState<string>("")

  const { lembarKerja, loading, fetchLembarKerja, fetchLembarKerjaByNoForm, updateLembarKerjaByNoForm } = useLembarKerja()

  // Loading states for update operations - track by item ID
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set())

  // Function to extract noSeri from versi (noForm)
  const extractNoSeriFromVersi = (versi: string) => {
    // Format versi: "PD/V1/0000005/2025" -> extract "0000005"
    const parts = versi.split('/')
    return parts.length >= 3 ? parts[2] : ''
  }

  // Function to convert job type enum to user-friendly display name
  const getJobTypeDisplayName = (jenisPekerjaan: string) => {
    switch (jenisPekerjaan) {
      case 'inspeksi_mesin':
        return 'Inspeksi Mesin'
      case 'assembly_staff':
        return 'Assembly'
      case 'qc_staff':
        return 'QC'
      case 'pdi_staff':
        return 'PDI'
      case 'painting_staff':
        return 'Painting'
      case 'pindah_lokasi':
        return 'Pindah Lokasi'
      case 'admin':
        return 'Admin'
      case 'supervisor':
        return 'Supervisor'
      default:
        // Return original value if no mapping found (for backward compatibility)
        return jenisPekerjaan
    }
  }

  // Function to handle update click - edit specific noForm
  const handleUpdateClick = async (item: any) => {
    const noForm = item.versi
    const noSeri = extractNoSeriFromVersi(item.versi)
    const jenisPekerjaan = item.jenisPekerjaan
    
    setSelectedData(item)
    setSelectedNoSeri(noSeri)
    
    // Add item to updating set
    setUpdatingItems(prev => new Set(prev).add(item.id))
    
    try {
      // Load existing data for this specific noForm
      const lembarKerjaData = await fetchLembarKerjaByNoForm(noForm)
      console.log('Loaded lembar kerja data:', lembarKerjaData)
      
      // Store loaded data for dialog
      setLoadedDialogData(lembarKerjaData)
      
      // Open appropriate dialog based on jenis pekerjaan
      if (jenisPekerjaan === "Inspeksi Mesin" || jenisPekerjaan === "inspeksi_mesin") {
        setEditInspeksiOpen(true)
      } 
      else if (jenisPekerjaan === "Assembly" || jenisPekerjaan === "assembly_staff") {
        setEditAssemblyOpen(true)
      }
      else if (jenisPekerjaan === "Painting" || jenisPekerjaan === "painting_staff") {
        setEditPaintingOpen(true)
      }
      else if (jenisPekerjaan === "QC" || jenisPekerjaan === "qc_staff") {
        setEditQCOpen(true)
      }
      else if (jenisPekerjaan === "PDI" || jenisPekerjaan === "pdi_staff") {
        setEditPDIOpen(true)
      }
      else if (jenisPekerjaan === "Pindah Lokasi" || jenisPekerjaan === "pindah_lokasi") {
        setEditPindahLokasiOpen(true)
      }
      else {
        console.error('Unknown job type:', jenisPekerjaan)
      }
    } catch (error) {
      console.error('Error loading data for update:', error)
    } finally {
      // Remove item from updating set
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(item.id)
        return newSet
      })
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    fetchLembarKerja({ search: term })
  }

  // Filter lembar kerja based on search term and filters
  const filteredLembarKerja = lembarKerja.filter((item: any) => {
    const matchesSearch = searchTerm === "" || 
      item.versi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tipeMesin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jenisPekerjaan.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesNamaBarang = namaBarangFilter === "" || 
      item.tipeMesin.toLowerCase().includes(namaBarangFilter.toLowerCase())
    
    const kodeBarang = item.kodeBarang // Use the actual kodeBarang from the item
    const matchesKodeBarang = kodeBarangFilter === "" || 
      kodeBarang.toLowerCase().includes(kodeBarangFilter.toLowerCase())
    
    return matchesSearch && matchesNamaBarang && matchesKodeBarang
  })

  // Handle dialog submissions - update specific noForm directly
  const handleDialogSubmit = async (data: any) => {
    console.log('Dialog submitted with data:', data)
    
    if (!selectedData) {
      console.error('No selected data found')
      return false
    }
    
    try {
      // Add item to updating set for dialog submission
      setUpdatingItems(prev => new Set(prev).add(selectedData.id))
      
      // Update specific noForm using the new API
      const noForm = selectedData.versi
      await updateLembarKerjaByNoForm(noForm, {
        items: data.items,
        keterangan: data.keterangan
      })
      
      // Close all dialogs
      setEditPDIOpen(false)
      setEditInspeksiOpen(false)
      setEditPindahLokasiOpen(false)
      setEditPaintingOpen(false)
      setEditQCOpen(false)
      setEditAssemblyOpen(false)
      
      // Reset dialog data
      setLoadedDialogData(null)
      setSelectedData(null)
      setSelectedNoSeri("")
      
      // Refresh the lembar kerja data
      fetchLembarKerja()
      
      return true
    } catch (error) {
      console.error('Error updating data:', error)
      return false
    } finally {
      // Remove item from updating set
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(selectedData.id)
        return newSet
      })
    }
  }

  return (
    <div className="space-y-6 pb-8 pt-4 lg:pt-0 animate-fadeIn">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">Update Lembar Kerja</h1>
        <div className="text-sm text-gray-500">Total: {filteredLembarKerja.length} lembar kerja</div>
      </div>

      <div className="h-px w-full bg-gray-200" />

      {/* Filter and Search Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Section - Left */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          
          {/* Nama Barang Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Nama Barang</label>
            <Input
              placeholder="Filter nama barang..."
              value={namaBarangFilter}
              onChange={(e) => setNamaBarangFilter(e.target.value)}
              className="w-full rounded-lg border-gray-200 bg-white pl-3 py-2 text-sm focus:border-primary focus:ring-primary sm:w-48"
            />
          </div>
          
          {/* Kode Barang Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Kode Barang</label>
            <Input
              placeholder="Filter kode barang..."
              value={kodeBarangFilter}
              onChange={(e) => setKodeBarangFilter(e.target.value)}
              className="w-full rounded-lg border-gray-200 bg-white pl-3 py-2 text-sm focus:border-primary focus:ring-primary sm:w-48"
            />
          </div>
          
          {/* Clear Filters Button */}
          {(namaBarangFilter || kodeBarangFilter) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNamaBarangFilter("")
                setKodeBarangFilter("")
              }}
              className="mt-6 sm:mt-0 h-8 px-3 text-xs"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Search Section - Right */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="contoh: PD/V1/no/2025"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border-gray-200 bg-white pl-4 py-2 pr-10 focus:border-primary focus:ring-primary sm:w-64"
          />
        </div>
      </div>

      {/* Info jumlah data */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan {filteredLembarKerja.length} dari {lembarKerja.length} data
          {(namaBarangFilter || kodeBarangFilter) && (
            <span className="ml-2">
              (Filter: {namaBarangFilter && `Nama: ${namaBarangFilter}`} {namaBarangFilter && kodeBarangFilter && ', '} {kodeBarangFilter && `Kode: ${kodeBarangFilter}`})
            </span>
          )}
        </p>
      </div>

      {/* Mobile card view */}
      <div className="grid gap-4 lg:hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : filteredLembarKerja.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-3">
              <FileEdit className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Belum ada lembar kerja</h3>
            <p className="text-gray-500">Mulai dengan menambahkan lembar kerja baru</p>
          </div>
        ) : (
          filteredLembarKerja.map((item: any) => (
          <div key={item.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Tanggal</p>
                <p className="text-gray-800">{new Date(item.tanggal).toLocaleDateString('id-ID')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Versi Form</p>
                <p className="text-sm text-gray-600">{item.versi}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Jenis Pekerjaan</p>
                <p className="text-sm text-gray-600">{getJobTypeDisplayName(item.jenisPekerjaan)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Nama Barang</p>
                <p className="text-sm text-gray-600">{item.tipeMesin}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Kode Barang</p>
                <p className="text-sm text-gray-600">{item.kodeBarang}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Catatan Pembaruan</p>
                <p className="text-sm text-gray-600">{item.catatanPembaruan}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark">
                <Eye className="mr-1 h-3 w-3" />
                Detail
              </Button>
              <Button 
                className="flex-1 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-500"
                onClick={() => handleUpdateClick(item)}
                disabled={updatingItems.has(item.id)}
              >
                {updatingItems.has(item.id) ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <FileEdit className="mr-1 h-3 w-3" />
                )}
                Update
              </Button>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-soft lg:block">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : filteredLembarKerja.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-3">
              <FileEdit className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Belum ada lembar kerja</h3>
            <p className="text-gray-500">Mulai dengan menambahkan lembar kerja baru</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-sky-100">
                  <TableHead className="w-12 rounded-tl-xl py-3 text-center font-medium text-gray-600">No</TableHead>
                  <TableHead className="py-3 font-medium text-gray-600">Tanggal</TableHead>
                  <TableHead className="py-3 font-medium text-gray-600">Versi Form</TableHead>
                  <TableHead className="py-3 font-medium text-gray-600">Jenis Pekerjaan</TableHead>
                  <TableHead className="py-3 font-medium text-gray-600">Nama Barang</TableHead>
                  <TableHead className="py-3 font-medium text-gray-600">Kode Barang</TableHead>
                  <TableHead className="py-3 font-medium text-gray-600">Catatan Pembaruan</TableHead>
                  <TableHead className="rounded-tr-xl py-3 text-center font-medium text-gray-600">Pengaturan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLembarKerja.map((item: any, index: number) => (
                <TableRow key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <TableCell className="text-center font-medium text-gray-600">{index + 1}</TableCell>
                  <TableCell className="text-gray-800">{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="font-medium text-gray-800">{item.versi}</TableCell>
                  <TableCell className="text-gray-800">{getJobTypeDisplayName(item.jenisPekerjaan)}</TableCell>
                  <TableCell className="text-gray-800">{item.tipeMesin}</TableCell>
                  <TableCell className="text-gray-800">{item.kodeBarang}</TableCell>
                  <TableCell className="text-gray-800">{item.catatanPembaruan}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button className="h-8 rounded-lg bg-primary px-3 text-xs font-medium text-white hover:bg-primary-dark">
                        <Eye className="mr-1 h-3 w-3" />
                        Detail
                      </Button>
                      <Button 
                        className="h-8 rounded-lg bg-amber-400 px-3 text-xs font-medium text-white hover:bg-amber-500"
                        onClick={() => handleUpdateClick(item)}
                        disabled={updatingItems.has(item.id)}
                      >
                        {updatingItems.has(item.id) ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <FileEdit className="mr-1 h-3 w-3" />
                        )}
                        Update
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}
      </div>

      {/* Edit Dialogs */}
      <EditPDIDialog
        isOpen={editPDIOpen}
        onClose={() => {
          setEditPDIOpen(false)
          setLoadedDialogData(null)
          setSelectedData(null)
          setSelectedNoSeri("")
        }}
        onSubmit={handleDialogSubmit}
        noSeri={selectedNoSeri}
        namaBarang={selectedData?.tipeMesin || ''}
        currentItems={loadedDialogData?.items || []}
      />

      <EditInspeksiDialog
        isOpen={editInspeksiOpen}
        onClose={() => {
          setEditInspeksiOpen(false)
          setLoadedDialogData(null)
          setSelectedData(null)
          setSelectedNoSeri("")
        }}
        onSubmit={handleDialogSubmit}
        noSeri={selectedNoSeri}
        namaBarang={selectedData?.tipeMesin || ''}
        currentItems={loadedDialogData?.items || []}
      />

      <EditPindahLokasiDialog
        isOpen={editPindahLokasiOpen}
        onClose={() => {
          setEditPindahLokasiOpen(false)
          setLoadedDialogData(null)
          setSelectedData(null)
          setSelectedNoSeri("")
        }}
        onSubmit={handleDialogSubmit}
        noSeri={selectedNoSeri}
        namaBarang={selectedData?.tipeMesin || ''}
      />

      <EditPaintingDialog
        isOpen={editPaintingOpen}
        onClose={() => {
          setEditPaintingOpen(false)
          setLoadedDialogData(null)
          setSelectedData(null)
          setSelectedNoSeri("")
        }}
        onSubmit={handleDialogSubmit}
        noSeri={selectedNoSeri}
        namaBarang={selectedData?.tipeMesin || ''}
        currentItems={loadedDialogData?.items || []}
      />

      <EditQCDialog
        isOpen={editQCOpen}
        onClose={() => {
          setEditQCOpen(false)
          setLoadedDialogData(null)
          setSelectedData(null)
          setSelectedNoSeri("")
        }}
        onSubmit={handleDialogSubmit}
        noSeri={selectedNoSeri}
        namaBarang={selectedData?.tipeMesin || ''}
        currentItems={loadedDialogData?.items || []}
      />

      <EditAssemblyDialog
        isOpen={editAssemblyOpen}
        onClose={() => {
          setEditAssemblyOpen(false)
          setLoadedDialogData(null)
          setSelectedData(null)
          setSelectedNoSeri("")
        }}
        onSubmit={handleDialogSubmit}
        noSeri={selectedNoSeri}
        namaBarang={selectedData?.tipeMesin || ''}
        currentItems={loadedDialogData?.items || []}
      />

    </div>
  )
}
