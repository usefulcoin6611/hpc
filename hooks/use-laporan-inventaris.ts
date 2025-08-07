import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { laporanInventarisService } from "@/services/laporan-inventaris"

export function useLaporanInventaris() {
  const [inventoryData, setInventoryData] = useState<any[]>([])
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

  const fetchInventoryReport = async (params?: {
    page?: number
    limit?: number
    search?: string
    period?: string
  }) => {
    setLoading(true)
    try {
      const response = await laporanInventarisService.getInventoryReport(params)
      
      if (response.success) {
        setInventoryData(response.data || [])
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        })
      } else {
        setInventoryData([])
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
            description: "Gagal mengambil data laporan inventaris",
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      console.error('Error fetching inventory report:', error)
      setInventoryData([])
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      })
      if (error instanceof Error && !error.message.includes('Token') && !error.message.includes('401')) {
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat mengambil data laporan inventaris",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // Load data on mount
  useEffect(() => {
    fetchInventoryReport()
  }, [])

  return {
    inventoryData,
    loading,
    pagination,
    fetchInventoryReport
  }
} 