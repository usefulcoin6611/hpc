import { useState, useCallback } from "react"

interface LoadingState {
  isLoading: boolean
  loadingText?: string
  progress?: number
}

interface UseLoadingOptions {
  initialLoading?: boolean
  initialText?: string
}

export function useLoading(options: UseLoadingOptions = {}) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: options.initialLoading || false,
    loadingText: options.initialText,
    progress: 0
  })

  const startLoading = useCallback((text?: string) => {
    setLoadingState({
      isLoading: true,
      loadingText: text,
      progress: 0
    })
  }, [])

  const stopLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      loadingText: undefined,
      progress: 0
    })
  }, [])

  const updateProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress))
    }))
  }, [])

  const updateLoadingText = useCallback((text: string) => {
    setLoadingState(prev => ({
      ...prev,
      loadingText: text
    }))
  }, [])

  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    loadingText?: string
  ): Promise<T> => {
    try {
      startLoading(loadingText)
      const result = await operation()
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    ...loadingState,
    startLoading,
    stopLoading,
    updateProgress,
    updateLoadingText,
    withLoading
  }
}

// Hook untuk multiple loading states
export function useMultipleLoading() {
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({})

  const startLoading = useCallback((key: string, text?: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        isLoading: true,
        loadingText: text,
        progress: 0
      }
    }))
  }, [])

  const stopLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        isLoading: false,
        loadingText: undefined,
        progress: 0
      }
    }))
  }, [])

  const updateProgress = useCallback((key: string, progress: number) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        progress: Math.min(100, Math.max(0, progress))
      }
    }))
  }, [])

  const updateLoadingText = useCallback((key: string, text: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        loadingText: text
      }
    }))
  }, [])

  const withLoading = useCallback(async <T>(
    key: string,
    operation: () => Promise<T>,
    loadingText?: string
  ): Promise<T> => {
    try {
      startLoading(key, loadingText)
      const result = await operation()
      return result
    } finally {
      stopLoading(key)
    }
  }, [startLoading, stopLoading])

  const isLoading = useCallback((key: string) => {
    return loadingStates[key]?.isLoading || false
  }, [loadingStates])

  const getLoadingState = useCallback((key: string) => {
    return loadingStates[key] || { isLoading: false }
  }, [loadingStates])

  return {
    loadingStates,
    startLoading,
    stopLoading,
    updateProgress,
    updateLoadingText,
    withLoading,
    isLoading,
    getLoadingState
  }
}

// Hook untuk global loading state
export function useGlobalLoading() {
  const [globalLoading, setGlobalLoading] = useState<LoadingState>({
    isLoading: false,
    loadingText: undefined,
    progress: 0
  })

  const showGlobalLoading = useCallback((text?: string) => {
    setGlobalLoading({
      isLoading: true,
      loadingText: text,
      progress: 0
    })
  }, [])

  const hideGlobalLoading = useCallback(() => {
    setGlobalLoading({
      isLoading: false,
      loadingText: undefined,
      progress: 0
    })
  }, [])

  const updateGlobalProgress = useCallback((progress: number) => {
    setGlobalLoading(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress))
    }))
  }, [])

  const updateGlobalLoadingText = useCallback((text: string) => {
    setGlobalLoading(prev => ({
      ...prev,
      loadingText: text
    }))
  }, [])

  return {
    ...globalLoading,
    showGlobalLoading,
    hideGlobalLoading,
    updateGlobalProgress,
    updateGlobalLoadingText
  }
} 