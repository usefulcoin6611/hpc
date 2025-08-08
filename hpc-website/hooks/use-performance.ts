import { useCallback, useRef, useEffect, useState } from "react"

// Hook untuk debounce
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay)
    }) as T,
    [callback, delay]
  )
}

// Hook untuk throttle
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0)
  const lastCallTimer = useRef<NodeJS.Timeout | undefined>(undefined)

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCall.current >= delay) {
        callback(...args)
        lastCall.current = now
      } else {
        if (lastCallTimer.current) {
          clearTimeout(lastCallTimer.current)
        }
        lastCallTimer.current = setTimeout(() => {
          callback(...args)
          lastCall.current = Date.now()
        }, delay - (now - lastCall.current))
      }
    }) as T,
    [callback, delay]
  )
}

// Hook untuk intersection observer (lazy loading)
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true)
      }
    }, options)

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [options, hasIntersected])

  return { elementRef, isIntersecting, hasIntersected }
}

// Hook untuk virtual scrolling
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex,
  }
}

// Hook untuk memoization dengan cache
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[],
  cacheSize: number = 100
): T {
  const cacheRef = useRef<Map<string, any>>(new Map())
  const cacheKeysRef = useRef<string[]>([])

  return useCallback(
    ((...args: Parameters<T>) => {
      const key = JSON.stringify(args)
      
      if (cacheRef.current.has(key)) {
        return cacheRef.current.get(key)
      }

      const result = callback(...args)
      
      // Implementasi LRU cache
      if (cacheRef.current.size >= cacheSize) {
        const oldestKey = cacheKeysRef.current.shift()
        if (oldestKey) {
          cacheRef.current.delete(oldestKey)
        }
      }
      
      cacheRef.current.set(key, result)
      cacheKeysRef.current.push(key)
      
      return result
    }) as T,
    dependencies
  )
}

// Hook untuk performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0)
  const lastRenderTimeRef = useRef(performance.now())

  useEffect(() => {
    renderCountRef.current += 1
    const currentTime = performance.now()
    const timeSinceLastRender = currentTime - lastRenderTimeRef.current
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] Render #${renderCountRef.current} (${timeSinceLastRender.toFixed(2)}ms)`)
    }
    
    lastRenderTimeRef.current = currentTime
  })

  return {
    renderCount: renderCountRef.current,
    timeSinceLastRender: performance.now() - lastRenderTimeRef.current,
  }
}

// Hook untuk lazy loading dengan preloading
export function useLazyLoad<T>(
  loader: () => Promise<T>,
  preload: boolean = false
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const loadedRef = useRef(false)

  const load = useCallback(async () => {
    if (loadedRef.current) return data

    setLoading(true)
    setError(null)

    try {
      const result = await loader()
      setData(result)
      loadedRef.current = true
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loader, data])

  useEffect(() => {
    if (preload && !loadedRef.current) {
      load()
    }
  }, [preload, load])

  return { data, loading, error, load }
}

// Hook untuk batch updates
export function useBatchUpdates<T>(
  initialState: T,
  batchDelay: number = 16 // ~60fps
) {
  const [state, setState] = useState<T>(initialState)
  const batchRef = useRef<T>(initialState)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const batchUpdate = useCallback((updater: (prev: T) => T) => {
    batchRef.current = updater(batchRef.current)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setState(batchRef.current)
    }, batchDelay)
  }, [batchDelay])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [state, batchUpdate] as const
}

// Hook untuk resource preloading
export function usePreloadResources(resources: string[]) {
  const [loadedResources, setLoadedResources] = useState<Set<string>>(new Set())

  useEffect(() => {
    const preloadPromises = resources.map((resource) => {
      return new Promise<void>((resolve) => {
        if (resource.endsWith('.css')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = resource
          link.onload = () => {
            setLoadedResources(prev => new Set(prev).add(resource))
            resolve()
          }
          link.onerror = () => resolve()
          document.head.appendChild(link)
        } else if (resource.endsWith('.js')) {
          const script = document.createElement('script')
          script.src = resource
          script.onload = () => {
            setLoadedResources(prev => new Set(prev).add(resource))
            resolve()
          }
          script.onerror = () => resolve()
          document.head.appendChild(script)
        } else {
          // Image preloading
          const img = new Image()
          img.onload = () => {
            setLoadedResources(prev => new Set(prev).add(resource))
            resolve()
          }
          img.onerror = () => resolve()
          img.src = resource
        }
      })
    })

    Promise.all(preloadPromises)
  }, [resources])

  return loadedResources
} 