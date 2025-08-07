# Troubleshooting Autentikasi

## Infinite Loop pada Login Page

### Masalah
Infinite loop terjadi saat mengakses halaman login (`/admin/login`) yang menyebabkan:
- Loading spinner terus berputar
- Tidak ada render form login
- Console error berulang

### Penyebab
1. **AuthCheck tidak memanggil `setLoading(false)`** saat token tidak ada
2. **useEffect dipicu berulang** karena `router.replace()` menyebabkan re-render
3. **Tidak menampilkan children** saat loading selesai
4. **Middleware dan client-side redirect konflik**

### Solusi yang Diterapkan

#### 1. AuthCheck Component
```tsx
// ✅ Gunakan useEffect untuk cek token sekali
useEffect(() => {
  if (hasCheckedRef.current) return
  
  const checkAuth = async () => {
    const isAuth = authService.isAuthenticated()
    
    if (isAuth) {
      // ✅ Gunakan router.replace() hanya jika token ada
      router.replace(redirectTo)
    } else {
      // ✅ Panggil setLoading(false) jika token tidak ditemukan
      authService.clearStoredUser()
      setIsLoading(false)
    }
  }
  
  checkAuth()
}, []) // Empty dependency array untuk cek token sekali

// ✅ Tidak render <LoginForm /> sebelum cek selesai
if (isLoading) {
  return <PageLoading />
}

// ✅ Saat loading selesai, tampilkan children (yaitu <LoginForm />)
return <>{children}</>
```

#### 2. Middleware
```tsx
// ✅ Middleware hanya proteksi route /admin, bukan /login
const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login'

if (isAdminRoute && !token) {
  return NextResponse.redirect(new URL('/admin/login', request.url))
}

// ✅ Jangan redirect user login di middleware
return NextResponse.next()
```

### Checklist Perbaikan

| Hal | Status | Implementasi |
|-----|--------|--------------|
| Komponen `AuthCheck` harus menghindari render loop | ✅ | Empty dependency array `[]` |
| Hanya redirect jika token valid | ✅ | `if (isAuth) router.replace()` |
| Harus `setLoading(false)` jika token **tidak** valid | ✅ | `setIsLoading(false)` di else block |
| Saat loading selesai, tampilkan `children` (yaitu `<LoginForm />`) | ✅ | Return `{children}` setelah loading |

## Tips Implementasi yang Diterapkan

### 🔄 Hindari redirect di client dan server sekaligus
- **Client-side:** AuthCheck menangani redirect user yang sudah login
- **Server-side:** Middleware hanya melindungi route admin
- **Tidak ada overlap:** Tidak ada redirect ganda

### ⏳ Tunda render login form sampai session dicek
- AuthCheck dengan loading state yang proper
- Tidak render form sampai session dicek
- User tidak melihat flash of login form

### ✅ Gunakan `router.replace()`
- Semua redirect menggunakan `router.replace()` untuk menghindari stack history
- Browser back button tidak mengembalikan user ke halaman login

### 🧠 Jangan render apapun saat session masih "loading"
- Loading state yang konsisten di semua komponen auth
- Pattern `if (loading) return <LoadingComponent />`
- Tidak ada render komponen yang tidak perlu

### 👀 Gunakan middleware hanya untuk route yang perlu
- Middleware yang fokus hanya pada route yang perlu proteksi
- Tidak ada redirect di middleware untuk user yang sudah login
- Middleware hanya proteksi route `/admin`, bukan `/login`

## Debug Commands

### Cek Token di Browser Console
```javascript
// Check token in localStorage
console.log('Token:', localStorage.getItem('auth_token'))

// Check token in cookies
console.log('Cookies:', document.cookie)

// Check auth service
import { authService } from '@/lib/auth'
console.log('Is authenticated:', authService.isAuthenticated())
```

### Clear Auth Data
```javascript
// Clear all auth data
localStorage.removeItem('auth_token')
localStorage.removeItem('current_user')
document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
```

### Test Manual Redirect
```javascript
// Test redirect manually
window.location.href = '/admin'
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Infinite loading | AuthCheck tidak setLoading(false) | Pastikan setLoading(false) di else block |
| Redirect loop | useEffect dependency array | Gunakan empty array `[]` |
| Flash of login form | Tidak ada loading state | Tambahkan loading state di AuthCheck |
| Token not found | Token tidak tersimpan | Cek setStoredToken function |
| Middleware blocking | Route matching terlalu luas | Narrow down middleware scope |

## Testing Checklist

### Login Flow
- [x] User yang belum login bisa akses halaman login
- [x] Loading spinner muncul saat cek auth
- [x] Form login muncul setelah loading selesai
- [x] Tidak ada infinite loop

### Auth Check
- [x] User yang sudah login di-redirect ke admin
- [x] User yang belum login tetap di halaman login
- [x] Loading state berfungsi dengan benar
- [x] Tidak ada re-render yang tidak perlu

### Middleware
- [x] Route `/admin/login` tidak diblokir
- [x] Route `/admin/*` diblokir jika tidak ada token
- [x] API routes dilindungi dengan benar
- [x] Tidak ada redirect loop

## Kesimpulan

Implementasi autentikasi yang benar harus:

1. **Menghindari infinite loop** dengan proper loading state
2. **Menggunakan `router.replace()`** untuk semua redirect
3. **Menunda render** sampai auth check selesai
4. **Memisahkan client dan server redirect** untuk menghindari konflik
5. **Menggunakan middleware dengan bijak** hanya untuk route yang perlu

Dengan perbaikan ini, infinite loop seharusnya sudah teratasi dan autentikasi berfungsi dengan baik.
