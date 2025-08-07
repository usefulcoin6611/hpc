"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { getStoredToken } from '@/lib/auth-utils'
import type { User } from '@/types'

interface UseUserReturn {
  user: User | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isFetchingRef = useRef(false)
  const eventListenersAddedRef = useRef(false)
  const fetchUserRef = useRef<((force?: boolean) => Promise<void>) | null>(null)

  const fetchUser = useCallback(async (force = false) => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current && !force) {
      console.log('useUser: fetchUser already in progress, skipping')
      return
    }

    try {
      console.log('useUser: fetchUser called')
      isFetchingRef.current = true
      setIsLoading(true)
      setError(null)

      const token = getStoredToken()
      console.log('useUser: token exists:', !!token)
      
      if (!token) {
        // Tidak ada token, user belum login - ini normal, bukan error
        console.log('useUser: No token found, setting user to null')
        setUser(null)
        setError(null)
        setIsLoading(false)
        isFetchingRef.current = false
        return
      }

      console.log('useUser: Fetching user data from /api/auth/me')
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('useUser: Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('useUser: API error:', errorData)
        throw new Error(errorData.message || 'Failed to fetch user data')
      }

      const result = await response.json()
      console.log('useUser: API response:', result)
      
      if (!result.success) {
        console.error('useUser: API returned success: false')
        throw new Error(result.message || 'Failed to fetch user data')
      }

      // Transform API response to match User interface
      const userData: User = {
        id: result.data.id.toString(),
        username: result.data.username,
        name: result.data.name,
        email: result.data.email,
        role: result.data.role,
        jobType: result.data.jobType,
        isActive: result.data.isActive,
        createdAt: new Date(result.data.createdAt),
        updatedAt: new Date(result.data.updatedAt),
      }

      console.log('useUser: Setting user data:', userData)
      setUser(userData)
    } catch (err) {
      console.error('useUser: Error fetching user:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setUser(null)
    } finally {
      console.log('useUser: Setting loading to false')
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  // Store fetchUser in ref for event listeners
  fetchUserRef.current = fetchUser

  // Set up event listeners only once
  useEffect(() => {
    if (eventListenersAddedRef.current) {
      return
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === null) {
        // Token changed or was removed, refetch user data
        console.log('useUser: Storage change detected, refetching user')
        
        // Check if token still exists before refetching
        const token = getStoredToken()
        if (!token) {
          console.log('useUser: No token found during storage change, setting user to null')
          setUser(null)
          setError(null)
          setIsLoading(false)
          isFetchingRef.current = false
          return
        }
        
        if (fetchUserRef.current) {
          fetchUserRef.current(true)
        }
      }
    }

    const handleTokenChange = () => {
      // Custom event for token changes in same tab
      console.log('useUser: Token change event detected, refetching user')
      
      // Check if token still exists before refetching
      const token = getStoredToken()
      if (!token) {
        console.log('useUser: No token found during token change, setting user to null')
        setUser(null)
        setError(null)
        setIsLoading(false)
        isFetchingRef.current = false
        return
      }
      
      if (fetchUserRef.current) {
        fetchUserRef.current(true)
      }
    }

    // Listen for storage events (when token changes in other tabs)
    window.addEventListener('storage', handleStorageChange)
    
    // Listen for custom token change events (same tab)
    window.addEventListener('tokenChange', handleTokenChange)

    eventListenersAddedRef.current = true

    // Initial fetch
    fetchUser()

    return () => {
      // Clean up event listeners
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('tokenChange', handleTokenChange)
      eventListenersAddedRef.current = false
    }
  }, [fetchUser])

  return {
    user,
    isLoading,
    error,
    refetch: () => fetchUser(true),
  }
}