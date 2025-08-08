import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import type { ApiResponse, PaginatedResponse } from '@/types'

interface UseApiOptions<T> {
  endpoint: string
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  transform?: (data: any) => T
}

interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  setData: (data: T) => void
}

export function useApi<T>(options: UseApiOptions<T>): UseApiReturn<T> {
  const { endpoint, immediate = true, onSuccess, onError, transform } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const hasInitialized = useRef(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<T>(endpoint)
      
      if (response.success && response.data) {
        const transformedData = transform ? transform(response.data) : response.data
        setData(transformedData)
        onSuccess?.(transformedData)
      } else {
        throw new Error(response.message || 'Data tidak ditemukan')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(errorMessage)
      onError?.(errorMessage)
      // Use toast without including it in dependencies
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [endpoint, onSuccess, onError, transform]) // Remove toast from dependencies

  useEffect(() => {
    if (immediate && !hasInitialized.current) {
      hasInitialized.current = true
      fetchData()
    }
  }, [immediate, fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
  }
}

interface UseMutationOptions<T, V> {
  endpoint: string
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  successMessage?: string
  errorMessage?: string
  transform?: (data: any) => T
}

interface UseMutationReturn<T, V> {
  mutate: (variables: V) => Promise<T | null>
  mutateAsync: (variables: V) => Promise<T | null>
  loading: boolean
  error: string | null
  reset: () => void
}

export function useMutation<T, V = any>(options: UseMutationOptions<T, V>): UseMutationReturn<T, V> {
  const { 
    endpoint, 
    method = 'POST', 
    onSuccess, 
    onError, 
    successMessage = 'Operasi berhasil',
    errorMessage = 'Operasi gagal',
    transform 
  } = options
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const executeMutation = useCallback(async (variables: V): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      let response: ApiResponse<T>

      switch (method) {
        case 'POST':
          response = await apiClient.post<T>(endpoint, variables)
          break
        case 'PUT':
          response = await apiClient.put<T>(endpoint, variables)
          break
        case 'PATCH':
          response = await apiClient.patch<T>(endpoint, variables)
          break
        case 'DELETE':
          response = await apiClient.delete<T>(endpoint)
          break
        default:
          throw new Error('Method tidak valid')
      }

      if (response.success && response.data) {
        const transformedData = transform ? transform(response.data) : response.data
        onSuccess?.(transformedData)
        // Use toast without including it in dependencies
        toast({
          title: "Berhasil!",
          description: successMessage,
          variant: "success",
        })
        return transformedData
      } else {
        throw new Error(response.message || errorMessage)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : errorMessage
      setError(errorMsg)
      onError?.(errorMsg)
      // Use toast without including it in dependencies
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [endpoint, method, onSuccess, onError, successMessage, errorMessage, transform]) // Remove toast from dependencies

  const reset = useCallback(() => {
    setError(null)
    setLoading(false)
  }, [])

  return {
    mutate: executeMutation,
    mutateAsync: executeMutation,
    loading,
    error,
    reset,
  }
}

// Hook untuk paginated data
export function usePaginatedApi<T>(
  endpoint: string,
  page: number = 1,
  limit: number = 10,
  search?: string
) {
  const [data, setData] = useState<T[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      })

      const response = await apiClient.get<PaginatedResponse<T>>(`${endpoint}?${params}`)
      
      if (response.success && response.data) {
        setData(response.data.data)
        setPagination(response.data.pagination)
      } else {
        throw new Error(response.message || 'Data tidak ditemukan')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(errorMessage)
      // Use toast without including it in dependencies
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [endpoint, page, limit, search]) // Remove toast from dependencies

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    pagination,
    loading,
    error,
    refetch: fetchData,
  }
} 