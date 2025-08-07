import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/barang/search - Search barang for autocompletion
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json({ data: [] })
    }

    // Search barang by kode or nama
    const barang = await prisma.barang.findMany({
      where: {
        isActive: true,
        OR: [
          { kode: { contains: query, mode: 'insensitive' } },
          { nama: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        kode: true,
        nama: true,
        satuan: true,

        stok: true,
        lokasi: true,
        jenis: {
          select: {
            nama: true
          }
        }
      },
      orderBy: [
        { kode: 'asc' },
        { nama: 'asc' }
      ],
      take: limit
    })

    return NextResponse.json({
      data: barang.map(item => ({
        id: item.id,
        kode: item.kode,
        nama: item.nama,
        satuan: item.satuan,

        stok: item.stok,
        lokasi: item.lokasi,
        jenis: item.jenis?.nama || '',
        label: `${item.kode} - ${item.nama}`,
        value: item.id
      }))
    })

  } catch (error) {
    console.error('Error searching barang:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 