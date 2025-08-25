import { getStoredToken } from "@/lib/auth-utils"

export interface Barang {
  id: number
  kode: string
  nama: string
  satuan?: string | null
  stok?: number
  stokMinimum?: number
  lokasi?: string | null
  deskripsi?: string | null
  jenisId?: number | null
  jenis?: {
    id: number
    nama: string
    deskripsi?: string | null
  } | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateBarangData {
  id?: number
  kode: string
  nama: string
  satuan?: string | null
  stok?: number
  stokMinimum?: number
  lokasi?: string | null
  deskripsi?: string | null
}

export interface UpdateBarangData {
  kode: string
  nama: string
  satuan?: string | null
  stok?: number
  stokMinimum?: number
  lokasi?: string | null
  deskripsi?: string | null
}

class BarangService {
  private baseUrl = '/api/barang'

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

  async getBarang(search?: string, page: number = 1, limit: number = 10): Promise<{ data: Barang[], pagination: any }> {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (page) params.set('page', String(page))
      if (limit) params.set('limit', String(limit))
      const searchParams = params.toString() ? `?${params.toString()}` : ''
      const result = await this.makeRequest(searchParams)
      return result
    } catch (error) {
      console.error('Error fetching barang:', error)
      throw error
    }
  }

  async createBarang(data: CreateBarangData): Promise<Barang> {
    try {
      const result = await this.makeRequest('', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return result.data
    } catch (error) {
      console.error('Error creating barang:', error)
      throw error
    }
  }

  async updateBarang(id: number, data: UpdateBarangData): Promise<Barang> {
    try {
      const result = await this.makeRequest(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      return result.data
    } catch (error) {
      console.error('Error updating barang:', error)
      throw error
    }
  }

  async deleteBarang(id: number): Promise<void> {
    try {
      await this.makeRequest(`/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error deleting barang:', error)
      throw error
    }
  }

  async importBarang(data: CreateBarangData[]): Promise<{
    successCount: number
    errorCount: number
    skippedCount: number
    errors: string[]
  }> {
    try {
      let successCount = 0
      let errorCount = 0
      let skippedCount = 0
      const errors: string[] = []

      for (const row of data) {
        try {
          const response = await fetch(`${this.baseUrl}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getStoredToken()}`
            },
            body: JSON.stringify(row)
          })

          const responseData = await response.json()
          
          if (responseData.success) {
            successCount++
          } else if (responseData.message === 'Kode barang sudah ada' || responseData.message === 'ID barang sudah ada') {
            skippedCount++
          } else {
            errorCount++
            errors.push(`Baris ${row.kode}: ${responseData.message}`)
          }
        } catch (error) {
          errorCount++
          errors.push(`Baris ${row.kode}: Terjadi kesalahan saat menyimpan`)
        }
      }

      return {
        successCount,
        errorCount,
        skippedCount,
        errors
      }
    } catch (error) {
      console.error('Error importing barang:', error)
      throw error
    }
  }

  // Method untuk kompatibilitas dengan komponen yang sudah ada
  async fetchActive(): Promise<Barang[]> {
    try {
      const result = await this.makeRequest('?isActive=true')
      return result.data || []
    } catch (error) {
      console.error('Error fetching active barang:', error)
      throw error
    }
  }

  async assignToJenis(barangId: number, jenisId: number | null): Promise<Barang> {
    try {
      const result = await this.makeRequest(`/${barangId}/assign-jenis`, {
        method: 'PUT',
        body: JSON.stringify({ jenisId })
      })
      return result.data
    } catch (error) {
      console.error('Error assigning barang to jenis:', error)
      throw error
    }
  }
}

export const barangService = new BarangService() 