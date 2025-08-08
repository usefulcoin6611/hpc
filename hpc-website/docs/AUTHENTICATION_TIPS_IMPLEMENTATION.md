# Implementasi Tips Autentikasi

Dokumentasi ini menjelaskan implementasi tips autentikasi yang telah diterapkan di HPC Website.

## 1. 🔄 Hindari redirect di client dan server sekaligus

### Penjelasan
Tidak menggunakan middleware untuk redirect user yang sudah login dari halaman login, karena middleware sudah mengecek token di server-side.

### Implementasi
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token from cookies or headers
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  // Middleware hanya proteksi route /admin, bukan /login
  const publicRoutes = ['/admin/login', '/api/auth/login', '/api/health', '/api/test-db']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Check if it's an admin route (excluding login)
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login'
  
  // For admin routes without token, redirect to login
  if (isAdminRoute && !token) {
    console.log('Middleware: Redirecting unauthenticated user to login')
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  
  // Jangan redirect user login di middleware
  return NextResponse.next()
}
```

## 2. ⏳ Tunda render login form sampai session dicek

### Penjelasan
Menggunakan `useEffect` + `loading` state untuk menunda render form login sampai session dicek.

### Implementasi
```typescript
// app/admin/login/page.tsx
function LoginForm() {
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  
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

  // Tidak render form sebelum cek session selesai
  if (isCheckingSession) {
    return (
      <PageLoading 
        title="Memverifikasi Session" 
        description="Mohon tunggu sebentar..." 
      />
    )
  }

  return <LoginForm />
}
```

## 3. ✅ Gunakan `router.replace()` - Hindari stack history

### Penjelasan
Menggunakan `router.replace()` untuk menghindari masalah back button dan stack history.

### Implementasi
```typescript
// Setelah login berhasil
setTimeout(() => {
  console.log('Executing smooth redirect to /admin...')
  // Masuk admin setelah login - router.replace("/admin")
  router.replace('/admin')
}, 1000)

// Di AuthGuard
if (!user) {
  console.log('AuthGuard: User not authenticated, redirecting to login')
  hasRedirectedRef.current = true
  // Back button tetap di admin - Gunakan replace, bukan push
  router.replace('/admin/login')
  return
}

if (!hasRequiredPermission) {
  console.log('AuthGuard: User does not have required permission for this page')
  hasRedirectedRef.current = true
  // Back button tetap di admin - Gunakan replace, bukan push
  router.replace('/admin')
  return
}
```

## 4. 🧠 Jangan render apapun saat session masih "loading"

### Penjelasan
Menggunakan `if (loading) return null` untuk tidak render apapun saat session masih dicek.

### Implementasi
```typescript
// AuthGuard
if (isUserLoading || isCheckingPermission) {
  return (
    <PageLoading
      title="Memverifikasi Akses"
      description="Mohon tunggu sebentar..."
    />
  )
}

// LoginPage
if (isCheckingSession) {
  return (
    <PageLoading 
      title="Memverifikasi Session" 
      description="Mohon tunggu sebentar..." 
    />
  )
}
```

## 5. 👀 Gunakan middleware hanya untuk route yang perlu

### Penjelasan
Middleware hanya digunakan untuk proteksi route `/admin`, bukan untuk redirect user login.

### Implementasi
```typescript
// middleware.ts
// Middleware hanya proteksi route /admin, bukan /login
const publicRoutes = ['/admin/login', '/api/auth/login', '/api/health', '/api/test-db']
const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

// Check if it's an admin route (excluding login)
const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login'

// For admin routes without token, redirect to login
if (isAdminRoute && !token) {
  console.log('Middleware: Redirecting unauthenticated user to login')
  return NextResponse.redirect(new URL('/admin/login', request.url))
}

// Jangan redirect user login di middleware
return NextResponse.next()
```

## Flow Autentikasi

### Login Page Flow (`/admin/login`)
1. **Middleware**: Cek token → jika tidak ada, lanjut ke login page
2. **LoginPage**: Cek session di `useEffect`
   - Jika sudah login → `router.replace('/admin')`
   - Jika belum login → tampilkan form login
3. **LoginForm**: Submit credentials
   - Jika berhasil → `router.replace('/admin')`
   - Jika gagal → tampilkan error

### Admin Routes Flow (`/admin/*`)
1. **Middleware**: Cek token → jika tidak ada, redirect ke `/admin/login`
2. **AuthGuard**: Cek user data dan permission
   - Jika tidak ada user → `router.replace('/admin/login')`
   - Jika tidak ada permission → `router.replace('/admin')`
   - Jika ada permission → tampilkan content

### Logout Flow
1. **Logout**: Hapus token/session + proteksi route + redirect ke login
2. **clearAuthData**: Hapus semua data auth dari localStorage dan cookies
3. **performLogout**: Panggil API logout dan clear data lokal

## Best Practices yang Diterapkan

| Tips | Status | Implementasi |
|------|--------|--------------|
| 🔄 Hindari redirect di client dan server sekaligus | ✅ | Middleware hanya proteksi, tidak redirect login |
| ⏳ Tunda render login form sampai session dicek | ✅ | useEffect + loading state |
| ✅ Gunakan `router.replace()` | ✅ | Semua redirect menggunakan replace |
| 🧠 Jangan render apapun saat session masih "loading" | ✅ | PageLoading component |
| 👀 Gunakan middleware hanya untuk route yang perlu | ✅ | Hanya proteksi /admin routes |

## Testing Checklist

- [ ] User yang belum login tidak bisa akses `/admin/*`
- [ ] User yang sudah login tidak bisa akses `/admin/login`
- [ ] Login berhasil redirect ke `/admin`
- [ ] Logout berhasil redirect ke `/admin/login`
- [ ] Back button tidak kembali ke halaman sebelumnya
- [ ] Loading state muncul saat cek session
- [ ] Error handling berfungsi dengan baik
- [ ] Token expired dihandle dengan benar
- [ ] Middleware tidak mengganggu flow autentikasi

## Perbaikan Error Handling Login Page

### Masalah yang Diperbaiki
- Update page login masih belum ada tampilan return/alert username salah, password salah

### Solusi yang Diterapkan

#### 1. Error Message yang Lebih Spesifik
```typescript
// Cek response message yang lebih spesifik
if (response.message) {
  if (response.message.includes('username') || response.message.includes('Username')) {
    errorMessage = "Username tidak ditemukan atau salah"
  } else if (response.message.includes('password') || response.message.includes('Password')) {
    errorMessage = "Password salah"
  } else if (response.message.includes('credentials') || response.message.includes('Credential')) {
    errorMessage = "Username atau password salah"
  } else {
    errorMessage = response.message
  }
}
```

#### 2. Toast Notification untuk Error
```typescript
// Tambahkan toast notification untuk error
toast({
  title: "Login Gagal!",
  description: errorMessage,
  variant: "destructive",
})
```

#### 3. Validasi Real-time
```typescript
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
```

#### 4. Visual Feedback pada Input
```typescript
// Styling input berdasarkan error
className={`h-9 sm:h-10 lg:h-11 rounded-lg sm:rounded-xl border-gray-200 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-primary focus:ring-primary ${
  getUsernameError() ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
}`}

// Tampilkan error message di bawah input
{getUsernameError() && (
  <p className="text-xs text-red-600 mt-1">{getUsernameError()}</p>
)}
```

#### 5. Button State Management
```typescript
// Disable button saat ada error validasi
disabled={isLoading || !!getUsernameError() || !!getPasswordError() || !username.trim() || !password.trim()}
```

### Hasil Perbaikan
- ✅ Pesan error yang jelas dan spesifik
- ✅ Toast notification untuk feedback
- ✅ Validasi real-time saat user mengetik
- ✅ Visual feedback dengan border merah
- ✅ Button disabled saat form tidak valid
- ✅ Error message dihapus saat user mulai mengetik ulang

## Perbaikan Refresh Page Saat Password Salah

### Masalah yang Diperbaiki
- Fix saat password salah malah terjadi refresh page bukan memberi ts

### Solusi yang Diterapkan

#### 1. Form Event Handling yang Lebih Robust
```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  // Fix saat password salah malah terjadi refresh page bukan memberi ts
  e.preventDefault()
  e.stopPropagation()
  
  // Prevent multiple submissions
  if (isLoading) {
    console.log('Login already in progress, ignoring submission')
    return
  }
  
  updateFormState({ error: null })
  // ... rest of the logic
}
```

#### 2. Form Element dengan noValidate
```typescript
<form 
  onSubmit={handleSubmit} 
  className="space-y-4 sm:space-y-6"
  noValidate
>
```

#### 3. Button dengan Explicit Event Handling
```typescript
<Button
  type="submit"
  onClick={(e) => {
    // Fix saat password salah malah terjadi refresh page bukan memberi ts
    if (isLoading) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
  }}
  disabled={isLoading || !!getUsernameError() || !!getPasswordError() || !username.trim() || !password.trim()}
>
  Login
</Button>
```

#### 4. Error Boundary Wrapper
```typescript
export default function LoginPage() {
  return (
    <ErrorBoundary>
      <LoginForm />
    </ErrorBoundary>
  )
}
```

#### 5. Try-Catch yang Lebih Robust
```typescript
try {
  await withLoading(async () => {
    // Login logic
  }, "Logging In...")
} catch (loadingError) {
  console.error('Error in withLoading:', loadingError)
  // Handle error from withLoading
  let errorMessage = "Terjadi kesalahan saat login"
  
  if (loadingError instanceof Error) {
    errorMessage = loadingError.message
  }
  
  updateFormState({ error: errorMessage })
  toast({
    title: "Login Gagal!",
    description: errorMessage,
    variant: "destructive",
  })
}
```

### Hasil Perbaikan
- ✅ Tidak ada refresh page saat password salah
- ✅ Error ditampilkan dengan toast notification
- ✅ Form tidak di-submit ulang saat loading
- ✅ Semua error ditangkap dengan error boundary
- ✅ User experience yang lebih smooth

## Perbaikan Logika Login Saat Password Salah

### Masalah yang Diperbaiki
- Tolong perbaiki logika login saat salah password

### Solusi yang Diterapkan

#### 1. Validasi Form Sebelum Submit
```typescript
// Validasi form sebelum submit
if (!username.trim() || !password.trim()) {
  const errorMsg = !username.trim() ? "Username wajib diisi" : "Password wajib diisi"
  updateFormState({ error: errorMsg })
  toast({
    title: "Validasi Gagal!",
    description: errorMsg,
    variant: "destructive",
  })
  return
}
```

#### 2. Logging yang Lebih Detail
```typescript
console.log('Attempting login with username:', username)

const response: LoginResponse = await authService.login(credentials)
console.log('Login response received:', {
  success: response.success,
  hasUser: !!response.user,
  hasToken: !!response.token,
  message: response.message
})
```

#### 3. Error Message yang Lebih Spesifik
```typescript
// Cek response message yang lebih spesifik
if (response.message) {
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
```

#### 4. Response Structure Analysis
```typescript
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
```

#### 5. Debugging Information
```typescript
// Log response untuk debugging
console.log('Response details:', {
  success: response.success,
  message: response.message,
  user: response.user ? 'exists' : 'null',
  token: response.token ? 'exists' : 'null'
})

console.log('Final error message:', errorMessage)
```

### Hasil Perbaikan
- ✅ Validasi form yang lebih robust
- ✅ Logging yang detail untuk debugging
- ✅ Error message yang spesifik dan informatif
- ✅ Analysis response structure untuk error type
- ✅ User feedback yang jelas dan konsisten
- ✅ Keamanan tetap terjaga dengan pesan umum untuk credential error

## Perbaikan Redirect Page Saat Password Salah

### Masalah yang Diperbaiki
- Saya melihat ketika password salah ada redirect page, apa benar? jika iya itu tidak perlu

### Penyebab Masalah
Masalah terjadi di `apiClient.ts` yang melakukan redirect otomatis saat status 401 untuk semua endpoint, termasuk `/auth/login`. Ini menyebabkan redirect page saat password salah.

### Solusi yang Diterapkan

#### 1. Conditional Redirect di ApiClient
```typescript
// Handle 401 Unauthorized
if (response.status === 401) {
  this.clearToken()
  // Saya melihat ketika password salah ada redirect page, apa benar? jika iya itu tidak perlu
  // Jangan redirect otomatis untuk endpoint login
  if (!endpoint.includes('/auth/login')) {
    window.location.href = '/admin/login'
  }
}
```

#### 2. Perbaikan di Semua Error Handler
```typescript
// Token expired
if (isTokenExpired(this.token)) {
  this.clearToken()
  // Jangan redirect otomatis untuk endpoint login
  if (!endpoint.includes('/auth/login')) {
    window.location.href = '/admin/login'
  }
  throw new Error('Token expired')
}

// Error catch block
if (error instanceof Error && error.message.includes('401')) {
  this.clearToken()
  // Jangan redirect otomatis untuk endpoint login
  if (!endpoint.includes('/auth/login')) {
    window.location.href = '/admin/login'
  }
}
```

### Hasil Perbaikan
- ✅ Tidak ada redirect page saat password salah
- ✅ Error ditampilkan dengan toast notification
- ✅ User tetap di halaman login
- ✅ Redirect hanya terjadi untuk endpoint non-login
- ✅ User experience yang lebih baik

## Perbaikan Error Handling Saat Password Salah

### Masalah yang Diperbaiki
- Saat password salah ada error Error: Username atau password salah
- Error terjadi di `lib/api-client.ts (59:15) @ ApiClient.request`

### Penyebab Masalah
`apiClient` melempar error untuk status 401, termasuk untuk login endpoint. Ini menyebabkan error yang tidak ditangkap dengan benar di login form.

### Solusi yang Diterapkan

#### 1. Conditional Error Handling untuk Login Endpoint
```typescript
if (!response.ok) {
  // Handle 401 Unauthorized
  if (response.status === 401) {
    this.clearToken()
    // Jangan redirect otomatis untuk endpoint login
    if (!endpoint.includes('/auth/login')) {
      window.location.href = '/admin/login'
    }
  }
  
  // Saat password salah ada error Error: Username atau password salah
  // Untuk login endpoint, jangan throw error, kembalikan response dengan success: false
  if (endpoint.includes('/auth/login')) {
    return {
      success: false,
      message: data.message || `HTTP ${response.status}`,
      data: undefined
    }
  }
  
  throw new Error(data.message || `HTTP ${response.status}`)
}
```

#### 2. Catch Block Error Handling
```typescript
} catch (error) {
  // Saat password salah ada error Error: Username atau password salah
  // Untuk login endpoint, jangan throw error, kembalikan response dengan success: false
  if (endpoint.includes('/auth/login')) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Terjadi kesalahan saat login',
      data: undefined
    }
  }
  
  // Handle other errors...
  throw error
}
```

### Hasil Perbaikan
- ✅ Tidak ada error yang tidak ditangkap
- ✅ Response dengan `success: false` dikembalikan untuk login gagal
- ✅ Error message ditampilkan dengan benar
- ✅ Login form menangani error dengan proper
- ✅ User experience yang smooth tanpa error console

## Penghapusan Error Message Redundant

### Masalah yang Diperbaiki
- Tidak perlu ada error message "Username atau password salah" di atas field username
- Karena sudah ada toast notification

### Solusi yang Diterapkan

#### 1. Hapus ErrorDisplay Component
```typescript
// Sebelum
{error && (
  <ErrorDisplay 
    error={error} 
    onRetry={() => updateFormState({ error: null })}
    className="mb-4 sm:mb-6"
  />
)}

// Sesudah
// ErrorDisplay component dihapus, hanya menggunakan toast notification
```

#### 2. Hapus Error State dari Form
```typescript
// Sebelum
interface LoginFormState {
  username: string
  password: string
  error: string | null
}

// Sesudah
interface LoginFormState {
  username: string
  password: string
}
```

#### 3. Hapus Error Update dari State
```typescript
// Sebelum
updateFormState({ error: errorMessage })

// Sesudah
// Tidak perlu update error state, hanya toast notification
toast({
  title: "Login Gagal!",
  description: errorMessage,
  variant: "destructive",
})
```

### Hasil Perbaikan
- ✅ UI lebih clean tanpa error message redundant
- ✅ Hanya toast notification yang menampilkan error
- ✅ User experience yang lebih baik
- ✅ Tidak ada duplikasi pesan error
