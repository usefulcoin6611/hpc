import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { TransaksiItem, TransaksiFilter } from "@/types/transaksi"
import { transaksiService } from "@/services/transaksi"
import { userService } from "@/services/user"
import { inspeksiService } from "@/services/inspeksi"
import { assemblyService } from "@/services/assembly"
import { paintingService } from "@/services/painting"
import { qcService } from "@/services/qc"
import { pdiService } from "@/services/pdi"

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

export function useTransaksi() {
  const [transactions, setTransactions] = useState<TransaksiItem[]>([])
  const [filter, setFilter] = useState<TransaksiFilter>({
    noSeri: "",
    namaBarang: "",
    lokasi: "",
    kodeKedatangan: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSearched, setIsSearched] = useState(false)

  const { toast } = useToast()

  // Search transactions
  const searchTransactions = async (searchParams: TransaksiFilter) => {
    try {
      setIsLoading(true)
      const data = await transaksiService.search(searchParams)
      setTransactions(data)
      setIsSearched(true)

      // Auto-fill field search by dari hasil pertama (hanya field yang kosong)
      if (data.length > 0) {
        const firstResult = data[0]
        setFilter(prev => ({
          noSeri: prev.noSeri.trim() !== "" ? prev.noSeri : (firstResult.noSeri || ""),
          namaBarang: prev.namaBarang.trim() !== "" ? prev.namaBarang : (firstResult.namaBarang || ""),
          lokasi: prev.lokasi.trim() !== "" ? prev.lokasi : (firstResult.lokasi || ""),
          kodeKedatangan: prev.kodeKedatangan.trim() !== "" ? prev.kodeKedatangan : (firstResult.kodeKedatangan || ""),
        }))
      }
    } catch (error) {
      console.error('Error searching transactions:', error)
      toast({
        title: "Error",
        description: "Gagal mencari data transaksi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if at least one filter is filled
    const hasFilter = Object.values(filter).some(value => value.trim() !== '')
    
    if (!hasFilter) {
      toast({
        title: "Error",
        description: "Minimal satu filter harus diisi",
        variant: "destructive",
      })
      return
    }

    await searchTransactions(filter)
  }

  // Reset search
  const resetSearch = () => {
    setFilter({
      noSeri: "",
      namaBarang: "",
      lokasi: "",
      kodeKedatangan: "",
    })
    setIsSearched(false)
    setTransactions([])
  }

  // Update filter
  const updateFilter = (field: keyof TransaksiFilter, value: string) => {
    setFilter(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Create new transaksi
  const createTransaksi = async (data: {
    detailBarangMasukNoSeriId: number
    jenisPekerjaan: string
    staffId: number
    status: string
    ket?: string
    lokasi?: string
  }) => {
    try {
      setIsLoading(true)
      await transaksiService.createTransaksi(data)
      
      toast({
        title: "Success",
        description: "Transaksi berhasil dibuat",
      })

      // Refresh search results
      if (isSearched) {
        await searchTransactions(filter)
      }
    } catch (error) {
      console.error('Error creating transaksi:', error)
      toast({
        title: "Error",
        description: "Gagal membuat transaksi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get inspeksi data
  const getInspeksiData = async (noSeri: string): Promise<InspeksiItem[]> => {
    try {
      const data = await inspeksiService.getInspeksiData(noSeri)
      
      // Pastikan semua field adalah string (tidak null/undefined) dan hasil adalah boolean
      return data.map(item => ({
        id: item.id,
        parameter: item.parameter || "",
        hasil: typeof item.hasil === 'boolean' ? item.hasil : (item.hasil === 'true' || item.hasil === true),
        keterangan: item.keterangan || ""
      }))
    } catch (error) {
      console.error('Error fetching inspeksi data:', error)
      toast({
        title: "Error",
        description: "Gagal mengambil data inspeksi",
        variant: "destructive",
      })
      return []
    }
  }

  // Update Inspeksi data
  const updateInspeksiData = async (data: {
    noSeri: string
    items: InspeksiItem[]
    keterangan?: string
  }) => {
    try {
      setIsLoading(true)
      await inspeksiService.updateInspeksiData(data.noSeri, data.items, data.keterangan)
      
      toast({
        title: "Success",
        description: "Data Inspeksi berhasil diupdate",
      })

      // Refresh search results
      if (isSearched) {
        await searchTransactions(filter)
      }
    } catch (error) {
      console.error('Error updating Inspeksi data:', error)
      toast({
        title: "Error",
        description: "Gagal mengupdate data Inspeksi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get users by job type
  const getUsersByJobType = async (jobType: string) => {
    try {
      return await userService.getUsersByJobType(jobType)
    } catch (error) {
      console.error('Error fetching users by job type:', error)
      toast({
        title: "Error",
        description: "Gagal mengambil data staff",
        variant: "destructive",
      })
      return []
    }
  }

  // Get assembly data
  const getAssemblyData = async (noSeri: string): Promise<AssemblyItem[]> => {
    try {
      const data = await assemblyService.getAssemblyData(noSeri)
      
      // Pastikan semua field adalah string (tidak null/undefined) dan hasil adalah boolean
      return data.map(item => ({
        id: item.id,
        parameter: item.parameter || "",
        hasil: typeof item.hasil === 'boolean' ? item.hasil : (item.hasil === 'true' || item.hasil === true),
        keterangan: item.keterangan || ""
      }))
    } catch (error) {
      console.error('Error fetching assembly data:', error)
      toast({
        title: "Error",
        description: "Gagal mengambil data assembly",
        variant: "destructive",
      })
      return []
    }
  }

  // Update Assembly data
  const updateAssemblyData = async (data: {
    noSeri: string
    items: AssemblyItem[]
    keterangan?: string
  }) => {
    try {
      setIsLoading(true)
      await assemblyService.updateAssemblyData(data.noSeri, data.items, data.keterangan)
      
      toast({
        title: "Success",
        description: "Data Assembly berhasil diupdate",
      })

      // Refresh search results
      if (isSearched) {
        await searchTransactions(filter)
      }
    } catch (error) {
      console.error('Error updating Assembly data:', error)
      toast({
        title: "Error",
        description: "Gagal mengupdate data Assembly",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get painting data
  const getPaintingData = async (noSeri: string): Promise<PaintingItem[]> => {
    try {
      const data = await paintingService.getPaintingData(noSeri)
      
      // Pastikan semua field adalah string (tidak null/undefined) dan hasil adalah boolean
      return data.map(item => ({
        id: item.id,
        parameter: item.parameter || "",
        hasil: typeof item.hasil === 'boolean' ? item.hasil : (item.hasil === 'true' || item.hasil === true),
        keterangan: item.keterangan || ""
      }))
    } catch (error) {
      console.error('Error fetching painting data:', error)
      toast({
        title: "Error",
        description: "Gagal mengambil data painting",
        variant: "destructive",
      })
      return []
    }
  }

  // Update Painting data
  const updatePaintingData = async (data: {
    noSeri: string
    items: PaintingItem[]
    keterangan?: string
  }) => {
    try {
      setIsLoading(true)
      await paintingService.updatePaintingData(data.noSeri, data.items, data.keterangan)
      
      toast({
        title: "Success",
        description: "Data Painting berhasil diupdate",
      })

      // Refresh search results
      if (isSearched) {
        await searchTransactions(filter)
      }
    } catch (error) {
      console.error('Error updating Painting data:', error)
      toast({
        title: "Error",
        description: "Gagal mengupdate data Painting",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get QC data
  const getQCData = async (noSeri: string): Promise<QCItem[]> => {
    try {
      const data = await qcService.getQCData(noSeri)
      
      // Pastikan semua field adalah string (tidak null/undefined)
      return data.map(item => ({
        id: item.id,
        parameter: item.parameter || "",
        aktual: item.aktual || "",
        standar: item.standar || ""
      }))
    } catch (error) {
      console.error('Error fetching QC data:', error)
      toast({
        title: "Error",
        description: "Gagal mengambil data QC",
        variant: "destructive",
      })
      return []
    }
  }

  // Update QC data
  const updateQCData = async (data: {
    noSeri: string
    items: QCItem[]
    keterangan?: string
  }) => {
    try {
      setIsLoading(true)
      await qcService.updateQCData(data.noSeri, data.items, data.keterangan)
      
      toast({
        title: "Success",
        description: "Data QC berhasil diupdate",
      })

      // Refresh search results
      if (isSearched) {
        await searchTransactions(filter)
      }
    } catch (error) {
      console.error('Error updating QC data:', error)
      toast({
        title: "Error",
        description: "Gagal mengupdate data QC",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get PDI data
  const getPDIData = async (noSeri: string): Promise<PDIItem[]> => {
    try {
      const data = await pdiService.getPDIData(noSeri)
      
      // Pastikan semua field adalah string (tidak null/undefined) dan pdi adalah boolean
      return data.map(item => ({
        id: item.id,
        parameter: item.parameter || "",
        pdi: typeof item.pdi === 'boolean' ? item.pdi : (item.pdi === 'true' || item.pdi === true),
        keterangan: item.keterangan || ""
      }))
    } catch (error) {
      console.error('Error fetching PDI data:', error)
      toast({
        title: "Error",
        description: "Gagal mengambil data PDI",
        variant: "destructive",
      })
      return []
    }
  }

  // Update PDI data
  const updatePDIData = async (data: {
    noSeri: string
    items: PDIItem[]
    keterangan?: string
  }) => {
    try {
      setIsLoading(true)
      await pdiService.updatePDIData(data.noSeri, data.items, data.keterangan)
      
      toast({
        title: "Success",
        description: "Data PDI berhasil diupdate",
      })

      // Refresh search results
      if (isSearched) {
        await searchTransactions(filter)
      }
    } catch (error) {
      console.error('Error updating PDI data:', error)
      toast({
        title: "Error",
        description: "Gagal mengupdate data PDI",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on mount - tidak lagi fetch semua data
  useEffect(() => {
    // Tidak ada fetch otomatis, user harus search dulu
  }, [])

  const updateTransactionStatus = async (transaksiId: string, status: string) => {
    try {
      const result = await transaksiService.updateStatus(transaksiId, status)
      return result
    } catch (error) {
      console.error('Error updating transaction status:', error)
      throw error
    }
  }

  return {
    // State
    transactions,
    filter,
    isLoading,
    isSearched,

    // Actions
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
    updateTransactionStatus,
  }
} 