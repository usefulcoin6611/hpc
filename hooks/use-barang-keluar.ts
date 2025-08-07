import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { barangKeluarService, CreateBarangKeluarData, UpdateBarangKeluarData } from "@/services/barang-keluar"

export function useBarangKeluar() {
  const [barangKeluar, setBarangKeluar] = useState<any[]>([])
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

  const fetchBarangKeluar = async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }) => {
    setLoading(true)
    try {
      console.log('Fetching barang keluar with params:', params)
      const response = await barangKeluarService.getAll(params)
      console.log('Barang keluar response:', response)
      
      if (response.success) {
        setBarangKeluar(response.data || [])
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        })
      } else {
        console.log('Barang keluar response not successful:', response.message)
        // Jika tidak ada data, set empty array
        setBarangKeluar([])
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        })
        // Hanya tampilkan error jika bukan karena data kosong
        if (response.message && !response.message.includes('tidak ditemukan')) {
          toast({
            title: "Error",
            description: "Gagal mengambil data barang keluar",
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      console.error('Error fetching barang keluar:', error)
      // Set empty state jika terjadi error
      setBarangKeluar([])
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      })
      // Hanya tampilkan error jika bukan karena autentikasi
      if (error instanceof Error && !error.message.includes('Token') && !error.message.includes('401')) {
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat mengambil data barang keluar",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const createBarangKeluar = async (data: CreateBarangKeluarData): Promise<boolean> => {
    try {
      const response = await barangKeluarService.create(data)
      if (response.success) {
        toast({
          title: "Sukses",
          description: response.message,
        })
        // Refresh data
        await fetchBarangKeluar()
        return true
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal menambahkan barang keluar",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error creating barang keluar:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menambahkan barang keluar",
        variant: "destructive"
      })
      return false
    }
  }

  const approveBarangKeluar = async (id: number): Promise<boolean> => {
    try {
      const response = await barangKeluarService.approve(id)
      if (response.success) {
        toast({
          title: "Sukses",
          description: response.message,
        })
        // Refresh data
        await fetchBarangKeluar()
        return true
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal menyetujui barang keluar",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error approving barang keluar:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyetujui barang keluar",
        variant: "destructive"
      })
      return false
    }
  }

  const updateBarangKeluar = async (id: number, data: UpdateBarangKeluarData): Promise<boolean> => {
    try {
      const response = await barangKeluarService.update(id, data)
      if (response.success) {
        toast({
          title: "Sukses",
          description: response.message,
        })
        // Refresh data
        await fetchBarangKeluar()
        return true
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal memperbarui barang keluar",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error updating barang keluar:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui barang keluar",
        variant: "destructive"
      })
      return false
    }
  }

  const deleteBarangKeluar = async (id: number): Promise<boolean> => {
    try {
      const response = await barangKeluarService.delete(id)
      if (response.success) {
        toast({
          title: "Sukses",
          description: response.message,
        })
        // Refresh data
        await fetchBarangKeluar()
        return true
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal menghapus barang keluar",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error deleting barang keluar:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus barang keluar",
        variant: "destructive"
      })
      return false
    }
  }

  // Load data on mount
  useEffect(() => {
    fetchBarangKeluar()
  }, [])

  return {
    barangKeluar,
    loading,
    pagination,
    fetchBarangKeluar,
    createBarangKeluar,
    updateBarangKeluar,
    approveBarangKeluar,
    deleteBarangKeluar
  }
} 