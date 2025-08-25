import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { barangService, Barang, CreateBarangData, UpdateBarangData } from '@/services/barang'

export function useBarang() {
  const { toast } = useToast()
  
  // State
  const [data, setData] = useState<{ data: Barang[], pagination: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)

  // Fetch data function
  const fetchData = useCallback(async (search?: string, pageArg?: number, limitArg?: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const effectivePage = pageArg ?? page
      const effectiveLimit = limitArg ?? limit
      const result = await barangService.getBarang(search, effectivePage, effectiveLimit)
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(errorMessage)
      console.error('Failed to fetch barang:', err)
      toast({
        title: "Error",
        description: "Gagal memuat data barang",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast, page, limit])

  // Refetch function for retry
  const refetch = useCallback(() => {
    fetchData(searchTerm, page, limit)
  }, [fetchData, searchTerm, page, limit])

  // Load data on component mount
  useEffect(() => {
    fetchData(searchTerm, page, limit)
  }, [fetchData, searchTerm, page, limit])

  // CRUD Operations
  const createBarang = useCallback(async (data: CreateBarangData) => {
    try {
      await barangService.createBarang(data)
      toast({
        title: "Berhasil",
        description: "Barang berhasil ditambahkan",
        variant: "success",
      })
      setTimeout(() => {
        refetch()
      }, 100)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [toast, refetch])

  const updateBarang = useCallback(async (id: number, data: UpdateBarangData) => {
    try {
      await barangService.updateBarang(id, data)
      toast({
        title: "Berhasil",
        description: "Barang telah diperbarui",
        variant: "success",
      })
      setTimeout(() => {
        refetch()
      }, 100)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [toast, refetch])

  const deleteBarang = useCallback(async (id: number) => {
    try {
      await barangService.deleteBarang(id)
      toast({
        title: "Berhasil",
        description: "Barang telah dihapus",
        variant: "success",
      })
      setTimeout(() => {
        refetch()
      }, 100)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [toast, refetch])

  const importBarang = useCallback(async (data: CreateBarangData[]) => {
    try {
      const result = await barangService.importBarang(data)
      
      if (result.successCount > 0) {
        let description = `${result.successCount} data berhasil disimpan ke database.`
        if (result.skippedCount > 0) {
          description += ` ${result.skippedCount} data dilewati (kode barang atau ID sudah ada).`
        }
        if (result.errorCount > 0) {
          description += ` ${result.errorCount} data gagal.`
        }
        
        toast({
          title: "Import Berhasil",
          description: description,
          variant: "success",
        })
        
        // Refresh data from database
        setTimeout(() => {
          refetch()
        }, 500)
      } else if (result.skippedCount > 0 && result.errorCount === 0) {
        toast({
          title: "Import Gagal",
          description: `${result.skippedCount} data dilewati karena kode barang atau ID sudah ada di database. Tidak ada data baru yang disimpan.`,
          variant: "destructive",
        })
      } else if (result.errorCount > 0) {
        toast({
          title: "Import Gagal",
          description: `${result.errorCount} data gagal disimpan ke database. Periksa format data Anda.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Import Gagal",
          description: "Tidak ada data yang dapat diimport",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      console.error('Import to database error:', error)
      toast({
        title: "Import Gagal",
        description: "Terjadi kesalahan saat import ke database",
        variant: "destructive",
      })
      throw error
    }
  }, [toast, refetch])

  // Computed values
  const items = data?.data || []
  
  // Filter items based on search term
  const filteredItems = !searchTerm ? items : items.filter(
    (item) =>
      item.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Sort filtered items by ID from smallest to largest for consistent display
  const sortedFilteredItems = [...filteredItems].sort((a, b) => a.id - b.id)

  return {
    // State
    data,
    loading,
    error,
    searchTerm,
    page,
    limit,
    items,
    filteredItems,
    sortedFilteredItems,
    
    // Actions
    setSearchTerm,
    setPage,
    setLimit,
    fetchData,
    refetch,
    createBarang,
    updateBarang,
    deleteBarang,
    importBarang,
  }
} 