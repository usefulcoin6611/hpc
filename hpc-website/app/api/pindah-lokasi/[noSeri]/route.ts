import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Mengambil data pindah lokasi berdasarkan noSeri
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ noSeri: string }> }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    const { noSeri } = await params

    // Ambil data pindah lokasi beserta history
    let pindahLokasiData: any[] = []
    try {
      pindahLokasiData = await (prisma as any).pindahLokasi.findMany({
        where: {
          noSeri: noSeri,
          isActive: true
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true
            }
          },
          fotoPindahLokasi: {
            where: {
              isActive: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } catch (error) {
      console.error('Error fetching pindah lokasi data:', error)
      // Jika tabel belum ada, gunakan array kosong
      pindahLokasiData = []
    }

    // Ambil data detail barang masuk no seri untuk informasi barang
    const detailBarangMasukNoSeri = await prisma.detailBarangMasukNoSeri.findFirst({
      where: {
        noSeri: noSeri
      },
      include: {
        detailBarangMasuk: {
          include: {
            barang: true,
            barangMasuk: true
          }
        }
      }
    })

    // Format response
    const formattedData = {
      currentData: pindahLokasiData.length > 0 ? {
        id: pindahLokasiData[0].id,
        namaBarang: detailBarangMasukNoSeri?.detailBarangMasuk.barang?.nama || '',
        kodeBarang: detailBarangMasukNoSeri?.detailBarangMasuk.barang?.kode || '',
        noSeri: noSeri,
        kodeKedatangan: detailBarangMasukNoSeri?.detailBarangMasuk.barangMasuk?.kodeKedatangan || '',
        lokasiSekarang: pindahLokasiData[0].keLokasi, // Lokasi terakhir adalah lokasi sekarang
        lokasiBaru: '',
        keterangan: '',
        fotoUrl: pindahLokasiData[0].fotoPindahLokasi[0]?.fileUrl || ''
      } : {
        namaBarang: detailBarangMasukNoSeri?.detailBarangMasuk.barang?.nama || '',
        kodeBarang: detailBarangMasukNoSeri?.detailBarangMasuk.barang?.kode || '',
        noSeri: noSeri,
        kodeKedatangan: detailBarangMasukNoSeri?.detailBarangMasuk.barangMasuk?.kodeKedatangan || '',
        lokasiSekarang: detailBarangMasukNoSeri?.lokasi || 'Gudang A', // Default lokasi
        lokasiBaru: '',
        keterangan: '',
        fotoUrl: ''
      },
      history: pindahLokasiData.map((item: any) => ({
        id: item.id,
        tanggal: item.createdAt.toISOString().split('T')[0],
        waktu: item.createdAt.toTimeString().split(' ')[0],
        dariLokasi: item.dariLokasi,
        keLokasi: item.keLokasi,
        staff: item.createdBy?.name || 'Unknown',
        keterangan: item.keterangan || ''
      }))
    }

    return NextResponse.json({
      success: true,
      data: formattedData
    })

  } catch (error) {
    console.error('Error fetching pindah lokasi data:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update data pindah lokasi
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ noSeri: string }> }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    const { noSeri } = await params
    const body = await request.json()
    const { lokasiBaru, keterangan } = body

    // Validasi input
    if (!lokasiBaru) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Lokasi baru harus diisi',
          title: 'Validasi Gagal'
        },
        { status: 400 }
      )
    }

    // Ambil data detail barang masuk no seri
    const detailBarangMasukNoSeri = await prisma.detailBarangMasukNoSeri.findFirst({
      where: {
        noSeri: noSeri
      }
    })

    if (!detailBarangMasukNoSeri) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Data barang tidak ditemukan',
          title: 'Data Tidak Ditemukan'
        },
        { status: 404 }
      )
    }

    // Ambil lokasi sekarang (lokasi terakhir atau default)
    let lastPindahLokasi: any = null
    try {
      lastPindahLokasi = await (prisma as any).pindahLokasi.findFirst({
        where: {
          noSeri: noSeri,
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } catch (error) {
      console.error('Error fetching last pindah lokasi:', error)
      lastPindahLokasi = null
    }

    const lokasiSekarang = lastPindahLokasi?.keLokasi || detailBarangMasukNoSeri.lokasi || 'Gudang A'

    // Validasi lokasi baru tidak boleh sama dengan lokasi sekarang
    if (lokasiBaru === lokasiSekarang) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Lokasi baru tidak boleh sama dengan lokasi sekarang',
          title: 'Lokasi Sama'
        },
        { status: 400 }
      )
    }

    // Buat record pindah lokasi baru
    let newPindahLokasi: any = null
    try {
      newPindahLokasi = await (prisma as any).pindahLokasi.create({
        data: {
          noSeri: noSeri,
          dariLokasi: lokasiSekarang,
          keLokasi: lokasiBaru,
          keterangan: keterangan || '',
          createdById: 1, // TODO: Get user ID from token
          detailBarangMasukNoSeriId: detailBarangMasukNoSeri.id
        }
      })
    } catch (error) {
      console.error('Error creating pindah lokasi:', error)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Gagal membuat record pindah lokasi. Pastikan tabel sudah dibuat.',
          title: 'Database Error'
        },
        { status: 500 }
      )
    }

    // Update lokasi di detail barang masuk no seri
    await prisma.detailBarangMasukNoSeri.update({
      where: {
        id: detailBarangMasukNoSeri.id
      },
      data: {
        lokasi: lokasiBaru
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Data pindah lokasi berhasil disimpan',
      data: newPindahLokasi
    })

  } catch (error) {
    console.error('Error updating pindah lokasi data:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal menyimpan data pindah lokasi',
        title: 'Error'
      },
      { status: 500 }
    )
  }
} 