import { getStoredToken } from "@/lib/auth-utils"

interface PDIItem {
  id?: number
  parameter: string
  pdi: boolean
  keterangan: string
}

export interface FotoPDI {
  id?: number
  fileName: string
  fileUrl: string
  fileSize?: number
  fileType?: string
  uploadDate?: string
  keterangan?: string
}

class PDIService {
  private baseUrl = '/api/pdi'

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

  async getPDIData(noSeri: string): Promise<PDIItem[]> {
    try {
      const result = await this.makeRequest(`/${noSeri}`)
      return result.data || []
    } catch (error) {
      console.error('Error fetching PDI data:', error)
      throw error
    }
  }

  async updatePDIData(noSeri: string, items: PDIItem[], keterangan?: string): Promise<any> {
    try {
      return await this.makeRequest(`/${noSeri}`, {
        method: 'PUT',
        body: JSON.stringify({ items, keterangan })
      })
    } catch (error) {
      console.error('Error updating PDI data:', error)
      throw error
    }
  }

  async uploadFoto(file: File, noSeri: string, keterangan: string): Promise<void> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('keterangan', keterangan)

      const token = getStoredToken()
      
      const response = await fetch(`${this.baseUrl}/${noSeri}/upload-foto`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Terjadi kesalahan pada server')
      }
    } catch (error) {
      console.error('Error uploading PDI foto:', error)
      throw error
    }
  }

  async getFotoList(noSeri: string): Promise<FotoPDI[]> {
    try {
      const token = getStoredToken()
      const response = await fetch(`${this.baseUrl}/${noSeri}/upload-foto`, {
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
      console.error('Error fetching PDI foto list:', error)
      return []
    }
  }

  async deleteFoto(fotoId: number, noSeri?: string): Promise<void> {
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
      console.error('Error deleting PDI foto:', error)
      throw error
    }
  }
}

export const pdiService = new PDIService() 