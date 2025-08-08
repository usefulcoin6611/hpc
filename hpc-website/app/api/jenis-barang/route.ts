import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

// GET /api/jenis-barang - Get all jenis barang
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const exportData = searchParams.get('export') === 'true'
    const offset = (page - 1) * limit

    // If export is requested, return all data without pagination
    if (exportData) {
      const jenisBarang = await prisma.jenisBarang.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({
        success: true,
        data: jenisBarang.map(item => ({
          id: item.id,
          nama: item.nama,
          deskripsi: item.deskripsi,
          isActive: item.isActive,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }))
      })
    }

    // Build where clause for search
    const whereClause = {
      isActive: true,
      ...(search && {
        OR: [
          { nama: { contains: search } }
        ]
      })
    }

    // Get jenis barang with pagination
    const [jenisBarang, total] = await Promise.all([
      prisma.jenisBarang.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.jenisBarang.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: jenisBarang.map(item => ({
        id: item.id,
        nama: item.nama,
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
    console.error('Get jenis barang error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}

// Helper function to handle import
async function handleImport(data: any[], userId: string) {
  let successCount = 0
  let errorCount = 0
  let skippedCount = 0
  const errors: string[] = []

  for (const item of data) {
    try {
      // Validate required fields
      if (!item.nama || item.nama.trim() === '') {
        errors.push(`Baris ${data.indexOf(item) + 1}: Nama jenis barang wajib diisi`)
        errorCount++
        continue
      }

      // Check if nama already exists
      const existingJenisBarang = await prisma.jenisBarang.findFirst({
        where: { nama: item.nama.trim(), isActive: true }
      })

      if (existingJenisBarang) {
        errors.push(`Baris ${data.indexOf(item) + 1}: Nama "${item.nama}" sudah ada`)
        skippedCount++
        continue
      }

      // Create new jenis barang
      await prisma.jenisBarang.create({
        data: {
          nama: item.nama.trim(),
          deskripsi: item.deskripsi || null,
          createdById: parseInt(userId)
        }
      })

      successCount++
    } catch (error) {
      console.error('Error importing item:', error)
      errors.push(`Baris ${data.indexOf(item) + 1}: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`)
      errorCount++
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Import selesai',
    successCount,
    errorCount,
    skippedCount,
    errors
  })
}

// POST /api/jenis-barang - Create new jenis barang
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
    const body = await request.json()

    // Check if this is an import request
    if (body.data && Array.isArray(body.data)) {
      return handleImport(body.data, payload.userId)
    }

    // Regular create request
    const { nama, deskripsi } = body

    if (!nama) {
      return NextResponse.json(
        { success: false, message: 'Nama jenis barang wajib diisi' },
        { status: 400 }
      )
    }

    // Check if nama already exists
    const existingJenisBarang = await prisma.jenisBarang.findFirst({
      where: { nama, isActive: true }
    })

    if (existingJenisBarang) {
      return NextResponse.json(
        { success: false, message: 'Nama jenis barang sudah ada' },
        { status: 400 }
      )
    }

    // Create new jenis barang
    const newJenisBarang = await prisma.jenisBarang.create({
      data: {
        nama,
        deskripsi: deskripsi || null,
        createdById: parseInt(payload.userId)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Jenis barang berhasil ditambahkan',
      data: {
        id: newJenisBarang.id,
        nama: newJenisBarang.nama,
        deskripsi: newJenisBarang.deskripsi,
        createdAt: newJenisBarang.createdAt
      }
    })

  } catch (error) {
    console.error('Create jenis barang error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
} 