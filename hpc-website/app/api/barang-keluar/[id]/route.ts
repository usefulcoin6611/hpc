import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

// GET /api/barang-keluar/[id] - Get barang keluar by ID
export async function GET(
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

    authenticateToken(token)

    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID' },
        { status: 400 }
      )
    }

    const barangKeluar = await prisma.barangKeluar.findUnique({
      where: { id, isActive: true },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        detailBarangKeluar: {
          include: {
            barang: {
              select: {
                id: true,
                kode: true,
                nama: true,
                satuan: true,
              }
            },
            detailBarangMasukNoSeri: {
              select: {
                id: true,
                noSeri: true
              }
            }
          }
        }
      }
    })

    if (!barangKeluar) {
      return NextResponse.json(
        { success: false, message: 'Barang keluar tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: barangKeluar.id,
        tanggal: barangKeluar.tanggal,
        noTransaksi: barangKeluar.noTransaksi,
        deliveryNo: barangKeluar.deliveryNo,
        shipVia: barangKeluar.shipVia,
        tujuan: barangKeluar.tujuan,
        keterangan: barangKeluar.keterangan,
        status: barangKeluar.status,
        createdBy: barangKeluar.createdBy,
        approvedBy: barangKeluar.approvedBy,
        detailBarangKeluar: barangKeluar.detailBarangKeluar,
        totalItems: barangKeluar.detailBarangKeluar.reduce((sum, detail) => sum + detail.jumlah, 0),
        createdAt: barangKeluar.createdAt,
        updatedAt: barangKeluar.updatedAt
      }
    })

  } catch (error) {
    console.error('Get barang keluar by ID error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}

// PUT /api/barang-keluar/[id] - Update barang keluar
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
        { success: false, message: 'Invalid ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { tanggal, deliveryNo, shipVia, tujuan, keterangan, items } = body

    // Check if barang keluar exists and is not approved
    const existingBarangKeluar = await prisma.barangKeluar.findUnique({
      where: { id, isActive: true }
    })

    if (!existingBarangKeluar) {
      return NextResponse.json(
        { success: false, message: 'Barang keluar tidak ditemukan' },
        { status: 404 }
      )
    }

    if (existingBarangKeluar.status === 'approved') {
      return NextResponse.json(
        { success: false, message: 'Tidak dapat mengubah barang keluar yang sudah disetujui' },
        { status: 400 }
      )
    }

    // Update barang keluar using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update main barang keluar record
      const updatedBarangKeluar = await tx.barangKeluar.update({
        where: { id },
        data: {
          tanggal: new Date(tanggal),
          deliveryNo,
          shipVia,
          tujuan,
          keterangan
        }
      })

      // Delete existing detail barang keluar
      await tx.detailBarangKeluar.deleteMany({
        where: { barangKeluarId: id }
      })

      // Create new detail barang keluar
      for (const item of items) {
        await tx.detailBarangKeluar.create({
          data: {
            barangKeluarId: id,
            barangId: item.barangId,
            detailBarangMasukNoSeriId: item.detailBarangMasukNoSeriId,
            jumlah: item.qty
          }
        })
      }

      return updatedBarangKeluar
    })

    return NextResponse.json({
      success: true,
      message: 'Barang keluar berhasil diperbarui'
    })

  } catch (error) {
    console.error('Update barang keluar error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}

// DELETE /api/barang-keluar/[id] - Delete barang keluar
export async function DELETE(
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
        { success: false, message: 'Invalid ID' },
        { status: 400 }
      )
    }

    // Check if barang keluar exists and is not approved
    const existingBarangKeluar = await prisma.barangKeluar.findUnique({
      where: { id, isActive: true }
    })

    if (!existingBarangKeluar) {
      return NextResponse.json(
        { success: false, message: 'Barang keluar tidak ditemukan' },
        { status: 404 }
      )
    }

    if (existingBarangKeluar.status === 'approved') {
      return NextResponse.json(
        { success: false, message: 'Tidak dapat menghapus barang keluar yang sudah disetujui' },
        { status: 400 }
      )
    }

    // Soft delete
    await prisma.barangKeluar.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Barang keluar berhasil dihapus'
    })

  } catch (error) {
    console.error('Delete barang keluar error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
} 