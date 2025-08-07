import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

// GET - Fetch approval data (transaksi yang perlu diapprove)
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization')
    console.log('Approval API: Auth header:', authHeader ? authHeader.substring(0, 20) + '...' : 'null')
    
    const token = extractToken(authHeader || undefined)
    console.log('Approval API: Extracted token:', token ? token.substring(0, 20) + '...' : 'null')
    
    if (!token) {
      console.log('Approval API: No token found')
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 })
    }

    console.log('Approval API: Authenticating token...')
    const user = await authenticateToken(token)
    console.log('Approval API: Authentication result:', user ? 'success' : 'failed')
    
    if (!user) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 })
    }

    // Fetch transaksi yang perlu diapprove (bukan Barang Masuk)
    const approvalData = await prisma.transaksi.findMany({
      where: {
        isActive: true,
        jenisPekerjaan: {
          not: 'Barang Masuk'
        }
      },
      include: {
        detailBarangMasukNoSeri: {
          include: {
            detailBarangMasuk: {
              include: {
                barang: {
                  select: { id: true, nama: true, kode: true }
                },
                barangMasuk: {
                  select: {
                    id: true,
                    tanggal: true,
                    kodeKedatangan: true,
                    namaSupplier: true
                  }
                }
              }
            }
          }
        },
        createdBy: {
          select: { id: true, name: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform data untuk approval
    const transformedData = approvalData.map((transaksi: any) => ({
      id: transaksi.id,
      tanggal: new Date(transaksi.tanggal).toLocaleDateString('id-ID'),
      jenisPekerjaan: transaksi.jenisPekerjaan,
      noSeri: transaksi.detailBarangMasukNoSeri?.noSeri || '',
      kodeBarang: transaksi.detailBarangMasukNoSeri?.detailBarangMasuk?.barang?.kode || '',
      namaBarang: transaksi.detailBarangMasukNoSeri?.detailBarangMasuk?.barang?.nama || '',
      qty: transaksi.qty || 1,
      staff: transaksi.staff || '',
      pic: transaksi.createdBy?.name || transaksi.createdBy?.username || 'Unknown',
      isApproved: transaksi.isApproved || false,
      approvedAt: transaksi.approvedAt ? new Date(transaksi.approvedAt).toLocaleDateString('id-ID') : null,
      approvedBy: transaksi.approvedBy || null
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
      message: 'Data approval berhasil diambil'
    })

  } catch (error) {
    console.error('Error fetching approval data:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data approval' },
      { status: 500 }
    )
  }
}

// PUT - Approve/Unapprove transaksi
export async function PUT(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader || undefined)
    
    if (!token) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 })
    }

    const user = await authenticateToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 })
    }

    const body = await request.json()
    const { transaksiId, action } = body // action: 'approve' atau 'unapprove'

    // Validation
    if (!transaksiId) {
      return NextResponse.json({ error: 'ID transaksi wajib diisi' }, { status: 400 })
    }

    if (!action || !['approve', 'unapprove'].includes(action)) {
      return NextResponse.json({ error: 'Action harus approve atau unapprove' }, { status: 400 })
    }

    // Check if transaction exists
    const existingTransaction = await prisma.transaksi.findUnique({
      where: { id: Number(transaksiId) }
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 })
    }

    // Update transaction
    const updateData = action === 'approve' 
      ? {
          isApproved: true,
          approvedAt: new Date(),
          approvedBy: user.username || 'admin'
        }
      : {
          isApproved: false,
          approvedAt: null,
          approvedBy: null
        }

    const updatedTransaction = await prisma.transaksi.update({
      where: { id: Number(transaksiId) },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: updatedTransaction,
      message: `Transaksi berhasil di${action === 'approve' ? 'approve' : 'unapprove'}`
    })

  } catch (error) {
    console.error('Error updating approval:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengubah status approval' },
      { status: 500 }
    )
  }
} 