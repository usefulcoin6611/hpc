import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader || undefined)
    
    if (token) {
      try {
        // Verify token
        const payload = authenticateToken(token)
        console.log('Authenticated user:', payload.username)
      } catch (authError) {
        console.log('Auth error:', authError)
        return NextResponse.json(
          { success: false, message: 'Token tidak valid' },
          { status: 401 }
        )
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'Token tidak ditemukan' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (search.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Minimal 2 karakter untuk pencarian'
      })
    }

    // Search no seri and kode barang from DetailBarangMasukNoSeri
    const noSeriData = await prisma.detailBarangMasukNoSeri.findMany({
      where: {
        OR: [
          {
            noSeri: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            detailBarangMasuk: {
              barang: {
                kode: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          }
        ],
        // Exclude no seri that are already used in barang keluar
        detailBarangKeluar: {
          none: {}
        }
      },
      include: {
        detailBarangMasuk: {
          include: {
            barang: {
              select: {
                id: true,
                kode: true,
                nama: true,
                satuan: true
              }
            },
            barangMasuk: {
              select: {
                id: true,
                kodeKedatangan: true,
                tanggal: true
              }
            }
          }
        }
      },
      take: limit,
      orderBy: {
        id: 'desc'
      }
    })

    // Transform data to flatten structure
    const transformedData = noSeriData.map(noSeri => ({
      id: noSeri.id,
      noSeri: noSeri.noSeri,
      lokasi: noSeri.lokasi,
      barangId: noSeri.detailBarangMasuk.barang.id,
      barangKode: noSeri.detailBarangMasuk.barang.kode,
      barangNama: noSeri.detailBarangMasuk.barang.nama,
      barangSatuan: noSeri.detailBarangMasuk.barang.satuan,
      barangMasukId: noSeri.detailBarangMasuk.barangMasuk.id,
      kodeKedatangan: noSeri.detailBarangMasuk.barangMasuk.kodeKedatangan,
      tanggalMasuk: noSeri.detailBarangMasuk.barangMasuk.tanggal
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
      message: 'Data berhasil diambil'
    })

  } catch (error) {
    console.error('Search barang masuk with no seri error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
} 