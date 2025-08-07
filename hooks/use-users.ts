import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { getStoredToken } from "@/lib/auth-utils"
import { userService, User, CreateUserData, UpdateUserData } from "@/services/user"

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const { toast } = useToast()

  const fetchUsers = async (params?: {
    page?: number
    limit?: number
    search?: string
  }) => {
    setLoading(true)
    try {
      // Check if user is authenticated before making API call
      const token = getStoredToken()
      if (!token) {
        console.log('useUsers: No token found, skipping API call')
        setUsers([])
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        })
        setLoading(false)
        return
      }
      
      const response = await userService.getAll(params)
      
      if (response.success) {
        setUsers(response.data || [])
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        })
      } else {
        setUsers([])
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        })
        if (response.message && !response.message.includes('tidak ditemukan')) {
          toast({
            title: "Error",
            description: "Gagal mengambil data pengguna",
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      })
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: "Gagal memuat data pengguna",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (data: CreateUserData): Promise<boolean> => {
    try {
      // Check if user is authenticated before making API call
      const token = getStoredToken()
      if (!token) {
        toast({
          title: "Error",
          description: "Sesi Anda telah berakhir. Silakan login kembali.",
          variant: "destructive"
        })
        return false
      }
      
      const response = await userService.create(data)
      if (response.success) {
        toast({
          title: "Sukses",
          description: response.message,
        })
        await fetchUsers()
        return true
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal menambahkan pengguna",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menambahkan pengguna",
        variant: "destructive"
      })
      return false
    }
  }

  const updateUser = async (id: number, data: UpdateUserData): Promise<boolean> => {
    try {
      // Check if user is authenticated before making API call
      const token = getStoredToken()
      if (!token) {
        toast({
          title: "Error",
          description: "Sesi Anda telah berakhir. Silakan login kembali.",
          variant: "destructive"
        })
        return false
      }
      
      const response = await userService.update(id, data)
      if (response.success) {
        toast({
          title: "Sukses",
          description: response.message,
        })
        await fetchUsers()
        return true
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal mengupdate pengguna",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengupdate pengguna",
        variant: "destructive"
      })
      return false
    }
  }

  const deleteUser = async (id: number): Promise<boolean> => {
    try {
      // Check if user is authenticated before making API call
      const token = getStoredToken()
      if (!token) {
        toast({
          title: "Error",
          description: "Sesi Anda telah berakhir. Silakan login kembali.",
          variant: "destructive"
        })
        return false
      }
      
      const response = await userService.delete(id)
      if (response.success) {
        toast({
          title: "Sukses",
          description: response.message,
        })
        await fetchUsers()
        return true
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal menghapus pengguna",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus pengguna",
        variant: "destructive"
      })
      return false
    }
  }

  // Load data on mount
  useEffect(() => {
    // Only fetch users if user is authenticated
    const token = getStoredToken()
    if (token) {
      fetchUsers()
    }
  }, [])

  return {
    users,
    loading,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  }
}
