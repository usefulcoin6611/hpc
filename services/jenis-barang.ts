import { getStoredToken } from "@/lib/auth-utils"

export interface JenisBarang {
  id: number
  nama: string
  deskripsi?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdById?: number | null
  barangCount?: number
}

export interface CreateJenisBarangData {
  nama: string
  deskripsi?: string | null
}

export interface UpdateJenisBarangData {
  nama: string
  deskripsi?: string | null
}

class JenisBarangService {
  private baseUrl = '/api/jenis-barang'

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

  async getJenisBarang(search?: string): Promise<{ data: JenisBarang[], pagination: any }> {
    try {
      const searchParams = search ? `?search=${encodeURIComponent(search)}` : ''
      const result = await this.makeRequest(searchParams)
      return result
    } catch (error) {
      console.error('Error fetching jenis barang:', error)
      throw error
    }
  }

  async createJenisBarang(data: CreateJenisBarangData): Promise<JenisBarang> {
    try {
      const result = await this.makeRequest('', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return result.data
    } catch (error) {
      console.error('Error creating jenis barang:', error)
      throw error
    }
  }

  async updateJenisBarang(id: number, data: UpdateJenisBarangData): Promise<JenisBarang> {
    try {
      const result = await this.makeRequest(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      return result.data
    } catch (error) {
      console.error('Error updating jenis barang:', error)
      throw error
    }
  }

  async deleteJenisBarang(id: number): Promise<void> {
    try {
      await this.makeRequest(`/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error deleting jenis barang:', error)
      throw error
    }
  }

  async importJenisBarang(data: CreateJenisBarangData[]): Promise<{
    successCount: number
    errorCount: number
    skippedCount: number
    errors: string[]
  }> {
    try {
      const result = await this.makeRequest('/import', {
        method: 'POST',
        body: JSON.stringify({ data })
      })
      return result
    } catch (error) {
      console.error('Error importing jenis barang:', error)
      throw error
    }
  }

  async exportJenisBarang(): Promise<JenisBarang[]> {
    try {
      const result = await this.makeRequest('/export')
      return result.data
    } catch (error) {
      console.error('Error exporting jenis barang:', error)
      throw error
    }
  }
}

export const jenisBarangService = new JenisBarangService()
