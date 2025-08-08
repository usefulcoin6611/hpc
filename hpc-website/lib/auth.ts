import type { LoginCredentials, LoginResponse, User } from "@/types"
import { apiClient } from "./api-client"
import { 
  getStoredToken, 
  setStoredToken, 
  removeStoredToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  clearAllAuthData,
  isTokenExpired,
  getTokenExpirationTime,
  performLogout
} from "./auth-utils"

export class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null
  private refreshTimeout: NodeJS.Timeout | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
      
      if (response.success && response.data?.token) {
        console.log('AuthService: Login berhasil, menyimpan token...')
        apiClient.setToken(response.data.token)
        
        // Use enhanced setStoredToken function
        const tokenStored = setStoredToken(response.data.token)
        if (tokenStored) {
          console.log('AuthService: Token berhasil disimpan di localStorage dan cookies')
        } else {
          console.error('AuthService: Gagal menyimpan token')
          return {
            success: false,
            message: 'Gagal menyimpan token authentication'
          }
        }
        
        if (response.data?.user) {
          this.currentUser = response.data.user
          setStoredUser(response.data.user)
          console.log('AuthService: User data berhasil disimpan:', response.data.user)
        }

        // Set up automatic token refresh
        this.setupTokenRefresh(response.data.token)
        console.log('AuthService: Token refresh setup selesai')
      }
      
      return response
    } catch (error) {
      console.error('AuthService: Login error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login gagal'
      }
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('AuthService: Starting logout process...')
      
      // Logout, tidak bisa akses admin - Hapus token/session + proteksi route + redirect ke login
      await performLogout()
      
      // Clear current user data
      this.currentUser = null
      
      // Clear refresh timeout
      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout)
        this.refreshTimeout = null
      }
      
      console.log('AuthService: Logout completed')
    } catch (error) {
      console.error('AuthService: Logout error:', error)
      // Even if there's an error, ensure data is cleared
      this.clearAuthData()
    }
  }

  async getCurrentUser(): Promise<User | null> {
    // First check if we have user in memory
    if (this.currentUser) {
      return this.currentUser
    }

    // Then check localStorage
    const storedUser = getStoredUser()
    if (storedUser) {
      this.currentUser = storedUser
      return storedUser
    }

    // Finally try to get from API
    try {
      const response = await apiClient.get<User>('/auth/me')
      if (response.success && response.data) {
        this.currentUser = response.data
        setStoredUser(response.data)
        return response.data
      }
    } catch (error) {
      console.error('Get current user error:', error)
      // If API call fails, clear auth data
      this.clearAuthData()
    }

    return null
  }

  async refreshToken(): Promise<string | null> {
    try {
      const response = await apiClient.post<{ token: string }>('/auth/refresh', {})
      if (response.success && response.data?.token) {
        apiClient.setToken(response.data.token)
        setStoredToken(response.data.token)
        
        // Set up next refresh
        this.setupTokenRefresh(response.data.token)
        
        return response.data.token
      }
    } catch (error) {
      console.error('Refresh token error:', error)
      // If refresh fails, logout user
      this.clearAuthData()
    }

    return null
  }

  isAuthenticated(): boolean {
    console.log('AuthService: isAuthenticated called, window exists:', typeof window !== 'undefined')
    
    // Only check on client side
    if (typeof window === 'undefined') {
      console.log('AuthService: isAuthenticated called on server side, returning false')
      return false
    }
    
    // Use enhanced getStoredToken function
    const token = getStoredToken()
    console.log('AuthService: getStoredToken result, token exists:', !!token)
    console.log('AuthService: getStoredToken result, token value:', token ? token.substring(0, 20) + '...' : 'null')
    
    if (!token) {
      console.log('AuthService: No token found, not authenticated')
      return false
    }
    
    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log('AuthService: Token expired, clearing data and not authenticated')
      // Clear expired token data
      this.clearAuthData()
      return false
    }
    
    console.log('AuthService: Token valid, user authenticated')
    return true
  }

  // New method to check auth and handle expired tokens
  checkAndHandleExpiredToken(): boolean {
    const token = getStoredToken()
    if (!token) return false
    
    // Check if token is expired
    if (isTokenExpired(token)) {
      this.clearAuthData()
      return false
    }
    
    return true
  }

  private setupTokenRefresh(token: string): void {
    // Clear existing timeout
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
    }

    const expirationTime = getTokenExpirationTime(token)
    if (!expirationTime) return

    // Refresh token 5 minutes before expiration
    const refreshTime = expirationTime - (5 * 60 * 1000) // 5 minutes
    const now = Date.now()
    
    if (refreshTime > now) {
      const delay = refreshTime - now
      this.refreshTimeout = setTimeout(() => {
        this.refreshToken()
      }, delay)
    }
  }

  private clearAuthData(): void {
    // Logout, tidak bisa akses admin - Hapus token/session + proteksi route + redirect ke login
    apiClient.clearToken()
    this.currentUser = null
    clearAllAuthData()
    
    // Clear token from cookies
    if (typeof window !== 'undefined') {
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'auth_token=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
    
    // Clear refresh timeout
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
      this.refreshTimeout = null
    }
  }

  // Method to check if user has specific role
  hasRole(role: string): boolean {
    return this.currentUser?.role === role
  }

  // Method to check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    return this.currentUser ? roles.includes(this.currentUser.role) : false
  }

  // Method to get current user role
  getCurrentUserRole(): string | null {
    return this.currentUser?.role || null
  }

  // Legacy methods for backward compatibility
  getStoredUser(): User | null {
    return getStoredUser()
  }

  setStoredUser(user: User): void {
    this.currentUser = user
    setStoredUser(user)
  }

  clearStoredUser(): void {
    this.currentUser = null
    removeStoredUser()
  }
}

// Export singleton instance
export const authService = AuthService.getInstance() 