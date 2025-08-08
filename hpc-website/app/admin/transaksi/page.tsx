"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronRight, Download, FileEdit, Eye, Search, RotateCcw, Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useTransaksi } from "@/hooks/use-transaksi"

import { AddTransaksiDialog } from "@/components/dialogs/AddTransaksiDialog"
import { EditInspeksiDialog } from "@/components/dialogs/EditInspeksiDialog"
import { EditAssemblyDialog } from "@/components/dialogs/EditAssemblyDialog"
import { EditPaintingDialog } from "@/components/dialogs/EditPaintingDialog"
import { EditQCDialog } from "@/components/dialogs/EditQCDialog"
import { EditPDIDialog } from "@/components/dialogs/EditPDIDialog"
import { EditPindahLokasiDialog } from "@/components/dialogs/EditPindahLokasiDialog"
import { pindahLokasiService } from "@/services/pindah-lokasi"

// Import interface dari dialog untuk konsistensi
interface InspeksiItem {
  id?: number
  parameter: string
  hasil: boolean
  keterangan: string
}

interface AssemblyItem {
  id?: number
  parameter: string
  hasil: boolean
  keterangan: string
}

interface PaintingItem {
  id?: number
  parameter: string
  hasil: boolean
  keterangan: string
}

interface QCItem {
  id?: number
  parameter: string
  aktual: string
  standar: string
}

interface PDIItem {
  id?: number
  parameter: string
  pdi: boolean
  keterangan: string
}

export default function TransaksiPage() {
  const {
    transactions,
    isLoading,
    isSearched,
    filter,
    searchTransactions,
    handleSearch,
    resetSearch,
    updateFilter,
    createTransaksi,
    getInspeksiData,
    updateInspeksiData,
    getUsersByJobType,
    getAssemblyData,
    updateAssemblyData,
    getPaintingData,
    updatePaintingData,
    getQCData,
    updateQCData,
    getPDIData,
    updatePDIData,
  } = useTransaksi()

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

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedDetailId, setSelectedDetailId] = useState<number>(0)
  const [selectedNoSeri, setSelectedNoSeri] = useState<string>("")
  const [selectedInspeksiItems, setSelectedInspeksiItems] = useState<InspeksiItem[]>([])
  const [selectedAssemblyItems, setSelectedAssemblyItems] = useState<AssemblyItem[]>([])
  const [selectedPaintingItems, setSelectedPaintingItems] = useState<PaintingItem[]>([])
  const [selectedQCItems, setSelectedQCItems] = useState<QCItem[]>([])
  const [selectedPDIItems, setSelectedPDIItems] = useState<PDIItem[]>([])

  // Dialog states
  const [isInspeksiDialogOpen, setIsInspeksiDialogOpen] = useState(false)
  const [isAssemblyDialogOpen, setIsAssemblyDialogOpen] = useState(false)
  const [isPaintingDialogOpen, setIsPaintingDialogOpen] = useState(false)
  const [isQCDialogOpen, setIsQCDialogOpen] = useState(false)
  const [isPDIDialogOpen, setIsPDIDialogOpen] = useState(false)
  const [isPindahLokasiDialogOpen, setIsPindahLokasiDialogOpen] = useState(false)
  
  // Detail dialog states
  const [isDetailInspeksiDialogOpen, setIsDetailInspeksiDialogOpen] = useState(false)
  const [selectedDetailInspeksiItems, setSelectedDetailInspeksiItems] = useState<InspeksiItem[]>([])
  const [selectedDetailNoSeri, setSelectedDetailNoSeri] = useState<string>("")
  const [selectedDetailNamaBarang, setSelectedDetailNamaBarang] = useState<string>("")
  const [selectedDetailJenisPekerjaan, setSelectedDetailJenisPekerjaan] = useState<string>("")
  
  // Detail painting dialog states
  const [isDetailPaintingDialogOpen, setIsDetailPaintingDialogOpen] = useState(false)
  const [selectedDetailPaintingItems, setSelectedDetailPaintingItems] = useState<PaintingItem[]>([])
  
  // Detail QC dialog states
  const [isDetailQCDialogOpen, setIsDetailQCDialogOpen] = useState(false)
  const [selectedDetailQCItems, setSelectedDetailQCItems] = useState<QCItem[]>([])
  
  // Detail PDI dialog states
  const [isDetailPDIDialogOpen, setIsDetailPDIDialogOpen] = useState(false)
  const [selectedDetailPDIItems, setSelectedDetailPDIItems] = useState<PDIItem[]>([])
  
  // Detail Pindah Lokasi dialog states
  const [isDetailPindahLokasiDialogOpen, setIsDetailPindahLokasiDialogOpen] = useState(false)
  
  // Detail Assembly dialog states
  const [isDetailAssemblyDialogOpen, setIsDetailAssemblyDialogOpen] = useState(false)
  const [selectedDetailAssemblyItems, setSelectedDetailAssemblyItems] = useState<AssemblyItem[]>([])


  const handleNewClick = (transaction: any) => {
    setSelectedNoSeri(transaction.noSeri)
    
    // Gunakan detailBarangMasukNoSeriId yang sudah ada di data
    if (transaction.detailBarangMasukNoSeriId) {
      setSelectedDetailId(transaction.detailBarangMasukNoSeriId)
    } else {
      // Fallback untuk baris pertama (detail row)
      const detailId = parseInt(transaction.id.toString().split('-')[1] || '0')
      setSelectedDetailId(detailId)
    }
    
    setIsAddDialogOpen(true)
  }

  const handleUpdateClick = async (transaction: any) => {
    // Untuk baris pertama (isDetailRow = true) - tidak bisa diupdate
    if (transaction.isDetailRow) {
      console.log('Update tidak tersedia untuk baris pertama')
      return
    } 
    // Untuk baris transaksi dengan jenis pekerjaan "Inspeksi Mesin"
    else if (transaction.jenisPekerjaan === "Inspeksi Mesin" || transaction.jenisPekerjaan === "inspeksi_mesin") {
      setSelectedNoSeri(transaction.noSeri)
      
      // Load existing inspeksi data
      try {
        const inspeksiData = await getInspeksiData(transaction.noSeri)
        console.log('Loaded inspeksi data:', inspeksiData) // Debug log
        setSelectedInspeksiItems(inspeksiData)
      } catch (error) {
        console.error('Error loading inspeksi data:', error)
        setSelectedInspeksiItems([])
      }
      
      setIsInspeksiDialogOpen(true)
    } 
    // Untuk baris transaksi dengan jenis pekerjaan "Assembly"
    else if (transaction.jenisPekerjaan === "Assembly" || transaction.jenisPekerjaan === "assembly_staff") {
      setSelectedNoSeri(transaction.noSeri)
      
      // Load existing assembly data
      try {
        const assemblyData = await getAssemblyData(transaction.noSeri)
        console.log('Loaded assembly data:', assemblyData) // Debug log
        setSelectedAssemblyItems(assemblyData)
      } catch (error) {
        console.error('Error loading assembly data:', error)
        setSelectedAssemblyItems([])
      }
      
      setIsAssemblyDialogOpen(true)
    }
    // Untuk baris transaksi dengan jenis pekerjaan "Painting"
    else if (transaction.jenisPekerjaan === "Painting" || transaction.jenisPekerjaan === "painting_staff") {
      setSelectedNoSeri(transaction.noSeri)
      
      // Load existing painting data
      try {
        const paintingData = await getPaintingData(transaction.noSeri)
        console.log('Loaded painting data:', paintingData) // Debug log
        setSelectedPaintingItems(paintingData)
      } catch (error) {
        console.error('Error loading painting data:', error)
        setSelectedPaintingItems([])
      }
      
      setIsPaintingDialogOpen(true)
    }
    // Untuk baris transaksi dengan jenis pekerjaan "QC"
    else if (transaction.jenisPekerjaan === "QC" || transaction.jenisPekerjaan === "qc_staff") {
      setSelectedNoSeri(transaction.noSeri)
      
      // Load existing QC data
      try {
        const qcData = await getQCData(transaction.noSeri)
        console.log('Loaded QC data:', qcData) // Debug log
        setSelectedQCItems(qcData)
      } catch (error) {
        console.error('Error loading QC data:', error)
        setSelectedQCItems([])
      }
      
      setIsQCDialogOpen(true)
    }
    // Untuk baris transaksi dengan jenis pekerjaan "PDI"
    else if (transaction.jenisPekerjaan === "PDI" || transaction.jenisPekerjaan === "pdi_staff") {
      setSelectedNoSeri(transaction.noSeri)
      
      // Load existing PDI data
      try {
        const pdiData = await getPDIData(transaction.noSeri)
        console.log('Loaded PDI data:', pdiData) // Debug log
        setSelectedPDIItems(pdiData)
      } catch (error) {
        console.error('Error loading PDI data:', error)
        setSelectedPDIItems([])
      }
      
      setIsPDIDialogOpen(true)
    }
    // Untuk baris transaksi dengan jenis pekerjaan "Pindah Lokasi"
    else if (transaction.jenisPekerjaan === "Pindah Lokasi" || transaction.jenisPekerjaan === "pindah_lokasi") {
      setSelectedNoSeri(transaction.noSeri)
      setIsPindahLokasiDialogOpen(true)
    }
    // Untuk jenis pekerjaan lain (bisa ditambahkan dialog lain)
    else {
      console.log(`Update untuk jenis pekerjaan "${transaction.jenisPekerjaan}" belum diimplementasikan`)
    }
  }

  const handleAddTransaksi = async (data: {
    detailBarangMasukNoSeriId: number
    jenisPekerjaan: string
    staffId: number
    status: string
    ket?: string
    lokasi?: string
  }) => {
    await createTransaksi(data)
  }

  const handleUpdateInspeksi = async (data: {
    noSeri: string
    items: InspeksiItem[]
    keterangan?: string
  }) => {
    await updateInspeksiData(data)
  }

  const handleUpdateAssembly = async (data: {
    noSeri: string
    items: AssemblyItem[]
    keterangan?: string
  }) => {
    await updateAssemblyData(data)
  }

  const handleUpdatePainting = async (data: {
    noSeri: string
    items: PaintingItem[]
    keterangan?: string
  }) => {
    await updatePaintingData(data)
  }

  const handleUpdateQC = async (data: {
    noSeri: string
    items: QCItem[]
    keterangan?: string
  }) => {
    await updateQCData(data)
  }

  const handleUpdatePDI = async (data: {
    noSeri: string
    items: PDIItem[]
    keterangan?: string
  }) => {
    await updatePDIData(data)
  }

  const handleUpdatePindahLokasi = async (data: any) => {
    try {
      // Update data pindah lokasi menggunakan service
      await pindahLokasiService.savePindahLokasiForm(data)
      
      // Refresh data transaksi setelah simpan form pindah lokasi
      if (isSearched) {
        await handleSearch(new Event('submit') as any)
      }
    } catch (error) {
      console.error('Error updating pindah lokasi data:', error)
    }
  }

  // Handler untuk button detail inspeksi
  const handleDetailInspeksi = async (transaction: any) => {
    try {
      setSelectedDetailNoSeri(transaction.noSeri)
      setSelectedDetailNamaBarang(transaction.namaBarang)
      setSelectedDetailJenisPekerjaan(transaction.jenisPekerjaan)
      
      // Fetch data sesuai jenis pekerjaan
      switch (transaction.jenisPekerjaan) {
        case 'Inspeksi':
        case 'inspeksi':
        case 'INSPEKSI':
        case 'Inspeksi Mesin':
        case 'inspeksi_mesin':
          const inspeksiData = await getInspeksiData(transaction.noSeri)
          setSelectedDetailInspeksiItems(inspeksiData)
          setIsDetailInspeksiDialogOpen(true)
          break
        case 'Assembly':
        case 'assembly':
        case 'ASSEMBLY':
        case 'assembly_staff':
          const assemblyData = await getAssemblyData(transaction.noSeri)
          setSelectedDetailAssemblyItems(assemblyData)
          setIsDetailAssemblyDialogOpen(true)
          break
        case 'QC':
        case 'qc':
        case 'qc_staff':
          const qcData = await getQCData(transaction.noSeri)
          setSelectedDetailQCItems(qcData)
          setIsDetailQCDialogOpen(true)
          break
        case 'PDI':
        case 'pdi':
        case 'pdi_staff':
          const pdiData = await getPDIData(transaction.noSeri)
          setSelectedDetailPDIItems(pdiData)
          setIsDetailPDIDialogOpen(true)
          break
        case 'Painting':
        case 'painting':
        case 'PAINTING':
        case 'painting_staff':
          const paintingData = await getPaintingData(transaction.noSeri)
          setSelectedDetailPaintingItems(paintingData)
          setIsDetailPaintingDialogOpen(true)
          break
        case 'Pindah Lokasi':
        case 'pindah lokasi':
        case 'PINDAH LOKASI':
        case 'pindah_lokasi':
          setIsDetailPindahLokasiDialogOpen(true)
          break
        default:
          console.log('Jenis pekerjaan tidak didukung untuk detail view:', transaction.jenisPekerjaan)
      }
    } catch (error) {
      console.error('Error fetching data for detail:', error)
    }
  }





  return (
    <div className="h-screen flex flex-col animate-fadeIn">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 space-y-6 pb-6 pt-4 lg:pt-0">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Transaksi</h1>
          <p className="text-muted-foreground">
            Pelacakan proses pergudangan untuk setiap unit barang dalam sistem inventaris.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label htmlFor="noSeri" className="text-sm font-medium text-muted-foreground">
                  No Seri
                </label>
                <Input
                  id="noSeri"
                  value={filter.noSeri}
                  onChange={(e) => updateFilter('noSeri', e.target.value)}
                  className="rounded-lg border-gray-200"
                  placeholder="Masukkan nomor seri"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="namaBarang" className="text-sm font-medium text-muted-foreground">
                  Nama Barang
                </label>
                <Input
                  id="namaBarang"
                  value={filter.namaBarang}
                  onChange={(e) => updateFilter('namaBarang', e.target.value)}
                  className="rounded-lg border-gray-200"
                  placeholder="Masukkan nama barang"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lokasi" className="text-sm font-medium text-muted-foreground">
                  Lokasi
                </label>
                <Input
                  id="lokasi"
                  value={filter.lokasi}
                  onChange={(e) => updateFilter('lokasi', e.target.value)}
                  className="rounded-lg border-gray-200"
                  placeholder="Masukkan lokasi"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="kodeKedatangan" className="text-sm font-medium text-muted-foreground">
                  Kode Kedatangan
                </label>
                <Input
                  id="kodeKedatangan"
                  value={filter.kodeKedatangan}
                  onChange={(e) => updateFilter('kodeKedatangan', e.target.value)}
                  className="rounded-lg border-gray-200"
                  placeholder="Masukkan kode kedatangan"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Mencari...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Cari
                  </>
                )}
              </Button>
              
              {isSearched && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetSearch}
                  className="rounded-lg px-4 py-2 text-sm font-medium"
                  disabled={isLoading}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-6">
          {/* Results Section */}
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Hasil Pencarian</h2>
                {isSearched && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {isLoading ? "Memuat..." : `${transactions.length} item ditemukan`}
                    </span>
                  </div>
                )}
              </div>

              {!isSearched ? (
                <div className="mt-6 flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-full bg-muted p-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium">Belum ada pencarian</h3>
                      <p className="text-sm text-muted-foreground">
                        Silakan lakukan pencarian terlebih dahulu untuk melihat data transaksi
                      </p>
                    </div>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="mt-6 flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Memuat data transaksi...</p>
                  </div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="mt-6 flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-full bg-muted p-4">
                      <FileEdit className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium">Tidak ada data yang ditemukan</h3>
                      <p className="text-sm text-muted-foreground">
                        Coba ubah filter pencarian Anda
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">No</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>No Form</TableHead>
                        <TableHead>Jenis Pekerjaan</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead className="w-40">Pengaturan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction, index) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-center">{index + 1}</TableCell>
                          <TableCell>{transaction.tanggal}</TableCell>
                          <TableCell className="font-medium">{transaction.noForm || '-'}</TableCell>
                          <TableCell>{transaction.jenisPekerjaan ? getJobTypeDisplayName(transaction.jenisPekerjaan) : '-'}</TableCell>
                          <TableCell>{transaction.staff || '-'}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              transaction.status === 'Diterima' || transaction.status === 'Sudah Dicek' || transaction.status === 'Sudah Painting' || transaction.status === 'Sudah Assy' || transaction.status === 'Sudah Qc' || transaction.status === 'Sudah PDI'
                                ? 'bg-green-100 text-green-800' 
                                : transaction.status === 'Proses' || transaction.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">{transaction.qty}</TableCell>
                          <TableCell>{transaction.ket || '-'}</TableCell>
                          <TableCell>{transaction.lokasi || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                title="Detail"
                                onClick={() => {
                                  if (!transaction.isDetailRow) {
                                    handleDetailInspeksi(transaction)
                                  }
                                }}
                                disabled={transaction.isDetailRow}
                              >
                                Detail
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                                title="Update"
                                onClick={() => handleUpdateClick(transaction)}
                                disabled={transaction.isDetailRow}
                              >
                                Update
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                title="New"
                                onClick={() => handleNewClick(transaction)}
                              >
                                New
                              </Button>
                              {transaction.isDetailRow ? (
                                // Baris pertama selalu hijau (approved)
                                <Checkbox
                                  checked={true}
                                  disabled={false}
                                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                />
                              ) : (
                                // Baris transaksi sesuai status approval
                                <Checkbox
                                  checked={transaction.isApproved || false}
                                  disabled={false}
                                  className={`data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 ${
                                    !transaction.isApproved ? 'data-[state=unchecked]:bg-yellow-100 data-[state=unchecked]:border-yellow-400' : ''
                                  }`}
                                />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaksi Dialog */}
      <AddTransaksiDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddTransaksi}
        detailBarangMasukNoSeriId={selectedDetailId}
        noSeri={selectedNoSeri}
      />

      {/* Edit Inspeksi Dialog */}
      <EditInspeksiDialog
        isOpen={isInspeksiDialogOpen}
        onClose={() => setIsInspeksiDialogOpen(false)}
        onSubmit={handleUpdateInspeksi}
        noSeri={selectedNoSeri}
        currentItems={selectedInspeksiItems}
        namaBarang={selectedNoSeri ? transactions.find(t => t.noSeri === selectedNoSeri)?.namaBarang || "" : ""}
        isDetailView={false}
        currentKeterangan=""
      />

      {/* Edit Assembly Dialog */}
      <EditAssemblyDialog
        isOpen={isAssemblyDialogOpen}
        onClose={() => setIsAssemblyDialogOpen(false)}
        onSubmit={handleUpdateAssembly}
        noSeri={selectedNoSeri}
        currentItems={selectedAssemblyItems}
        namaBarang={selectedNoSeri ? transactions.find(t => t.noSeri === selectedNoSeri)?.namaBarang || "" : ""}
        isDetailView={false}
        currentKeterangan=""
      />

      {/* Edit Painting Dialog */}
      <EditPaintingDialog
        isOpen={isPaintingDialogOpen}
        onClose={() => setIsPaintingDialogOpen(false)}
        onSubmit={handleUpdatePainting}
        noSeri={selectedNoSeri}
        currentItems={selectedPaintingItems}
        namaBarang={selectedNoSeri ? transactions.find(t => t.noSeri === selectedNoSeri)?.namaBarang || "" : ""}
        isDetailView={false}
        currentKeterangan=""
      />

      {/* Edit QC Dialog */}
      <EditQCDialog
        isOpen={isQCDialogOpen}
        onClose={() => setIsQCDialogOpen(false)}
        onSubmit={handleUpdateQC}
        noSeri={selectedNoSeri}
        currentItems={selectedQCItems}
        namaBarang={selectedNoSeri ? transactions.find(t => t.noSeri === selectedNoSeri)?.namaBarang || "" : ""}
        isDetailView={false}
        currentKeterangan=""
      />

      {/* Edit PDI Dialog */}
      <EditPDIDialog
        isOpen={isPDIDialogOpen}
        onClose={() => setIsPDIDialogOpen(false)}
        onSubmit={handleUpdatePDI}
        noSeri={selectedNoSeri}
        currentItems={selectedPDIItems}
        namaBarang={selectedNoSeri ? transactions.find(t => t.noSeri === selectedNoSeri)?.namaBarang || "" : ""}
        isDetailView={false}
        currentKeterangan=""
      />

      {/* Edit Pindah Lokasi Dialog */}
      <EditPindahLokasiDialog
        isOpen={isPindahLokasiDialogOpen}
        onClose={() => setIsPindahLokasiDialogOpen(false)}
        onSubmit={handleUpdatePindahLokasi}
        noSeri={selectedNoSeri}
        namaBarang={selectedNoSeri ? transactions.find(t => t.noSeri === selectedNoSeri)?.namaBarang || "" : ""}
        isDetailView={false}
      />

      {/* Detail Inspeksi Dialog */}
      <EditInspeksiDialog
        isOpen={isDetailInspeksiDialogOpen}
        onClose={() => setIsDetailInspeksiDialogOpen(false)}
        onSubmit={() => {}} // No submission for detail view
        noSeri={selectedDetailNoSeri}
        currentItems={selectedDetailInspeksiItems}
        namaBarang={selectedDetailNamaBarang}
        isDetailView={true}
      />

      {/* Detail Painting Dialog */}
      <EditPaintingDialog
        isOpen={isDetailPaintingDialogOpen}
        onClose={() => setIsDetailPaintingDialogOpen(false)}
        onSubmit={() => {}} // No submission for detail view
        noSeri={selectedDetailNoSeri}
        currentItems={selectedDetailPaintingItems}
        namaBarang={selectedDetailNamaBarang}
        isDetailView={true}
      />

      {/* Detail QC Dialog */}
      <EditQCDialog
        isOpen={isDetailQCDialogOpen}
        onClose={() => setIsDetailQCDialogOpen(false)}
        onSubmit={() => {}} // No submission for detail view
        noSeri={selectedDetailNoSeri}
        currentItems={selectedDetailQCItems}
        namaBarang={selectedDetailNamaBarang}
        isDetailView={true}
      />

      {/* Detail PDI Dialog */}
      <EditPDIDialog
        isOpen={isDetailPDIDialogOpen}
        onClose={() => setIsDetailPDIDialogOpen(false)}
        onSubmit={() => {}} // No submission for detail view
        noSeri={selectedDetailNoSeri}
        currentItems={selectedDetailPDIItems}
        namaBarang={selectedDetailNamaBarang}
        isDetailView={true}
      />

      {/* Detail Pindah Lokasi Dialog */}
      <EditPindahLokasiDialog
        isOpen={isDetailPindahLokasiDialogOpen}
        onClose={() => setIsDetailPindahLokasiDialogOpen(false)}
        onSubmit={() => {}} // No submission for detail view
        noSeri={selectedDetailNoSeri}
        namaBarang={selectedDetailNamaBarang}
        isDetailView={true}
      />

      {/* Detail Assembly Dialog */}
      <EditAssemblyDialog
        isOpen={isDetailAssemblyDialogOpen}
        onClose={() => setIsDetailAssemblyDialogOpen(false)}
        onSubmit={() => {}} // No submission for detail view
        noSeri={selectedDetailNoSeri}
        currentItems={selectedDetailAssemblyItems}
        namaBarang={selectedDetailNamaBarang}
        isDetailView={true}
      />
    </div>
  )
}
