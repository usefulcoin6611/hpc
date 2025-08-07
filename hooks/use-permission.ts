import { useUser } from './use-user'
import { hasPermission } from '@/lib/auth-utils'
import type { UserRole, UserJobType } from '@/types'

export function usePermission() {
  const { user } = useUser()

  const checkPermission = (allowedRoles?: UserRole[], allowedJobTypes?: UserJobType[]): boolean => {
    if (!user) return false
    
    return hasPermission(
      user.role, 
      user.jobType || null, 
      allowedRoles, 
      allowedJobTypes
    )
  }

  const isAdmin = checkPermission(undefined, ['admin'])
  const isSupervisor = checkPermission(undefined, ['supervisor'])
  const isStaff = checkPermission(undefined, ['staff'])
  
  const canAccessMasterBarang = checkPermission(undefined, ['admin', 'supervisor'])
  const canAccessJenisBarang = checkPermission(undefined, ['admin', 'supervisor'])
  const canAccessBarangMasuk = checkPermission(undefined, ['admin', 'supervisor'])
  const canAccessTransaksi = checkPermission(undefined, ['admin', 'supervisor', 'staff'])
  const canAccessApprover = checkPermission(undefined, ['admin', 'supervisor'])
  const canAccessBarangKeluar = checkPermission(undefined, ['admin', 'supervisor'])
  const canAccessUpdateLembarKerja = checkPermission(undefined, ['admin', 'supervisor', 'staff'])
  const canAccessLaporan = checkPermission(undefined, ['admin', 'supervisor'])
  const canAccessDataPengguna = checkPermission(undefined, ['admin'])
  const canAccessPengaturan = checkPermission(undefined, ['admin'])

  return {
    user,
    checkPermission,
    isAdmin,
    isSupervisor,
    isStaff,
    canAccessMasterBarang,
    canAccessJenisBarang,
    canAccessBarangMasuk,
    canAccessTransaksi,
    canAccessApprover,
    canAccessBarangKeluar,
    canAccessUpdateLembarKerja,
    canAccessLaporan,
    canAccessDataPengguna,
    canAccessPengaturan,
  }
}
