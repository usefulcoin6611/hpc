import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

// GET /api/barang-keluar - Get all barang keluar
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader || undefined)
    
    if (token) {
      try {
        // Verify token
        const payload = authenticateToken(token)
        console.log('Authenticated user:', payload.username)
      } catch (authError) {
        console.log('Auth error:', authError)
        return NextResponse.json(
          { success: false, message: 'Token tidak valid' },
          { status: 401 }
        )
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'Token tidak ditemukan' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const offset = (page - 1) * limit

    // Build where clause for search
    const whereClause = {
      isActive: true,
      ...(search && {
        OR: [
          { noTransaksi: { contains: search } },
          { tujuan: { contains: search } },
          { keterangan: { contains: search } },
          {
            detailBarangKeluar: {
              some: {
                detailBarangMasukNoSeri: {
                  noSeri: { contains: search }
                }
              }
            }
          }
        ]
      }),
      ...(status && { status })
    }

    // Get barang keluar with pagination
    const [barangKeluar, total] = await Promise.all([
      prisma.barangKeluar.findMany({
        where: whereClause,
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
                  satuan: true
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
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.barangKeluar.count({ where: whereClause })
    ])

    const mappedData = barangKeluar.map(item => ({
      id: item.id,
      noTransaksi: item.noTransaksi,
      deliveryNo: item.deliveryNo,
      shipVia: item.shipVia,
      tanggal: item.tanggal,
      tujuan: item.tujuan,
      keterangan: item.keterangan,
      status: item.status,
      totalItems: item.detailBarangKeluar.reduce((sum, detail) => sum + detail.jumlah, 0),
      noSeriList: item.detailBarangKeluar
        .filter(detail => detail.detailBarangMasukNoSeri)
        .map(detail => detail.detailBarangMasukNoSeri?.noSeri)
        .filter(Boolean),
      createdBy: item.createdBy,
      approvedBy: item.approvedBy,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))

    return NextResponse.json({
      success: true,
      message: total === 0 ? 'Tidak ada data barang keluar' : 'Data berhasil diambil',
      data: mappedData,
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
    console.error('Get barang keluar error:', error)
    
    if (error instanceof Error && error.message.includes('Token')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}

// POST /api/barang-keluar - Create new barang keluar
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader || undefined)
    
    let payload: any = null
    if (token) {
      try {
        // Verify token
        payload = authenticateToken(token)
        console.log('Authenticated user:', payload.username)
      } catch (authError) {
        console.log('Auth error:', authError)
        return NextResponse.json(
          { success: false, message: 'Token tidak valid' },
          { status: 401 }
        )
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'Token tidak ditemukan' },
        { status: 401 }
      )
    }
    const { tanggal, deliveryNo, shipVia, tujuan, keterangan, items } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Detail barang wajib diisi' },
        { status: 400 }
      )
    }

    // Check stok availability
    for (const item of items) {
      const { barangId, qty } = item
      const barang = await prisma.barang.findUnique({
        where: { id: barangId }
      })

      if (!barang) {
        return NextResponse.json(
          { success: false, message: `Barang dengan ID ${barangId} tidak ditemukan` },
          { status: 400 }
        )
      }

      if (barang.stok < qty) {
        return NextResponse.json(
          { success: false, message: `Stok barang ${barang.nama} tidak mencukupi. Tersedia: ${barang.stok}, Dibutuhkan: ${qty}` },
          { status: 400 }
        )
      }
    }

    // Generate transaction number
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const count = await prisma.barangKeluar.count({
      where: {
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
        }
      }
    })
    const noTransaksi = `BK${dateStr}${String(count + 1).padStart(3, '0')}`

    // Create barang keluar with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create barang keluar
      const barangKeluar = await tx.barangKeluar.create({
        data: {
          tanggal: tanggal || new Date(),
          noTransaksi,
          deliveryNo: deliveryNo || null,
          shipVia: shipVia || null,
          tujuan: tujuan || null,
          keterangan: keterangan || null,
          status: 'pending',
          createdById: parseInt(payload.userId)
        }
      })

      // Create detail barang keluar
      const detailBarangKeluar = []
      for (const item of items) {
        const { barangId, qty, detailBarangMasukNoSeriId } = item
        const barang = await tx.barang.findUnique({
          where: { id: barangId }
        })

        // Create detail
        const detail = await tx.detailBarangKeluar.create({
          data: {
            barangKeluarId: barangKeluar.id,
            barangId,
            detailBarangMasukNoSeriId,
            jumlah: qty
          }
        })

        detailBarangKeluar.push(detail)
      }

      return { barangKeluar, detailBarangKeluar }
    })

    return NextResponse.json({
      success: true,
      message: 'Barang keluar berhasil ditambahkan',
      data: {
        id: result.barangKeluar.id,
        noTransaksi: result.barangKeluar.noTransaksi,
        deliveryNo: result.barangKeluar.deliveryNo,
        shipVia: result.barangKeluar.shipVia,
        tanggal: result.barangKeluar.tanggal,
        tujuan: result.barangKeluar.tujuan,
        keterangan: result.barangKeluar.keterangan,
        status: result.barangKeluar.status,
        totalItems: result.detailBarangKeluar.length,
        createdAt: result.barangKeluar.createdAt
      }
    })

  } catch (error) {
    console.error('Create barang keluar error:', error)
    
    if (error instanceof Error && error.message.includes('Token')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
} 