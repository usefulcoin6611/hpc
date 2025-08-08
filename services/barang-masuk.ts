import { getStoredToken } from "@/lib/auth-utils"
import { IncomingItemWithDetails } from "@/types/barang-masuk"

export interface BarangMasukData {
  tanggal: string
  kodeKedatangan: string
  namaSupplier: string
  noForm: string
  status: string
  details: {
    kodeBarang: string
    namaBarang: string
    jumlah: number
    units: {
      noSeri: string
      lokasi: string
      keterangan: string
    }[]
  }[]
}

export interface UpdateBarangMasukData extends BarangMasukData {
  id: number
}

class BarangMasukService {
  private baseUrl = '/api/barang-masuk'

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getStoredToken()
    if (!token) {
      throw new Error('Token tidak ditemukan')
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Terjadi kesalahan pada server')
    }

    return response.json()
  }

  async fetchAll(): Promise<IncomingItemWithDetails[]> {
    try {
      const result = await this.makeRequest('')
      
      // Transform API data to match our frontend structure
      const transformedData: IncomingItemWithDetails[] = result.data.map((item: any) => ({
        id: item.id,
        tanggal: new Date(item.tanggal).toISOString().split('T')[0],
        kodeKedatangan: item.kodeKedatangan || '',
        namaSupplier: item.namaSupplier || '',
        noForm: item.noForm || '',
        status: item.status || '',
        details: item.detailBarangMasuk.map((detail: any) => ({
          id: detail.id,
          kodeBarang: detail.barang?.kode || '',
          namaBarang: detail.barang?.nama || '',
          jumlah: detail.jumlah,
          units: detail.noSeriList.map((unit: any, index: number) => ({
            no: index + 1,
            namaItem: detail.barang?.nama || '',
            lokasi: unit.lokasi || '',
            noSeri: unit.noSeri || '',
            keterangan: unit.keterangan || '',
            unitIndex: index
          }))
        }))
      }))

      return transformedData
    } catch (error) {
      console.error('Error fetching barang masuk:', error)
      throw error
    }
  }

  async create(data: BarangMasukData): Promise<boolean> {
    try {
      await this.makeRequest('', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return true
    } catch (error) {
      console.error('Error creating barang masuk:', error)
      throw error
    }
  }

  async update(id: number, data: BarangMasukData): Promise<boolean> {
    try {
      await this.makeRequest('', {
        method: 'PUT',
        body: JSON.stringify({ id, ...data })
      })
      return true
    } catch (error) {
      console.error('Error updating barang masuk:', error)
      throw error
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.makeRequest(`?id=${id}`, {
        method: 'DELETE'
      })
      return true
    } catch (error) {
      console.error('Error deleting barang masuk:', error)
      throw error
    }
  }
}

export const barangMasukService = new BarangMasukService() 