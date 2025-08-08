import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { jenisBarangService, JenisBarang, CreateJenisBarangData, UpdateJenisBarangData } from '@/services/jenis-barang'

export function useJenisBarang() {
  const { toast } = useToast()
  
  // State
  const [data, setData] = useState<{ data: JenisBarang[], pagination: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch data function
  const fetchData = useCallback(async (search?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await jenisBarangService.getJenisBarang(search)
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(errorMessage)
      console.error('Failed to fetch jenis barang:', err)
      toast({
        title: "Error",
        description: "Gagal memuat data jenis barang",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Refetch function for retry
  const refetch = useCallback(() => {
    fetchData(searchTerm)
  }, [fetchData, searchTerm])

  // Load data on component mount
  useEffect(() => {
    fetchData(searchTerm)
  }, [fetchData, searchTerm])

  // CRUD Operations
  const createJenisBarang = useCallback(async (data: CreateJenisBarangData) => {
    try {
      await jenisBarangService.createJenisBarang(data)
      toast({
        title: "Berhasil",
        description: "Jenis barang berhasil ditambahkan",
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

  const updateJenisBarang = useCallback(async (id: number, data: UpdateJenisBarangData) => {
    try {
      await jenisBarangService.updateJenisBarang(id, data)
      toast({
        title: "Berhasil",
        description: "Jenis barang telah diperbarui",
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

  const deleteJenisBarang = useCallback(async (id: number) => {
    try {
      await jenisBarangService.deleteJenisBarang(id)
      toast({
        title: "Berhasil",
        description: "Jenis barang telah dihapus",
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

  const importJenisBarang = useCallback(async (data: CreateJenisBarangData[]) => {
    try {
      const result = await jenisBarangService.importJenisBarang(data)
      toast({
        title: "Berhasil",
        description: `Import selesai: ${result.successCount} berhasil, ${result.errorCount} error, ${result.skippedCount} dilewati`,
        variant: "success",
      })
      setTimeout(() => {
        refetch()
      }, 100)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [toast, refetch])

  const exportJenisBarang = useCallback(async () => {
    try {
      const result = await jenisBarangService.exportJenisBarang()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [toast])

  return {
    // State
    data,
    loading,
    error,
    searchTerm,
    setSearchTerm,

    // Actions
    refetch,
    createJenisBarang,
    updateJenisBarang,
    deleteJenisBarang,
    importJenisBarang,
    exportJenisBarang,
  }
}
