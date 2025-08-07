import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await params
    const body = await request.json()
    const { ket, lokasi } = body

    // Validate required fields
    if (ket === undefined && lokasi === undefined) {
      return NextResponse.json(
        { error: 'Minimal satu field (ket atau lokasi) harus diisi' },
        { status: 400 }
      )
    }

    // Check if detail exists
    const existingDetail = await prisma.detailBarangMasukNoSeri.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingDetail) {
      return NextResponse.json(
        { error: 'Detail barang masuk no seri tidak ditemukan' },
        { status: 404 }
      )
    }

    // Update detail
    const updatedDetail = await prisma.detailBarangMasukNoSeri.update({
      where: { id: parseInt(id) },
      data: {
        keterangan: ket !== undefined ? ket : existingDetail.keterangan,
        lokasi: lokasi !== undefined ? lokasi : existingDetail.lokasi
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedDetail,
      message: 'Detail barang berhasil diupdate'
    })

  } catch (error) {
    console.error('Error updating detail barang:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate detail barang' },
      { status: 500 }
    )
  }
} 