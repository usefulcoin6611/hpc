import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader || undefined)

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Access token required' },
        { status: 401 }
      )
    }

    authenticateToken(token)

    // Get total barang (active items)
    const totalBarang = await prisma.barang.count({
      where: { isActive: true }
    })

    // Get barang masuk count (from last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const barangMasuk = await prisma.barangMasuk.count({
      where: {
        tanggal: {
          gte: thirtyDaysAgo
        },
        isActive: true
      }
    })

    // Get barang keluar count (from last 30 days)
    const barangKeluar = await prisma.barangKeluar.count({
      where: {
        tanggal: {
          gte: thirtyDaysAgo
        },
        isActive: true
      }
    })

    // Get total pengguna (active users)
    const totalPengguna = await prisma.user.count({
      where: { isActive: true }
    })

    // Get recent barang masuk activities
    const recentBarangMasuk = await prisma.barangMasuk.findMany({
      where: { isActive: true },
      include: {
        detailBarangMasuk: {
          include: {
            barang: {
              select: { nama: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Get recent barang keluar activities
    const recentBarangKeluar = await prisma.barangKeluar.findMany({
      where: { isActive: true },
      include: {
        detailBarangKeluar: {
          include: {
            detailBarangMasukNoSeri: {
              include: {
                detailBarangMasuk: {
                  include: {
                    barang: {
                      select: { nama: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Transform barang masuk to activities
    const barangMasukActivities = recentBarangMasuk.map((item, index) => {
      const barangNama = item.detailBarangMasuk[0]?.barang?.nama || 'Unknown'
      
      return {
        id: `masuk-${index + 1}`,
        type: "barang_masuk",
        title: `Barang Masuk: ${barangNama}`,
        description: `Barang masuk dengan kode ${item.kodeKedatangan || item.noForm || 'N/A'}`,
        timestamp: item.createdAt,
        status: 'success'
      }
    })

    // Transform barang keluar to activities
    const barangKeluarActivities = recentBarangKeluar.map((item, index) => {
      const barangNama = item.detailBarangKeluar[0]?.detailBarangMasukNoSeri?.detailBarangMasuk?.barang?.nama || 'Unknown'
      
      return {
        id: `keluar-${index + 1}`,
        type: "barang_keluar",
        title: `Barang Keluar: ${barangNama}`,
        description: `Barang keluar dengan kode ${item.noTransaksi}`,
        timestamp: item.createdAt,
        status: 'success'
      }
    })

    // Combine and sort all activities by timestamp
    const allActivities = [...barangMasukActivities, ...barangKeluarActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      data: {
        totalBarang,
        barangMasuk,
        barangKeluar,
        totalPengguna,
        activities: allActivities
      }
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
