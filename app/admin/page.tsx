"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  BoxIcon,
  AlertTriangle
} from "lucide-react"
import type { ActivityItem } from "@/types"
import { useDashboard } from "@/hooks/use-dashboard"

interface DashboardCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendType?: 'positive' | 'negative' | 'neutral'
  bgColor: string
  textColor: string
}

interface ActivityCardProps {
  activities: ActivityItem[]
}

// Komponen DashboardCard yang reusable
function DashboardCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendType = 'neutral',
  bgColor, 
  textColor 
}: DashboardCardProps) {
  const getTrendColor = () => {
    switch (trendType) {
      case 'positive':
        return 'text-green-500'
      case 'negative':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <Card className="overflow-hidden rounded-xl border-none shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bgColor} ${textColor}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-800 sm:text-3xl">{value}</div>
        {trend && (
          <p className={`mt-1 text-xs font-medium ${getTrendColor()}`}>{trend}</p>
        )}
      </CardContent>
    </Card>
  )
}

// Komponen ActivityCard yang reusable
function ActivityCard({ activities }: ActivityCardProps) {
  const formatTimeAgo = (date: Date | string): string => {
    const now = new Date()
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Waktu tidak valid'
    }
    
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Baru saja'
    if (diffInHours === 1) return '1 jam yang lalu'
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return '1 hari yang lalu'
    return `${diffInDays} hari yang lalu`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'barang_masuk':
        return <ShoppingCart className="h-5 w-5" />
      case 'barang_keluar':
        return <BoxIcon className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  return (
    <Card className="overflow-hidden rounded-xl border-none shadow-soft">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-lg font-medium text-gray-800">Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {activities.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-gray-500">Belum ada aktivitas</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-primary">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                  <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                  <p className="text-xs text-gray-400">{activity.description}</p>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    activity.status === 'success' ? 'bg-green-100 text-green-800' :
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {activity.status === 'success' ? 'Berhasil' :
                     activity.status === 'pending' ? 'Pending' : 'Error'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const { dashboardData, loading, error, refetch } = useDashboard()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render time-dependent content during SSR
  if (!isClient) {
    return (
      <div className="p-6 animate-fadeIn">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">Dashboard</h1>
          <p className="text-gray-600">Selamat datang di sistem manajemen gudang PT Himawan Putra</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Barang"
            value="Loading..."
            icon={<Package className="h-5 w-5" />}
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <DashboardCard
            title="Barang Masuk"
            value="Loading..."
            icon={<ShoppingCart className="h-5 w-5" />}
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <DashboardCard
            title="Barang Keluar"
            value="Loading..."
            icon={<BoxIcon className="h-5 w-5" />}
            bgColor="bg-orange-50"
            textColor="text-orange-600"
          />
          <DashboardCard
            title="Total Pengguna"
            value="Loading..."
            icon={<Users className="h-5 w-5" />}
            bgColor="bg-purple-50"
            textColor="text-purple-600"
          />
        </div>
        
        <div className="mt-8">
          <ActivityCard activities={[]} />
        </div>
      </div>
    )
  }

  // Add loading state display
  if (loading) {
    return (
      <div className="p-6 animate-fadeIn">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">Dashboard</h1>
          <p className="text-gray-600">Selamat datang di sistem manajemen gudang PT Himawan Putra</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-muted-foreground">Memuat data dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Add error state display
  if (error) {
    return (
      <div className="p-6 animate-fadeIn">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">Dashboard</h1>
          <p className="text-gray-600">Selamat datang di sistem manajemen gudang PT Himawan Putra</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-semibold">Error</h3>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button 
              onClick={() => refetch()} 
              className="mt-4"
              variant="outline"
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">Dashboard</h1>
        <p className="text-gray-600">Selamat datang di sistem manajemen gudang PT Himawan Putra</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Barang"
          value={dashboardData.totalBarang.toLocaleString()}
          icon={<Package className="h-5 w-5" />}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <DashboardCard
          title="Barang Masuk"
          value={dashboardData.barangMasuk.toLocaleString()}
          icon={<ShoppingCart className="h-5 w-5" />}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <DashboardCard
          title="Barang Keluar"
          value={dashboardData.barangKeluar.toLocaleString()}
          icon={<BoxIcon className="h-5 w-5" />}
          bgColor="bg-orange-50"
          textColor="text-orange-600"
        />
        <DashboardCard
          title="Total Pengguna"
          value={dashboardData.totalPengguna.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
      </div>
      
      <div className="mt-8">
        <ActivityCard activities={dashboardData.activities} />
      </div>
    </div>
  )
}
