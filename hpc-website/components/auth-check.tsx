"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authService } from "@/lib/auth"
import { PageLoading } from "@/components/ui/loading"

interface AuthCheckProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function AuthCheck({ 
  children, 
  redirectTo = "/admin" 
}: AuthCheckProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    // Gunakan useEffect untuk cek token sekali
    if (hasCheckedRef.current) return
    
    // Don't check if we're already on the target page
    if (pathname === redirectTo) {
      console.log('AuthCheck: Already on target page, no check needed')
      setIsLoading(false)
      return
    }
    
    let isMounted = true
    hasCheckedRef.current = true

    const checkAuth = async () => {
      try {
        console.log('AuthCheck: Checking authentication status...', { pathname, redirectTo })
        
        const isAuth = authService.isAuthenticated()
        console.log('AuthCheck: Authentication result:', { isAuth, pathname, redirectTo })

        if (!isMounted) {
          console.log('AuthCheck: Component unmounted, stopping check')
          return
        }

        if (isAuth) {
          console.log('AuthCheck: User authenticated, redirecting to:', redirectTo)
          // Gunakan router.replace() hanya jika token ada
          router.replace(redirectTo)
        } else {
          console.log('AuthCheck: User not authenticated, redirecting to login')
          // Redirect ke login jika tidak ada token
          router.replace('/admin/login')
        }
      } catch (error) {
        console.error('AuthCheck: Error during auth check:', error)
        if (isMounted) {
          // Redirect ke login jika error
          router.replace('/admin/login')
        }
      }
    }

    // Tunda render sampai session dicek
    const timer = setTimeout(checkAuth, 500)
    
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, []) // Empty dependency array untuk cek token sekali

  // Tidak render children sebelum cek selesai
  if (isLoading) {
    return (
      <PageLoading 
        title="Memverifikasi Autentikasi" 
        description="Mohon tunggu sebentar..." 
      />
    )
  }

  // Saat loading selesai, tampilkan children
  return <>{children}</>
} 