import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

// GET - Mengambil data form pindah lokasi berdasarkan noSeri
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ noSeri: string }> }
) {
  try {
    const { noSeri } = await params

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

    // Ambil data form pindah lokasi
    const formData = await (prisma as any).pindahLokasiForm.findFirst({
      where: {
        noSeri: noSeri,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Ambil data detail barang masuk no seri untuk mendapatkan nama barang
    const detailBarangMasukNoSeri = await prisma.detailBarangMasukNoSeri.findFirst({
      where: {
        noSeri: noSeri
      },
      include: {
        detailBarangMasuk: {
          include: {
            barang: true
          }
        }
      }
    })

    if (!detailBarangMasukNoSeri) {
      return NextResponse.json(
        { success: false, message: 'Data barang tidak ditemukan' },
        { status: 404 }
      )
    }

    // Cari transaksi pindah lokasi yang sudah ada untuk mendapatkan noForm dan lokasi awal
    const existingTransaksi = await prisma.transaksi.findFirst({
      where: {
        detailBarangMasukNoSeriId: detailBarangMasukNoSeri.id,
        jenisPekerjaan: 'Pindah Lokasi',
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Jika tidak ada data form, buat data default
    if (!formData) {
      // Generate nomor form otomatis jika tidak ada transaksi yang sudah ada
      const currentYear = new Date().getFullYear()
      const generatedNoForm = existingTransaksi?.noForm || `PL/V1/${noSeri}/${currentYear}`

      // Ambil lokasi awal dari transaksi pindah lokasi yang sudah ada, atau dari detail barang masuk no seri
      const lokasiAwal = existingTransaksi?.lokasi || detailBarangMasukNoSeri.lokasi || 'Gudang A'

      const defaultFormData = {
        id: undefined,
        noSeri: noSeri,
        namaBarang: detailBarangMasukNoSeri.detailBarangMasuk.barang?.nama || '',
        lokasiAwal: lokasiAwal,
        lokasiBaru: '',
        noForm: generatedNoForm,
        tanggal: new Date(),
        keterangan: ''
      }

      return NextResponse.json({
        success: true,
        data: defaultFormData
      })
    }

    // Jika ada data form, update dengan data terbaru dari transaksi
    const lokasiAwal = existingTransaksi?.lokasi || detailBarangMasukNoSeri.lokasi || 'Gudang A'
    
    const updatedFormData = {
      ...formData,
      namaBarang: detailBarangMasukNoSeri.detailBarangMasuk.barang?.nama || '',
      lokasiAwal: lokasiAwal
    }

    return NextResponse.json({
      success: true,
      data: updatedFormData
    })

  } catch (error) {
    console.error('Error fetching pindah lokasi form:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Menyimpan data form pindah lokasi
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ noSeri: string }> }
) {
  try {
    const { noSeri } = await params
    const body = await request.json()
    const { namaBarang, lokasiAwal, lokasiBaru, noForm, tanggal, keterangan } = body

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

    // Validasi lokasi baru tidak boleh sama dengan lokasi awal
    if (lokasiBaru === lokasiAwal) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Lokasi baru tidak boleh sama dengan lokasi awal',
          title: 'Lokasi Sama'
        },
        { status: 400 }
      )
    }

    // Hapus data lama (soft delete)
    await (prisma as any).pindahLokasiForm.updateMany({
      where: {
        noSeri: noSeri,
        isActive: true
      },
      data: {
        isActive: false
      }
    })

    // Simpan data baru
    const savedForm = await (prisma as any).pindahLokasiForm.create({
      data: {
        noSeri: noSeri,
        namaBarang: namaBarang || '',
        lokasiAwal: lokasiAwal || '',
        lokasiBaru: lokasiBaru,
        noForm: noForm || '',
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        keterangan: keterangan || '',
        createdById: 1, // TODO: Get user ID from token
        detailBarangMasukNoSeriId: detailBarangMasukNoSeri.id
      }
    })

    // Cari transaksi pindah lokasi yang sudah ada
    const existingTransaksi = await prisma.transaksi.findFirst({
      where: {
        detailBarangMasukNoSeriId: detailBarangMasukNoSeri.id,
        jenisPekerjaan: 'Pindah Lokasi',
        isActive: true
      }
    })

    if (existingTransaksi) {
      // Update transaksi yang sudah ada
      await prisma.transaksi.update({
        where: {
          id: existingTransaksi.id
        },
        data: {
          lokasi: lokasiBaru,
          tanggal: tanggal ? new Date(tanggal) : new Date(),
          ket: keterangan || ''
        }
      })
    } else {
      // Buat transaksi baru jika belum ada
      await prisma.transaksi.create({
        data: {
          tanggal: tanggal ? new Date(tanggal) : new Date(),
          noForm: noForm || '',
          jenisPekerjaan: 'Pindah Lokasi',
          staff: 'Staff Gudang', // Default staff
          status: 'Selesai',
          qty: 1,
          ket: keterangan || '',
          lokasi: lokasiBaru,
          detailBarangMasukNoSeriId: detailBarangMasukNoSeri.id,
          createdById: 1 // TODO: Get user ID from token
        }
      })
    }

    // Buat record pindah lokasi untuk history
    await prisma.pindahLokasi.create({
      data: {
        noSeri: noSeri,
        dariLokasi: lokasiAwal,
        keLokasi: lokasiBaru,
        keterangan: keterangan || '',
        createdById: 1, // TODO: Get user ID from token
        detailBarangMasukNoSeriId: detailBarangMasukNoSeri.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Data form pindah lokasi berhasil disimpan',
      data: savedForm
    })

  } catch (error) {
    console.error('Error saving pindah lokasi form:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal menyimpan data form pindah lokasi',
        title: 'Error'
      },
      { status: 500 }
    )
  }
} 