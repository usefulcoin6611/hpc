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
    const jobType = searchParams.get('jobType') as 'staff' | 'supervisor' | 'admin' | null

    if (!jobType) {
      return NextResponse.json(
        { error: 'Job type parameter is required' },
        { status: 400 }
      )
    }

    // Validate jobType
    if (!['staff', 'supervisor', 'admin'].includes(jobType)) {
      return NextResponse.json(
        { error: 'Invalid job type' },
        { status: 400 }
      )
    }

    // Get users by job type
    const users = await prisma.user.findMany({
      where: {
        jobType: jobType,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        username: true,
        jobType: true
      }
    })

    return NextResponse.json({
      success: true,
      data: users,
      message: `Users found for job type: ${jobType}`
    })

  } catch (error) {
    console.error('Error fetching users by job type:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data user' },
      { status: 500 }
    )
  }
} 