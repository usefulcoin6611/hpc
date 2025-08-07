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

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') as 'inspeksi_mesin' | 'assembly_staff' | 'qc_staff' | 'pdi_staff' | 'painting_staff' | 'pindah_lokasi' | 'admin' | 'supervisor' | null

    if (!role) {
      return NextResponse.json(
        { error: 'Role parameter is required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['inspeksi_mesin', 'assembly_staff', 'qc_staff', 'pdi_staff', 'painting_staff', 'pindah_lokasi', 'admin', 'supervisor']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Get users by role
    const users = await prisma.user.findMany({
      where: {
        role: role,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        jobType: true
      }
    })

    return NextResponse.json({
      success: true,
      data: users,
      message: `Users found for role: ${role}`
    })

  } catch (error) {
    console.error('Error fetching users by role:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data user' },
      { status: 500 }
    )
  }
}
