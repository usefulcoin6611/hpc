import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

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
          { error: 'Token tidak valid' },
          { status: 401 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const noSeri = searchParams.get('noSeri')
    const namaBarang = searchParams.get('namaBarang')
    const lokasi = searchParams.get('lokasi')
    const kodeKedatangan = searchParams.get('kodeKedatangan')

    // Build where clause for DetailBarangMasukNoSeri search
    let detailWhereClause: any = {}
    
    if (noSeri || namaBarang || lokasi || kodeKedatangan) {
      detailWhereClause.AND = []
      
      if (noSeri) {
        detailWhereClause.AND.push({
          noSeri: {
            equals: noSeri,
            mode: 'insensitive'
          }
        })
      }
      
      if (namaBarang) {
        detailWhereClause.AND.push({
          detailBarangMasuk: {
            barang: {
              nama: {
                contains: namaBarang,
                mode: 'insensitive'
              }
            }
          }
        })
      }
      
      if (lokasi) {
        detailWhereClause.AND.push({
          lokasi: {
            contains: lokasi,
            mode: 'insensitive'
          }
        })
      }
      
      if (kodeKedatangan) {
        detailWhereClause.AND.push({
          detailBarangMasuk: {
            barangMasuk: {
              kodeKedatangan: {
                contains: kodeKedatangan,
                mode: 'insensitive'
              }
            }
          }
        })
      }
    }

    // Build where clause for Transaksi search
    let transaksiWhereClause: any = { isActive: true }
    
    if (noSeri || namaBarang || lokasi || kodeKedatangan) {
      transaksiWhereClause.AND = [
        { isActive: true }
      ]
      
      // Jika ada noSeri, gunakan AND untuk memastikan hanya data noSeri yang spesifik
      if (noSeri) {
        transaksiWhereClause.AND.push({
          detailBarangMasukNoSeri: {
            noSeri: {
              equals: noSeri,
              mode: 'insensitive'
            }
          }
        })
      }
      
      // Filter tambahan untuk namaBarang, lokasi, kodeKedatangan
      if (namaBarang) {
        transaksiWhereClause.AND.push({
          detailBarangMasukNoSeri: {
            detailBarangMasuk: {
              barang: {
                nama: {
                  contains: namaBarang,
                  mode: 'insensitive'
                }
              }
            }
          }
        })
      }
      
      if (lokasi) {
        transaksiWhereClause.AND.push({
          OR: [
            {
              lokasi: {
                contains: lokasi,
                mode: 'insensitive'
              }
            },
            {
              detailBarangMasukNoSeri: {
                lokasi: {
                  contains: lokasi,
                  mode: 'insensitive'
                }
              }
            }
          ]
        })
      }
      
      if (kodeKedatangan) {
        transaksiWhereClause.AND.push({
          detailBarangMasukNoSeri: {
            detailBarangMasuk: {
              barangMasuk: {
                kodeKedatangan: {
                  contains: kodeKedatangan,
                  mode: 'insensitive'
                }
              }
            }
          }
        })
      }
    }

    // Fetch DetailBarangMasukNoSeri data (baris pertama)
    const detailData = await (prisma as any).detailBarangMasukNoSeri.findMany({
      where: detailWhereClause,
      include: {
        detailBarangMasuk: {
          include: {
            barang: {
              select: {
                id: true,
                nama: true,
                kode: true
              }
            },
            barangMasuk: {
              select: {
                id: true,
                tanggal: true,
                kodeKedatangan: true,
                namaSupplier: true,
                createdBy: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    role: true
                  }
                }
              } as any
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Fetch Transaksi data (baris selanjutnya)
    const transaksiData = await (prisma as any).transaksi.findMany({
      where: transaksiWhereClause,
      include: {
        detailBarangMasukNoSeri: {
          include: {
            detailBarangMasuk: {
              include: {
                barang: {
                  select: {
                    id: true,
                    nama: true,
                    kode: true
                  }
                },
                barangMasuk: {
                  select: {
                    id: true,
                    tanggal: true,
                    kodeKedatangan: true,
                    namaSupplier: true
                  } as any
                }
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Transform data untuk frontend
    const transformedData: any[] = []

    // Add DetailBarangMasukNoSeri data (baris pertama)
    detailData.forEach((detail: any) => {
      // Ambil role dari user yang membuat barang masuk
      const userRole = detail.detailBarangMasuk.barangMasuk.createdBy?.role || 'Unknown'
      
      // Map role ke nama yang lebih deskriptif
      const getRoleDisplayName = (role: string) => {
        switch (role.toLowerCase()) {
          case 'inspeksi_mesin':
            return 'Inspeksi Mesin'
          case 'assembly_staff':
            return 'Assembly'
          case 'qc_staff':
            return 'QC'
          case 'pdi_staff':
            return 'PDI'
          case 'painting_staff':
            return 'Painting'
          case 'pindah_lokasi':
            return 'Pindah Lokasi'
          case 'admin':
            return 'Administrator'
          case 'supervisor':
            return 'Supervisor'
          case 'staff':
            return 'Staff Gudang'
          case 'super admin':
            return 'Super Admin'
          default:
            return role
        }
      }
      
      const transformedItem = {
        id: `detail-${detail.id}`,
        tanggal: new Date(detail.detailBarangMasuk.barangMasuk.tanggal).toLocaleDateString('id-ID'),
        noForm: detail.detailBarangMasuk.barangMasuk.kodeKedatangan || null,
        jenisPekerjaan: 'Barang Masuk', // Informasi penerimaan barang
        staff: 'Admin', // Selalu tampilkan Admin untuk baris pertama
        status: 'Diterima', // Default untuk baris pertama
        qty: 1,
        ket: detail.keterangan || null,
        lokasi: detail.lokasi || null,
        // Additional fields for search
        noSeri: detail.noSeri || '',
        namaBarang: detail.detailBarangMasuk.barang?.nama || '',
        kodeBarang: detail.detailBarangMasuk.barang?.kode || '', // Tambahkan kode barang
        barangId: detail.detailBarangMasuk.barang?.id || 0, // Tambahkan barangId
        kodeKedatangan: detail.detailBarangMasuk.barangMasuk?.kodeKedatangan || '',
        isDetailRow: true, // Flag untuk membedakan dengan transaksi
        detailBarangMasukNoSeriId: detail.id // Tambahkan ID untuk referensi
      }
      
      transformedData.push(transformedItem)
    })

    // Add Transaksi data (baris selanjutnya)
    transaksiData.forEach((transaksi: any) => {
      const transformedItem = {
        id: `transaksi-${transaksi.id}`,
        tanggal: new Date(transaksi.tanggal).toLocaleDateString('id-ID'),
        noForm: transaksi.noForm || null,
        jenisPekerjaan: transaksi.jenisPekerjaan || null,
        staff: transaksi.createdBy?.name || null,
        status: transaksi.status || 'pending',
        qty: transaksi.qty || 1,
        ket: transaksi.ket || null,
        lokasi: transaksi.lokasi || null,
        // Additional fields for search
        noSeri: transaksi.detailBarangMasukNoSeri?.noSeri || '',
        namaBarang: transaksi.detailBarangMasukNoSeri?.detailBarangMasuk?.barang?.nama || '',
        kodeBarang: transaksi.detailBarangMasukNoSeri?.detailBarangMasuk?.barang?.kode || '',
        kodeKedatangan: transaksi.detailBarangMasukNoSeri?.detailBarangMasuk?.barangMasuk?.kodeKedatangan || '',
        isDetailRow: false, // Flag untuk membedakan dengan detail
        detailBarangMasukNoSeriId: transaksi.detailBarangMasukNoSeriId, // Tambahkan ID untuk referensi
        // Approval status
        isApproved: transaksi.isApproved || false,
        approvedAt: transaksi.approvedAt ? new Date(transaksi.approvedAt).toLocaleDateString('id-ID') : null,
        approvedBy: transaksi.approvedBy || null
      }
      
      transformedData.push(transformedItem)
    })

    // Sort by tanggal ascending (terlama ke terbaru)
    transformedData.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())

    return NextResponse.json({
      success: true,
      data: transformedData,
      message: 'Data transaksi berhasil diambil'
    })

  } catch (error) {
    console.error('Error fetching transaksi:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data transaksi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader || undefined)
    
    if (token) {
      try {
        const payload = authenticateToken(token)
        console.log('Authenticated user:', payload.username)
      } catch (authError) {
        return NextResponse.json(
          { error: 'Token tidak valid' },
          { status: 401 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      detailBarangMasukNoSeriId, 
      jenisPekerjaan, 
      staffId, 
      status,
      ket, 
      lokasi 
    } = body

    // Validate required fields
    if (!detailBarangMasukNoSeriId || !jenisPekerjaan || !staffId) {
      return NextResponse.json(
        { error: 'detailBarangMasukNoSeriId, jenisPekerjaan, dan staffId wajib diisi' },
        { status: 400 }
      )
    }

    // Get detail barang masuk no seri
    const detailNoSeri = await prisma.detailBarangMasukNoSeri.findUnique({
      where: { id: detailBarangMasukNoSeriId },
      include: {
        detailBarangMasuk: {
          include: {
            barangMasuk: true
          }
        }
      }
    })

    if (!detailNoSeri) {
      return NextResponse.json(
        { error: 'Detail barang masuk no seri tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get staff user
    const staff = await prisma.user.findUnique({
      where: { id: staffId }
    })

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff tidak ditemukan' },
        { status: 404 }
      )
    }

    // Generate noForm: {initial}/V1/{noSeri}/{Year}
    const currentYear = new Date().getFullYear()
    
    // Extract initials from jenis pekerjaan
    const getInitials = (jobType: string): string => {
      // Special case for QC - keep as QC
      if (jobType === 'QC') {
        return 'QC'
      }
      
      // Special case for Assembly - use AS
      if (jobType === 'Assembly') {
        return 'AS'
      }
      
      // Special case for Painting - use PI
      if (jobType === 'Painting') {
        return 'PI'
      }
      
      // Special case for PDI - use PD
      if (jobType === 'PDI') {
        return 'PD'
      }
      
      return jobType
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
    }
    
    const initials = getInitials(jenisPekerjaan)
    const noForm = `${initials}/V1/${detailNoSeri.noSeri}/${currentYear}`

    // Create new transaksi
    const transaksi = await (prisma as any).transaksi.create({
      data: {
        tanggal: new Date(),
        noForm: noForm,
        jenisPekerjaan: jenisPekerjaan,
        staff: staff.name,
        status: status || 'Proses',
        qty: 1,
        ket: ket || null,
        lokasi: lokasi || null,
        detailBarangMasukNoSeriId: detailBarangMasukNoSeriId,
        createdById: staffId
      }
    })

    return NextResponse.json({
      success: true,
      data: transaksi,
      message: 'Transaksi berhasil dibuat'
    })

  } catch (error) {
    console.error('Error creating transaksi:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat transaksi' },
      { status: 500 }
    )
  }
} 