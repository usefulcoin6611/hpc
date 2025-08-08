# Best Practices Autentikasi

## Overview

Implementasi autentikasi ini mengikuti best practices modern untuk aplikasi web dengan fokus pada keamanan, user experience, dan maintainability.

## Tips Implementasi yang Diterapkan

### 🔄 Hindari redirect di client dan server sekaligus
**Implementasi:** Menggunakan AuthCheck di client-side untuk halaman login dan middleware hanya untuk proteksi route admin
- **Client-side:** AuthCheck menangani redirect user yang sudah login dari halaman login
- **Server-side:** Middleware hanya melindungi route admin tanpa redirect user login
- **Hasil:** Tidak ada konflik redirect antara client dan server

### ⏳ Tunda render login form sampai session dicek
**Implementasi:** AuthCheck dengan loading state yang proper
```tsx
// AuthCheck menampilkan loading sampai session dicek
if (isLoading) {
  return <PageLoading title="Memverifikasi Autentikasi" />
}
```
- **Hasil:** User tidak melihat flash of login form sebelum redirect

### ✅ Gunakan `router.replace()` 
**Implementasi:** Semua redirect menggunakan `router.replace()` untuk menghindari stack history
```tsx
// Di AuthCheck
router.replace(redirectTo)

// Di AuthGuard  
router.replace('/admin/login')

// Di LoginPage
router.replace('/admin')
```
- **Hasil:** Browser back button tidak mengembalikan user ke halaman login setelah login

### 🧠 Jangan render apapun saat session masih "loading"
**Implementasi:** Loading state yang konsisten di semua komponen auth
```tsx
// AuthCheck
if (isLoading) return <PageLoading />

// AuthGuard
if (isUserLoading || isCheckingPermission) return <PageLoading />
```
- **Hasil:** Tidak ada render komponen yang tidak perlu saat masih checking session

### 👀 Gunakan middleware hanya untuk route yang perlu
**Implementasi:** Middleware yang fokus dan tidak redundant
- **Proteksi:** Hanya route admin yang dilindungi middleware
- **Login page:** Tidak ada redirect di middleware untuk user yang sudah login
- **API routes:** Hanya API yang memerlukan auth yang dilindungi
- **Hasil:** Middleware yang efisien dan tidak mengganggu flow autentikasi

## Fitur Utama

### 1. **Background Auth Check**
- Komponen AuthCheck yang mengecek token di background
- Otomatis redirect user yang sudah login dari halaman login ke dashboard
- Mencegah flash of content dengan return null saat checking
- Logging untuk debugging auth flow

### 2. **Token Management**
- Token disimpan di localStorage dengan nama konsisten (`auth_token`)
- Pengecekan token expiration otomatis
- Automatic token refresh 5 menit sebelum expired
- Pembersihan token otomatis saat expired

### 3. **Middleware Protection**
- Proteksi rute di level middleware Next.js
- Redirect otomatis untuk user yang tidak terautentikasi ke halaman login
- Hanya halaman login yang bisa diakses tanpa token

### 4. **Consistent Auth Utils**
- Utility functions terpusat untuk manajemen token
- Konsistensi dalam penyimpanan dan pengambilan data auth
- Error handling yang robust

## Flow Autentikasi

### Login Page Flow (`/admin/login`)
1. **AuthCheck**: Komponen mengecek token di background dengan loading state
2. **Token Valid**: Jika token masih valid, otomatis redirect ke `/admin` dengan `router.replace()`
3. **Token Invalid/Expired**: Jika token tidak valid, tampilkan form login
4. **Login Success**: Setelah login berhasil, redirect ke `/admin` dengan `router.replace()`
5. **Browser Back**: User yang sudah login tidak bisa kembali ke halaman login

### Admin Routes Flow (`/admin/*`)
1. **AuthGuard**: Komponen mengecek token sebelum menampilkan halaman
2. **Token Valid**: User bisa mengakses halaman admin
3. **Token Invalid**: Otomatis redirect ke `/admin/login` dengan `router.replace()`
4. **Middleware**: Double protection di server-side tanpa konflik

### Logout Flow
1. User klik logout di sidebar
2. Konfirmasi dialog muncul
3. Setelah konfirmasi:
   - Call logout API
   - Clear token dari localStorage
   - Clear user data
   - Clear refresh timeout
   - Redirect ke halaman login dengan `router.replace()`

### Browser Navigation Protection
- **User sudah login** → tidak bisa akses `/admin/login` (redirect ke `/admin`)
- **User belum login** → tidak bisa akses `/admin/*` (redirect ke `/admin/login`)
- **User sudah logout** → tidak bisa akses `/admin/*` (redirect ke `/admin/login`)
- **Token expired** → tidak bisa akses `/admin/*` (redirect ke `/admin/login`)
- **Browser back button** → tidak bisa kembali ke halaman login jika sudah login
- **Browser forward button** → tidak bisa ke halaman admin jika sudah logout
- **Direct URL access** → dilindungi oleh middleware dan client-side guards
- **Manual URL typing** → tidak bisa akses halaman admin tanpa token valid

### Logout & Token Expired Protection
**Saat user logout:**
1. Token dihapus dari localStorage
2. User data dihapus dari localStorage
3. Refresh timeout dibersihkan
4. User tidak bisa akses halaman admin lagi
5. Browser back/forward tidak berfungsi untuk halaman admin

**Saat token expired:**
1. Token expired terdeteksi otomatis
2. Data auth dibersihkan otomatis
3. User di-redirect ke halaman login
4. Tidak bisa akses halaman admin sampai login ulang

### Token Refresh Flow
1. Token akan di-refresh otomatis 5 menit sebelum expired
2. Jika refresh berhasil, token baru disimpan
3. Jika refresh gagal, user di-logout otomatis

## Keamanan

### Token Security
- Token disimpan di localStorage (bisa diubah ke httpOnly cookies untuk keamanan lebih)
- Pengecekan expiration otomatis
- Automatic logout saat token expired

### Route Protection
- Middleware protection untuk semua rute admin
- Background auth check untuk halaman login
- Double protection untuk keamanan maksimal

### Error Handling
- Graceful handling untuk network errors
- Automatic logout saat API call gagal
- User-friendly error messages

## Best Practices yang Diimplementasikan

### ✅ **Yang Sudah Baik:**
1. **Background Auth Check**: Mencegah user yang sudah login mengakses halaman login
2. **Middleware Protection**: Server-side protection untuk semua rute admin
3. **Automatic Token Refresh**: Mencegah session timeout
4. **Consistent Token Management**: Centralized utility functions
5. **Graceful Error Handling**: Robust error handling
6. **User Experience**: No flash of content, smooth transitions
7. **Router.replace()**: Menghindari stack history
8. **Loading States**: Proper loading states di semua komponen auth
9. **Focused Middleware**: Middleware yang hanya melindungi route yang perlu

### 🔄 **Yang Bisa Ditingkatkan:**
1. **HTTP-Only Cookies**: Untuk keamanan token yang lebih baik
2. **Refresh Token**: Implementasi refresh token terpisah
3. **Session Management**: Server-side session tracking
4. **Rate Limiting**: Mencegah brute force attacks
5. **2FA Support**: Two-factor authentication

## Penggunaan

### Background Auth Check
```tsx
// Halaman login dengan background auth check
<AuthCheck redirectTo="/admin">
  <LoginPage />
</AuthCheck>
```

### Cek Status Auth
```tsx
import { authService } from '@/lib/auth'

// Cek apakah user sudah login
const isAuth = authService.isAuthenticated()

// Cek role user
const hasRole = authService.hasRole('admin')
const hasAnyRole = authService.hasAnyRole(['admin', 'user'])
```

### Logout
```tsx
import { authService } from '@/lib/auth'

// Logout user
await authService.logout()
```

## Troubleshooting

### User tidak bisa login
1. Cek network connectivity
2. Cek API endpoint
3. Cek browser console untuk errors
4. Clear localStorage dan coba lagi

### User di-logout otomatis
1. Cek token expiration
2. Cek refresh token functionality
3. Cek API responses

### Redirect loop
1. Cek middleware configuration
2. Cek AuthCheck implementation
3. Cek token storage consistency

### Loop Loading "Memverifikasi Autentikasi"
**Gejala:** Halaman terus menampilkan loading "Memverifikasi Autentikasi" tanpa berhenti

**Penyebab:**
1. Token corrupted atau invalid format
2. Error dalam pengecekan token
3. Infinite loop dalam useEffect

**Solusi:**
1. Clear localStorage dan cookies
2. Restart browser
3. Cek console untuk error messages
4. Pastikan token format valid

### Browser Back Button Issues
**Gejala:** User bisa kembali ke halaman login setelah login

**Penyebab:**
1. Menggunakan `router.push()` instead of `router.replace()`
2. Stack history tidak dibersihkan

**Solusi:**
1. Gunakan `router.replace()` untuk semua redirect auth
2. Pastikan AuthCheck dan AuthGuard menggunakan `router.replace()`

### Flash of Login Form
**Gejala:** Login form muncul sebentar sebelum redirect

**Penyebab:**
1. Tidak ada loading state saat pengecekan auth
2. Render form sebelum auth check selesai

**Solusi:**
1. Tambahkan loading state di AuthCheck
2. Jangan render form sampai auth check selesai
3. Gunakan `if (loading) return null` pattern

## Kesimpulan

Implementasi autentikasi ini mengikuti best practices modern dengan fokus pada:

1. **User Experience**: Loading states yang proper, tidak ada flash of content
2. **Security**: Double protection dengan middleware dan client-side guards
3. **Maintainability**: Centralized auth utilities dan consistent patterns
4. **Performance**: Efficient middleware dan optimized auth checks
5. **Browser Navigation**: Proper handling dengan `router.replace()`

Tips-tips yang diterapkan memastikan autentikasi yang robust, user-friendly, dan maintainable. 