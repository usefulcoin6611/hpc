# Loading System - Warehouse Admin System

## 📋 Overview

Sistem loading yang komprehensif untuk memberikan feedback visual yang baik kepada pengguna saat aplikasi memproses data atau melakukan operasi async.

## 🎯 Komponen Loading

### **1. LoadingSpinner**
Spinner loading dengan berbagai ukuran dan teks opsional.

```typescript
import { LoadingSpinner } from "@/components/ui/loading"

// Basic usage
<LoadingSpinner />

// With custom size and text
<LoadingSpinner 
  size="lg" 
  text="Memuat data..." 
  className="my-4" 
/>
```

**Props:**
- `size`: "sm" | "md" | "lg" | "xl" (default: "md")
- `text`: string (default: "Memuat...")
- `className`: string (optional)

### **2. LoadingSkeleton**
Skeleton loading dengan berbagai variant untuk layout yang berbeda.

```typescript
import { LoadingSkeleton } from "@/components/ui/loading"

// Default skeleton
<LoadingSkeleton />

// Card skeleton
<LoadingSkeleton variant="card" />

// Table skeleton
<LoadingSkeleton variant="table" />

// Form skeleton
<LoadingSkeleton variant="form" />
```

**Props:**
- `variant`: "default" | "card" | "table" | "form" (default: "default")
- `className`: string (optional)

### **3. PageLoading**
Loading untuk halaman penuh dengan berbagai variant.

```typescript
import { PageLoading } from "@/components/ui/page-loading"

// Default page loading
<PageLoading />

// Table page loading
<PageLoading variant="table" />

// Form page loading
<PageLoading variant="form" />

// Dashboard page loading
<PageLoading variant="dashboard" />
```

**Props:**
- `variant`: "default" | "table" | "form" | "dashboard" (default: "default")
- `title`: string (default: "Memuat Halaman")
- `description`: string (default: "Mohon tunggu sebentar...")
- `className`: string (optional)

### **4. TableLoading**
Loading khusus untuk tabel dengan jumlah baris dan kolom yang dapat dikustomisasi.

```typescript
import { TableLoading } from "@/components/ui/loading"

// Default table (5 rows, 4 columns)
<TableLoading />

// Custom table
<TableLoading rows={10} columns={6} />
```

**Props:**
- `rows`: number (default: 5)
- `columns`: number (default: 4)
- `className`: string (optional)

### **5. CardLoading**
Loading untuk card dengan jumlah card yang dapat dikustomisasi.

```typescript
import { CardLoading } from "@/components/ui/loading"

// Default cards (3 cards)
<CardLoading />

// Custom number of cards
<CardLoading cards={5} />
```

**Props:**
- `cards`: number (default: 3)
- `className`: string (optional)

### **6. DashboardLoading**
Loading khusus untuk dashboard dengan stats cards dan content cards.

```typescript
import { DashboardLoading } from "@/components/ui/loading"

<DashboardLoading />
```

**Props:**
- `className`: string (optional)

### **7. InlineLoading**
Loading inline untuk komponen kecil.

```typescript
import { InlineLoading } from "@/components/ui/loading"

// Small inline loading
<InlineLoading size="sm" text="Saving..." />

// Medium inline loading
<InlineLoading size="md" text="Processing..." />
```

**Props:**
- `size`: "sm" | "md" (default: "sm")
- `text`: string (optional)
- `className`: string (optional)

### **8. ButtonLoading**
Loading untuk button dengan teks kustom.

```typescript
import { ButtonLoading } from "@/components/ui/loading"

<ButtonLoading text="Memuat..." />
```

**Props:**
- `text`: string (default: "Memuat...")
- `className`: string (optional)

## 🎣 Custom Hooks

### **useLoading Hook**
Hook untuk mengelola state loading dengan berbagai fitur.

```typescript
import { useLoading } from "@/hooks/use-loading"

function MyComponent() {
  const { 
    isLoading, 
    loadingText, 
    progress,
    startLoading, 
    stopLoading, 
    updateProgress, 
    updateLoadingText,
    withLoading 
  } = useLoading()

  // Manual loading control
  const handleManualLoading = async () => {
    startLoading("Memulai proses...")
    try {
      await someAsyncOperation()
      updateLoadingText("Menyelesaikan...")
      await finalizeOperation()
    } finally {
      stopLoading()
    }
  }

  // Automatic loading with withLoading
  const handleAutomaticLoading = async () => {
    await withLoading(async () => {
      await someAsyncOperation()
    }, "Memproses data...")
  }

  return (
    <div>
      {isLoading && (
        <LoadingSpinner text={loadingText} />
      )}
      <button onClick={handleAutomaticLoading}>
        Start Process
      </button>
    </div>
  )
}
```

### **useMultipleLoading Hook**
Hook untuk mengelola multiple loading states.

```typescript
import { useMultipleLoading } from "@/hooks/use-loading"

function MyComponent() {
  const { 
    loadingStates,
    startLoading, 
    stopLoading, 
    withLoading,
    isLoading,
    getLoadingState 
  } = useMultipleLoading()

  const handleMultipleOperations = async () => {
    // Start multiple operations
    await Promise.all([
      withLoading("operation1", async () => {
        await operation1()
      }, "Processing operation 1..."),
      
      withLoading("operation2", async () => {
        await operation2()
      }, "Processing operation 2...")
    ])
  }

  return (
    <div>
      {isLoading("operation1") && <LoadingSpinner text="Operation 1..." />}
      {isLoading("operation2") && <LoadingSpinner text="Operation 2..." />}
    </div>
  )
}
```

### **useGlobalLoading Hook**
Hook untuk global loading state.

```typescript
import { useGlobalLoading } from "@/hooks/use-loading"

function App() {
  const { 
    isLoading, 
    loadingText,
    showGlobalLoading, 
    hideGlobalLoading 
  } = useGlobalLoading()

  return (
    <div>
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <LoadingSpinner text={loadingText} />
        </div>
      )}
      {/* App content */}
    </div>
  )
}
```

## 📱 Loading Pages

### **Automatic Loading Pages**
Next.js App Router secara otomatis akan menampilkan `loading.tsx` saat halaman sedang dimuat.

```typescript
// app/admin/data-pengguna/loading.tsx
import { PageLoading } from "@/components/ui/page-loading"

export default function DataPenggunaLoading() {
  return <PageLoading variant="table" />
}
```

### **Manual Loading States**
Untuk loading states yang lebih granular, gunakan hooks dan komponen loading.

```typescript
function DataPenggunaPage() {
  const { isLoading, withLoading } = useLoading()

  const handleExport = async () => {
    await withLoading(async () => {
      await exportData()
    }, "Exporting data...")
  }

  return (
    <div>
      <Button 
        onClick={handleExport}
        loading={isLoading}
        loadingText="Exporting..."
      >
        Export Data
      </Button>
    </div>
  )
}
```

## 🎨 Styling & Customization

### **Custom Loading Styles**
```typescript
// Custom loading component
function CustomLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
    </div>
  )
}
```

### **Loading with Progress**
```typescript
function ProgressLoading() {
  const { progress, updateProgress } = useLoading()

  const handleProgressOperation = async () => {
    for (let i = 0; i <= 100; i += 10) {
      updateProgress(i)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className="text-sm text-muted-foreground">{progress}%</span>
    </div>
  )
}
```

## 🔧 Best Practices

### **1. Use Appropriate Loading Types**
- **Spinner**: Untuk operasi singkat (< 1 detik)
- **Skeleton**: Untuk loading konten yang panjang
- **Progress**: Untuk operasi yang dapat diukur
- **Button Loading**: Untuk aksi yang memerlukan feedback

### **2. Provide Meaningful Text**
```typescript
// ✅ Good
<LoadingSpinner text="Mengunduh laporan..." />

// ❌ Bad
<LoadingSpinner text="Loading..." />
```

### **3. Handle Loading States Properly**
```typescript
// ✅ Good - Always stop loading
const handleOperation = async () => {
  startLoading("Processing...")
  try {
    await operation()
  } catch (error) {
    // Handle error
  } finally {
    stopLoading() // Always stop loading
  }
}

// ✅ Better - Use withLoading
const handleOperation = async () => {
  await withLoading(async () => {
    await operation()
  }, "Processing...")
}
```

### **4. Disable Interactive Elements**
```typescript
// ✅ Good
<Button 
  onClick={handleSubmit}
  disabled={isLoading}
  loading={isLoading}
>
  Submit
</Button>

// ❌ Bad
<Button onClick={handleSubmit}>
  Submit
</Button>
```

### **5. Use Loading Pages for Route Changes**
```typescript
// app/admin/data-pengguna/loading.tsx
export default function DataPenggunaLoading() {
  return <PageLoading variant="table" />
}
```

## 🎯 Performance Considerations

### **1. Lazy Loading**
```typescript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### **2. Debounced Loading**
```typescript
import { debounce } from 'lodash'

const debouncedSearch = debounce(async (query) => {
  startLoading("Searching...")
  try {
    const results = await searchAPI(query)
    setResults(results)
  } finally {
    stopLoading()
  }
}, 300)
```

### **3. Optimistic Updates**
```typescript
const handleOptimisticUpdate = async () => {
  // Update UI immediately
  setData(newData)
  
  // Then sync with server
  await withLoading(async () => {
    await updateServer(newData)
  }, "Syncing...")
}
```

## 🔍 Testing Loading States

### **Unit Tests**
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { useLoading } from '@/hooks/use-loading'

test('shows loading state', async () => {
  render(<MyComponent />)
  
  fireEvent.click(screen.getByText('Submit'))
  
  expect(screen.getByText('Processing...')).toBeInTheDocument()
  
  await waitFor(() => {
    expect(screen.queryByText('Processing...')).not.toBeInTheDocument()
  })
})
```

### **Integration Tests**
```typescript
test('loading page shows during navigation', async () => {
  render(<App />)
  
  fireEvent.click(screen.getByText('Data Pengguna'))
  
  expect(screen.getByText('Memuat Halaman')).toBeInTheDocument()
  
  await waitFor(() => {
    expect(screen.getByText('Data Pengguna')).toBeInTheDocument()
  })
})
```

## 📚 Additional Resources

- [Next.js Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Tailwind CSS Animations](https://tailwindcss.com/docs/animation)
- [Loading States UX Best Practices](https://www.nngroup.com/articles/response-times-3-important-limits/) 