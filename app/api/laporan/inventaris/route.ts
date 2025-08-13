import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

// Helper function to get date range based on period
function getDateRange(period: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (period) {
    case 'today':
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      }
    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      return {
        startDate: yesterday,
        endDate: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
      }
    case 'this-week':
      const startOfWeek = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000)
      return {
        startDate: startOfWeek,
        endDate: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
      }
    case 'last-week':
      const lastWeekStart = new Date(today.getTime() - (today.getDay() + 7) * 24 * 60 * 60 * 1000)
      return {
        startDate: lastWeekStart,
        endDate: new Date(lastWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
      }
    case 'this-month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return {
        startDate: startOfMonth,
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      }
    case 'last-month':
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return {
        startDate: lastMonthStart,
        endDate: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      }
    case 'this-year':
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      return {
        startDate: startOfYear,
        endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      }
    default:
      return null
  }
}

// GET /api/laporan/inventaris - Get inventory report data
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const period = searchParams.get('period') || ''

    const skip = (page - 1) * limit

    // Get date range if period is specified
    const dateRange = period && period !== 'all' ? getDateRange(period) : null

    // Build where clause for barang
    const whereClause: any = {
      isActive: true,
      ...(search && {
        OR: [
          { kode: { contains: search, mode: 'insensitive' } },
          { nama: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    // Get total count
    const total = await prisma.barang.count({ where: whereClause })

    // Get barang data
    const barangData = await prisma.barang.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        nama: 'asc'
      }
    })

    // Get inventory data with qty ready calculation
    const inventoryData = await Promise.all(
      barangData.map(async (barang) => {
        // Build where clause for detailBarangMasukNoSeri based on period
        const noSeriWhereClause: any = {
          detailBarangMasuk: {
            barangId: barang.id
          }
        }

        // If period is specified, filter by date range
        if (dateRange) {
          noSeriWhereClause.detailBarangMasuk = {
            ...noSeriWhereClause.detailBarangMasuk,
            barangMasuk: {
              tanggal: {
                gte: dateRange.startDate,
                lte: dateRange.endDate
              }
            }
          }
        }

        // Get total qty from detailBarangMasukNoSeri (excluding barang keluar)
        // Total Qty = Barang Masuk - Barang Keluar
        const totalBarangMasuk = await prisma.detailBarangMasukNoSeri.count({
          where: noSeriWhereClause
        })

        // Hitung barang yang sudah keluar untuk barang ini
        const totalBarangKeluar = await prisma.barangKeluar.count({
          where: {
            detailBarangKeluar: {
              some: {
                detailBarangMasukNoSeri: {
                  detailBarangMasuk: {
                    barangId: barang.id
                  }
                }
              }
            },
            isActive: true
          }
        })

        // Total Qty = Barang Masuk - Barang Keluar
        const totalQty = totalBarangMasuk - totalBarangKeluar

        // Get qty ready (no seri yang QC approved dan belum keluar)
        // Ambil semua no seri untuk barang ini
        const allNoSeri = await prisma.detailBarangMasukNoSeri.findMany({
          where: noSeriWhereClause,
          select: {
            id: true
          }
        })

        // Hitung no seri yang sudah ready (QC approved dan belum keluar)
        let qtyReady = 0
        for (const noSeri of allNoSeri) {
          // Build transaksi where clause based on period
          const transaksiWhereClause: any = {
            detailBarangMasukNoSeriId: noSeri.id,
            isActive: true
          }

          // If period is specified, filter transaksi by date range
          if (dateRange) {
            transaksiWhereClause.tanggal = {
              gte: dateRange.startDate,
              lte: dateRange.endDate
            }
          }

          // Cek apakah ada transaksi QC yang sudah approved untuk no seri ini
          const qcApprovedTransaksi = await prisma.transaksi.count({
            where: {
              ...transaksiWhereClause,
              jenisPekerjaan: { in: ['QC', 'qc_staff'] },
              isApproved: true
            }
          })

          // Cek apakah ada barang keluar untuk no seri ini
          const barangKeluar = await prisma.barangKeluar.count({
            where: {
              detailBarangKeluar: {
                some: {
                  detailBarangMasukNoSeriId: noSeri.id
                }
              },
              isActive: true
            }
          })

          // Jika ada transaksi QC approved dan belum ada barang keluar, maka ready
          if (qcApprovedTransaksi > 0 && barangKeluar === 0) {
            qtyReady++
          }
        }

        // Calculate qty not ready
        const qtyNotReady = totalQty - qtyReady

        return {
          id: barang.id,
          kodeBarang: barang.kode,
          namaBarang: barang.nama,
          totalQty,
          qtyReady,
          qtyNotReady
        }
      })
    )

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: inventoryData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Get inventory report error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
} 