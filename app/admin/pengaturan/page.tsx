"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  Users,
  Shield,
  UserCog,
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"
import { getStoredToken } from "@/lib/auth-utils"

export default function PengaturanPage() {
  const { user, isLoading: isUserLoading, refetch } = useUser()
  const { toast } = useToast()

  // Form states for profile update
  const [profileForm, setProfileForm] = useState({
    name: "",
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Form states for new user creation
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    username: "",
    email: "",
    role: "inspeksi_mesin",
    jobType: "staff",
    password: "",
    confirmPassword: ""
  })

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  // Determine if user is admin based on actual user data
  const isAdmin = user?.role === 'admin'

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || "",
        username: user.username || ""
      }))
    }
  }, [user])

  // Handle profile form changes
  const handleProfileChange = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle new user form changes
  const handleNewUserChange = (field: string, value: string) => {
    setNewUserForm(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-sync jobType based on role selection (optional convenience)
    if (field === 'role') {
      let defaultJobType = 'staff'
      
      if (value === 'admin') {
        defaultJobType = 'admin'
      } else if (value === 'supervisor') {
        defaultJobType = 'supervisor'
      } else {
        // Untuk semua role lainnya (inspeksi_mesin, assembly_staff, qc_staff, dll)
        defaultJobType = 'staff'
      }
      
      setNewUserForm(prev => ({
        ...prev,
        jobType: defaultJobType
      }))
    }
  }

  // Update profile
  const handleUpdateProfile = async () => {
    if (!user) return

    // Validate password change
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Password baru dan konfirmasi password tidak cocok",
        variant: "destructive"
      })
      return
    }

    if (profileForm.newPassword && !profileForm.currentPassword) {
      toast({
        title: "Error",
        description: "Password saat ini wajib diisi untuk mengubah password",
        variant: "destructive"
      })
      return
    }

    setIsUpdatingProfile(true)
    try {
      const updateData: any = {
        name: profileForm.name,
        username: profileForm.username
      }

      if (profileForm.newPassword) {
        updateData.currentPassword = profileForm.currentPassword
        updateData.newPassword = profileForm.newPassword
      }

      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Sukses",
          description: "Profil berhasil diupdate",
        })
        
        // Reset password fields
        setProfileForm(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }))
        
        // Refetch user data
        await refetch()
      } else {
        toast({
          title: "Error",
          description: result.message || "Gagal mengupdate profil",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengupdate profil",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // Create new user
  const handleCreateUser = async () => {
    // Validate form
    if (!newUserForm.name || !newUserForm.username || !newUserForm.password || !newUserForm.jobType) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi",
        variant: "destructive"
      })
      return
    }

    if (newUserForm.password !== newUserForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Password dan konfirmasi password tidak cocok",
        variant: "destructive"
      })
      return
    }

    if (newUserForm.password.length < 6) {
      toast({
        title: "Error",
        description: "Password minimal 6 karakter",
        variant: "destructive"
      })
      return
    }

    setIsCreatingUser(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({
          name: newUserForm.name,
          username: newUserForm.username,
          email: newUserForm.email || null,
          password: newUserForm.password,
          role: newUserForm.role,
          jobType: newUserForm.jobType
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Sukses",
          description: "User berhasil dibuat",
        })
        
        // Reset form
        setNewUserForm({
          name: "",
          username: "",
          email: "",
          role: "inspeksi_mesin",
          jobType: "staff",
          password: "",
          confirmPassword: ""
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Gagal membuat user",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat user",
        variant: "destructive"
      })
    } finally {
      setIsCreatingUser(false)
    }
  }

  return (
    <div className="space-y-6 pb-8 pt-4 lg:pt-0 animate-fadeIn">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">Pengaturan Pengguna</h1>
          <Badge 
            variant={isAdmin ? "default" : "secondary"}
            className={`flex items-center gap-1 ${
              isUserLoading 
                ? "bg-gray-100 text-gray-500" 
                : isAdmin 
                  ? "bg-purple-100 text-purple-700 hover:bg-purple-200" 
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            {isUserLoading ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border border-gray-400 border-t-transparent"></div>
                Loading...
              </>
            ) : (
              <>
                {isAdmin ? <Shield className="h-3 w-3" /> : <UserCog className="h-3 w-3" />}
                {isAdmin ? "Admin" : "Staff"}
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="h-px w-full bg-gray-200" />

      {/* Admin View - Full settings */}
      {isAdmin ? (
        <div className="space-y-6">
          {/* Admin Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Pengaturan Profil Admin
              </CardTitle>
              <CardDescription>Update informasi profil Anda sebagai administrator</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-display-name">Nama Lengkap *</Label>
                  <Input 
                    id="admin-display-name" 
                    placeholder="Masukkan nama lengkap" 
                    className="rounded-xl" 
                    value={profileForm.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    disabled={isUserLoading}
                  />
                  <p className="text-xs text-gray-500">Nama lengkap yang akan ditampilkan</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Username *</Label>
                  <Input 
                    id="admin-username" 
                    placeholder="Masukkan username" 
                    className="rounded-xl" 
                    value={profileForm.username}
                    onChange={(e) => handleProfileChange('username', e.target.value)}
                    disabled={isUserLoading}
                  />
                  <p className="text-xs text-gray-500">Username untuk login (tidak boleh duplikat)</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-current-password">Password Saat Ini</Label>
                <Input 
                  id="admin-current-password" 
                  type="password" 
                  placeholder="Masukkan password saat ini" 
                  className="rounded-xl"
                  value={profileForm.currentPassword}
                  onChange={(e) => handleProfileChange('currentPassword', e.target.value)}
                />
                <p className="text-xs text-gray-500">Wajib diisi jika ingin mengubah password</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-new-password">Password Baru</Label>
                  <Input 
                    id="admin-new-password" 
                    type="password" 
                    placeholder="Masukkan password baru" 
                    className="rounded-xl"
                    value={profileForm.newPassword}
                    onChange={(e) => handleProfileChange('newPassword', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Kosongkan jika tidak ingin mengubah password</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-confirm-password">Konfirmasi Password Baru</Label>
                  <Input 
                    id="admin-confirm-password" 
                    type="password" 
                    placeholder="Konfirmasi password baru" 
                    className="rounded-xl"
                    value={profileForm.confirmPassword}
                    onChange={(e) => handleProfileChange('confirmPassword', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Masukkan ulang password baru untuk konfirmasi</p>
                </div>
              </div>
              {/* Password criteria info */}
              {(profileForm.newPassword || profileForm.confirmPassword) && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Kriteria Password Baru:</h4>
                  <p className="text-xs text-blue-600 mb-3">Password baru harus memenuhi semua kriteria berikut:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${profileForm.newPassword && profileForm.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Minimal 6 karakter
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${profileForm.newPassword && /[A-Z]/.test(profileForm.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Mengandung huruf besar (A-Z)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${profileForm.newPassword && /[a-z]/.test(profileForm.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Mengandung huruf kecil (a-z)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${profileForm.newPassword && /\d/.test(profileForm.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Mengandung angka (0-9)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${profileForm.newPassword && profileForm.newPassword === profileForm.confirmPassword ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Password dan konfirmasi password cocok
                    </li>
                  </ul>
                </div>
              )}
              <Button 
                className="w-full rounded-xl bg-primary hover:bg-primary/90"
                onClick={handleUpdateProfile}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengupdate...
                  </>
                ) : (
                  <>
                    <UserCog className="mr-2 h-4 w-4" />
                    Update Profil Admin
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Admin Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manajemen Pengguna
              </CardTitle>
              <CardDescription>Kelola pengguna sistem dan buat akun baru</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Buat Akun Pengguna Baru</h4>
                <p className="text-xs text-gray-500 mb-4">Semua field dengan tanda (*) wajib diisi untuk membuat akun baru</p>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 mb-4">
                  <h5 className="text-xs font-medium text-blue-800 mb-2">Info Mapping Role → JobType:</h5>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Role: <strong>admin</strong> → JobType: <strong>admin</strong></li>
                    <li>• Role: <strong>supervisor</strong> → JobType: <strong>supervisor</strong></li>
                    <li>• Role: <strong>inspeksi_mesin, assembly_staff, qc_staff, pdi_staff, painting_staff, pindah_lokasi</strong> → JobType: <strong>staff</strong></li>
                  </ul>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-user-name">Nama Lengkap *</Label>
                    <Input 
                      id="new-user-name" 
                      placeholder="Masukkan nama lengkap" 
                      className="rounded-xl"
                      value={newUserForm.name}
                      onChange={(e) => handleNewUserChange('name', e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Nama lengkap pengguna yang akan dibuat</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-username">Username *</Label>
                    <Input 
                      id="new-user-username" 
                      placeholder="Masukkan username" 
                      className="rounded-xl"
                      value={newUserForm.username}
                      onChange={(e) => handleNewUserChange('username', e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Username unik untuk login (tidak boleh duplikat)</p>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-user-email">Email</Label>
                    <Input 
                      id="new-user-email" 
                      type="email" 
                      placeholder="Masukkan email (opsional)" 
                      className="rounded-xl"
                      value={newUserForm.email}
                      onChange={(e) => handleNewUserChange('email', e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Email bersifat opsional, bisa dikosongkan</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-role">Role *</Label>
                    <Select 
                      value={newUserForm.role} 
                      onValueChange={(value) => handleNewUserChange('role', value)}
                    >
                      <SelectTrigger id="new-user-role" className="rounded-xl">
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inspeksi_mesin">Inspeksi Mesin</SelectItem>
                        <SelectItem value="assembly_staff">Assembly Staff</SelectItem>
                        <SelectItem value="qc_staff">QC Staff</SelectItem>
                        <SelectItem value="pdi_staff">PDI Staff</SelectItem>
                        <SelectItem value="painting_staff">Painting Staff</SelectItem>
                        <SelectItem value="pindah_lokasi">Pindah Lokasi</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">Pilih role sesuai dengan tugas pengguna (akan auto-set jobType)</p>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-user-jobtype">Job Type *</Label>
                    <Select 
                      value={newUserForm.jobType} 
                      onValueChange={(value) => handleNewUserChange('jobType', value)}
                    >
                      <SelectTrigger id="new-user-jobtype" className="rounded-xl">
                        <SelectValue placeholder="Pilih job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">Pilih job type sesuai dengan level pengguna (bisa diubah manual)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-password">Password *</Label>
                    <Input 
                      id="new-user-password" 
                      type="password" 
                      placeholder="Masukkan password" 
                      className="rounded-xl"
                      value={newUserForm.password}
                      onChange={(e) => handleNewUserChange('password', e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Password untuk login pengguna baru</p>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-user-confirm-password">Konfirmasi Password *</Label>
                    <Input 
                      id="new-user-confirm-password" 
                      type="password" 
                      placeholder="Konfirmasi password" 
                      className="rounded-xl"
                      value={newUserForm.confirmPassword}
                      onChange={(e) => handleNewUserChange('confirmPassword', e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Masukkan ulang password untuk konfirmasi</p>
                  </div>
                  <div className="space-y-2">
                    {/* Empty div untuk balance layout */}
                  </div>
                </div>
                {/* Password criteria info for new user */}
                {(newUserForm.password || newUserForm.confirmPassword) && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Kriteria Password:</h4>
                    <p className="text-xs text-blue-600 mb-3">Password harus memenuhi semua kriteria berikut:</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${newUserForm.password && newUserForm.password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Minimal 6 karakter
                      </li>
                      <li className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${newUserForm.password && /[A-Z]/.test(newUserForm.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Mengandung huruf besar (A-Z)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${newUserForm.password && /[a-z]/.test(newUserForm.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Mengandung huruf kecil (a-z)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${newUserForm.password && /\d/.test(newUserForm.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Mengandung angka (0-9)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${newUserForm.password && newUserForm.password === newUserForm.confirmPassword ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Password dan konfirmasi password cocok
                      </li>
                    </ul>
                  </div>
                )}
                <Button 
                  className="w-full rounded-xl bg-primary hover:bg-primary/90"
                  onClick={handleCreateUser}
                  disabled={isCreatingUser}
                >
                  {isCreatingUser ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Membuat User...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Buat Akun Baru
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Staff View - Profile only */
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Pengaturan Profil
              </CardTitle>
              <CardDescription>Update informasi profil Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="staff-display-name">Nama Lengkap *</Label>
                  <Input 
                    id="staff-display-name" 
                    placeholder="Masukkan nama lengkap" 
                    className="rounded-xl" 
                    value={profileForm.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    disabled={isUserLoading}
                  />
                  <p className="text-xs text-gray-500">Nama lengkap yang akan ditampilkan</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-username">Username *</Label>
                  <Input 
                    id="staff-username" 
                    placeholder="Masukkan username" 
                    className="rounded-xl" 
                    value={profileForm.username}
                    onChange={(e) => handleProfileChange('username', e.target.value)}
                    disabled={isUserLoading}
                  />
                  <p className="text-xs text-gray-500">Username untuk login (tidak boleh duplikat)</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-current-password">Password Saat Ini</Label>
                <Input 
                  id="staff-current-password" 
                  type="password" 
                  placeholder="Masukkan password saat ini" 
                  className="rounded-xl"
                  value={profileForm.currentPassword}
                  onChange={(e) => handleProfileChange('currentPassword', e.target.value)}
                />
                <p className="text-xs text-gray-500">Wajib diisi jika ingin mengubah password</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="staff-new-password">Password Baru</Label>
                  <Input 
                    id="staff-new-password" 
                    type="password" 
                    placeholder="Masukkan password baru" 
                    className="rounded-xl"
                    value={profileForm.newPassword}
                    onChange={(e) => handleProfileChange('newPassword', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Kosongkan jika tidak ingin mengubah password</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-confirm-password">Konfirmasi Password Baru</Label>
                  <Input 
                    id="staff-confirm-password" 
                    type="password" 
                    placeholder="Konfirmasi password baru" 
                    className="rounded-xl"
                    value={profileForm.confirmPassword}
                    onChange={(e) => handleProfileChange('confirmPassword', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Masukkan ulang password baru untuk konfirmasi</p>
                </div>
              </div>
              {/* Password criteria info for staff */}
              {(profileForm.newPassword || profileForm.confirmPassword) && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Kriteria Password Baru:</h4>
                  <p className="text-xs text-blue-600 mb-3">Password baru harus memenuhi semua kriteria berikut:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${profileForm.newPassword && profileForm.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Minimal 6 karakter
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${profileForm.newPassword && /[A-Z]/.test(profileForm.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Mengandung huruf besar (A-Z)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${profileForm.newPassword && /[a-z]/.test(profileForm.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Mengandung huruf kecil (a-z)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${profileForm.newPassword && /\d/.test(profileForm.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Mengandung angka (0-9)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${profileForm.newPassword && profileForm.newPassword === profileForm.confirmPassword ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Password dan konfirmasi password cocok
                    </li>
                  </ul>
                </div>
              )}
              <Button 
                className="w-full rounded-xl bg-primary hover:bg-primary/90"
                onClick={handleUpdateProfile}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengupdate...
                  </>
                ) : (
                  <>
                    <UserCog className="mr-2 h-4 w-4" />
                    Update Profil
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Information card for staff */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="text-center text-blue-700">
                <UserCog className="mx-auto h-8 w-8 mb-3 text-blue-500" />
                <h3 className="font-medium mb-2">Pengaturan Staff</h3>
                <p className="text-sm text-blue-600">
                  Anda dapat mengubah nama lengkap, username, dan password Anda. 
                  Untuk bantuan lebih lanjut, silakan hubungi administrator sistem.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
