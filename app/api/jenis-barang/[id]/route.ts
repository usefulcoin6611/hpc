import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

// PUT /api/jenis-barang/[id] - Update jenis barang
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
    const { nama, deskripsi } = await request.json()
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    if (!nama) {
      return NextResponse.json(
        { success: false, message: 'Nama jenis barang wajib diisi' },
        { status: 400 }
      )
    }

    // Check if jenis barang exists
    const existingJenisBarang = await prisma.jenisBarang.findUnique({
      where: { id }
    })

    if (!existingJenisBarang) {
      return NextResponse.json(
        { success: false, message: 'Jenis barang tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if nama already exists (excluding current item)
    const duplicateJenisBarang = await prisma.jenisBarang.findFirst({
      where: { 
        nama, 
        isActive: true,
        id: { not: id }
      }
    })

    if (duplicateJenisBarang) {
      return NextResponse.json(
        { success: false, message: 'Nama jenis barang sudah ada' },
        { status: 400 }
      )
    }

    // Update jenis barang
    const updatedJenisBarang = await prisma.jenisBarang.update({
      where: { id },
      data: {
        nama,
        deskripsi: deskripsi || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Jenis barang berhasil diperbarui',
      data: {
        id: updatedJenisBarang.id,
        nama: updatedJenisBarang.nama,
        deskripsi: updatedJenisBarang.deskripsi,
        isActive: updatedJenisBarang.isActive,
        createdAt: updatedJenisBarang.createdAt,
        updatedAt: updatedJenisBarang.updatedAt
      }
    })

  } catch (error) {
    console.error('Update jenis barang error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}

// DELETE /api/jenis-barang/[id] - Delete jenis barang
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

    // Check if jenis barang exists
    const existingJenisBarang = await prisma.jenisBarang.findUnique({
      where: { id }
    })

    if (!existingJenisBarang) {
      return NextResponse.json(
        { success: false, message: 'Jenis barang tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if jenis barang is being used by any barang
    const barangCount = await prisma.barang.count({
      where: { jenisId: id }
    })

    if (barangCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Jenis barang tidak dapat dihapus karena masih digunakan oleh barang lain' },
        { status: 400 }
      )
    }

    // Soft delete by setting isActive to false
    await prisma.jenisBarang.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Jenis barang berhasil dihapus'
    })

  } catch (error) {
    console.error('Delete jenis barang error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
