import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

// GET /api/barang/no-seri - Get available no seri for a barang
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
    const barangId = searchParams.get('barangId')
    const search = searchParams.get('search') || ''

    if (!barangId) {
      return NextResponse.json(
        { success: false, message: 'Barang ID is required' },
        { status: 400 }
      )
    }

    // Get no seri that are available (not used in barang keluar)
    const noSeriList = await prisma.detailBarangMasukNoSeri.findMany({
      where: {
        detailBarangMasuk: {
          barangId: parseInt(barangId)
        },
        noSeri: {
          contains: search,
          mode: 'insensitive'
        },
        // Exclude no seri that are already used in barang keluar
        detailBarangKeluar: {
          none: {}
        }
      },
      select: {
        id: true,
        noSeri: true,
        lokasi: true,
        keterangan: true,
        detailBarangMasuk: {
          select: {
            barang: {
              select: {
                id: true,
                kode: true,
                nama: true
              }
            }
          }
        }
      },
      orderBy: {
        noSeri: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: noSeriList.map(item => ({
        id: item.id,
        noSeri: item.noSeri,
        lokasi: item.lokasi,
        keterangan: item.keterangan,
        barang: item.detailBarangMasuk.barang
      }))
    })

  } catch (error) {
    console.error('Get no seri error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
} 