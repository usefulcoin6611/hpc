"use client"

import React, { useEffect, useState, useCallback } from "react"
import { usePerformanceMonitor } from "@/hooks/use-performance"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown, Activity } from "lucide-react"

interface PerformanceMetrics {
  renderCount: number
  timeSinceLastRender: number
  averageRenderTime: number
  memoryUsage?: number
  fps: number
}

interface PerformanceMonitorProps {
  componentName: string
  showDetails?: boolean
  className?: string
}

export function PerformanceMonitor({ 
  componentName, 
  showDetails = false,
  className = "" 
}: PerformanceMonitorProps) {
  const { renderCount, timeSinceLastRender } = usePerformanceMonitor(componentName)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    timeSinceLastRender: 0,
    averageRenderTime: 0,
    fps: 0,
  })
  const [isVisible, setIsVisible] = useState(false)
  const [renderTimes, setRenderTimes] = useState<number[]>([])

  // Calculate performance metrics
  useEffect(() => {
    const newRenderTimes = [...renderTimes, timeSinceLastRender].slice(-10) // Keep last 10 renders
    setRenderTimes(newRenderTimes)
    
    const averageRenderTime = newRenderTimes.reduce((a, b) => a + b, 0) / newRenderTimes.length
    
    setMetrics({
      renderCount,
      timeSinceLastRender,
      averageRenderTime,
      fps: timeSinceLastRender > 0 ? Math.round(1000 / timeSinceLastRender) : 0,
    })
  }, [renderCount, timeSinceLastRender, renderTimes])

  // Toggle visibility
  const toggleVisibility = useCallback(() => {
    setIsVisible(!isVisible)
  }, [isVisible])

  // Performance status
  const getPerformanceStatus = useCallback(() => {
    if (metrics.averageRenderTime < 16) return { status: "Excellent", color: "bg-green-500" }
    if (metrics.averageRenderTime < 33) return { status: "Good", color: "bg-yellow-500" }
    return { status: "Poor", color: "bg-red-500" }
  }, [metrics.averageRenderTime])

  const performanceStatus = getPerformanceStatus()

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 z-50 h-8 w-8 p-0"
      >
        <Activity className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Card className={`fixed bottom-4 right-4 z-50 w-80 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Performance Monitor</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${performanceStatus.color} text-white`}
            >
              {performanceStatus.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVisibility}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{componentName}</p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <p className="text-muted-foreground">Render Count</p>
            <p className="font-mono font-medium">{metrics.renderCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Last Render</p>
            <p className="font-mono font-medium">{metrics.timeSinceLastRender.toFixed(1)}ms</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Avg Render</p>
            <p className="font-mono font-medium">{metrics.averageRenderTime.toFixed(1)}ms</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">FPS</p>
            <p className="font-mono font-medium">{metrics.fps}</p>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Render History</span>
              <div className="flex items-center gap-1">
                {metrics.averageRenderTime < 16 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
              </div>
            </div>
            <div className="flex items-end gap-1 h-8">
              {renderTimes.slice(-8).map((time, index) => (
                <div
                  key={index}
                  className="flex-1 bg-muted rounded-t"
                  style={{
                    height: `${Math.min((time / 50) * 100, 100)}%`,
                    backgroundColor: time < 16 ? '#10b981' : time < 33 ? '#f59e0b' : '#ef4444'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs">
          <RefreshCw className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">Auto-updating</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Global Performance Monitor
export function GlobalPerformanceMonitor() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [components, setComponents] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsEnabled(true)
    }
  }, [])

  const registerComponent = useCallback((componentName: string) => {
    setComponents(prev => new Set(prev).add(componentName))
  }, [])

  const unregisterComponent = useCallback((componentName: string) => {
    setComponents(prev => {
      const newSet = new Set(prev)
      newSet.delete(componentName)
      return newSet
    })
  }, [])

  if (!isEnabled) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {Array.from(components).map(componentName => (
        <PerformanceMonitor
          key={componentName}
          componentName={componentName}
          showDetails={true}
        />
      ))}
    </div>
  )
}

// Performance Boundary Component
interface PerformanceBoundaryProps {
  children: React.ReactNode
  componentName: string
  maxRenderTime?: number
  onSlowRender?: (renderTime: number) => void
}

export function PerformanceBoundary({
  children,
  componentName,
  maxRenderTime = 50,
  onSlowRender,
}: PerformanceBoundaryProps) {
  const { renderCount, timeSinceLastRender } = usePerformanceMonitor(componentName)

  useEffect(() => {
    if (timeSinceLastRender > maxRenderTime) {
      console.warn(`[${componentName}] Slow render detected: ${timeSinceLastRender.toFixed(2)}ms`)
      onSlowRender?.(timeSinceLastRender)
    }
  }, [timeSinceLastRender, maxRenderTime, componentName, onSlowRender])

  return <>{children}</>
} 