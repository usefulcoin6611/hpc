import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { dashboardService } from "@/services/dashboard"

export function useDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalBarang: 0,
    barangMasuk: 0,
    barangKeluar: 0,
    totalPengguna: 0,
    activities: [] as any[]
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await dashboardService.getDashboardData()
      
      if (response.success) {
        setDashboardData(response.data)
      } else {
        const errorMessage = response.message || 'Gagal mengambil data dashboard'
        setError(errorMessage)
        console.error('Failed to fetch dashboard data:', response.message)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data dashboard'
      setError(errorMessage)
      console.error('Error fetching dashboard data:', err)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return {
    dashboardData,
    loading,
    error,
    refetch
  }
}
