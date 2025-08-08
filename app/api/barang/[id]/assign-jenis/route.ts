import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

// PUT /api/barang/[id]/assign-jenis - Assign barang to jenis
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
    const { jenisId } = await request.json()
    const resolvedParams = await params
    const barangId = parseInt(resolvedParams.id)

    // Allow null jenisId for unassigning
    if (jenisId === undefined) {
      return NextResponse.json(
        { success: false, message: 'ID jenis barang wajib diisi' },
        { status: 400 }
      )
    }

    // Check if barang exists
    const existingBarang = await prisma.barang.findUnique({
      where: { id: barangId }
    })

    if (!existingBarang) {
      return NextResponse.json(
        { success: false, message: 'Barang tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if jenis barang exists (only if jenisId is not null)
    if (jenisId !== null) {
      const existingJenisBarang = await prisma.jenisBarang.findUnique({
        where: { id: jenisId }
      })

      if (!existingJenisBarang) {
        return NextResponse.json(
          { success: false, message: 'Jenis barang tidak ditemukan' },
          { status: 404 }
        )
      }
    }

    // Update barang with new jenis
    const updatedBarang = await prisma.barang.update({
      where: { id: barangId },
      data: {
        jenisId: jenisId
      },
      include: {
        jenis: true
      }
    })

        const message = jenisId === null 
      ? `Barang "${updatedBarang.nama}" berhasil dilepas dari jenis barang`
      : `Barang "${updatedBarang.nama}" berhasil diassign ke jenis "${updatedBarang.jenis?.nama}"`

    return NextResponse.json({
      success: true,
      message,
      data: {
        id: updatedBarang.id,
        kode: updatedBarang.kode,
        nama: updatedBarang.nama,
        satuan: updatedBarang.satuan,
        stok: updatedBarang.stok,
        stokMinimum: updatedBarang.stokMinimum,
        lokasi: updatedBarang.lokasi,
        deskripsi: updatedBarang.deskripsi,
        jenisId: updatedBarang.jenisId,
        jenis: updatedBarang.jenis ? {
          id: updatedBarang.jenis.id,
          nama: updatedBarang.jenis.nama,
          deskripsi: updatedBarang.jenis.deskripsi
        } : null,
        createdAt: updatedBarang.createdAt,
        updatedAt: updatedBarang.updatedAt
      }
    })

  } catch (error) {
    console.error('Assign barang to jenis error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
