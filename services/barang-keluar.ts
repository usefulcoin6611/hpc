import { getStoredToken } from "@/lib/auth-utils"

export interface CreateBarangKeluarData {
  tanggal: Date
  deliveryNo?: string
  shipVia?: string
  tujuan: string
  keterangan: string
  items: {
    barangId: number
    detailBarangMasukNoSeriId: number
    kode: string
    nama: string
    qty: number
  }[]
}

export interface UpdateBarangKeluarData {
  tanggal: Date
  deliveryNo?: string
  shipVia?: string
  tujuan: string
  keterangan: string
  items: {
    barangId: number
    detailBarangMasukNoSeriId: number
    kode: string
    nama: string
    qty: number
  }[]
}

export interface BarangKeluarListItem {
  id: number
  noTransaksi: string
  deliveryNo?: string
  shipVia?: string
  tanggal: string
  tujuan: string
  keterangan?: string
  status: string
  totalItems: number
  noSeriList?: string[]
  createdBy: {
    id: number
    name: string
    username: string
  }
  approvedBy?: {
    id: number
    name: string
    username: string
  }
  createdAt: string
  updatedAt: string
}

export interface BarangKeluarItem {
  id: number
  tanggal: string
  noTransaksi: string
  deliveryNo?: string
  shipVia?: string
  tujuan: string
  keterangan: string
  status: string
  createdBy: {
    id: number
    name: string
    username: string
  }
  approvedBy?: {
    id: number
    name: string
    username: string
  }
  detailBarangKeluar: {
    id: number
    jumlah: number
    detailBarangMasukNoSeri?: {
      id: number
      noSeri: string
    } | null
    barang: {
      id: number
      kode: string
      nama: string
      satuan: string
    }
  }[]
  totalItems: number
  createdAt: string
  updatedAt: string
}

export interface BarangKeluarResponse {
  success: boolean
  message?: string
  data: BarangKeluarListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CreateBarangKeluarResponse {
  success: boolean
  message: string
  data: {
    id: number
    noTransaksi: string
    deliveryNo?: string
    shipVia?: string
    tanggal: string
    tujuan: string
    keterangan?: string
    status: string
    totalItems: number
    createdAt: string
  }
}

class BarangKeluarService {
  private baseUrl = '/api/barang-keluar'

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

  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }): Promise<BarangKeluarResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.status) queryParams.append('status', params.status)

      const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : ''
      
      const result = await this.makeRequest(endpoint)
      return result
    } catch (error) {
      console.error('Error getting barang keluar:', error)
      throw error
    }
  }

  async create(data: CreateBarangKeluarData): Promise<CreateBarangKeluarResponse> {
    try {
      const result = await this.makeRequest('', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      
      return result
    } catch (error) {
      console.error('Error creating barang keluar:', error)
      throw error
    }
  }

  async getById(id: number): Promise<{ success: boolean; data: BarangKeluarItem }> {
    try {
      const result = await this.makeRequest(`/${id}`)
      return result
    } catch (error) {
      console.error('Error getting barang keluar by id:', error)
      throw error
    }
  }

  async approve(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.makeRequest(`/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'approve' })
      })
      
      return result
    } catch (error) {
      console.error('Error approving barang keluar:', error)
      throw error
    }
  }

  async update(id: number, data: UpdateBarangKeluarData): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.makeRequest(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      
      return result
    } catch (error) {
      console.error('Error updating barang keluar:', error)
      throw error
    }
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.makeRequest(`/${id}`, {
        method: 'DELETE'
      })
      
      return result
    } catch (error) {
      console.error('Error deleting barang keluar:', error)
      throw error
    }
  }
}

export const barangKeluarService = new BarangKeluarService() 