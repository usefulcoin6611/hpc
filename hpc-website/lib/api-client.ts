import type { ApiResponse, PaginatedResponse } from "@/types"
import { getStoredToken, setStoredToken, removeStoredToken, isTokenExpired } from "./auth-utils"

export class ApiClient {
  private baseURL: string
  private token: string | null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = getStoredToken()
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Get fresh token from storage
    this.token = getStoredToken()
    
    if (this.token) {
      // Check if token is expired
      if (isTokenExpired(this.token)) {
        this.clearToken()
        // Saya melihat ketika password salah ada redirect page, apa benar? jika iya itu tidak perlu
        // Jangan redirect otomatis untuk endpoint login
        if (!endpoint.includes('/auth/login')) {
          window.location.href = '/admin/login'
        }
        throw new Error('Token expired')
      }
      
      (headers as any).Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          this.clearToken()
          // Saya melihat ketika password salah ada redirect page, apa benar? jika iya itu tidak perlu
          // Jangan redirect otomatis untuk endpoint login
          if (!endpoint.includes('/auth/login')) {
            window.location.href = '/admin/login'
          }
        }
        
        // Saat password salah ada error Error: Username atau password salah
        // Untuk login endpoint, jangan throw error, kembalikan response dengan success: false
        if (endpoint.includes('/auth/login')) {
          return {
            success: false,
            message: data.message || `HTTP ${response.status}`,
            data: undefined
          }
        }
        
        throw new Error(data.message || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      // Saat password salah ada error Error: Username atau password salah
      // Untuk login endpoint, jangan throw error, kembalikan response dengan success: false
      if (endpoint.includes('/auth/login')) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Terjadi kesalahan saat login',
          data: undefined
        }
      }
      
      if (error instanceof Error && error.message.includes('401')) {
        this.clearToken()
        // Saya melihat ketika password salah ada redirect page, apa benar? jika iya itu tidak perlu
        // Jangan redirect otomatis untuk endpoint login
        if (!endpoint.includes('/auth/login')) {
          window.location.href = '/admin/login'
        }
      }
      throw error
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  // POST request
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // PUT request
  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // PATCH request
  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Set token (for login)
  setToken(token: string): void {
    this.token = token
    setStoredToken(token)
  }

  // Clear token (for logout)
  clearToken(): void {
    this.token = null
    removeStoredToken()
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    const token = getStoredToken()
    if (!token) return false
    
    return !isTokenExpired(token)
  }
}

// Create singleton instance
export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
) 