import { getStoredToken } from "@/lib/auth-utils"

export interface InventoryItem {
  id: number
  kodeBarang: string
  namaBarang: string
  totalQty: number
  qtyReady: number
  qtyNotReady: number
}

export interface InventoryResponse {
  success: boolean
  message?: string
  data: InventoryItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

class LaporanInventarisService {
  private baseUrl = '/api/laporan/inventaris'

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
      const errorData = await response.json()
      throw new Error(errorData.message || 'Terjadi kesalahan pada server')
    }

    const result = await response.json()
    return result
  }

  async getInventoryReport(params?: {
    page?: number
    limit?: number
    search?: string
    period?: string
  }): Promise<InventoryResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.period) queryParams.append('period', params.period)

      const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : ''
      
      const result = await this.makeRequest(endpoint)
      return result
    } catch (error) {
      console.error('Error getting inventory report:', error)
      throw error
    }
  }
}

export const laporanInventarisService = new LaporanInventarisService() 