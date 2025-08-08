import { useState, useEffect, useCallback } from 'react'
import { getStoredToken } from '@/lib/auth-utils'

interface BarangOption {
  id: number
  kode: string
  nama: string
  satuan: string
  harga: number
  stok: number
  lokasi: string
  jenis: string
  label: string
  value: number
}

interface UseBarangAutocompleteReturn {
  options: BarangOption[]
  loading: boolean
  error: string | null
  searchBarang: (query: string) => void
  clearSearch: () => void
}

export function useBarangAutocomplete(): UseBarangAutocompleteReturn {
  const [options, setOptions] = useState<BarangOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const searchBarang = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setOptions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = getStoredToken()
      if (!token) {
        throw new Error('Token tidak ditemukan')
      }

      const response = await fetch(`/api/barang/search?q=${encodeURIComponent(query)}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Gagal mencari barang')
      }

      const data = await response.json()
      setOptions(data.data || [])
    } catch (err) {
      console.error('Error searching barang:', err)
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      setOptions([])
    } finally {
      setLoading(false)
    }
  }, [])

  const debouncedSearch = useCallback((query: string) => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      searchBarang(query)
    }, 300) // 300ms delay

    setSearchTimeout(timeout)
  }, [searchBarang, searchTimeout])

  const clearSearch = useCallback(() => {
    setOptions([])
    setLoading(false)
    setError(null)
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
  }, [searchTimeout])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  return {
    options,
    loading,
    error,
    searchBarang: debouncedSearch,
    clearSearch
  }
} 