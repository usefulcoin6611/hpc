import { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authService } from "@/lib/auth"
import { performLogout, redirectToLogin } from "@/lib/auth-utils"
import { useToast } from "@/hooks/use-toast"

interface SidebarState {
  isMobileOpen: boolean
  isMobile: boolean
  isLogoutDialogOpen: boolean
  isLoggingOut: boolean
}

interface ScrollPositions {
  [key: string]: number
}

export function useSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [state, setState] = useState<SidebarState>({
    isMobileOpen: false,
    isMobile: false,
    isLogoutDialogOpen: false,
    isLoggingOut: false,
  })

  const sidebarNavRef = useRef<HTMLElement | null>(null)
  const scrollPositions = useRef<ScrollPositions>({})
  const prevPathname = useRef<string | null>(null)

  // Effect untuk mendeteksi ukuran mobile
  useEffect(() => {
    // Pastikan window tersedia (client-side only)
    if (typeof window === 'undefined') return

    const checkIfMobile = () => {
      setState(prev => ({ ...prev, isMobile: window.innerWidth < 1024 }))
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // useLayoutEffect untuk menyimpan posisi scroll
  useLayoutEffect(() => {
    // Pastikan window tersedia (client-side only)
    if (typeof window === 'undefined') return

    if (sidebarNavRef.current && prevPathname.current) {
      scrollPositions.current[prevPathname.current] = sidebarNavRef.current.scrollTop
    }
    prevPathname.current = pathname
  }, [pathname])

  // useEffect untuk memulihkan posisi scroll
  useEffect(() => {
    // Pastikan window tersedia (client-side only)
    if (typeof window === 'undefined') return

    const navElement = sidebarNavRef.current
    if (navElement) {
      const savedScroll = scrollPositions.current[pathname]
      if (savedScroll !== undefined) {
        navElement.scrollTop = savedScroll
      } else {
        navElement.scrollTop = 0
      }

      const handleCurrentScroll = () => {
        scrollPositions.current[pathname] = navElement.scrollTop
      }

      navElement.addEventListener("scroll", handleCurrentScroll)
      return () => {
        navElement.removeEventListener("scroll", handleCurrentScroll)
      }
    }
  }, [pathname])

  const setMobileOpen = useCallback((isOpen: boolean) => {
    setState(prev => ({ ...prev, isMobileOpen: isOpen }))
  }, [])

  const setLogoutDialogOpen = useCallback((isOpen: boolean) => {
    setState(prev => ({ ...prev, isLogoutDialogOpen: isOpen }))
  }, [])

  const setLoggingOut = useCallback((isLoggingOut: boolean) => {
    setState(prev => ({ ...prev, isLoggingOut }))
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      setLoggingOut(true)
      
      // Use the robust logout function
      await performLogout()
      
      // Show success toast
      toast({
        title: "Logout Berhasil",
        description: "Anda telah berhasil logout dari sistem",
        variant: "success",
      })
      
      // Use the reliable redirect function
      redirectToLogin()
      
    } catch (error) {
      console.error('Logout error:', error)
      
      // Show error toast
      toast({
        title: "Logout Gagal",
        description: "Terjadi kesalahan saat logout. Silakan coba lagi.",
        variant: "destructive",
      })
      
      // Even if logout fails, redirect to login
      redirectToLogin()
      
    } finally {
      setLogoutDialogOpen(false)
      setLoggingOut(false)
    }
  }, [setLogoutDialogOpen, setLoggingOut, toast])

  return {
    ...state,
    sidebarNavRef,
    setMobileOpen,
    setLogoutDialogOpen,
    setLoggingOut,
    handleLogout,
  }
} 