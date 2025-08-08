"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { usePermission } from "@/hooks/use-permission"
import { PageLoading } from "@/components/ui/loading"
import { ErrorDisplay } from "@/components/error-boundary"
import { sidebarMenuItems } from "@/components/sidebar/sidebar-menu-data"
import { filterMenuItemsByPermission } from "@/lib/auth-utils"
import type { User } from "@/types"

interface AuthGuardProps {
  children: React.ReactNode
  requiredPermission?: {
    jobTypes?: string[]
    roles?: string[]
  }
  user?: User | null
  isUserLoading?: boolean
  userError?: string | null
}

export default function AuthGuard({ 
  children, 
  requiredPermission, 
  user: propUser, 
  isUserLoading: propIsUserLoading, 
  userError: propUserError 
}: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { checkPermission } = usePermission()
  const [isCheckingPermission, setIsCheckingPermission] = useState(true)
  const hasRedirectedRef = useRef(false)

  // Use props if provided, otherwise use useUser hook
  const { user: hookUser, isLoading: hookIsUserLoading, error: hookUserError } = useUser()
  
  // Determine which user data to use
  const user = propUser !== undefined ? propUser : hookUser
  const isUserLoading = propIsUserLoading !== undefined ? propIsUserLoading : hookIsUserLoading
  const userError = propUserError !== undefined ? propUserError : hookUserError

  useEffect(() => {
    // Reset redirect flag when pathname changes
    hasRedirectedRef.current = false
  }, [pathname])

  useEffect(() => {
    if (!isUserLoading && !hasRedirectedRef.current) {
      // Check if user is authenticated
      if (!user) {
        console.log('AuthGuard: User not authenticated, redirecting to login')
        hasRedirectedRef.current = true
        // Back button tetap di admin - Gunakan replace, bukan push
        router.replace('/admin/login')
        return
      }

      // If no specific permission required, allow access
      if (!requiredPermission) {
        setIsCheckingPermission(false)
        return
      }

      // Check if user has required permission for this page
      const hasRequiredPermission = checkPermission(
        requiredPermission.roles as any,
        requiredPermission.jobTypes as any
      )

      if (!hasRequiredPermission) {
        console.log('AuthGuard: User does not have required permission for this page')
        // Redirect to dashboard or show access denied
        hasRedirectedRef.current = true
        // Back button tetap di admin - Gunakan replace, bukan push
        router.replace('/admin')
        return
      }

      setIsCheckingPermission(false)
    }
  }, [user, isUserLoading, router, pathname, requiredPermission, checkPermission])

  // 🧠 Jangan render apapun saat session masih "loading" - if (loading) return null
  if (isUserLoading || isCheckingPermission) {
    return (
      <PageLoading 
        // title="Memverifikasi Akses" 
        // description="Mohon tunggu sebentar..." 
      />
    )
  }

  // Show error if authentication failed
  if (userError) {
    return (
      <ErrorDisplay 
        error={userError}
        onRetry={() => window.location.reload()}
      />
    )
  }

  // Show children if user is authenticated and has permission
  return <>{children}</>
} 