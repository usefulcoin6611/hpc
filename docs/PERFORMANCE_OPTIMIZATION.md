# Performance Optimization - Warehouse Admin System

## 📋 Overview

Dokumentasi lengkap untuk optimasi performance yang telah diimplementasikan dalam Warehouse Admin System.

## 🚀 Optimasi yang Telah Diterapkan

### **1. Next.js Configuration Optimization**

#### **Bundle Splitting & Code Splitting**
```typescript
// next.config.mjs
webpack: (config, { dev, isServer }) => {
  if (!dev && !isServer) {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        radix: {
          test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
          name: 'radix-ui',
          chunks: 'all',
          priority: 10,
        },
        lucide: {
          test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
          name: 'lucide',
          chunks: 'all',
          priority: 10,
        },
      },
    }
  }
  return config
}
```

#### **Package Import Optimization**
```typescript
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-select',
    '@radix-ui/react-toast',
    'recharts',
    'date-fns',
  ],
}
```

#### **Image Optimization**
```typescript
images: {
  unoptimized: false,
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### **2. Performance Hooks**

#### **useDebounce Hook**
```typescript
import { useDebounce } from "@/hooks/use-performance"

function SearchComponent() {
  const debouncedSearch = useDebounce((query: string) => {
    // Perform search
  }, 300)

  return (
    <input 
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

#### **useThrottle Hook**
```typescript
import { useThrottle } from "@/hooks/use-performance"

function ScrollComponent() {
  const throttledScroll = useThrottle((event: Event) => {
    // Handle scroll
  }, 16) // ~60fps

  return (
    <div onScroll={throttledScroll}>
      {/* Content */}
    </div>
  )
}
```

#### **useIntersectionObserver Hook**
```typescript
import { useIntersectionObserver } from "@/hooks/use-performance"

function LazyComponent() {
  const { elementRef, isIntersecting, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  })

  return (
    <div ref={elementRef}>
      {hasIntersected && <HeavyComponent />}
    </div>
  )
}
```

#### **useVirtualScroll Hook**
```typescript
import { useVirtualScroll } from "@/hooks/use-performance"

function VirtualList({ items }) {
  const { visibleItems, totalHeight, offsetY, handleScroll } = useVirtualScroll(
    items,
    60, // item height
    400, // container height
    5   // overscan
  )

  return (
    <div onScroll={handleScroll} style={{ height: 400 }}>
      <div style={{ height: totalHeight }}>
        <div style={{ height: offsetY }} />
        {visibleItems.map(item => (
          <div key={item.id} style={{ height: 60 }}>
            {item.content}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### **3. Optimized Components**

#### **OptimizedTable Component**
```typescript
import { OptimizedTable } from "@/components/ui/optimized-table"

function DataTable() {
  const columns = [
    { key: "name", header: "Name", width: "200px" },
    { key: "email", header: "Email", width: "250px" },
    {
      key: "status",
      header: "Status",
      render: (item) => <Badge>{item.status}</Badge>
    },
  ]

  return (
    <OptimizedTable
      data={users}
      columns={columns}
      itemHeight={60}
      containerHeight={600}
      onRowClick={(user, index) => handleRowClick(user)}
      loading={isLoading}
    />
  )
}
```

#### **OptimizedSearch Component**
```typescript
import { OptimizedSearch } from "@/components/ui/optimized-search"

function SearchComponent() {
  return (
    <OptimizedSearch
      placeholder="Search users..."
      onSearch={handleSearch}
      debounceDelay={300}
      loading={isLoading}
      showClearButton={true}
    />
  )
}
```

### **4. Performance Monitoring**

#### **PerformanceMonitor Component**
```typescript
import { PerformanceMonitor } from "@/components/ui/performance-monitor"

function MyComponent() {
  return (
    <>
      <div>My Component Content</div>
      <PerformanceMonitor 
        componentName="MyComponent"
        showDetails={true}
      />
    </>
  )
}
```

#### **PerformanceBoundary Component**
```typescript
import { PerformanceBoundary } from "@/components/ui/performance-monitor"

function App() {
  return (
    <PerformanceBoundary
      componentName="App"
      maxRenderTime={50}
      onSlowRender={(renderTime) => {
        console.warn(`Slow render: ${renderTime}ms`)
      }}
    >
      <MyComponent />
    </PerformanceBoundary>
  )
}
```

## 🎯 Best Practices

### **1. React Optimization**

#### **useMemo untuk Expensive Calculations**
```typescript
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])
```

#### **useCallback untuk Event Handlers**
```typescript
const handleClick = useCallback((id: string) => {
  // Handle click
}, [])
```

#### **React.memo untuk Components**
```typescript
const MyComponent = React.memo(({ data, onAction }) => {
  return <div>{/* Component content */}</div>
})
```

### **2. Bundle Optimization**

#### **Dynamic Imports**
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
})
```

#### **Tree Shaking**
```typescript
// ✅ Good - Only import what you need
import { Button } from '@/components/ui/button'

// ❌ Bad - Import everything
import * as UI from '@/components/ui'
```

### **3. Image Optimization**

#### **Next.js Image Component**
```typescript
import Image from 'next/image'

function OptimizedImage() {
  return (
    <Image
      src="/image.jpg"
      alt="Description"
      width={400}
      height={300}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      priority={true} // For above-the-fold images
    />
  )
}
```

### **4. CSS Optimization**

#### **Tailwind CSS Purge**
```typescript
// tailwind.config.ts
content: [
  "./pages/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./app/**/*.{ts,tsx}",
],
```

#### **Critical CSS**
```typescript
// Extract critical CSS for above-the-fold content
const criticalStyles = `
  .header { /* styles */ }
  .hero { /* styles */ }
`
```

## 📊 Performance Metrics

### **1. Core Web Vitals**

#### **Largest Contentful Paint (LCP)**
- Target: < 2.5s
- Optimization: Image optimization, critical CSS, server-side rendering

#### **First Input Delay (FID)**
- Target: < 100ms
- Optimization: Code splitting, bundle optimization, lazy loading

#### **Cumulative Layout Shift (CLS)**
- Target: < 0.1
- Optimization: Image dimensions, font loading, dynamic content

### **2. Bundle Analysis**

#### **Bundle Size Targets**
- Initial Bundle: < 200KB
- Total Bundle: < 500KB
- Vendor Bundle: < 150KB

#### **Chunk Analysis**
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

## 🔧 Performance Tools

### **1. Development Tools**

#### **React DevTools Profiler**
```typescript
// Enable profiling in development
import { Profiler } from 'react'

function App() {
  const onRenderCallback = (id, phase, actualDuration) => {
    console.log(`Component ${id} took ${actualDuration}ms to render`)
  }

  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <MyComponent />
    </Profiler>
  )
}
```

#### **Performance Monitor**
```typescript
import { usePerformanceMonitor } from "@/hooks/use-performance"

function MyComponent() {
  const { renderCount, timeSinceLastRender } = usePerformanceMonitor("MyComponent")
  
  // Monitor in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Render #${renderCount}: ${timeSinceLastRender}ms`)
  }
  
  return <div>Content</div>
}
```

### **2. Production Monitoring**

#### **Real User Monitoring (RUM)**
```typescript
// Track Core Web Vitals
export function reportWebVitals(metric) {
  if (metric.label === 'web-vital') {
    console.log(metric) // Send to analytics
  }
}
```

#### **Error Tracking**
```typescript
// Track performance errors
window.addEventListener('error', (event) => {
  if (event.error && event.error.message.includes('performance')) {
    // Send to error tracking service
  }
})
```

## 🚀 Advanced Optimizations

### **1. Service Worker**
```typescript
// next.config.mjs
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  // ... other config
})
```

### **2. HTTP/2 Server Push**
```typescript
// next.config.mjs
async headers() {
  return [
    {
      source: '/',
      headers: [
        {
          key: 'Link',
          value: '</styles.css>; rel=preload; as=style'
        }
      ]
    }
  ]
}
```

### **3. Resource Hints**
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.example.com" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## 📈 Performance Checklist

### **✅ Implemented**
- [x] Bundle splitting and code splitting
- [x] Image optimization with Next.js
- [x] Debounced search functionality
- [x] Virtual scrolling for large lists
- [x] Performance monitoring hooks
- [x] Optimized table component
- [x] Tailwind CSS optimization
- [x] React.memo and useMemo usage
- [x] Dynamic imports for heavy components
- [x] Service worker setup

### **🔄 In Progress**
- [ ] Advanced caching strategies
- [ ] GraphQL optimization
- [ ] Database query optimization
- [ ] CDN implementation
- [ ] Advanced analytics

### **📋 Planned**
- [ ] WebAssembly integration
- [ ] Progressive Web App (PWA)
- [ ] Advanced compression
- [ ] Real-time performance monitoring
- [ ] A/B testing for performance

## 🎯 Performance Targets

### **Desktop Performance**
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- First Input Delay: < 100ms
- Cumulative Layout Shift: < 0.1

### **Mobile Performance**
- First Contentful Paint: < 2s
- Largest Contentful Paint: < 3s
- First Input Delay: < 150ms
- Cumulative Layout Shift: < 0.1

### **Bundle Size Targets**
- Initial JavaScript: < 150KB
- Total JavaScript: < 400KB
- CSS: < 50KB
- Images: Optimized with WebP/AVIF

## 📚 Additional Resources

- [Next.js Performance Documentation](https://nextjs.org/docs/advanced-features/measuring-performance)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Performance Monitoring](https://nextjs.org/docs/advanced-features/measuring-performance) 