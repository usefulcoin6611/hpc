import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

// GET - Get single transaksi by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Validate id
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'ID transaksi tidak valid' }, { status: 400 })
    }

    // Get transaksi by ID
    const transaksi = await prisma.transaksi.findUnique({
      where: { id: Number(id) },
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
      }
    })

    if (!transaksi) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: transaksi,
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

// PUT - Update transaksi
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()

    // Validate id
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'ID transaksi tidak valid' }, { status: 400 })
    }

    // Check if transaction exists
    const existingTransaction = await prisma.transaksi.findUnique({
      where: { id: Number(id) }
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 })
    }

    // Update transaction (exclude approval fields - handled by /api/approval)
    const { isApproved, approvedAt, approvedBy, ...updateData } = body

    const updatedTransaction = await prisma.transaksi.update({
      where: { id: Number(id) },
      data: {
        ...updateData,
        updatedAt: new Date()
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
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedTransaction,
      message: 'Transaksi berhasil diperbarui'
    })

  } catch (error) {
    console.error('Error updating transaksi:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui transaksi' },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete transaksi
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Validate id
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'ID transaksi tidak valid' }, { status: 400 })
    }

    // Check if transaction exists
    const existingTransaction = await prisma.transaksi.findUnique({
      where: { id: Number(id) }
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 })
    }

    // Soft delete transaction
    const deletedTransaction = await prisma.transaksi.update({
      where: { id: Number(id) },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: deletedTransaction,
      message: 'Transaksi berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting transaksi:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus transaksi' },
      { status: 500 }
    )
  }
} 