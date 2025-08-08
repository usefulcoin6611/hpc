import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

// PUT /api/barang/[id] - Update barang
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
        { success: false, message: 'ID barang tidak valid' },
        { status: 400 }
      )
    }

    const { kode, nama, jenis_id, satuan, stok, stok_minimum, lokasi, deskripsi } = await request.json()

    if (!kode || !nama) {
      return NextResponse.json(
        { success: false, message: 'Kode dan nama barang wajib diisi' },
        { status: 400 }
      )
    }

    // Check if barang exists
    const existingBarang = await prisma.barang.findFirst({
      where: { id, isActive: true }
    })

    if (!existingBarang) {
      return NextResponse.json(
        { success: false, message: 'Barang tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if kode already exists (excluding current item)
    const duplicateBarang = await prisma.barang.findFirst({
      where: { 
        kode, 
        isActive: true,
        id: { not: id }
      }
    })

    if (duplicateBarang) {
      return NextResponse.json(
        { success: false, message: 'Kode barang sudah ada' },
        { status: 400 }
      )
    }

    // Update barang
    const updatedBarang = await prisma.barang.update({
      where: { id },
      data: {
        kode,
        nama,
        jenisId: jenis_id || null,
        satuan: satuan || null,
        stok: stok || 0,
        stokMinimum: stok_minimum || 0,
        lokasi: lokasi || null,
        deskripsi: deskripsi || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Barang berhasil diperbarui',
      data: {
        id: updatedBarang.id,
        kode: updatedBarang.kode,
        nama: updatedBarang.nama,
        satuan: updatedBarang.satuan,
        stok: updatedBarang.stok,
        stokMinimum: updatedBarang.stokMinimum,
        lokasi: updatedBarang.lokasi,
        deskripsi: updatedBarang.deskripsi,
        updatedAt: updatedBarang.updatedAt
      }
    })

  } catch (error) {
    console.error('Update barang error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}

// DELETE /api/barang/[id] - Delete barang (hard delete)
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
        { success: false, message: 'ID barang tidak valid' },
        { status: 400 }
      )
    }

    // Check if barang exists
    const existingBarang = await prisma.barang.findFirst({
      where: { id, isActive: true }
    })

    if (!existingBarang) {
      return NextResponse.json(
        { success: false, message: 'Barang tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if barang is being used in any transactions
    const [barangMasukCount, barangKeluarCount] = await Promise.all([
      prisma.detailBarangMasuk.count({
        where: { barangId: id }
      }),
      prisma.detailBarangKeluar.count({
        where: { barangId: id }
      })
    ])

    if (barangMasukCount > 0 || barangKeluarCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Barang tidak dapat dihapus karena masih digunakan dalam transaksi' 
        },
        { status: 400 }
      )
    }

    // Hard delete barang (permanently remove from database)
    await prisma.barang.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Barang berhasil dihapus secara permanen'
    })

  } catch (error) {
    console.error('Delete barang error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
} 