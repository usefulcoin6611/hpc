import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

// GET /api/lembar-kerja - Get all lembar kerja from transaksi table
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

    const skip = (page - 1) * limit

    // Build where clause for transaksi
    const whereClause: any = {
      isActive: true,
      ...(search && {
        OR: [
          { jenisPekerjaan: { contains: search, mode: 'insensitive' } },
          { noForm: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    // Get total count
    const total = await prisma.transaksi.count({ where: whereClause })

    // Get transaksi data grouped by jenisPekerjaan and namaBarang
    const transaksiData = await (prisma.transaksi as any).findMany({
      where: whereClause,
      select: {
        id: true,
        jenisPekerjaan: true,
        tanggal: true,
        noForm: true,
        ket: true,
        detailBarangMasukNoSeriId: true
      },
      skip,
      take: limit,
      orderBy: {
        tanggal: 'desc'
      }
    })

    // Get barang names for each transaksi
    const transaksiWithBarang = await Promise.all(
      transaksiData.map(async (transaksi: any) => {
        const detailBarangMasukNoSeri = await prisma.detailBarangMasukNoSeri.findUnique({
          where: { id: transaksi.detailBarangMasukNoSeriId },
          select: {
            detailBarangMasuk: {
              select: {
                barang: {
                  select: {
                    nama: true,
                    kode: true
                  }
                }
              }
            }
          }
        })
        
        return {
          ...transaksi,
          namaBarang: detailBarangMasukNoSeri?.detailBarangMasuk?.barang?.nama || 'Unknown',
          kodeBarang: detailBarangMasukNoSeri?.detailBarangMasuk?.barang?.kode || 'Unknown'
        }
      })
    )

    // Group by jenisPekerjaan and namaBarang, then get the latest entry for each group
    const groupedData = new Map()
    
    transaksiWithBarang.forEach(transaksi => {
      const namaBarang = transaksi.namaBarang
      const key = `${transaksi.jenisPekerjaan}-${namaBarang}`
      
      if (!groupedData.has(key) || new Date(transaksi.tanggal) > new Date(groupedData.get(key).tanggal)) {
        groupedData.set(key, {
          id: transaksi.id,
          jenisPekerjaan: transaksi.jenisPekerjaan,
          tipeMesin: namaBarang,
          kodeBarang: transaksi.kodeBarang,
          tanggal: transaksi.tanggal,
          versi: transaksi.noForm,
          ket: transaksi.ket,
          createdAt: transaksi.tanggal,
          updatedAt: transaksi.tanggal
        })
      }
    })

    // Convert to array and sort by tanggal desc
    const lembarKerja = Array.from(groupedData.values()).sort((a, b) => 
      new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    )

    // Transform data with catatan pembaruan logic
    const transformedData = lembarKerja.map((item) => {
      // Determine if this is first upload or update based on version number
      const versionMatch = item.versi?.match(/\/V(\d+)\//)
      const versionNumber = versionMatch ? parseInt(versionMatch[1]) : 1
      
      // If version is V1 and no ket, it's "Upload Awal"
      // If version > V1 or has ket, use ket or "Upload Awal" as default
      const catatanPembaruan = (versionNumber === 1 && !item.ket) 
        ? "Upload Awal" 
        : (item.ket || "Upload Awal")
      
      return {
        id: item.id,
        jenisPekerjaan: item.jenisPekerjaan,
        tipeMesin: item.tipeMesin,
        kodeBarang: item.kodeBarang,
        tanggal: new Date(item.tanggal).toISOString(),
        versi: item.versi,
        catatanPembaruan: catatanPembaruan,
        createdAt: new Date(item.createdAt).toISOString(),
        updatedAt: new Date(item.updatedAt).toISOString()
      }
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        page,
        limit,
        total: groupedData.size,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Get lembar kerja error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}

// POST /api/lembar-kerja - Create new transaksi as lembar kerja update
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
    const { jenisPekerjaan, tipeMesin, tanggal, versi, catatanPembaruan } = body

    // Validate required fields
    if (!jenisPekerjaan || !tipeMesin || !tanggal || !versi) {
      return NextResponse.json(
        { success: false, message: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    // Find existing transaksi for this jenisPekerjaan and namaBarang combination
    const existingTransaksi = await prisma.transaksi.findFirst({
      where: {
        jenisPekerjaan,
        detailBarangMasukNoSeri: {
          detailBarangMasuk: {
            barang: {
              nama: tipeMesin
            }
          }
        },
        isActive: true
      },
      orderBy: {
        tanggal: 'desc'
      }
    })

    let newVersi = versi
    let isFirstTime = true

    if (existingTransaksi) {
      // Generate next version based on existing noForm
      const versionRegex = /^(.+)\/V(\d+)\/(.+)\/(\d+)$/
      const match = existingTransaksi.noForm?.match(versionRegex)
      
      if (match) {
        const [, prefix, versionNum, formNumber, year] = match
        const nextVersionNum = parseInt(versionNum) + 1
        newVersi = `${prefix}/V${nextVersionNum}/${formNumber}/${year}`
      } else {
        // Simple version increment
        const simpleVersionRegex = /^(.+)\/V(\d+)$/
        const simpleMatch = existingTransaksi.noForm?.match(simpleVersionRegex)
        
        if (simpleMatch) {
          const [, prefix, versionNum] = simpleMatch
          const nextVersionNum = parseInt(versionNum) + 1
          newVersi = `${prefix}/V${nextVersionNum}`
        }
      }
      
      isFirstTime = false
    }

    // Find barang by nama
    const barang = await prisma.barang.findFirst({
      where: {
        nama: tipeMesin,
        isActive: true
      }
    })

    if (!barang) {
      return NextResponse.json(
        { success: false, message: 'Barang tidak ditemukan' },
        { status: 404 }
      )
    }

    // Find detailBarangMasukNoSeri for this barang
    const detailBarangMasukNoSeri = await prisma.detailBarangMasukNoSeri.findFirst({
      where: {
        detailBarangMasuk: {
          barangId: barang.id
        }
      }
    })

    if (!detailBarangMasukNoSeri) {
      return NextResponse.json(
        { success: false, message: 'Detail barang masuk tidak ditemukan' },
        { status: 404 }
      )
    }

    // Create new transaksi as lembar kerja update
    const transaksi = await prisma.transaksi.create({
      data: {
        jenisPekerjaan,
        tanggal: new Date(tanggal),
        noForm: newVersi,
        detailBarangMasukNoSeriId: detailBarangMasukNoSeri.id,
        createdById: (payload as any).id,
        status: 'completed'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Lembar kerja berhasil diupdate',
      data: {
        id: transaksi.id,
        jenisPekerjaan: transaksi.jenisPekerjaan,
        tipeMesin: tipeMesin,
        tanggal: transaksi.tanggal.toISOString(),
        versi: transaksi.noForm,
        catatanPembaruan: isFirstTime ? "Upload Awal" : (catatanPembaruan || "Update Lembar Kerja")
      }
    })

  } catch (error) {
    console.error('Create lembar kerja error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
} 