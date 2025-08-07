"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileEdit, Plus, Search, Trash2, User, UserCheck, UserCog, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useUsers } from "@/hooks/use-users"
import { usePermission } from "@/hooks/use-permission"
import { AccessDenied } from "@/components/access-denied"
import { EditUserDialog } from "@/components/dialogs/EditUserDialog"
import { DeleteUserDialog } from "@/components/dialogs/DeleteUserDialog"
import { ErrorBoundary } from "@/components/error-boundary"
import { getStoredToken } from "@/lib/auth-utils"

export default function DataPenggunaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Hook untuk data pengguna
  const { users, loading, fetchUsers, createUser, updateUser, deleteUser } = useUsers()
  
  // Hook untuk permission
  const { canAccessDataPengguna, isAdmin, isLoading: permissionLoading } = usePermission()

  // Effect untuk mendeteksi logout
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = getStoredToken()
      if (!token && !permissionLoading) {
        setIsLoggingOut(true)
      }
    }

    // Check immediately
    checkAuthStatus()

    // Listen for storage changes (logout)
    const handleStorageChange = () => {
      checkAuthStatus()
    }

    // Listen for token change events
    const handleTokenChange = () => {
      checkAuthStatus()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('tokenChange', handleTokenChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('tokenChange', handleTokenChange)
    }
  }, [permissionLoading])

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users
    
    const lowerSearchTerm = searchTerm.toLowerCase()
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerSearchTerm) ||
        user.username.toLowerCase().includes(lowerSearchTerm) ||
        (user.email && user.email.toLowerCase().includes(lowerSearchTerm)) ||
        user.role.toLowerCase().includes(lowerSearchTerm) ||
        (user.jobType && user.jobType.toLowerCase().includes(lowerSearchTerm))
    )
  }, [users, searchTerm])

  // Show loading while checking permissions
  if (permissionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Memeriksa izin akses...</span>
      </div>
    )
  }

  // Show loading during logout
  if (isLoggingOut) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Logging out...</span>
      </div>
    )
  }

  // Check if user has permission to access this page
  if (!canAccessDataPengguna) {
    return (
      <AccessDenied 
        title="Akses Data Pengguna Ditolak"
        message="Hanya administrator yang dapat mengakses halaman Data Pengguna."
      />
    )
  }

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    fetchUsers({ search: term })
  }

  // Handle add user
  const handleAddUser = async () => {
    setIsLoading(true)
    try {
      // Simulate add user delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log("Adding new user...")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle edit user
  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  // Handle delete user
  const handleDeleteUser = (user: any) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  // Handle edit submit
  const handleEditSubmit = async (data: { 
    id: number; 
    role: 'inspeksi_mesin' | 'assembly_staff' | 'qc_staff' | 'pdi_staff' | 'painting_staff' | 'pindah_lokasi' | 'admin' | 'supervisor'; 
    isActive: boolean; 
    jobType: 'staff' | 'supervisor' | 'admin' | null 
  }) => {
    return await updateUser(data.id, {
      role: data.role,
      isActive: data.isActive,
      jobType: data.jobType
    })
  }

  // Handle delete confirm
  const handleDeleteConfirm = async (userId: number) => {
    return await deleteUser(userId)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return "Hari ini, " + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 2) {
      return "Kemarin, " + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('id-ID') + ", " + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin'
      case 'supervisor':
        return 'Supervisor'
      case 'inspeksi_mesin':
        return 'Inspeksi Mesin'
      case 'assembly_staff':
        return 'Assembly Staff'
      case 'qc_staff':
        return 'QC Staff'
      case 'pdi_staff':
        return 'PDI Staff'
      case 'painting_staff':
        return 'Painting Staff'
      case 'pindah_lokasi':
        return 'Pindah Lokasi'
      default:
        return role.charAt(0).toUpperCase() + role.slice(1)
    }
  }

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-700'
      case 'supervisor':
        return 'bg-indigo-100 text-indigo-700'
      case 'inspeksi_mesin':
        return 'bg-orange-100 text-orange-700'
      case 'assembly_staff':
        return 'bg-green-100 text-green-700'
      case 'qc_staff':
        return 'bg-blue-100 text-blue-700'
      case 'pdi_staff':
        return 'bg-purple-100 text-purple-700'
      case 'painting_staff':
        return 'bg-pink-100 text-pink-700'
      case 'pindah_lokasi':
        return 'bg-amber-100 text-amber-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Get job type badge color
  const getJobTypeBadgeColor = (jobType: string) => {
    switch (jobType) {
      case 'admin':
        return 'bg-red-100 text-red-700'
      case 'supervisor':
        return 'bg-indigo-100 text-indigo-700'
      case 'staff':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 pb-8 pt-4 lg:pt-0 animate-fadeIn">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">Data Pengguna</h1>
        <div className="text-sm text-gray-500">Total: {filteredUsers.length} pengguna</div>
      </div>

      <div className="h-px w-full bg-gray-200" />

      {/* Button Tambah Data, Export dan Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Button Tambah Data - Rata Kiri */}
        <Button
          className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 sm:px-4"
          onClick={handleAddUser}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Adding...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              <span>Info Akses Pengguna</span>
            </>
          )}
        </Button>

        {/* Search - Rata Kanan */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari pengguna..."
            className="w-full rounded-xl border-gray-200 bg-white pl-4 py-2 pr-10 focus:border-primary focus:ring-primary sm:w-64"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Mobile card view */}
      <div className="grid gap-4 lg:hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada data pengguna</h3>
            <p className="text-sm text-gray-600">
              Mulai dengan menambahkan pengguna pertama ke sistem
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3430e2]/10 text-[#3430e2]">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`rounded-full ${
                    user.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {user.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm">{user.email || "Tidak ada email"}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <Badge className={`mt-1 ${getRoleBadgeColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Login Terakhir</p>
                    <p className="text-sm text-muted-foreground">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
                {user.jobType && (
                  <div>
                    <p className="text-xs text-muted-foreground">Job Type</p>
                    <Badge className={`mt-1 ${getJobTypeBadgeColor(user.jobType)}`}>
                      {user.jobType}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button 
                  className="flex-1 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-500"
                  onClick={() => handleEditUser(user)}
                >
                  <FileEdit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button 
                  className="flex-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                  onClick={() => handleDeleteUser(user)}
                  disabled={user.role === 'admin'}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Hapus
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-soft lg:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-sky-100">
                <TableHead className="w-12 rounded-tl-xl py-3 text-center font-medium text-gray-600">No</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Nama</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Username</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Email</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Role</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Status</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Job Type</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Login Terakhir</TableHead>
                <TableHead className="rounded-tr-xl py-3 text-center font-medium text-gray-600">Pengaturan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2 text-gray-600">Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <User className="h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada data pengguna</h3>
                      <p className="text-sm text-gray-600">
                        Mulai dengan menambahkan pengguna pertama ke sistem
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, index) => (
                  <TableRow key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <TableCell className="text-center font-medium text-gray-600">{index + 1}</TableCell>
                    <TableCell className="font-medium text-gray-800">{user.name}</TableCell>
                    <TableCell className="text-gray-800">@{user.username}</TableCell>
                    <TableCell className="text-gray-800">{user.email || "-"}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                      >
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.jobType ? (
                        <Badge className={getJobTypeBadgeColor(user.jobType)}>
                          {user.jobType}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">{formatDate(user.updatedAt)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          className="h-8 rounded-lg bg-amber-400 px-3 text-xs font-medium text-white hover:bg-amber-500"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          className="h-8 rounded-lg bg-red-500 px-3 text-xs font-medium text-white hover:bg-red-600"
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.role === 'admin'}
                        >
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit User Dialog */}
      <EditUserDialog
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setSelectedUser(null)
        }}
        onSubmit={handleEditSubmit}
        user={selectedUser}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setSelectedUser(null)
        }}
        onConfirm={handleDeleteConfirm}
        user={selectedUser}
      />
    </div>
    </ErrorBoundary>
  )
}

