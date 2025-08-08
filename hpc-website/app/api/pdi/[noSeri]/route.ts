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

    // Get transaksi by noSeri
    const transaksi = await (prisma as any).transaksi.findFirst({
      where: {
        detailBarangMasukNoSeri: {
          noSeri: noSeri
        },
        jenisPekerjaan: { in: ['PDI', 'pdi_staff'] },
        isActive: true
      },
      include: {
        detailBarangMasukNoSeri: {
          include: {
            detailBarangMasuk: {
              include: {
                barang: true
              }
            }
          }
        }
      }
    })

    if (!transaksi) {
      return NextResponse.json(
        { error: 'Transaksi PDI tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get PDI data
    const pdiData = await (prisma as any).pDIData.findMany({
      where: {
        transaksiId: transaksi.id,
        isActive: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: pdiData,
      message: 'Data PDI berhasil diambil'
    })

  } catch (error) {
    console.error('Error fetching PDI data:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data PDI' },
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
    const body = await request.json()
    const { items, keterangan } = body

    // Get transaksi by noSeri
    const transaksi = await (prisma as any).transaksi.findFirst({
      where: {
        detailBarangMasukNoSeri: {
          noSeri: noSeri
        },
        jenisPekerjaan: { in: ['PDI', 'pdi_staff'] },
        isActive: true
      }
    })

    if (!transaksi) {
      return NextResponse.json(
        { error: 'Transaksi PDI tidak ditemukan' },
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

      // Delete existing PDI data for this transaksi
      await tx.pDIData.deleteMany({
        where: { transaksiId: transaksi.id }
      })

      // Create new PDI data for the updated transaksi
      const pdiDataToCreate = items.map((item: any) => ({
        parameter: item.parameter,
        pdi: item.pdi,
        keterangan: item.keterangan || '',
        transaksiId: transaksi.id
      }))

      await tx.pDIData.createMany({
        data: pdiDataToCreate
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Data PDI berhasil diupdate dengan versi baru'
    })

  } catch (error) {
    console.error('Error updating PDI data:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate data PDI' },
      { status: 500 }
    )
  }
} 