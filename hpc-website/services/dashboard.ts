import { getStoredToken } from "@/lib/auth-utils"

export interface DashboardData {
  totalBarang: number
  barangMasuk: number
  barangKeluar: number
  totalPengguna: number
  activities: any[]
}

export interface DashboardResponse {
  success: boolean
  data: DashboardData
  message?: string
}

class DashboardService {
  private baseUrl = '/api/dashboard'

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getStoredToken()

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      // Try to parse as JSON first, if it fails, it's probably HTML
      let errorMessage = 'Terjadi kesalahan pada server'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (parseError) {
        // If JSON parsing fails, it's likely HTML (404, 500, etc.)
        console.error('Response is not JSON, likely HTML error page:', response.status, response.statusText)
        if (response.status === 404) {
          errorMessage = 'API endpoint tidak ditemukan'
        } else if (response.status === 401) {
          errorMessage = 'Token tidak valid atau expired'
        } else if (response.status === 500) {
          errorMessage = 'Terjadi kesalahan pada server'
        } else {
          errorMessage = `Error ${response.status}: ${response.statusText}`
        }
      }
      throw new Error(errorMessage)
    }

    // Try to parse response as JSON
    try {
      const result = await response.json()
      return result
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError)
      throw new Error('Response tidak valid (bukan JSON)')
    }
  }

  async getDashboardData(): Promise<DashboardResponse> {
    try {
      const result = await this.makeRequest('')
      return result
    } catch (error) {
      console.error('Dashboard service error:', error)
      throw error
    }
  }
}

export const dashboardService = new DashboardService()
