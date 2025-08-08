import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { id, status } = body

    // Validate required fields
    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID dan status wajib diisi' },
        { status: 400 }
      )
    }

    // Extract transaksi ID from the combined ID format
    const transaksiId = id.startsWith('transaksi-') ? parseInt(id.replace('transaksi-', '')) : null

    if (!transaksiId) {
      return NextResponse.json(
        { error: 'ID transaksi tidak valid' },
        { status: 400 }
      )
    }

    // Update transaksi status
    const updatedTransaksi = await prisma.transaksi.update({
      where: {
        id: transaksiId
      },
      data: {
        status: status
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedTransaksi,
      message: 'Status transaksi berhasil diperbarui'
    })

  } catch (error) {
    console.error('Error updating transaksi status:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui status transaksi' },
      { status: 500 }
    )
  }
}
