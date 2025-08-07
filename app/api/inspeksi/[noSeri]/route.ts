import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

// GET - Get inspeksi data by no seri
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ noSeri: string }> }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader || undefined)
    
    if (token) {
      try {
        const payload = authenticateToken(token)
      } catch (authError) {
        return NextResponse.json(
          { error: 'Token tidak valid' },
          { status: 401 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      )
    }

    const { noSeri } = await params

    // Find transaksi with jenisPekerjaan = "Inspeksi Mesin" for this no seri
    const transaksi = await (prisma as any).transaksi.findFirst({
      where: {
        detailBarangMasukNoSeri: {
          noSeri: noSeri
        },
        jenisPekerjaan: { in: ["Inspeksi Mesin", "inspeksi_mesin"] },
        isActive: true
      },
      include: {
        inspeksiData: {
          where: {
            isActive: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!transaksi) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Data inspeksi tidak ditemukan'
      })
    }

    const result = transaksi.inspeksiData.map((item: any) => ({
      ...item,
      parameter: item.parameter || "",
      hasil: typeof item.hasil === 'boolean' ? item.hasil : (item.hasil === 'true' || item.hasil === true),
      keterangan: item.keterangan || ""
    }))

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Data inspeksi berhasil diambil'
    })

  } catch (error) {
    console.error('Error fetching inspeksi data:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data inspeksi' },
      { status: 500 }
    )
  }
}

// PUT - Update inspeksi data by no seri
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ noSeri: string }> }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader || undefined)
    
    if (token) {
      try {
        const payload = authenticateToken(token)
      } catch (authError) {
        return NextResponse.json(
          { error: 'Token tidak valid' },
          { status: 401 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      )
    }

    const { noSeri } = await params
    const body = await request.json()
    const { items, keterangan } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Data items harus berupa array' },
        { status: 400 }
      )
    }

    // Find transaksi with jenisPekerjaan = "Inspeksi Mesin" for this no seri
    const transaksi = await (prisma as any).transaksi.findFirst({
      where: {
        detailBarangMasukNoSeri: {
          noSeri: noSeri
        },
        jenisPekerjaan: { in: ["Inspeksi Mesin", "inspeksi_mesin"] },
        isActive: true
      }
    })

    if (!transaksi) {
      return NextResponse.json(
        { error: 'Transaksi inspeksi mesin tidak ditemukan' },
        { status: 404 }
      )
    }

    // Use transaction to ensure data consistency
    await (prisma as any).$transaction(async (tx: any) => {
      // Update existing transaksi
      await tx.transaksi.update({
        where: { id: transaksi.id },
        data: {
          ket: keterangan || transaksi.ket,
          updatedAt: new Date()
        }
      })

      // Delete existing inspeksi data for this transaksi
      await tx.inspeksiData.deleteMany({
        where: { transaksiId: transaksi.id }
      })

      // Create new inspeksi data for the updated transaksi
      const dataToCreate = items.map((item: any) => ({
        parameter: item.parameter,
        hasil: typeof item.hasil === 'boolean' ? item.hasil : (item.hasil === 'true' || item.hasil === true),
        keterangan: item.keterangan || '',
        transaksiId: transaksi.id
      }))

      await tx.inspeksiData.createMany({
        data: dataToCreate
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Data inspeksi berhasil diupdate dengan versi baru'
    })

  } catch (error) {
    console.error('Error updating inspeksi data:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate data inspeksi' },
      { status: 500 }
    )
  }
} 