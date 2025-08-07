import { getStoredToken } from "@/lib/auth-utils"

class DetailBarangMasukService {
  private baseUrl = '/api/detail-barang-masuk-no-seri'

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
      throw new Error(errorData.error || 'Terjadi kesalahan pada server')
    }

    const result = await response.json()
    return result
  }

  async updateDetail(id: number, data: { ket?: string; lokasi?: string }) {
    try {
      const result = await this.makeRequest(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      
      return result.data
    } catch (error) {
      console.error('Error updating detail barang:', error)
      throw error
    }
  }
}

export const detailBarangMasukService = new DetailBarangMasukService() 