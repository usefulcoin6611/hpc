"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DialogWrapper } from "@/components/ui/dialog-wrapper"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  UserCheck,
  Edit,
  Trash2,
  Save,
  X,
  Filter,
  Settings,
  Wrench,
  CheckCircle,
  ClipboardCheck,
  Palette,
  Camera,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { getStoredToken } from "@/lib/auth-utils"
import { useUser } from "@/hooks/use-user"

// Import dialogs
import { EditInspeksiDialog } from "@/components/dialogs/EditInspeksiDialog"
import { EditAssemblyDialog } from "@/components/dialogs/EditAssemblyDialog"
import { EditPaintingDialog } from "@/components/dialogs/EditPaintingDialog"
import { EditQCDialog } from "@/components/dialogs/EditQCDialog"
import { EditPDIDialog } from "@/components/dialogs/EditPDIDialog"
import { EditPindahLokasiDialog } from "@/components/dialogs/EditPindahLokasiDialog"

// Interface untuk data transaksi
interface Transaction {
  id: number
  tanggal: string
  jenisPekerjaan: string
  noSeri: string
  kodeBarang: string
  namaBarang: string
  qty: number
  staff: string
  pic: string // Person In Charge - nama user yang membuat transaksi
  isApproved?: boolean
  approvedAt?: string
  approvedBy?: string
}

// Interface untuk data inspeksi
interface InspeksiItem {
  id?: number
  parameter: string
  hasil: boolean
  keterangan: string
}

// Interface untuk data assembly
interface AssemblyItem {
  id?: number
  parameter: string
  hasil: boolean
  keterangan: string
}

// Interface untuk data painting
interface PaintingItem {
  id?: number
  parameter: string
  hasil: boolean
  keterangan: string
}

// Interface untuk data QC
interface QCItem {
  id?: number
  parameter: string
  aktual: string
  standar: string
}

// Interface untuk data PDI
interface PDIItem {
  id?: number
  parameter: string
  pdi: boolean
  keterangan: string
}

// Array untuk filter jenis pekerjaan
const jobTypes = [
  "Semua",
  "Inspeksi Mesin",
  "Assembly",
  "QC",
  "PDI",
  "Painting",
  "Pindah Lokasi"
]

export default function ApproverPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("Semua")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useUser()

  // Dialog states untuk update
  const [isInspeksiDialogOpen, setIsInspeksiDialogOpen] = useState(false)
  const [isAssemblyDialogOpen, setIsAssemblyDialogOpen] = useState(false)
  const [isPaintingDialogOpen, setIsPaintingDialogOpen] = useState(false)
  const [isQCDialogOpen, setIsQCDialogOpen] = useState(false)
  const [isPDIDialogOpen, setIsPDIDialogOpen] = useState(false)
  const [isPindahLokasiDialogOpen, setIsPindahLokasiDialogOpen] = useState(false)

  // Data states untuk dialogs
  const [selectedNoSeri, setSelectedNoSeri] = useState("")
  const [selectedNamaBarang, setSelectedNamaBarang] = useState("")
  const [selectedInspeksiItems, setSelectedInspeksiItems] = useState<InspeksiItem[]>([])
  const [selectedAssemblyItems, setSelectedAssemblyItems] = useState<AssemblyItem[]>([])
  const [selectedPaintingItems, setSelectedPaintingItems] = useState<PaintingItem[]>([])
  const [selectedQCItems, setSelectedQCItems] = useState<QCItem[]>([])
  const [selectedPDIItems, setSelectedPDIItems] = useState<PDIItem[]>([])

  // Load data from approval API
  useEffect(() => {
    loadTransactions()
  }, [])

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

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      
      // Debug: Check token
      const token = getStoredToken()
      console.log('ApproverPage: Token exists:', !!token)
      console.log('ApproverPage: Token value:', token ? token.substring(0, 20) + '...' : 'null')
      
      // Fetch data dari API approval yang terpisah
      const response = await fetch('/api/approval', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch approval data')
      }

      const result = await response.json()
      setTransactions(result.data)
    } catch (error) {
      console.error('Error loading transactions:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data transaksi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter transaksi berdasarkan search term dan filter jenis pekerjaan
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.noSeri.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.kodeBarang.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "Semua" || getJobTypeDisplayName(transaction.jenisPekerjaan) === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Handle approve/unapprove
  const handleApprove = async (transaction: Transaction) => {
    try {
      const action = transaction.isApproved ? 'unapprove' : 'approve'
      
      const response = await fetch('/api/approval', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({
          transaksiId: transaction.id,
          action: action
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} transaction`)
      }

      const result = await response.json()

      toast({
        title: "Success",
        description: result.message,
      })

      // Reload transactions
      await loadTransactions()
    } catch (error) {
      console.error(`Error ${transaction.isApproved ? 'unapproving' : 'approving'} transaction:`, error)
      toast({
        title: "Error",
        description: "Gagal mengubah status approval",
        variant: "destructive",
      })
    }
  }

  const handleDetail = async (transaction: Transaction) => {
    try {
      setSelectedNoSeri(transaction.noSeri)
      setSelectedNamaBarang(transaction.namaBarang)
      
      // Clear previous items
      setSelectedInspeksiItems([])
      setSelectedAssemblyItems([])
      setSelectedPaintingItems([])
      setSelectedQCItems([])
      setSelectedPDIItems([])

      // Untuk sementara, buka dialog sesuai jenis pekerjaan tanpa fetch data
      const displayName = getJobTypeDisplayName(transaction.jenisPekerjaan)
      if (displayName === "Inspeksi Mesin") {
        setIsInspeksiDialogOpen(true)
      } else if (displayName === "Assembly") {
        setIsAssemblyDialogOpen(true)
      } else if (displayName === "Painting") {
        setIsPaintingDialogOpen(true)
      } else if (displayName === "QC") {
        setIsQCDialogOpen(true)
      } else if (displayName === "PDI") {
        setIsPDIDialogOpen(true)
      } else if (displayName === "Pindah Lokasi") {
        setIsPindahLokasiDialogOpen(true)
      }
    } catch (error) {
      console.error('Error opening detail dialog:', error)
      toast({
        title: "Error",
        description: "Gagal membuka detail dialog",
        variant: "destructive",
      })
    }
  }

  const handleCloseDetailDialog = () => {
    setIsInspeksiDialogOpen(false)
    setIsAssemblyDialogOpen(false)
    setIsPaintingDialogOpen(false)
    setIsQCDialogOpen(false)
    setIsPDIDialogOpen(false)
    setIsPindahLokasiDialogOpen(false)
    setSelectedNoSeri("")
    setSelectedNamaBarang("")
    setSelectedInspeksiItems([])
    setSelectedAssemblyItems([])
    setSelectedPaintingItems([])
    setSelectedQCItems([])
    setSelectedPDIItems([])
  }

  return (
    <div className="h-screen flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="flex-shrink-0 space-y-6 pb-6 pt-4 lg:pt-0">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Approval Transaksi</h1>
          <p className="text-muted-foreground">
            Kelola persetujuan transaksi untuk setiap jenis pekerjaan dalam sistem.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Field PIC Indicator - Non Editable */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <UserCheck className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">PIC:</span>
                <span className="text-sm text-gray-900">{user?.name || "Loading..."}</span>
              </div>
            </div>

            {/* Filter Buttons - Center */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedFilter === "Semua" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("Semua")}
                className="rounded-lg text-xs"
              >
                <Filter className="mr-1 h-3 w-3" /> Semua
              </Button>
              <Button
                variant={selectedFilter === "Inspeksi Mesin" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("Inspeksi Mesin")}
                className="rounded-lg text-xs"
              >
                <Wrench className="mr-1 h-3 w-3" /> Inspeksi Mesin
              </Button>
              <Button
                variant={selectedFilter === "Assembly" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("Assembly")}
                className="rounded-lg text-xs"
              >
                <Settings className="mr-1 h-3 w-3" /> Assembly
              </Button>
              <Button
                variant={selectedFilter === "QC" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("QC")}
                className="rounded-lg text-xs"
              >
                <ClipboardCheck className="mr-1 h-3 w-3" /> QC
              </Button>
              <Button
                variant={selectedFilter === "PDI" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("PDI")}
                className="rounded-lg text-xs"
              >
                <CheckCircle className="mr-1 h-3 w-3" /> PDI
              </Button>
              <Button
                variant={selectedFilter === "Painting" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("Painting")}
                className="rounded-lg text-xs"
              >
                <Palette className="mr-1 h-3 w-3" /> Painting
              </Button>
            </div>

            {/* Search Field - Right */}
            <div className="relative w-full sm:w-auto">
              <Input
                placeholder="Cari no seri, kode barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border-gray-200 bg-white pl-4 pr-10 py-2 focus:border-primary focus:ring-primary sm:w-64"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          {/* Info jumlah data */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan {filteredTransactions.length} dari {transactions.length} data
              {selectedFilter !== "Semua" && ` (Filter: ${selectedFilter})`}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        <div className="rounded-lg border bg-card">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-left">No</TableHead>
                  <TableHead className="text-left">Tanggal</TableHead>
                  <TableHead className="text-left">Jenis Pekerjaan</TableHead>
                  <TableHead className="text-left">No Seri</TableHead>
                  <TableHead className="text-left">Kode Barang</TableHead>
                  <TableHead className="text-left">Nama Barang</TableHead>
                  <TableHead className="text-left">Qty</TableHead>
                  <TableHead className="text-left">Staff</TableHead>
                  <TableHead className="text-left">PIC</TableHead>
                  <TableHead className="text-center">Pengaturan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        Memuat data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      Tidak ada data transaksi
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction, index) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="text-left font-medium text-gray-700 py-2 text-xs">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-left font-medium text-gray-700 py-2 text-xs">
                        {transaction.tanggal}
                      </TableCell>
                      <TableCell className="text-left font-medium text-gray-700 py-2 text-xs">
                        {getJobTypeDisplayName(transaction.jenisPekerjaan)}
                      </TableCell>
                      <TableCell className="text-left font-medium text-gray-700 py-2 text-xs">
                        {transaction.noSeri}
                      </TableCell>
                      <TableCell className="text-left font-medium text-gray-700 py-2 text-xs">
                        {transaction.kodeBarang}
                      </TableCell>
                      <TableCell className="text-left font-medium text-gray-700 py-2 text-xs">
                        {transaction.namaBarang}
                      </TableCell>
                      <TableCell className="text-left font-medium text-gray-700 py-2 text-xs">
                        {transaction.qty}
                      </TableCell>
                      <TableCell className="text-left font-medium text-gray-700 py-2 text-xs">
                        {transaction.staff}
                      </TableCell>
                      <TableCell className="text-left font-medium text-gray-700 py-2 text-xs">
                        {transaction.pic}
                      </TableCell>
                      <TableCell className="text-center py-2">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDetail(transaction)}
                            className="h-8 px-3 text-xs"
                          >
                            {/* Ganti <Eye /> dengan ikon yang sudah diimport, misal dari lucide-react */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M1.5 12s3.75-7.5 10.5-7.5S22.5 12 22.5 12s-3.75 7.5-10.5 7.5S1.5 12 1.5 12z"
                              />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            Detail
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(transaction)}
                            className={`
                              group h-8 px-3 text-xs transition-all duration-300 ease-in-out ${
                                transaction.isApproved 
                                  ? "bg-green-500 hover:bg-red-300 border-green-500 hover:border-red-300 text-white hover:text-red-900" 
                                  : "bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600 text-white"
                              }`}
                          >
                            <span className="flex items-center relative">
                              {transaction.isApproved ? (
                                <>
                                  <CheckCircle className="h-3 w-3 ml-[2px] mr-2 transition-all duration-300 ease-in-out group-hover:opacity-0" />
                                  <X className="h-3 w-3 mr-1 transition-all duration-300 ease-in-out absolute opacity-0 group-hover:opacity-100" />
                                  <span className="transition-all duration-300 ease-in-out group-hover:opacity-0">
                                    Approved
                                  </span>
                                  <span className="ml-4 transition-all duration-300 ease-in-out absolute opacity-0 group-hover:opacity-100">
                                    Disapprove
                                  </span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </>
                              )}
                            </span>
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



      {/* Dialogs untuk update */}
      <EditInspeksiDialog
        isOpen={isInspeksiDialogOpen}
        onClose={handleCloseDetailDialog}
        onSubmit={async (data) => {
          // await updateInspeksiData(data) // This function does not exist
          setSelectedInspeksiItems(data.items)
          toast({
            title: "Success",
            description: "Inspeksi mesin berhasil diperbarui",
          })
        }}
        noSeri={selectedNoSeri}
        currentItems={selectedInspeksiItems}
        namaBarang={selectedNamaBarang}
        isDetailView={true}
      />

      <EditAssemblyDialog
        isOpen={isAssemblyDialogOpen}
        onClose={handleCloseDetailDialog}
        onSubmit={async (data) => {
          // await updateAssemblyData(data) // This function does not exist
          setSelectedAssemblyItems(data.items)
          toast({
            title: "Success",
            description: "Assembly berhasil diperbarui",
          })
        }}
        noSeri={selectedNoSeri}
        currentItems={selectedAssemblyItems}
        namaBarang={selectedNamaBarang}
        isDetailView={true}
      />

      <EditPaintingDialog
        isOpen={isPaintingDialogOpen}
        onClose={handleCloseDetailDialog}
        onSubmit={async (data) => {
          // await updatePaintingData(data) // This function does not exist
          setSelectedPaintingItems(data.items)
          toast({
            title: "Success",
            description: "Painting berhasil diperbarui",
          })
        }}
        noSeri={selectedNoSeri}
        currentItems={selectedPaintingItems}
        namaBarang={selectedNamaBarang}
        isDetailView={true}
      />

      <EditQCDialog
        isOpen={isQCDialogOpen}
        onClose={handleCloseDetailDialog}
        onSubmit={async (data) => {
          // await updateQCData(data) // This function does not exist
          setSelectedQCItems(data.items)
          toast({
            title: "Success",
            description: "QC berhasil diperbarui",
          })
        }}
        noSeri={selectedNoSeri}
        currentItems={selectedQCItems}
        namaBarang={selectedNamaBarang}
        isDetailView={true}
      />

      <EditPDIDialog
        isOpen={isPDIDialogOpen}
        onClose={handleCloseDetailDialog}
        onSubmit={async (data) => {
          // await updatePDIData(data) // This function does not exist
          setSelectedPDIItems(data.items)
          toast({
            title: "Success",
            description: "PDI berhasil diperbarui",
          })
        }}
        noSeri={selectedNoSeri}
        currentItems={selectedPDIItems}
        namaBarang={selectedNamaBarang}
        isDetailView={true}
      />

      <EditPindahLokasiDialog
        isOpen={isPindahLokasiDialogOpen}
        onClose={handleCloseDetailDialog}
        onSubmit={async (data) => {
          // Handle pindah lokasi update
          toast({
            title: "Success",
            description: "Pindah lokasi berhasil diperbarui",
          })
        }}
        noSeri={selectedNoSeri}
        namaBarang={selectedNamaBarang}
        isDetailView={true}
      />
    </div>
  )
}