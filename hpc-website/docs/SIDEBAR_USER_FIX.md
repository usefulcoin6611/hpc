# Perbaikan Masalah Infinite Loop pada Fetch Data User di Sidebar

## Masalah yang Ditemukan

Setelah perbaikan logout, muncul masalah baru yaitu infinite loop pada fetch data user di sidebar menu. Masalah ini disebabkan oleh:

1. **Multiple useUser calls** - AuthGuard dan AdminLayoutClient sama-sama memanggil useUser hook
2. **Event listener berulang** - Event listener untuk token change dipanggil berulang kali
3. **Dependency array yang tidak tepat** - useEffect bergantung pada fetchUser yang menyebabkan re-render berulang

## Solusi yang Diterapkan

### 1. Perbaikan AdminLayoutClient (`app/admin/admin-layout-client.tsx`)

- **Single useUser instance** - Hanya AdminLayoutClient yang memanggil useUser
- **Pass user data ke AuthGuard** - User data dipass sebagai props ke AuthGuard
- **Mencegah multiple calls** - AuthGuard tidak lagi memanggil useUser secara terpisah

### 2. Perbaikan AuthGuard (`components/auth-guard.tsx`)

- **Menerima user props** - AuthGuard sekarang menerima user, isUserLoading, dan userError sebagai props
- **Fallback ke useUser** - Jika props tidak disediakan, tetap menggunakan useUser hook
- **Mencegah duplicate calls** - Tidak memanggil useUser jika sudah ada data dari props

### 3. Perbaikan useUser Hook (`hooks/use-user.ts`)

- **Event listener ref** - Menggunakan ref untuk mencegah event listener setup berulang
- **FetchUser ref** - Menyimpan fetchUser dalam ref untuk akses dalam event listener
- **Dependency array yang tepat** - Memperbaiki dependency array untuk mencegah infinite loop
- **Fetch flag** - Mencegah multiple simultaneous fetches

## Perubahan Kode Utama

### AdminLayoutClient
```typescript
// Sebelum
<AuthGuard>
  <AdminSidebar user={user} isUserLoading={isUserLoading} userError={userError} />

// Sesudah  
<AuthGuard user={user} isUserLoading={isUserLoading} userError={userError}>
  <AdminSidebar user={user} isUserLoading={isUserLoading} userError={userError} />
```

### AuthGuard
```typescript
// Sebelum
const { user, isLoading, error } = useUser()

// Sesudah
const { user: hookUser, isLoading: hookIsUserLoading, error: hookUserError } = useUser()
const user = propUser !== undefined ? propUser : hookUser
const isUserLoading = propIsUserLoading !== undefined ? propIsUserLoading : hookIsUserLoading
const userError = propUserError !== undefined ? propUserError : hookUserError
```

### useUser Hook
```typescript
// Sebelum
useEffect(() => {
  // Event listener setup
}, [fetchUser]) // Bergantung pada fetchUser

// Sesudah
const fetchUserRef = useRef<((force?: boolean) => Promise<void>) | null>(null)
fetchUserRef.current = fetchUser

useEffect(() => {
  if (eventListenersAddedRef.current) return
  // Event listener setup dengan fetchUserRef.current
}, [fetchUser]) // Tetap bergantung pada fetchUser tapi dengan ref
```

## Cara Kerja Perbaikan

1. **Single Source of Truth** - Hanya AdminLayoutClient yang memanggil useUser
2. **Data Sharing** - User data di-share ke komponen lain melalui props
3. **Event Listener Management** - Event listener hanya disetup sekali per instance
4. **Fetch Control** - Mencegah multiple simultaneous API calls
5. **Dependency Management** - Dependency array yang tepat untuk mencegah infinite loop

## Hasil yang Diharapkan

- ✅ Tidak ada infinite loop pada fetch data user
- ✅ Sidebar menampilkan data user dengan benar
- ✅ Login dan logout tetap berfungsi dengan baik
- ✅ Tidak ada multiple API calls yang tidak perlu
- ✅ Performance yang lebih baik

## Testing

Untuk test perbaikan ini:

1. Login ke aplikasi
2. Pastikan data user muncul di sidebar
3. Navigasi ke halaman lain
4. Pastikan tidak ada infinite loop di console
5. Test logout dan login kembali
6. Pastikan semua berfungsi dengan normal

## Catatan Penting

- Perbaikan ini mempertahankan fungsionalitas login/logout yang sudah benar
- Mengurangi jumlah API calls yang tidak perlu
- Meningkatkan performance aplikasi
- Mencegah memory leak dan infinite loop
- Mempertahankan user experience yang baik
