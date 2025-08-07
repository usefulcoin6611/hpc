import { User } from "lucide-react"
import type { User as UserType } from "@/types"

interface SidebarProfileProps {
  user?: UserType | null
  isUserLoading?: boolean
  userError?: string | null
  className?: string
}

export function SidebarProfile({ user, isUserLoading, userError, className = "" }: SidebarProfileProps) {
  // Default user for fallback
  const defaultUser = {
    name: "Loading...",
    role: "..."
  }

  // Determine what to display
  let displayUser = defaultUser
  
  if (isUserLoading) {
    displayUser = {
      name: "Loading...",
      role: "Memuat data..."
    }
  } else if (userError) {
    displayUser = {
      name: "Error",
      role: "Gagal memuat"
    }
  } else if (user) {
    displayUser = {
      name: user.name,
      role: formatRole(user.role)
    }
  }

  return (
    <>
      <div className={`flex flex-col items-center gap-2 bg-[#3430e2] py-3 ${className}`}>
        <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-indigo-400/30 bg-indigo-600/30 shadow-lg flex items-center justify-center">
          <User className="h-6 w-6 text-white" />
        </div>
        <div className="flex flex-col items-center">
          <h3 className={`text-sm font-bold text-white ${isUserLoading ? 'animate-pulse' : ''}`}>
            {displayUser.name}
          </h3>
          <p className={`text-xs text-indigo-200 ${isUserLoading ? 'animate-pulse' : ''} ${userError ? 'text-red-300' : ''}`}>
            {displayUser.role}
          </p>
        </div>
      </div>
      <div className="border-b border-indigo-500/30" />
    </>
  )
}

// Helper function to format role display
function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    'admin': 'Administrator',
    'super_admin': 'Super Admin',
    'user': 'Pengguna',
    'staff': 'Staff',
    'supervisor': 'Supervisor',
    'approver': 'Approver',
    'inspeksi_mesin': 'Inspeksi Mesin',
    'assembly_staff': 'Assembly Staff',
    'qc_staff': 'QC Staff',
    'pdi_staff': 'PDI Staff',
    'painting_staff': 'Painting Staff',
    'pindah_lokasi': 'Pindah Lokasi'
  }
  
  return roleMap[role] || role
} 