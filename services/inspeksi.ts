import { getStoredToken } from '@/lib/auth-utils'

export interface InspeksiItem {
  id?: number
  parameter: string
  hasil: boolean
  keterangan: string
}

export interface FotoInspeksi {
  id?: number
  fileName: string
  fileUrl: string
  fileSize?: number
  fileType?: string
  uploadDate?: string
  keterangan?: string
}

class InspeksiService {
  private baseUrl = '/api/inspeksi'

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getStoredToken()
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }

  async getInspeksiData(noSeri: string): Promise<InspeksiItem[]> {
    try {
      const result = await this.makeRequest(`/${noSeri}`)
      const data = result.data || []
      return data.map((item: any) => ({
        id: item.id,
        parameter: item.parameter || "",
        hasil: typeof item.hasil === 'boolean' ? item.hasil : (item.hasil === 'true' || item.hasil === true),
        keterangan: item.keterangan || ""
      }))
    } catch (error) {
      console.error('Error fetching inspeksi data:', error)
      throw error
    }
  }

  async updateInspeksiData(noSeri: string, items: InspeksiItem[], keterangan?: string): Promise<any> {
    try {
      return await this.makeRequest(`/${noSeri}`, {
        method: 'PUT',
        body: JSON.stringify({ items, keterangan })
      })
    } catch (error) {
      console.error('Error updating inspeksi data:', error)
      throw error
    }
  }

  async uploadFoto(file: File, noSeri: string, keterangan?: string): Promise<void> {
    try {
      const token = getStoredToken()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('noSeri', noSeri)
      if (keterangan) {
        formData.append('keterangan', keterangan)
      }

      const response = await fetch('/api/inspeksi/upload-foto', {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || 'Failed to upload foto')
      }
    } catch (error) {
      console.error('Error uploading foto:', error)
      throw error
    }
  }

  async getFotoList(noSeri: string): Promise<FotoInspeksi[]> {
    try {
      const response = await fetch(`/api/inspeksi/upload-foto?noSeri=${encodeURIComponent(noSeri)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get foto list')
      }

      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('Error getting foto list:', error)
      throw error
    }
  }

  async deleteFoto(fotoId: number): Promise<void> {
    try {
      const token = getStoredToken()
      const response = await fetch(`/api/inspeksi/upload-foto`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ fotoId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Delete failed')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete foto')
      }
    } catch (error) {
      console.error('Error deleting foto:', error)
      throw error
    }
  }
}

export const inspeksiService = new InspeksiService() 