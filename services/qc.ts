import { getStoredToken } from '@/lib/auth-utils'

export interface QCItem {
  id?: number
  parameter: string
  aktual: string
  standar: string
}

export interface FotoQC {
  id?: number
  fileName: string
  fileUrl: string
  fileSize?: number
  fileType?: string
  uploadDate?: string
  keterangan?: string
}

class QCService {
  private baseUrl = '/api/qc'

  async getQCData(noSeri: string): Promise<QCItem[]> {
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
      return result.data || []
    } catch (error) {
      console.error('Error fetching QC data:', error)
      throw error
    }
  }

  async updateQCData(noSeri: string, items: QCItem[], keterangan?: string): Promise<void> {
    try {
      const token = getStoredToken()
      const response = await fetch(`${this.baseUrl}/${noSeri}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items, keterangan }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || 'Failed to update QC data')
      }
    } catch (error) {
      console.error('Error updating QC data:', error)
      throw error
    }
  }

  async uploadFoto(file: File, noSeri: string, keterangan: string): Promise<void> {
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
    } catch (error) {
      console.error('Error uploading foto:', error)
      throw error
    }
  }

  async getFotoList(noSeri: string): Promise<FotoQC[]> {
    try {
      const token = getStoredToken()
      const response = await fetch(`${this.baseUrl}/${noSeri}/fotos`, {
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
      console.error('Error fetching foto list:', error)
      throw error
    }
  }

  async deleteFoto(fotoId: number, noSeri: string): Promise<void> {
    try {
      const token = getStoredToken()
      const response = await fetch(`${this.baseUrl}/${noSeri}/fotos?id=${fotoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
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

export const qcService = new QCService() 