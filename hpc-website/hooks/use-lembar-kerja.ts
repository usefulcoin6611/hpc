import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { lembarKerjaService, LembarKerjaData } from "@/services/lembar-kerja"

export function useLembarKerja() {
  const [lembarKerja, setLembarKerja] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const { toast } = useToast()

  const fetchLembarKerja = async (params?: {
    page?: number
    limit?: number
    search?: string
  }) => {
    setLoading(true)
    try {
      const response = await lembarKerjaService.getAll(params)
      
      if (response.success) {
        setLembarKerja(response.data || [])
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        })
      } else {
        setLembarKerja([])
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        })
        if (response.message && !response.message.includes('tidak ditemukan')) {
          toast({
            title: "Error",
            description: "Gagal mengambil data lembar kerja",
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      console.error('Error fetching lembar kerja:', error)
      setLembarKerja([])
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      })
      if (error instanceof Error) {
        const errorMessage = error.message
        console.error('Failed to fetch lembar kerja:', error)
        toast({
          title: "Error",
          description: "Gagal memuat data lembar kerja",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const createLembarKerja = async (data: LembarKerjaData): Promise<boolean> => {
    try {
      const response = await lembarKerjaService.create(data)
      if (response.success) {
        toast({
          title: "Sukses",
          description: response.message,
        })
        await fetchLembarKerja()
        return true
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal menambahkan lembar kerja",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error creating lembar kerja:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menambahkan lembar kerja",
        variant: "destructive"
      })
      return false
    }
  }



  // Load data on mount
  useEffect(() => {
    fetchLembarKerja()
  }, [])

  // Fetch specific lembar kerja by noForm
  const fetchLembarKerjaByNoForm = async (noForm: string) => {
    try {
      const data = await lembarKerjaService.fetchByNoForm(noForm)
      return data
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message
        console.error('Failed to fetch lembar kerja by noForm:', error)
        toast({
          title: "Error",
          description: "Gagal memuat data lembar kerja",
          variant: "destructive",
        })
      }
      throw error
    }
  }

  // Update specific lembar kerja by noForm
  const updateLembarKerjaByNoForm = async (noForm: string, data: { items: any[], keterangan?: string }) => {
    try {
      const result = await lembarKerjaService.updateByNoForm(noForm, data)
      toast({
        title: "Berhasil",
        description: "Data lembar kerja berhasil diupdate",
      })
      return result
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message
        console.error('Failed to update lembar kerja by noForm:', error)
        toast({
          title: "Error",
          description: "Gagal mengupdate data lembar kerja",
          variant: "destructive",
        })
      }
      throw error
    }
  }

  return {
    lembarKerja,
    loading,
    pagination,
    fetchLembarKerja,
    createLembarKerja,
    fetchLembarKerjaByNoForm,
    updateLembarKerjaByNoForm
  }
} 