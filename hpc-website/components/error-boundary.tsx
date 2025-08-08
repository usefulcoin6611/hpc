"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AppError } from "@/types"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: AppError; resetError: () => void }>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: AppError | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error: {
        code: 'COMPONENT_ERROR',
        message: error.message,
        details: error.stack,
        timestamp: new Date(),
        stack: error.stack
      }
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    console.error('Component stack:', errorInfo.componentStack)
    console.error('Error stack:', error.stack)
    
    // Log error untuk monitoring (bisa dikirim ke service seperti Sentry)
    this.logError(error, errorInfo)
  }

  private logError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Simulasi logging ke external service
    const errorLog = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    }
    
    console.error('Error Log:', errorLog)
    
    // Di production, bisa dikirim ke monitoring service
    // sendToMonitoringService(errorLog)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />
    }

    return this.props.children
  }
}

// Default error fallback component
function DefaultErrorFallback({ error, resetError }: { error: AppError; resetError: () => void }) {
  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin'
    }
  }

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Oops! Terjadi Kesalahan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu dan sedang mengatasi masalah ini.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Detail Error (Development)
                </summary>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 overflow-auto max-h-32">
                  <div><strong>Message:</strong> {error.message}</div>
                  <div><strong>Code:</strong> {error.code}</div>
                  <div><strong>Time:</strong> {error.timestamp.toLocaleString()}</div>
                  {error.stack && (
                    <div><strong>Stack:</strong> <pre className="whitespace-pre-wrap">{error.stack}</pre></div>
                  )}
                </div>
              </details>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Coba Lagi
            </Button>
            
            <Button variant="outline" onClick={handleGoHome} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Button>
            
            <Button variant="ghost" onClick={handleReload} className="w-full">
              Muat Ulang Halaman
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook untuk error handling di functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<AppError | null>(null)

  const handleError = React.useCallback((error: Error | string, context?: string) => {
    const appError: AppError = {
      code: context || 'UNKNOWN_ERROR',
      message: typeof error === 'string' ? error : error.message,
      details: typeof error === 'object' ? error : undefined,
      timestamp: new Date(),
      stack: typeof error === 'object' ? error.stack : undefined
    }
    
    setError(appError)
    console.error('Error handled:', appError)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, clearError }
}

// Component untuk menampilkan error inline
export function ErrorDisplay({ 
  error, 
  onRetry, 
  className = "" 
}: { 
  error: AppError | string
  onRetry?: () => void
  className?: string 
}) {
  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Terjadi Kesalahan
          </h3>
          <p className="mt-1 text-sm text-red-700">
            {errorMessage}
          </p>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Coba Lagi
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 