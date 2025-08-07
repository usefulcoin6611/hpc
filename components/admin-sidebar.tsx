"use client"

import { usePathname } from "next/navigation"
import { SidebarContent } from "./sidebar/sidebar-content"
import { MobileHeader } from "./sidebar/mobile-header"
import { sidebarMenuItems } from "./sidebar/sidebar-menu-data"
import { useSidebar } from "@/hooks/use-sidebar"
import type { User } from "@/types"

interface AdminSidebarProps {
  className?: string
  user?: User | null
  isUserLoading?: boolean
  userError?: string | null
}

export default function AdminSidebar({ className, user, isUserLoading, userError }: AdminSidebarProps) {
  const pathname = usePathname()
  const {
    isMobile,
    isMobileOpen,
    isLogoutDialogOpen,
    isLoggingOut,
    setMobileOpen,
    setLogoutDialogOpen,
    handleLogout,
  } = useSidebar()

  const sidebarContent = (
    <SidebarContent
      menuItems={sidebarMenuItems}
      currentPath={pathname}
      user={user}
      isUserLoading={isUserLoading}
      userError={userError}
      isLogoutDialogOpen={isLogoutDialogOpen}
      isLoggingOut={isLoggingOut}
      onLogoutDialogChange={setLogoutDialogOpen}
      onLogout={handleLogout}
      onMobileClose={() => setMobileOpen(false)}
    />
  )

  // Untuk mobile: render komponen Sheet
  if (isMobile) {
    return (
      <MobileHeader
        isMobileOpen={isMobileOpen}
        onMobileOpenChange={setMobileOpen}
        sidebarContent={sidebarContent}
      />
    )
  }

  // Untuk desktop: render sidebar langsung
  return (
    <div className={`hidden h-screen w-72 flex-shrink-0 flex-col bg-[#3430e2] shadow-xl lg:flex ${className || ''}`}>
      {sidebarContent}
    </div>
  )
}
