import { getStoredToken } from "@/lib/auth-utils"

export interface LembarKerjaData {
  id?: number
  jenisPekerjaan: string
  tipeMesin: string
  tanggal: string
  versi: string
  catatanPembaruan?: string
}

export interface LembarKerjaListItem {
  id: number
  jenisPekerjaan: string
  tipeMesin: string
  tanggal: string
  versi: string
  catatanPembaruan: string
  createdAt: string
  updatedAt: string
}

export interface LembarKerjaResponse {
  success: boolean
  message?: string
  data: LembarKerjaListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CreateLembarKerjaResponse {
  success: boolean
  message: string
  data: LembarKerjaData
}

class LembarKerjaService {
  private baseUrl = '/api/lembar-kerja'

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
      let errorMessage = 'Terjadi kesalahan pada server'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (parseError) {
        // If response is not JSON, use status text or default message
        errorMessage = response.statusText || `HTTP ${response.status}: ${errorMessage}`
      }
      throw new Error(errorMessage)
    }

    try {
      const result = await response.json()
      return result
    } catch (parseError) {
      throw new Error('Response tidak dalam format JSON yang valid')
    }
  }

  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<LembarKerjaResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)

      const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : ''
      
      const result = await this.makeRequest(endpoint)
      return result
    } catch (error) {
      console.error('Error getting lembar kerja:', error)
      throw error
    }
  }

  async create(data: LembarKerjaData): Promise<CreateLembarKerjaResponse> {
    try {
      const result = await this.makeRequest('', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      
      return result
    } catch (error) {
      console.error('Error creating lembar kerja:', error)
      throw error
    }
  }

  // Get specific lembar kerja data by noForm
  async fetchByNoForm(noForm: string): Promise<any> {
    try {
      const encodedNoForm = encodeURIComponent(noForm)
      const result = await this.makeRequest(`/${encodedNoForm}`, {
        method: 'GET'
      })
      
      return result
    } catch (error) {
      console.error('Error fetching lembar kerja by noForm:', error)
      throw error
    }
  }

  // Update specific lembar kerja data by noForm
  async updateByNoForm(noForm: string, data: { items: any[], keterangan?: string }): Promise<any> {
    try {
      const encodedNoForm = encodeURIComponent(noForm)
      const result = await this.makeRequest(`/${encodedNoForm}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      
      return result
    } catch (error) {
      console.error('Error updating lembar kerja by noForm:', error)
      throw error
    }
  }

}

export const lembarKerjaService = new LembarKerjaService() 