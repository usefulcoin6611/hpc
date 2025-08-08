import { SidebarHeader } from "./sidebar-header"
import { SidebarProfile } from "./sidebar-profile"
import { SidebarNavigation } from "./sidebar-navigation"
import { SidebarLogout } from "./sidebar-logout"
import { filterMenuItemsByPermission } from "@/lib/auth-utils"
import type { MenuItem, User } from "@/types"

interface SidebarContentProps {
  menuItems: MenuItem[]
  currentPath: string
  user?: User | null
  isUserLoading?: boolean
  userError?: string | null
  isLogoutDialogOpen: boolean
  isLoggingOut: boolean
  onLogoutDialogChange: (open: boolean) => void
  onLogout: () => void
  onMobileClose?: () => void
  className?: string
}

export function SidebarContent({
  menuItems,
  currentPath,
  user,
  isUserLoading,
  userError,
  isLogoutDialogOpen,
  isLoggingOut,
  onLogoutDialogChange,
  onLogout,
  onMobileClose,
  className = ""
}: SidebarContentProps) {
  // Filter menu items based on user permissions
  const filteredMenuItems = user 
    ? filterMenuItemsByPermission(menuItems, user.role, user.jobType || null)
    : menuItems

  return (
    <div className={`flex h-full flex-col bg-[#3430e2] ${className}`}>
      <SidebarHeader />
      <SidebarProfile user={user} isUserLoading={isUserLoading} userError={userError} />
      <SidebarNavigation
        menuItems={filteredMenuItems}
        currentPath={currentPath}
        onMobileClose={onMobileClose}
      />
      <SidebarLogout
        isLogoutDialogOpen={isLogoutDialogOpen}
        isLoggingOut={isLoggingOut}
        onLogoutDialogChange={onLogoutDialogChange}
        onLogout={onLogout}
      />
    </div>
  )
} 