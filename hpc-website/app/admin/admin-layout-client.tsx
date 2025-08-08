"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Suspense, useMemo } from "react"

import AdminSidebar from "@/components/admin-sidebar"
import AuthGuard from "@/components/auth-guard"
import { PageLoading } from "@/components/ui/loading"
import { ErrorBoundary } from "@/components/error-boundary"
import { useUser } from "@/hooks/use-user"

interface AdminLayoutClientProps {
  children: ReactNode
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const pathname = usePathname()
  const { user, isLoading: isUserLoading, error: userError } = useUser()
  
  // Memoize the login page check to prevent unnecessary re-renders
  const isLoginPage = useMemo(() => pathname === "/admin/login", [pathname])

  console.log('AdminLayoutClient: Rendering with pathname:', pathname, 'isLoginPage:', isLoginPage, 'user:', !!user, 'isLoading:', isUserLoading)

  // If it's the login page, show without AuthGuard
  if (isLoginPage) {
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    )
  }

  // For all other admin routes, show the sidebar with AuthGuard protection
  return (
    <ErrorBoundary>
      <AuthGuard user={user} isUserLoading={isUserLoading} userError={userError}>
        <div className="flex h-screen overflow-hidden bg-gray-50">
          <AdminSidebar user={user} isUserLoading={isUserLoading} userError={userError} />
          <main className="flex-1 overflow-y-auto p-4 pt-0 lg:p-8">
            <Suspense fallback={
              <PageLoading 
                // title="Memuat Halaman" 
                // description="Mohon tunggu sebentar..." 
              />
            }>
              <div className="animate-fadeIn">
                {children}
              </div>
            </Suspense>
          </main>
        </div>
      </AuthGuard>
    </ErrorBoundary>
  )
} 