import { getStoredToken } from '@/lib/auth-utils'

export interface PindahLokasiData {
  id?: number
  namaBarang: string
  kodeBarang: string
  noSeri: string
  kodeKedatangan: string
  lokasiSekarang: string
  lokasiBaru: string
  keterangan?: string
  fotoUrl?: string
}

export interface PindahLokasiFormData {
  id?: number
  noSeri: string
  namaBarang: string
  lokasiAwal: string
  lokasiBaru?: string
  noForm?: string
  tanggal?: Date
  keterangan?: string
}

export interface HistoryPindahLokasi {
  id: number
  tanggal: string
  waktu: string
  dariLokasi: string
  keLokasi: string
  staff: string
  keterangan?: string
}

export interface PindahLokasiResponse {
  currentData: PindahLokasiData
  history: HistoryPindahLokasi[]
}

export interface FotoPindahLokasi {
  id?: number
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  keterangan?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

class PindahLokasiService {
  private baseUrl = '/api/pindah-lokasi'

  async getPindahLokasiData(noSeri: string): Promise<PindahLokasiResponse> {
    try {
      const token = getStoredToken()
      const response = await fetch(`${this.baseUrl}/${noSeri}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.data || { currentData: {}, history: [] }
    } catch (error) {
      console.error('Error fetching pindah lokasi data:', error)
      throw error
    }
  }

  async updatePindahLokasi(noSeri: string, data: { lokasiBaru: string; keterangan?: string }): Promise<any> {
    try {
      const token = getStoredToken()
      const response = await fetch(`${this.baseUrl}/${noSeri}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || 'Failed to update pindah lokasi')
      }
      return result
    } catch (error) {
      console.error('Error updating pindah lokasi:', error)
      throw error
    }
  }

  async uploadFoto(file: File, noSeri: string, keterangan: string): Promise<any> {
    try {
      const token = getStoredToken()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('noSeri', noSeri)
      formData.append('keterangan', keterangan)

      const response = await fetch(`${this.baseUrl}/upload-foto`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || 'Failed to upload foto')
      }
      return result
    } catch (error) {
      console.error('Error uploading foto pindah lokasi:', error)
      throw error
    }
  }

  async getPindahLokasiForm(noSeri: string): Promise<PindahLokasiFormData | null> {
    try {
      const token = getStoredToken()
      const response = await fetch(`${this.baseUrl}/${noSeri}/form`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.data || null
    } catch (error) {
      console.error('Error fetching pindah lokasi form:', error)
      return null
    }
  }

  async savePindahLokasiForm(data: PindahLokasiFormData): Promise<any> {
    try {
      const token = getStoredToken()
      const response = await fetch(`${this.baseUrl}/${data.noSeri}/form`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || 'Failed to save pindah lokasi form')
      }
      return result
    } catch (error) {
      console.error('Error saving pindah lokasi form:', error)
      throw error
    }
  }

  async getFotoList(noSeri: string): Promise<FotoPindahLokasi[]> {
    try {
      const token = getStoredToken()
      const response = await fetch(`${this.baseUrl}/upload-foto?noSeri=${noSeri}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('Error fetching pindah lokasi foto list:', error)
      return []
    }
  }

  async deleteFoto(fotoId: number): Promise<void> {
    try {
      const token = getStoredToken()
      const response = await fetch(`${this.baseUrl}/upload-foto`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fotoId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete foto')
      }
    } catch (error) {
      console.error('Error deleting pindah lokasi foto:', error)
      throw error
    }
  }
}

export const pindahLokasiService = new PindahLokasiService() 