import { getStoredToken } from "@/lib/auth-utils"

export interface User {
  id: number
  username: string
  name: string
  email: string | null
  role: 'inspeksi_mesin' | 'assembly_staff' | 'qc_staff' | 'pdi_staff' | 'painting_staff' | 'pindah_lokasi' | 'admin' | 'supervisor'
  isActive: boolean
  jobType: 'staff' | 'supervisor' | 'admin' | null
  createdAt: string
  updatedAt: string
}

export interface UserResponse {
  success: boolean
  message?: string
  data: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CreateUserData {
  username: string
  password: string
  name: string
  email?: string
  role?: 'inspeksi_mesin' | 'assembly_staff' | 'qc_staff' | 'pdi_staff' | 'painting_staff' | 'pindah_lokasi' | 'admin' | 'supervisor'
  jobType?: 'staff' | 'supervisor' | 'admin'
}

export interface UpdateUserData {
  role: 'inspeksi_mesin' | 'assembly_staff' | 'qc_staff' | 'pdi_staff' | 'painting_staff' | 'pindah_lokasi' | 'admin' | 'supervisor'
  isActive: boolean
  jobType: 'staff' | 'supervisor' | 'admin' | null
}

export interface CreateUserResponse {
  success: boolean
  message: string
  data: User
}

export interface UpdateUserResponse {
  success: boolean
  message: string
  data: User
}

export interface DeleteUserResponse {
  success: boolean
  message: string
}

class UserService {
  private baseUrl = '/api/users'

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
  }): Promise<UserResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)

      const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : ''
      
      const result = await this.makeRequest(endpoint)
      return result
    } catch (error) {
      console.error('Error getting users:', error)
      throw error
    }
  }

  async create(data: CreateUserData): Promise<CreateUserResponse> {
    try {
      const result = await this.makeRequest('', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      
      return result
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  async update(id: number, data: UpdateUserData): Promise<UpdateUserResponse> {
    try {
      const result = await this.makeRequest(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      
      return result
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  async delete(id: number): Promise<DeleteUserResponse> {
    try {
      const result = await this.makeRequest(`/${id}`, {
        method: 'DELETE'
      })
      
      return result
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  async getUsersByJobType(jobType: string): Promise<User[]> {
    try {
      const result = await this.makeRequest(`/job-types?jobType=${encodeURIComponent(jobType)}`)
      return result.data
    } catch (error) {
      console.error('Error fetching users by job type:', error)
      throw error
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const result = await this.makeRequest(`/role?role=${encodeURIComponent(role)}`)
      return result.data
    } catch (error) {
      console.error('Error fetching users by role:', error)
      throw error
    }
  }
}

export const userService = new UserService() 