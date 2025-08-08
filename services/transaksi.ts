import { getStoredToken } from "@/lib/auth-utils"
import { TransaksiItem, TransaksiSearchParams } from "@/types/transaksi"

class TransaksiService {
  private baseUrl = '/api/transaksi'

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

  async search(params: TransaksiSearchParams): Promise<TransaksiItem[]> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.noSeri) queryParams.append('noSeri', params.noSeri)
      if (params.namaBarang) queryParams.append('namaBarang', params.namaBarang)
      if (params.lokasi) queryParams.append('lokasi', params.lokasi)
      if (params.kodeKedatangan) queryParams.append('kodeKedatangan', params.kodeKedatangan)

      const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : ''
      
      const result = await this.makeRequest(endpoint)
      
      // Data sudah ditransformasi di API, langsung return
      return result.data
    } catch (error) {
      console.error('Error searching transaksi:', error)
      throw error
    }
  }

  async createTransaksi(data: {
    detailBarangMasukNoSeriId: number
    jenisPekerjaan: string
    staffId: number
    status: string
    ket?: string
    lokasi?: string
  }) {
    try {
      const result = await this.makeRequest('', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      
      return result.data
    } catch (error) {
      console.error('Error creating transaksi:', error)
      throw error
    }
  }

  async updateStatus(transaksiId: string, status: string): Promise<boolean> {
    try {
      await this.makeRequest(`/status`, {
        method: 'PUT',
        body: JSON.stringify({ id: transaksiId, status })
      })
      return true
    } catch (error) {
      console.error('Error updating transaksi status:', error)
      throw error
    }
  }
}

export const transaksiService = new TransaksiService() 