import { getStoredToken } from '@/lib/auth-utils'

export interface AssemblyItem {
  id?: number
  parameter: string
  hasil: boolean
  keterangan: string
}

export interface FotoAssembly {
  id?: number
  fileName: string
  fileUrl: string
  fileSize?: number
  fileType?: string
  uploadDate?: string
  keterangan?: string
}

class AssemblyService {
  private baseUrl = '/api/assembly'

  async getAssemblyData(noSeri: string): Promise<AssemblyItem[]> {
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
      console.error('Error fetching assembly data:', error)
      throw error
    }
  }

  async updateAssemblyData(noSeri: string, items: AssemblyItem[], keterangan?: string): Promise<any> {
    try {
      const token = getStoredToken()
      const response = await fetch(`${this.baseUrl}/${noSeri}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items, keterangan })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error updating assembly data:', error)
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

  async getFotoList(noSeri: string): Promise<FotoAssembly[]> {
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
      console.error('Error fetching foto list:', error)
      throw error
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
      console.error('Error deleting foto:', error)
      throw error
    }
  }
}

export const assemblyService = new AssemblyService() 