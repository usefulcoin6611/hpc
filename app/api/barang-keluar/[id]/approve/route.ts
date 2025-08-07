import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

// PUT /api/barang-keluar/[id]/approve - Approve barang keluar
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader || undefined)

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Access token required' },
        { status: 401 }
      )
    }

    const payload = authenticateToken(token)
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'ID barang keluar tidak valid' },
        { status: 400 }
      )
    }

    const { action } = await request.json() // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Action harus approve atau reject' },
        { status: 400 }
      )
    }

    // Check if barang keluar exists
    const existingBarangKeluar = await prisma.barangKeluar.findFirst({
      where: { id, isActive: true },
      include: {
        detailBarangKeluar: {
          include: {
            barang: true
          }
        }
      }
    })

    if (!existingBarangKeluar) {
      return NextResponse.json(
        { success: false, message: 'Barang keluar tidak ditemukan' },
        { status: 404 }
      )
    }

    if (existingBarangKeluar.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'Barang keluar sudah diproses' },
        { status: 400 }
      )
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    // Update barang keluar with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update status barang keluar
      const updatedBarangKeluar = await tx.barangKeluar.update({
        where: { id },
        data: {
          status: newStatus,
          approvedById: parseInt(payload.userId)
        }
      })

      // If approved, update stok barang
      if (action === 'approve') {
        for (const detail of existingBarangKeluar.detailBarangKeluar) {
          await tx.barang.update({
            where: { id: detail.barangId },
            data: {
              stok: {
                decrement: detail.jumlah
              }
            }
          })
        }
      }

      return updatedBarangKeluar
    })

    return NextResponse.json({
      success: true,
      message: `Barang keluar berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}`,
      data: {
        id: result.id,
        noTransaksi: result.noTransaksi,
        status: result.status,
        approvedById: result.approvedById,
        updatedAt: result.updatedAt
      }
    })

  } catch (error) {
    console.error('Approve barang keluar error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
} 