import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

const prisma = new PrismaClient()

// GET - Get jenis pekerjaan list
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader || undefined)
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token tidak ditemukan' }, { status: 401 })
    }

    const user = authenticateToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Token tidak valid' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jenisPekerjaan = searchParams.get('jenisPekerjaan')
    const tipeMesin = searchParams.get('tipeMesin')

    // If jenisPekerjaan is provided, get nama barang for that jenis pekerjaan
    if (jenisPekerjaan) {
      const transaksiData = await prisma.transaksi.findMany({
        where: {
          jenisPekerjaan: jenisPekerjaan
        },
        select: {
          id: true,
          tanggal: true,
          noForm: true,
          jenisPekerjaan: true,
          detailBarangMasukNoSeri: {
            select: {
              detailBarangMasuk: {
                select: {
                  barang: {
                    select: {
                      id: true,
                      nama: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      // Extract unique nama barang
      const uniqueBarang = [...new Set(
        transaksiData
          .map(item => item.detailBarangMasukNoSeri?.detailBarangMasuk?.barang?.nama)
          .filter(nama => nama && nama.trim() !== '')
      )]

      const barangList = uniqueBarang.map(nama => ({
        id: transaksiData.find(item => 
          item.detailBarangMasukNoSeri?.detailBarangMasuk?.barang?.nama === nama
        )?.detailBarangMasukNoSeri?.detailBarangMasuk?.barang?.id,
        nama: nama
      }))

      return NextResponse.json({
        success: true,
        data: barangList
      })
    }

    // If tipeMesin (nama barang) is provided, get specific transaksi data
    if (tipeMesin) {
      const transaksiData = await prisma.transaksi.findFirst({
        where: {
          detailBarangMasukNoSeri: {
            detailBarangMasuk: {
              barang: {
                nama: tipeMesin
              }
            }
          }
        },
        select: {
          id: true,
          tanggal: true,
          noForm: true,
          jenisPekerjaan: true
        },
        orderBy: {
          tanggal: 'desc'
        }
      })

      return NextResponse.json({
        success: true,
        data: transaksiData
      })
    }

    // Get all unique jenis pekerjaan
    const jenisPekerjaanList = await prisma.transaksi.findMany({
      select: {
        jenisPekerjaan: true
      },
      distinct: ['jenisPekerjaan'],
      where: {
        jenisPekerjaan: {
          not: null
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: jenisPekerjaanList
        .map(item => item.jenisPekerjaan)
        .filter(jenis => jenis && jenis.trim() !== '')
    })

  } catch (error) {
    console.error('Error in update-lembar-kerja GET:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST - Create/Update lembar kerja
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader || undefined)
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token tidak ditemukan' }, { status: 401 })
    }

    const user = authenticateToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Token tidak valid' }, { status: 401 })
    }

    const body = await request.json()
    const { jenisPekerjaan, tipeMesin, tanggal, versi } = body

    // Validate required fields
    if (!jenisPekerjaan || !tipeMesin || !tanggal || !versi) {
      return NextResponse.json(
        { success: false, message: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Create or update lembar kerja
    const lembarKerja = await (prisma as any).lembarKerja.upsert({
      where: {
        jenisPekerjaan_tipeMesin: {
          jenisPekerjaan,
          tipeMesin
        }
      },
      update: {
        tanggal: new Date(tanggal),
        versi,
        updatedAt: new Date()
      },
      create: {
        jenisPekerjaan,
        tipeMesin,
        tanggal: new Date(tanggal),
        versi,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Lembar kerja berhasil diupdate',
      data: lembarKerja
    })

  } catch (error) {
    console.error('Error in update-lembar-kerja POST:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
} 