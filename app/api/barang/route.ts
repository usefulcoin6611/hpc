import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

// GET /api/barang - Get all barang
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader || undefined)

    // Temporarily skip authentication for testing
    // if (!token) {
    //   return NextResponse.json(
    //     { success: false, message: 'Access token required' },
    //     { status: 401 }
    //   )
    // }

    // try {
    //   authenticateToken(token)
    // } catch (authError) {
    //   return NextResponse.json(
    //     { success: false, message: 'Invalid token' },
    //     { status: 401 }
    //   )
    // }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * limit

    // Build where clause for search
    const whereClause = {
      isActive: true,
      ...(search && {
        OR: [
          { kode: { contains: search } },
          { nama: { contains: search } }
        ]
      })
    }

    console.log('GET /api/barang - whereClause:', whereClause)

    // Get barang with pagination
    const [barang, total] = await Promise.all([
      prisma.barang.findMany({
        where: whereClause,
        include: {
          jenis: {
            select: {
              id: true,
              nama: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.barang.count({ where: whereClause })
    ])

    console.log('GET /api/barang - Found items:', barang.length, 'Total:', total)
    console.log('GET /api/barang - Items:', barang.map(item => ({ id: item.id, kode: item.kode, nama: item.nama, isActive: item.isActive })))

    return NextResponse.json({
      success: true,
      data: barang.map(item => ({
        id: item.id,
        kode: item.kode,
        nama: item.nama,
        jenis: item.jenis ? {
          id: item.jenis.id,
          nama: item.jenis.nama
        } : null,
        kategori: item.kategori,
        satuan: item.satuan,
        stok: item.stok,
        stokMinimum: item.stokMinimum,

        lokasi: item.lokasi,
        deskripsi: item.deskripsi,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Get barang error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}

// POST /api/barang - Create new barang
export async function POST(request: NextRequest) {
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

    const { id, kode, nama, jenis_id, kategori, satuan, stok, stok_minimum, lokasi, deskripsi } = await request.json()

    if (!kode || !nama) {
      return NextResponse.json(
        { success: false, message: 'Kode dan nama barang wajib diisi' },
        { status: 400 }
      )
    }

    // Check if kode already exists
    const existingBarang = await prisma.barang.findFirst({
      where: { kode, isActive: true }
    })

    if (existingBarang) {
      return NextResponse.json(
        { success: false, message: 'Kode barang sudah ada' },
        { status: 400 }
      )
    }

    // Check if ID already exists (if ID is provided)
    if (id) {
      const existingBarangById = await prisma.barang.findUnique({
        where: { id: parseInt(id) }
      })

      if (existingBarangById) {
        return NextResponse.json(
          { success: false, message: 'ID barang sudah ada' },
          { status: 400 }
        )
      }
    }

    // Get the next available ID if not provided
    let nextId: number
    if (id) {
      nextId = parseInt(id)
    } else {
      // Find the highest ID and add 1
      const highestBarang = await prisma.barang.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true }
      })
      nextId = highestBarang ? highestBarang.id + 1 : 1
    }

    // Create new barang with custom ID if provided
    const newBarang = await prisma.barang.create({
      data: {
        id: nextId,
        kode,
        nama,
        jenisId: jenis_id || null,
        kategori: kategori || null,
        satuan: satuan || null,
        stok: stok || 0,
        stokMinimum: stok_minimum || 0,
        lokasi: lokasi || null,
        deskripsi: deskripsi || null,
        createdById: parseInt(payload.userId)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Barang berhasil ditambahkan',
      data: {
        id: newBarang.id,
        kode: newBarang.kode,
        nama: newBarang.nama,
        kategori: newBarang.kategori,
        satuan: newBarang.satuan,
        stok: newBarang.stok,
        stokMinimum: newBarang.stokMinimum,
        lokasi: newBarang.lokasi,
        deskripsi: newBarang.deskripsi,
        createdAt: newBarang.createdAt
      }
    })

  } catch (error) {
    console.error('Create barang error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
} 