"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorDisplay } from "@/components/error-boundary"
import { PageLoading } from "@/components/ui/loading"
import type { LoginCredentials, LoginResponse } from "@/types"
import { createError, ERROR_CODES, handleError } from "@/lib/error-utils"
import { useLoading } from "@/hooks/use-loading"
import { authService } from "@/lib/auth"
import { setStoredToken } from "@/lib/auth-utils"
import { useToast } from "@/hooks/use-toast"
import { ErrorBoundary } from "@/components/error-boundary"

interface LoginFormState {
  username: string
  password: string
}

function LoginForm() {
  const [formState, setFormState] = useState<LoginFormState>({
    username: "",
    password: "",
  })
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const router = useRouter()
  const { isLoading, startLoading, stopLoading, withLoading } = useLoading()
  const { toast } = useToast()
  const isRedirectingRef = useRef(false)

  const { username, password } = formState

  // Validasi real-time untuk feedback langsung
  const getUsernameError = () => {
    if (username && username.length < 3) {
      return "Username minimal 3 karakter"
    }
    return null
  }

  const getPasswordError = () => {
    if (password && password.length < 6) {
      return "Password minimal 6 karakter"
    }
    return null
  }

  // Cek session di useEffect + router.replace
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('LoginPage: Checking session...')
        const isAuth = authService.isAuthenticated()
        
        if (isAuth) {
          console.log('LoginPage: User already authenticated, redirecting to admin')
          // Double refresh di login - Cek session di useEffect + router.replace
          router.replace('/admin')
        } else {
          console.log('LoginPage: User not authenticated, showing login form')
          setIsCheckingSession(false)
        }
      } catch (error) {
        console.error('LoginPage: Error checking session:', error)
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [router])

  const updateFormState = (updates: Partial<LoginFormState>) => {
    setFormState(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Fix saat password salah malah terjadi refresh page bukan memberi ts
    e.preventDefault()
    e.stopPropagation()
    
    // Prevent multiple submissions
    if (isLoading) {
      console.log('Login already in progress, ignoring submission')
      return
    }
    
    // Tolong perbaiki logika login saat salah password
    // Validasi form sebelum submit
    if (!username.trim() || !password.trim()) {
      const errorMsg = !username.trim() ? "Username wajib diisi" : "Password wajib diisi"
      toast({
        title: "Validasi Gagal!",
        description: errorMsg,
        variant: "destructive",
      })
      return
    }
    

    try {
      // Validate form
      const validationError = validateLoginForm({ username, password })
      if (validationError) {
        toast({
          title: "Validasi Gagal!",
          description: validationError,
          variant: "destructive",
        })
        return
      }

      // Use withLoading for better UX
      try {
        await withLoading(async () => {
          const credentials: LoginCredentials = { username, password }
          console.log('Attempting login with username:', username)
          
          const response: LoginResponse = await authService.login(credentials)
          console.log('Login response received:', {
            success: response.success,
            hasUser: !!response.user,
            hasToken: !!response.token,
            message: response.message
          })
          
          if (response.success && response.token && response.user) {
            console.log('Login berhasil, token:', response.token ? 'tersimpan' : 'gagal')
            console.log('Login berhasil, user:', response.user)
            console.log('Login berhasil, redirecting ke /admin dalam 1 detik...')
            
            // Set token using the proper function that handles localStorage and cookies
            const tokenStored = setStoredToken(response.token)
            if (!tokenStored) {
              console.error('Gagal menyimpan token')
              toast({
                title: "Login Gagal!",
                description: 'Gagal menyimpan token authentication',
                variant: "destructive",
              })
              return
            }
            
            toast({
              title: "Login Berhasil!",
              description: "Selamat datang kembali!",
              variant: "success",
            })
            
            // Set flag to prevent double redirect
            isRedirectingRef.current = true
            
            // Smooth transition to admin dashboard with delay to ensure toast shows
            setTimeout(() => {
              console.log('Executing smooth redirect to /admin...')
              // Masuk admin setelah login - router.replace("/admin")
              router.replace('/admin')
            }, 1000)
          } else {
            console.log('Login gagal:', response)
            // Tolong perbaiki logika login saat salah password
            let errorMessage = "Username atau password salah"
            
            // Log response untuk debugging
            console.log('Response details:', {
              success: response.success,
              message: response.message,
              user: response.user ? 'exists' : 'null',
              token: response.token ? 'exists' : 'null'
            })
            
            // Cek response message yang lebih spesifik
            if (response.message) {
              // API mengembalikan pesan yang sama untuk username/password salah untuk keamanan
              // Tapi kita bisa cek berdasarkan response structure
              if (response.message.includes('Username dan password wajib diisi')) {
                errorMessage = "Username dan password wajib diisi"
              } else if (response.message.includes('Akun tidak aktif')) {
                errorMessage = "Akun tidak aktif, hubungi administrator"
              } else if (response.message.includes('Terjadi kesalahan pada server')) {
                errorMessage = "Server bermasalah, coba lagi nanti"
              } else if (response.message.includes('Username atau password salah')) {
                // Untuk keamanan, tetap gunakan pesan umum
                errorMessage = "Username atau password salah"
              } else {
                errorMessage = response.message
              }
            }
            
            // Cek response structure untuk menentukan error type
            if (!response.success) {
              if (!response.user && !response.token) {
                // Login gagal - kemungkinan username/password salah
                errorMessage = "Username atau password salah"
              } else if (response.user && !response.token) {
                // User ditemukan tapi token tidak dibuat
                errorMessage = "Gagal membuat token autentikasi"
              }
            }
            
            console.log('Final error message:', errorMessage)
            
            const error = createError(
              ERROR_CODES.AUTH_INVALID_CREDENTIALS,
              errorMessage
            )
            toast({
              title: "Login Gagal!",
              description: errorMessage,
              variant: "destructive",
            })
          }
        }, "Logging In...")
      } catch (loadingError) {
        console.error('Error in withLoading:', loadingError)
        // Handle error from withLoading
        let errorMessage = "Terjadi kesalahan saat login"
        
        if (loadingError instanceof Error) {
          errorMessage = loadingError.message
        }
        
        toast({
          title: "Login Gagal!",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      // Fix saat password salah malah terjadi refresh page bukan memberi ts
      let errorMessage = "Terjadi kesalahan saat login"
      
      // Cek tipe error untuk pesan yang lebih spesifik
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Koneksi internet bermasalah, coba lagi"
        } else if (error.message.includes('timeout')) {
          errorMessage = "Waktu login habis, coba lagi"
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = "Username atau password salah"
        } else if (error.message.includes('500') || error.message.includes('server')) {
          errorMessage = "Server bermasalah, coba lagi nanti"
        } else {
          errorMessage = error.message
        }
      }
      
      const appError = createError(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        errorMessage
      )
      toast({
        title: "Login Gagal!",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const validateLoginForm = (data: { username: string; password: string }): string | null => {
    // Update page login masih belum ada tampilan return/alert username salah, password salah
    if (!data.username.trim()) {
      return "Username wajib diisi"
    }
    
    if (!data.password.trim()) {
      return "Password wajib diisi"
    }
    
    if (data.username.length < 3) {
      return "Username minimal 3 karakter"
    }
    
    if (data.password.length < 6) {
      return "Password minimal 6 karakter"
    }
    
    return null
  }

  // Tidak render form sebelum cek session selesai
  if (isCheckingSession) {
    return (
      <PageLoading 
        // title="Memverifikasi Session" 
        // description="Mohon tunggu sebentar..." 
      />
    )
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 p-2 sm:p-4"
      style={{
        backgroundImage: 'url("/images/gudang.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl overflow-hidden rounded-xl sm:rounded-2xl bg-white animate-slideIn shadow-2xl">
        <div className="bg-white p-4 sm:p-6 lg:p-8 text-center">
          <div className="mb-3 sm:mb-4 flex justify-center">
            <Image
              src="/images/hpclogo.png"
              alt="Himawanputra Corporation Logo"
              width={150}
              height={60}
              className="object-contain w-32 sm:w-40 lg:w-48"
              priority
            />
          </div>
          <p className="mt-1 text-xs sm:text-sm lg:text-base text-gray-600">Login untuk mengakses sistem</p>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          <h2 className="mb-4 sm:mb-6 text-center text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Log In</h2>
          <form 
            onSubmit={handleSubmit} 
            className="space-y-4 sm:space-y-6"
            noValidate
          >
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="username" className="text-xs sm:text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  updateFormState({ username: e.target.value })
                }
                required
                className={`h-9 sm:h-10 lg:h-11 rounded-lg sm:rounded-xl border-gray-200 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-primary focus:ring-primary ${
                  getUsernameError() ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                disabled={isLoading}
                placeholder="Masukkan username"
              />
              {getUsernameError() && (
                <p className="text-xs text-red-600 mt-1">{getUsernameError()}</p>
              )}
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  updateFormState({ password: e.target.value })
                }
                required
                className={`h-9 sm:h-10 lg:h-11 rounded-lg sm:rounded-xl border-gray-200 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-primary focus:ring-primary ${
                  getPasswordError() ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                disabled={isLoading}
                placeholder="Masukkan password"
              />
              {getPasswordError() && (
                <p className="text-xs text-red-600 mt-1">{getPasswordError()}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-9 sm:h-10 lg:h-11 rounded-lg sm:rounded-xl bg-primary py-2 sm:py-3 text-sm sm:text-base text-white transition-all hover:bg-primary-dark font-medium"
              loading={isLoading}
              loadingText="Logging In..."
              disabled={isLoading || !!getUsernameError() || !!getPasswordError() || !username.trim() || !password.trim()}
              onClick={(e) => {
                // Fix saat password salah malah terjadi refresh page bukan memberi ts
                if (isLoading) {
                  e.preventDefault()
                  e.stopPropagation()
                  return
                }
              }}
            >
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <ErrorBoundary>
      <LoginForm />
    </ErrorBoundary>
  )
} 