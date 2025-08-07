import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/barang-masuk/[id]/no-seri - Get noSeri for a specific detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    const { id } = await params
    const detailId = parseInt(id)
    
    if (isNaN(detailId)) {
      return NextResponse.json({ error: 'Invalid detail ID' }, { status: 400 })
    }

    // Get noSeri list for the detail
    const noSeriList = await prisma.detailBarangMasukNoSeri.findMany({
      where: {
        detailBarangMasukId: detailId
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({
      data: noSeriList
    })

  } catch (error) {
    console.error('Error fetching noSeri:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/barang-masuk/[id]/no-seri - Add noSeri for a specific detail
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    const { id } = await params
    const detailId = parseInt(id)
    
    if (isNaN(detailId)) {
      return NextResponse.json({ error: 'Invalid detail ID' }, { status: 400 })
    }

    const body = await request.json()
    const { noSeri, lokasi } = body

    if (!noSeri || noSeri.trim() === '') {
      return NextResponse.json(
        { error: 'No Seri wajib diisi' },
        { status: 400 }
      )
    }

    // Check if detail exists
    const detail = await prisma.detailBarangMasuk.findUnique({
      where: { id: detailId }
    })

    if (!detail) {
      return NextResponse.json(
        { error: 'Detail barang tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if noSeri already exists
    const existingNoSeri = await prisma.detailBarangMasukNoSeri.findUnique({
      where: { noSeri: noSeri.trim() }
    })

    if (existingNoSeri) {
      return NextResponse.json(
        { error: `No Seri ${noSeri} sudah digunakan` },
        { status: 400 }
      )
    }

    // Check if we haven't exceeded the jumlah
    const currentNoSeriCount = await prisma.detailBarangMasukNoSeri.count({
      where: { detailBarangMasukId: detailId }
    })

    if (currentNoSeriCount >= detail.jumlah) {
      return NextResponse.json(
        { error: `Jumlah No Seri sudah mencapai maksimum (${detail.jumlah})` },
        { status: 400 }
      )
    }

    // Create noSeri
    const newNoSeri = await prisma.detailBarangMasukNoSeri.create({
      data: {
        noSeri: noSeri.trim(),
        lokasi: lokasi || null,
        detailBarangMasukId: detailId
      }
    })

    return NextResponse.json({
      message: 'No Seri berhasil ditambahkan',
      data: newNoSeri
    })

  } catch (error) {
    console.error('Error creating noSeri:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/barang-masuk/[id]/no-seri/[noSeriId] - Update specific noSeri
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const noSeriId = searchParams.get('noSeriId')

    if (!noSeriId) {
      return NextResponse.json({ error: 'No Seri ID required' }, { status: 400 })
    }

    const body = await request.json()
    const { noSeri, lokasi } = body

    if (!noSeri || noSeri.trim() === '') {
      return NextResponse.json(
        { error: 'No Seri wajib diisi' },
        { status: 400 }
      )
    }

    // Check if noSeri already exists (excluding current one)
    const existingNoSeri = await prisma.detailBarangMasukNoSeri.findFirst({
      where: { 
        noSeri: noSeri.trim(),
        id: { not: parseInt(noSeriId) }
      }
    })

    if (existingNoSeri) {
      return NextResponse.json(
        { error: `No Seri ${noSeri} sudah digunakan` },
        { status: 400 }
      )
    }

    // Update noSeri
    const updatedNoSeri = await prisma.detailBarangMasukNoSeri.update({
      where: { id: parseInt(noSeriId) },
      data: {
        noSeri: noSeri.trim(),
        lokasi: lokasi || null
      }
    })

    return NextResponse.json({
      message: 'No Seri berhasil diperbarui',
      data: updatedNoSeri
    })

  } catch (error) {
    console.error('Error updating noSeri:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/barang-masuk/[id]/no-seri/[noSeriId] - Delete specific noSeri
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const noSeriId = searchParams.get('noSeriId')

    if (!noSeriId) {
      return NextResponse.json({ error: 'No Seri ID required' }, { status: 400 })
    }

    // Delete noSeri
    await prisma.detailBarangMasukNoSeri.delete({
      where: { id: parseInt(noSeriId) }
    })

    return NextResponse.json({
      message: 'No Seri berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting noSeri:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
} 