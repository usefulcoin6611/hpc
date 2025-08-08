# Import/Export System - Warehouse Admin System

## 📋 Overview

Dokumentasi lengkap untuk sistem import/export file CSV dan Excel yang telah diimplementasikan dalam Warehouse Admin System.

## 🚀 Fitur yang Telah Diterapkan

### **1. Utility Functions (`lib/import-utils.ts`)**

#### **ImportResult Interface**
```typescript
export interface ImportResult<T> {
  success: boolean
  data?: T[]
  error?: string
  totalRows: number
  validRows: number
  invalidRows: number
}
```

#### **ValidationRule Interface**
```typescript
export interface ValidationRule<T> {
  field: keyof T
  required?: boolean
  validator?: (value: any) => boolean | string
  transformer?: (value: any) => any
}
```

### **2. Fungsi Utama**

#### **parseCSV(content: string)**
- Parse file CSV dengan support untuk quoted values
- Handle escape characters dengan benar
- Filter empty lines

#### **parseExcel(file: File)**
- Parse file Excel (.xlsx, .xls) menggunakan SheetJS
- Dynamic import untuk mengurangi bundle size
- Support multiple sheets (menggunakan sheet pertama)

#### **validateAndTransformData()**
- Validasi data berdasarkan rules yang didefinisikan
- Transform data sesuai kebutuhan
- Generate detailed error messages
- Return comprehensive import result

#### **importFile()**
- Main function untuk import file
- Support CSV dan Excel formats
- Automatic format detection
- Error handling yang robust

#### **exportToCSV()**
- Export data ke format CSV
- Proper escaping untuk special characters
- Automatic file download

#### **exportToExcel()**
- Export data ke format Excel (.xlsx)
- Dynamic import SheetJS
- Proper worksheet formatting

## 📁 Implementasi di Halaman

### **1. Master Barang (`app/admin/master-barang/page.tsx`)**

#### **Validation Rules**
```typescript
const validationRules: ValidationRule<Item>[] = [
  {
    field: 'code',
    required: true,
    validator: (value) => {
      if (!value || value.trim() === '') return 'Kode barang wajib diisi'
      if (value.length < 3) return 'Kode barang minimal 3 karakter'
      return true
    }
  },
  {
    field: 'name',
    required: true,
    validator: (value) => {
      if (!value || value.trim() === '') return 'Nama barang wajib diisi'
      if (value.length < 5) return 'Nama barang minimal 5 karakter'
      return true
    }
  }
]
```

#### **Export Function**
```typescript
const handleExport = async (format: 'csv' | 'excel' = 'csv') => {
  setIsExporting(true)
  try {
    const headers = ["ID", "Kode Barang", "Nama Barang"]
    const filename = `master_barang_${new Date().toISOString().split('T')[0]}`
    
    if (format === 'csv') {
      exportToCSV(items, headers, filename)
    } else {
      await exportToExcel(items, headers, filename)
    }
    
    toast({
      title: "Export Berhasil!",
      description: `Data master barang telah diunduh sebagai ${format.toUpperCase()}.`,
    })
  } catch (error) {
    toast({
      title: "Export Gagal",
      description: error instanceof Error ? error.message : "Terjadi kesalahan saat export",
      variant: "destructive",
    })
  } finally {
    setIsExporting(false)
  }
}
```

#### **Import Function**
```typescript
const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return

  setIsImporting(true)
  setImportResult(null)

  try {
    const headers = ["ID", "Kode Barang", "Nama Barang"]
    const result = await importFile<Item>(file, headers, validationRules, true)
    
    setImportResult(result)
    
    if (result.success && result.data) {
      const newItems = result.data.map((item, index) => ({
        ...item,
        id: items.length > 0 ? Math.max(...items.map(i => i.id)) + index + 1 : index + 1
      }))
      
      setItems(prev => [...prev, ...newItems])
      
      toast({
        title: "Import Berhasil!",
        description: `${result.validRows} data berhasil diimport.`,
      })
      
      setIsImportDialogOpen(false)
    } else {
      toast({
        title: "Import Gagal",
        description: result.error || "Terjadi kesalahan saat import",
        variant: "destructive",
      })
    }
  } catch (error) {
    toast({
      title: "Import Gagal",
      description: error instanceof Error ? error.message : "Terjadi kesalahan saat import",
      variant: "destructive",
    })
  } finally {
    setIsImporting(false)
    event.target.value = ""
  }
}
```

### **2. Jenis Barang (`app/admin/jenis-barang/page.tsx`)**

#### **Validation Rules**
```typescript
const validationRules: ValidationRule<MachineType>[] = [
  {
    field: 'code',
    required: true,
    validator: (value) => {
      if (!value || value.trim() === '') return 'Kode jenis barang wajib diisi'
      if (value.length < 3) return 'Kode jenis barang minimal 3 karakter'
      return true
    }
  },
  {
    field: 'name',
    required: true,
    validator: (value) => {
      if (!value || value.trim() === '') return 'Nama jenis barang wajib diisi'
      if (value.length < 5) return 'Nama jenis barang minimal 5 karakter'
      return true
    }
  },
  {
    field: 'category',
    required: true,
    validator: (value) => {
      if (!value || value.trim() === '') return 'Kategori wajib diisi'
      return true
    }
  },
  {
    field: 'description',
    required: false
  }
]
```

## 🎨 UI Components

### **1. Export Dialog**
- Pilihan format: CSV atau Excel
- Loading state saat export
- Success/error notifications

### **2. Import Dialog**
- Drag & drop file upload area
- File type validation (.csv, .xlsx, .xls)
- Real-time import result display
- Detailed error reporting
- Progress indicators

### **3. Import Result Display**
```typescript
{importResult && (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      {importResult.success ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-red-500" />
      )}
      <span className="text-sm font-medium">
        {importResult.success ? 'Import Berhasil' : 'Import Gagal'}
      </span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <p>Total baris: {importResult.totalRows}</p>
      <p>Baris valid: {importResult.validRows}</p>
      <p>Baris invalid: {importResult.invalidRows}</p>
    </div>
    {importResult.error && (
      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
        <p className="font-medium">Error:</p>
        <pre className="whitespace-pre-wrap">{importResult.error}</pre>
      </div>
    )}
  </div>
)}
```

## 📊 Format File yang Didukung

### **1. CSV Format**
```csv
ID,Kode Barang,Nama Barang
1,70790030035,HUNTER Tire Changer TCX 45 Red - 1 Ph
2,70790020019,HUNTER Smart Weight Pro
3,70790030012,HUNTER Hawkeye Elite
```

### **2. Excel Format**
- **File Types**: .xlsx, .xls
- **Sheet**: Menggunakan sheet pertama
- **Headers**: Baris pertama sebagai header
- **Data**: Mulai dari baris kedua

## 🔧 Dependencies

### **Package.json**
```json
{
  "dependencies": {
    "xlsx": "^0.18.5"
  }
}
```

### **Dynamic Import**
```typescript
// Menggunakan dynamic import untuk mengurangi bundle size
const XLSX = await import('xlsx')
```

## 🛡️ Error Handling

### **1. File Validation**
- Format file validation
- File size limits
- MIME type checking

### **2. Data Validation**
- Required field validation
- Custom validation rules
- Data type validation
- Length validation

### **3. Import Errors**
- Detailed error messages
- Row-by-row error reporting
- Partial import support
- Rollback functionality

## 📈 Performance Optimizations

### **1. Bundle Size**
- Dynamic import untuk SheetJS
- Tree shaking untuk unused functions
- Lazy loading untuk large libraries

### **2. Memory Management**
- Proper cleanup untuk file objects
- URL.revokeObjectURL() untuk blob URLs
- Garbage collection optimization

### **3. User Experience**
- Loading states
- Progress indicators
- Real-time feedback
- Non-blocking operations

## 🔄 Workflow

### **1. Export Process**
1. User klik button Export
2. Dialog muncul dengan pilihan format
3. User pilih format (CSV/Excel)
4. Data diproses dan file di-generate
5. File otomatis di-download
6. Success notification ditampilkan

### **2. Import Process**
1. User klik button Import
2. Dialog upload muncul
3. User pilih file CSV/Excel
4. File divalidasi dan diproses
5. Data divalidasi berdasarkan rules
6. Valid data ditambahkan ke state
7. Result summary ditampilkan
8. Error details (jika ada) ditampilkan

## 🎯 Best Practices

### **1. Data Validation**
- Selalu validasi input data
- Gunakan custom validation rules
- Provide clear error messages
- Support partial imports

### **2. User Experience**
- Loading states untuk semua operations
- Clear feedback untuk success/error
- Intuitive file upload interface
- Detailed progress reporting

### **3. Error Handling**
- Graceful error handling
- User-friendly error messages
- Detailed logging untuk debugging
- Fallback mechanisms

### **4. Performance**
- Optimize bundle size
- Use dynamic imports
- Implement proper cleanup
- Cache validation results

## 🔮 Future Enhancements

### **1. Advanced Features**
- Batch import/export
- Scheduled exports
- Template downloads
- Data mapping interface

### **2. Integration**
- API integration
- Database direct export
- Cloud storage integration
- Email export

### **3. Analytics**
- Import/export analytics
- Usage tracking
- Performance monitoring
- Error tracking

## 📝 Contoh Penggunaan

### **1. Menambahkan Import/Export ke Halaman Baru**

```typescript
import { importFile, exportToCSV, exportToExcel, type ImportResult, type ValidationRule } from "@/lib/import-utils"

// Define validation rules
const validationRules: ValidationRule<YourType>[] = [
  {
    field: 'requiredField',
    required: true,
    validator: (value) => {
      if (!value || value.trim() === '') return 'Field wajib diisi'
      return true
    }
  }
]

// Export function
const handleExport = async (format: 'csv' | 'excel' = 'csv') => {
  const headers = ["Header1", "Header2", "Header3"]
  const filename = `your_data_${new Date().toISOString().split('T')[0]}`
  
  if (format === 'csv') {
    exportToCSV(data, headers, filename)
  } else {
    await exportToExcel(data, headers, filename)
  }
}

// Import function
const handleImport = async (file: File) => {
  const headers = ["Header1", "Header2", "Header3"]
  const result = await importFile<YourType>(file, headers, validationRules, true)
  
  if (result.success && result.data) {
    // Process imported data
    setData(prev => [...prev, ...result.data!])
  }
}
```

### **2. Custom Validation Rules**

```typescript
const customValidationRules: ValidationRule<Item>[] = [
  {
    field: 'email',
    required: true,
    validator: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) return 'Format email tidak valid'
      return true
    }
  },
  {
    field: 'phone',
    required: true,
    validator: (value) => {
      const phoneRegex = /^[0-9+\-\s()]+$/
      if (!phoneRegex.test(value)) return 'Format nomor telepon tidak valid'
      return true
    }
  },
  {
    field: 'price',
    required: true,
    transformer: (value) => parseFloat(value),
    validator: (value) => {
      if (isNaN(value) || value <= 0) return 'Harga harus berupa angka positif'
      return true
    }
  }
]
```

## ✅ Summary

Sistem import/export telah berhasil diimplementasikan dengan fitur-fitur:

1. **✅ Support CSV dan Excel formats**
2. **✅ Robust validation system**
3. **✅ User-friendly interface**
4. **✅ Comprehensive error handling**
5. **✅ Performance optimizations**
6. **✅ Type safety dengan TypeScript**
7. **✅ Reusable utility functions**
8. **✅ Detailed documentation**

Sistem ini siap digunakan untuk import/export data di seluruh aplikasi Warehouse Admin System! 🎉 