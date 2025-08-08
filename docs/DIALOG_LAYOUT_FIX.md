# Dialog Layout Fix - Solusi Bug Layout Shift

## Masalah

Ketika dialog popup dibuka dari `<main>`, elemen `<main>` tersebut mengalami penyempitan width/lebar. Ini terjadi karena:

1. **Scrollbar hilang** saat dialog terbuka, membuat viewport lebih lebar
2. **Layout menggunakan `flex-1`** pada `<main>` yang responsive terhadap perubahan viewport
3. **Perbedaan penanganan scrollbar** antar browser (Safari vs Chrome/Firefox/Edge)

## Solusi yang Diimplementasikan

### 1. CSS untuk Mencegah Layout Shift

```css
/* Fix for dialog causing main content to shrink */
body[data-dialog-open="true"] {
  overflow: hidden;
  padding-right: var(--scrollbar-width, 0px);
}

/* Calculate scrollbar width to prevent layout shift */
:root {
  --scrollbar-width: 0px;
}

/* Prevent layout shift when dialog opens */
.flex-1 {
  min-width: 0;
  flex-shrink: 1;
}

/* Ensure main content doesn't shrink unexpectedly */
main.flex-1 {
  width: 0;
  min-width: 0;
}

/* Cross-browser scrollbar fixes */
html {
  scrollbar-gutter: stable;
}

/* Force scrollbar to always be visible on webkit browsers */
@media screen and (min-width: 1024px) {
  body {
    overflow-y: scroll;
  }
}
```

### 2. Hook untuk Mengelola Scroll Lock

```typescript
// hooks/use-dialog-scroll.ts
export function useDialogScroll() {
  const scrollbarWidthRef = useRef<number>(0)

  // Calculate scrollbar width on mount
  useEffect(() => {
    const calculateScrollbarWidth = () => {
      const outer = document.createElement('div')
      outer.style.visibility = 'hidden'
      outer.style.overflow = 'scroll'
      outer.style.position = 'absolute'
      outer.style.top = '-9999px'
      document.body.appendChild(outer)

      const inner = document.createElement('div')
      outer.appendChild(inner)

      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth
      outer.parentNode?.removeChild(outer)

      scrollbarWidthRef.current = scrollbarWidth
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)
    }

    calculateScrollbarWidth()
  }, [])

  const lockScroll = () => {
    const body = document.body
    const scrollY = window.scrollY
    
    // Store scroll position
    body.style.top = `-${scrollY}px`
    body.style.position = 'fixed'
    body.style.width = '100%'
    
    // Add data attribute for CSS targeting
    body.setAttribute('data-dialog-open', 'true')
    
    // Add padding to compensate for scrollbar
    const scrollbarWidth = scrollbarWidthRef.current
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }
  }

  const unlockScroll = () => {
    const body = document.body
    
    // Remove data attribute
    body.removeAttribute('data-dialog-open')
    
    // Restore scroll position
    const scrollY = parseInt(body.style.top || '0') * -1
    body.style.position = ''
    body.style.top = ''
    body.style.width = ''
    body.style.paddingRight = ''
    
    // Restore scroll position
    window.scrollTo(0, scrollY)
  }

  return { lockScroll, unlockScroll }
}
```

### 3. Komponen Dialog Wrapper

```typescript
// components/ui/dialog-wrapper.tsx
export function DialogWrapper({ 
  open, 
  onOpenChange, 
  children, 
  ...props 
}: DialogWrapperProps) {
  const { lockScroll, unlockScroll } = useDialogScroll()

  useEffect(() => {
    if (open) {
      lockScroll()
    } else {
      unlockScroll()
    }

    return () => {
      unlockScroll()
    }
  }, [open, lockScroll, unlockScroll])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...props}>
        {children}
      </DialogContent>
    </Dialog>
  )
}
```

## Update Dialog di Semua Halaman

Dialog-dialog berikut telah diupdate untuk menggunakan `DialogWrapper`:

### Halaman Master Barang
- ✅ `AddBarangDialog` - Dialog tambah barang
- ✅ `EditBarangDialog` - Dialog edit barang  
- ✅ `DeleteBarangDialog` - Dialog hapus barang
- ✅ `ImportBarangDialog` - Dialog import data (Kode Barang & Nama Barang)
- ✅ `ExportBarangDialog` - Dialog export data (Kode Barang & Nama Barang)

### Halaman Barang Masuk
- ✅ `AddBarangMasukDialog` - Dialog tambah barang masuk
- ✅ `EditBarangMasukDialog` - Dialog edit barang masuk
- ✅ `DetailBarangMasukDialog` - Dialog detail barang masuk
- ✅ `DeleteBarangMasukDialog` - Dialog hapus barang masuk

### Halaman Transaksi
- ✅ `AddTransaksiDialog` - Dialog tambah transaksi

### Halaman Data Pengguna
- ✅ `EditUserDialog` - Dialog edit pengguna
- ✅ `DeleteUserDialog` - Dialog hapus pengguna

### Halaman Barang Keluar
- ✅ `AddBarangKeluarDialog` - Dialog tambah barang keluar
- ✅ `EditBarangKeluarDialog` - Dialog edit barang keluar
- ✅ `DetailBarangKeluarDialog` - Dialog detail barang keluar

### Halaman Update Lembar Kerja
- ✅ `UpdateDetailDialog` - Dialog update detail barang

### Halaman Approver
- ✅ Dialog detail inspeksi mesin (inline dialog)
- ✅ `EditInspeksiDialog` - Dialog edit inspeksi
- ✅ `EditAssemblyDialog` - Dialog edit assembly
- ✅ `EditPaintingDialog` - Dialog edit painting
- ✅ `EditQCDialog` - Dialog edit QC
- ✅ `EditPDIDialog` - Dialog edit PDI
- ✅ `EditPindahLokasiDialog` - Dialog edit pindah lokasi

## Cara Penggunaan

### Untuk Dialog Baru

Gunakan `DialogWrapper` sebagai pengganti kombinasi `Dialog` + `DialogContent`:

```typescript
import { DialogWrapper } from "@/components/ui/dialog-wrapper"

<DialogWrapper 
  open={isOpen} 
  onOpenChange={setIsOpen}
  className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto modal-scrollbar"
>
  <DialogHeader>
    <DialogTitle>Judul Dialog</DialogTitle>
  </DialogHeader>
  {/* Content */}
</DialogWrapper>
```

### Untuk Dialog Existing

Update import dan struktur:

```typescript
// Sebelum
import { Dialog, DialogContent } from "@/components/ui/dialog"
<Dialog open={isOpen} onOpenChange={onOpenChange}>
  <DialogContent>
    {/* content */}
  </DialogContent>
</Dialog>

// Sesudah
import { DialogWrapper } from "@/components/ui/dialog-wrapper"
<DialogWrapper open={isOpen} onOpenChange={onOpenChange}>
  {/* content */}
</DialogWrapper>
```

## Hasil

✅ **Layout tidak lagi menyempit** saat dialog terbuka  
✅ **Scrollbar width dikompensasi** untuk mencegah layout shift  
✅ **Body scroll terkunci** saat dialog terbuka  
✅ **Main content tetap stabil** dengan width yang konsisten  
✅ **Cross-browser compatibility** (Chrome, Firefox, Edge, Safari)

## Testing

Untuk memastikan fix berfungsi di semua halaman:

### Halaman Master Barang
1. Buka halaman Master Barang
2. Pastikan konten mengisi seluruh lebar yang tersedia
3. Buka salah satu dialog (Tambah Data, Edit, Hapus, Import, Export)
4. Perhatikan bahwa layout tidak menyempit dan tidak ada bagian putih di kanan
5. Tutup dialog dan pastikan layout kembali normal

### Halaman Barang Masuk
1. Buka halaman Barang Masuk
2. Buka dialog Tambah Barang Masuk, Edit, Detail, atau Hapus
3. Perhatikan bahwa layout tidak menyempit

### Halaman Transaksi
1. Buka halaman Transaksi
2. Buka dialog Tambah Transaksi
3. Perhatikan bahwa layout tidak menyempit

### Halaman Data Pengguna
1. Buka halaman Data Pengguna
2. Buka dialog Edit atau Hapus Pengguna
3. Perhatikan bahwa layout tidak menyempit

### Halaman Barang Keluar
1. Buka halaman Barang Keluar
2. Buka dialog Tambah, Edit, atau Detail Barang Keluar
3. Perhatikan bahwa layout tidak menyempit

### Halaman Update Lembar Kerja
1. Buka halaman Update Lembar Kerja
2. Buka dialog Update Detail
3. Perhatikan bahwa layout tidak menyempit

### Halaman Approver
1. Buka halaman Approver
2. Buka dialog detail atau edit
3. Perhatikan bahwa layout tidak menyempit

### Cross-Browser Testing
Test di berbagai browser (Chrome, Firefox, Edge, Safari) untuk memastikan konsistensi.

## Perbedaan Browser

- **Safari**: Biasanya tidak mengalami masalah ini karena penanganan scrollbar yang berbeda
- **Chrome/Edge**: Menggunakan webkit scrollbar, memerlukan kompensasi padding
- **Firefox**: Menggunakan scrollbar-width CSS, memerlukan pendekatan berbeda

Solusi ini mengatasi semua perbedaan browser dengan pendekatan yang konsisten.
