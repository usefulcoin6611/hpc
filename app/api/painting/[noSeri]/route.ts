import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ noSeri: string }> }
) {
  try {
    const { noSeri } = await params

    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader || undefined)
    
    if (token) {
      try {
        const payload = authenticateToken(token)
        console.log('Authenticated user:', payload.username)
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

    // Get DetailBarangMasukNoSeri by noSeri
    const detailNoSeri = await (prisma as any).detailBarangMasukNoSeri.findFirst({
      where: { noSeri },
      include: {
        transaksi: {
          where: { 
            jenisPekerjaan: { in: ['Painting', 'painting_staff'] },
            isActive: true 
          },
          include: {
            paintingData: {
              where: { isActive: true },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!detailNoSeri) {
      return NextResponse.json(
        { error: 'Detail barang masuk no seri tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get painting data from the latest painting transaction
    const paintingData = detailNoSeri.transaksi[0]?.paintingData || []

    return NextResponse.json({
      success: true,
      data: paintingData,
      message: 'Data painting berhasil diambil'
    })

  } catch (error) {
    console.error('Error fetching painting data:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data painting' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ noSeri: string }> }
) {
  try {
    const { noSeri } = await params
    const body = await request.json()
    const { items, keterangan } = body

    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader || undefined)
    
    if (token) {
      try {
        const payload = authenticateToken(token)
        console.log('Authenticated user:', payload.username)
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

    // Validate required fields
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items harus berupa array' },
        { status: 400 }
      )
    }

    // Get DetailBarangMasukNoSeri by noSeri
    const detailNoSeri = await (prisma as any).detailBarangMasukNoSeri.findFirst({
      where: { noSeri },
      include: {
        transaksi: {
          where: { 
            jenisPekerjaan: { in: ['Painting', 'painting_staff'] },
            isActive: true 
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!detailNoSeri) {
      return NextResponse.json(
        { error: 'Detail barang masuk no seri tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get the latest transaksi for this no seri and job type
    const transaksi = detailNoSeri.transaksi[0]
    
    if (!transaksi) {
      return NextResponse.json(
        { error: 'Transaksi Painting tidak ditemukan' },
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

      // Delete existing painting data for this transaksi
      await tx.paintingData.deleteMany({
        where: { transaksiId: transaksi.id }
      })

      // Create new painting data for the updated transaksi
      const paintingDataToCreate = items.map((item: any) => ({
        parameter: item.parameter,
        hasil: item.hasil,
        keterangan: item.keterangan || '',
        transaksiId: transaksi.id
      }))

      await tx.paintingData.createMany({
        data: paintingDataToCreate
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Data painting berhasil diperbarui dengan versi baru'
    })

  } catch (error) {
    console.error('Error updating painting data:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui data painting' },
      { status: 500 }
    )
  }
}
