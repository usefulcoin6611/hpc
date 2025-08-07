import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

export interface JWTPayload {
  userId: string
  username: string
  role: string
  iat?: number
  exp?: number
}

// Password utilities (sementara tanpa encryption)
export class PasswordUtils {
  static async hashPassword(password: string): Promise<string> {
    // Sementara return password as-is
    return password
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    // Sementara compare langsung
    console.log('PasswordUtils.comparePassword:', { 
      password: password ? '[HIDDEN]' : 'undefined', 
      hash: hash ? '[HIDDEN]' : 'undefined',
      passwordLength: password?.length,
      hashLength: hash?.length,
      isEqual: password === hash
    })
    return password === hash
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    // Alias untuk comparePassword
    return this.comparePassword(password, hash)
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// JWT utilities
export class JWTUtils {
  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '24h',
        issuer: 'warehouse-admin',
        audience: 'warehouse-admin-users'
      })
    } catch (error) {
      throw new Error(`Failed to generate token: ${error}`)
    }
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'warehouse-admin',
        audience: 'warehouse-admin-users'
      }) as JWTPayload
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token')
      } else {
        throw new Error(`Token verification failed: ${error}`)
      }
    }
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload
    } catch (error) {
      return null
    }
  }
}

// Authentication middleware for API routes
export function authenticateToken(token: string): JWTPayload {
  if (!token) {
    throw new Error('Access token required')
  }

  try {
    return JWTUtils.verifyToken(token)
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Invalid token')
  }
}

// Role-based authorization
export function requireRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole)
}

// Extract token from Authorization header
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null
  
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }
  
  return parts[1]
} 

// Auth utilities for consistent token management
export const AUTH_TOKEN_KEY = 'auth_token'
export const USER_DATA_KEY = 'current_user'
export const AUTH_COOKIE_KEY = 'auth_token'

// Enhanced token storage utilities with better error handling and validation
export const getStoredToken = (): string | null => {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.log('AuthUtils: getStoredToken called on server side, returning null')
      return null
    }

    // Try to get token from localStorage first
    let token = localStorage.getItem(AUTH_TOKEN_KEY)
    
    // If not in localStorage, try to get from cookies as fallback
    if (!token) {
      const cookies = document.cookie.split(';')
      const authCookie = cookies.find(cookie => 
        cookie.trim().startsWith(`${AUTH_COOKIE_KEY}=`)
      )
      
      if (authCookie) {
        token = authCookie.split('=')[1]
        console.log('AuthUtils: Token found in cookies, restoring to localStorage')
        // Restore to localStorage for consistency
        if (token) {
          localStorage.setItem(AUTH_TOKEN_KEY, token)
        }
      }
    }

    // Validate token format
    if (token && typeof token === 'string' && token.includes('.')) {
      console.log('AuthUtils: getStoredToken success:', `exists (${token.substring(0, 20)}...)`)
      return token
    } else {
      console.log('AuthUtils: getStoredToken invalid token format')
      // Clean up invalid token
      removeStoredToken()
      return null
    }
  } catch (error) {
    console.error('AuthUtils: getStoredToken error:', error)
    return null
  }
}

export const setStoredToken = (token: string): boolean => {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.log('AuthUtils: setStoredToken called on server side, ignoring')
      return false
    }

    // Validate token format before storing
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      console.error('AuthUtils: setStoredToken invalid token format')
      return false
    }

    // Store in localStorage (primary storage)
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    console.log('AuthUtils: setStoredToken to localStorage:', token.substring(0, 20) + '...')

    // Store in cookies (for middleware and cross-tab access)
    const cookieOptions = [
      `${AUTH_COOKIE_KEY}=${token}`,
      'path=/',
      'SameSite=Lax',
      'max-age=86400' // 24 hours
    ].join('; ')
    
    document.cookie = cookieOptions
    console.log('AuthUtils: setStoredToken to cookies:', token.substring(0, 20) + '...')

    // Verify storage was successful
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
    if (storedToken === token) {
      console.log('AuthUtils: setStoredToken verification successful')
      
      // Dispatch token change event
      dispatchTokenChange()
      
      return true
    } else {
      console.error('AuthUtils: setStoredToken verification failed')
      return false
    }
  } catch (error) {
    console.error('AuthUtils: setStoredToken error:', error)
    return false
  }
}

export const removeStoredToken = (): void => {
  try {
    if (typeof window === 'undefined') return

    // Check if token exists before removing
    const existingToken = localStorage.getItem(AUTH_TOKEN_KEY)
    const hasToken = existingToken || document.cookie.includes(AUTH_COOKIE_KEY)

    // Remove from localStorage
    localStorage.removeItem(AUTH_TOKEN_KEY)
    console.log('AuthUtils: removeStoredToken from localStorage')

    // Remove from cookies
    document.cookie = `${AUTH_COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    console.log('AuthUtils: removeStoredToken from cookies')
    
    // Only dispatch event if token actually existed
    if (hasToken) {
      dispatchTokenChange()
    }
  } catch (error) {
    console.error('AuthUtils: removeStoredToken error:', error)
  }
}

export const getStoredUser = (): any => {
  if (typeof window === 'undefined') return null
  
  try {
    const userStr = localStorage.getItem(USER_DATA_KEY)
    if (userStr) {
      return JSON.parse(userStr)
    }
  } catch (error) {
    console.error('Parse stored user error:', error)
  }

  return null
}

export const setStoredUser = (user: any): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user))
}

export const removeStoredUser = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_DATA_KEY)
}

export const clearAllAuthData = (): void => {
  try {
    console.log('AuthUtils: clearAllAuthData called')
    
    // Remove token first
    removeStoredToken()
    
    // Remove user data
    removeStoredUser()
    
    // Clear any remaining cookies
    if (typeof window !== 'undefined') {
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'auth_token=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      
      // Clear any other auth-related cookies
      const cookies = document.cookie.split(';')
      cookies.forEach(cookie => {
        const [name] = cookie.split('=')
        if (name.trim().includes('auth') || name.trim().includes('token')) {
          document.cookie = `${name.trim()}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        }
      })
    }
    
    console.log('AuthUtils: clearAllAuthData completed')
  } catch (error) {
    console.error('AuthUtils: clearAllAuthData error:', error)
  }
}

export const isAuthenticated = (): boolean => {
  return !!getStoredToken()
}

// Token expiration utilities
export const isTokenExpired = (token: string): boolean => {
  try {
    // Validate token format first
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      return true
    }
    
    const parts = token.split('.')
    if (parts.length !== 3) {
      return true
    }
    
    // Decode payload safely
    const payload = JSON.parse(atob(parts[1]))
    const currentTime = Date.now() / 1000
    
    // Check if exp exists and is valid
    if (!payload.exp || typeof payload.exp !== 'number') {
      return true
    }
    
    return payload.exp < currentTime
  } catch (error) {
    console.error('Token expiration check error:', error)
    return true
  }
}

export const getTokenExpirationTime = (token: string): number | null => {
  try {
    // Validate token format first
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      return null
    }
    
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    
    const payload = JSON.parse(atob(parts[1]))
    
    // Check if exp exists and is valid
    if (!payload.exp || typeof payload.exp !== 'number') {
      return null
    }
    
    return payload.exp * 1000 // Convert to milliseconds
  } catch (error) {
    console.error('Get token expiration error:', error)
    return null
  }
}

// Function to dispatch token change event with debouncing
let tokenChangeTimeout: NodeJS.Timeout | null = null
export function dispatchTokenChange() {
  if (typeof window !== 'undefined') {
    // Clear existing timeout to prevent multiple events
    if (tokenChangeTimeout) {
      clearTimeout(tokenChangeTimeout)
    }
    
    // Debounce the event dispatch
    tokenChangeTimeout = setTimeout(() => {
      console.log('AuthUtils: Dispatching tokenChange event')
      window.dispatchEvent(new CustomEvent('tokenChange'))
      tokenChangeTimeout = null
    }, 50)
  }
}

// Permission utility functions
export function hasPermission(userRole: string, userJobType: string | null, allowedRoles?: string[], allowedJobTypes?: string[]): boolean {
  // If no permission restrictions, allow access
  if (!allowedRoles && !allowedJobTypes) {
    return true
  }

  // Check role permission
  if (allowedRoles && allowedRoles.length > 0) {
    if (allowedRoles.includes(userRole)) {
      return true
    }
  }

  // Check job type permission
  if (allowedJobTypes && allowedJobTypes.length > 0 && userJobType) {
    if (allowedJobTypes.includes(userJobType)) {
      return true
    }
  }

  return false
}

export function filterMenuItemsByPermission(menuItems: any[], userRole: string, userJobType: string | null): any[] {
  return menuItems.filter(item => {
    // Check if item has permission restrictions
    if (!item.permission) {
      return true // No restrictions, show item
    }

    const { roles, jobTypes } = item.permission
    return hasPermission(userRole, userJobType, roles, jobTypes)
  }).map(item => {
    // Recursively filter children if they exist
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: filterMenuItemsByPermission(item.children, userRole, userJobType)
      }
    }
    return item
  })
}

// Robust logout function
export async function performLogout(): Promise<void> {
  try {
    console.log('AuthUtils: performLogout started')
    
    // Clear all auth data first
    clearAllAuthData()
    
    // Try to call logout API (but don't fail if it doesn't work)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        console.log('AuthUtils: Logout API call successful')
      } else {
        console.log('AuthUtils: Logout API call failed, but continuing with local cleanup')
      }
    } catch (error) {
      console.log('AuthUtils: Logout API call error, but continuing with local cleanup:', error)
    }
    
    // Dispatch token change event
    dispatchTokenChange()
    
    console.log('AuthUtils: performLogout completed')
  } catch (error) {
    console.error('AuthUtils: performLogout error:', error)
    // Even if there's an error, ensure data is cleared
    clearAllAuthData()
  }
}

// Reliable redirect function for logout
export function redirectToLogin(): void {
  try {
    console.log('AuthUtils: redirectToLogin called')
    
    // Use window.location.href for more reliable redirect
    if (typeof window !== 'undefined') {
      // Force redirect to login page
      window.location.href = "/admin/login"
    }
  } catch (error) {
    console.error('AuthUtils: redirectToLogin error:', error)
    // Fallback to window.location.replace
    if (typeof window !== 'undefined') {
      window.location.replace("/admin/login")
    }
  }
}