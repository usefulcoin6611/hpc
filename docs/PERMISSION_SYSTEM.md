# Sistem Permission Warehouse Admin

## Overview

Sistem permission ini memungkinkan kontrol akses yang berbeda untuk setiap role dan job type user. Menu sidebar dan halaman akan ditampilkan berdasarkan permission yang dimiliki user.

## Role dan Job Type

### UserRole (Role)
- `inspeksi_mesin` - Staff inspeksi mesin
- `assembly_staff` - Staff assembly
- `qc_staff` - Staff QC
- `pdi_staff` - Staff PDI
- `painting_staff` - Staff painting
- `pindah_lokasi` - Staff pindah lokasi
- `admin` - Administrator
- `supervisor` - Supervisor

### UserJobType (Job Type)
- `staff` - Staff level
- `supervisor` - Supervisor level
- `admin` - Admin level

## Permission Matrix

| Menu | Admin | Supervisor | Staff |
|------|-------|------------|-------|
| Dashboard | ✅ | ✅ | ✅ |
| Master Barang | ✅ | ✅ | ❌ |
| Jenis Barang | ✅ | ✅ | ❌ |
| Barang Masuk | ✅ | ✅ | ❌ |
| Transaksi | ✅ | ✅ | ✅ |
| Approver | ✅ | ✅ | ❌ |
| Barang Keluar | ✅ | ✅ | ❌ |
| Update Lembar Kerja | ✅ | ✅ | ✅ |
| Laporan | ✅ | ✅ | ❌ |
| Data Pengguna | ✅ | ❌ | ❌ |
| Pengaturan | ✅ | ❌ | ❌ |

## Implementasi

### 1. Menu Permission

Setiap menu item dapat memiliki permission:

```typescript
{
  title: "Data Pengguna",
  path: "/admin/data-pengguna",
  icon: <Users className="h-5 w-5" />,
  submenu: true,
  permission: {
    jobTypes: ['admin'] // Hanya admin
  }
}
```

### 2. Utility Functions

#### `hasPermission(userRole, userJobType, allowedRoles?, allowedJobTypes?)`
Mengecek apakah user memiliki permission berdasarkan role dan job type.

#### `filterMenuItemsByPermission(menuItems, userRole, userJobType)`
Memfilter menu items berdasarkan permission user.

### 3. Hook usePermission

```typescript
const { 
  checkPermission,
  isAdmin,
  isSupervisor,
  isStaff,
  canAccessDataPengguna,
  // ... other permissions
} = usePermission()
```

### 4. Komponen AccessDenied

Menampilkan pesan ketika user tidak memiliki akses:

```typescript
<AccessDenied 
  title="Akses Ditolak"
  message="Anda tidak memiliki izin untuk mengakses halaman ini."
/>
```

### 5. AuthGuard dengan Permission

```typescript
<AuthGuard requiredPermission={{ jobTypes: ['admin'] }}>
  <DataPenggunaPage />
</AuthGuard>
```

## Penggunaan

### 1. Di Sidebar

Menu akan otomatis difilter berdasarkan permission user:

```typescript
// Di SidebarContent
const filteredMenuItems = user 
  ? filterMenuItemsByPermission(menuItems, user.role, user.jobType || null)
  : menuItems
```

### 2. Di Halaman

```typescript
export default function SomePage() {
  const { canAccessSomePage } = usePermission()
  
  if (!canAccessSomePage) {
    return <AccessDenied />
  }
  
  return <div>Page content</div>
}
```

### 3. Di Komponen

```typescript
function SomeComponent() {
  const { isAdmin, checkPermission } = usePermission()
  
  return (
    <div>
      {isAdmin && <AdminOnlyButton />}
      {checkPermission(undefined, ['admin', 'supervisor']) && <SupervisorButton />}
    </div>
  )
}
```

## Best Practices

1. **Gunakan Job Type untuk permission utama** - Lebih sederhana dan mudah dikelola
2. **Gunakan Role untuk permission spesifik** - Jika diperlukan kontrol yang lebih detail
3. **Selalu cek permission di level komponen** - Jangan hanya mengandalkan sidebar filtering
4. **Gunakan AccessDenied component** - Untuk UX yang konsisten
5. **Log permission checks** - Untuk debugging dan audit

## Extending Permission System

### Menambah Permission Baru

1. Update interface MenuItem:
```typescript
permission?: {
  roles?: UserRole[]
  jobTypes?: UserJobType[]
  customPermission?: string
}
```

2. Update hasPermission function:
```typescript
export function hasPermission(
  userRole: string, 
  userJobType: string | null, 
  allowedRoles?: string[], 
  allowedJobTypes?: string[],
  customPermission?: string
): boolean {
  // Add custom permission logic
}
```

3. Update usePermission hook:
```typescript
const canAccessNewFeature = checkPermission(undefined, ['admin'])
```

## Troubleshooting

### Menu tidak muncul
- Cek apakah user memiliki jobType yang benar
- Cek permission di menu item
- Cek console untuk error

### Permission tidak bekerja
- Cek apakah useUser hook mengembalikan data yang benar
- Cek apakah user.role dan user.jobType ada
- Cek apakah filterMenuItemsByPermission dipanggil dengan benar

### AccessDenied muncul
- Cek permission yang dibutuhkan vs permission user
- Cek apakah user sudah login dengan benar
- Cek apakah role/jobType user sudah sesuai
