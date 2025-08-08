import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken, PasswordUtils } from '@/lib/auth-utils'

// GET /api/users - Get all users
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

    const payload = authenticateToken(token)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * limit

    // Build where clause for search
    const whereClause: any = {
      isActive: true,
      ...(search && {
        OR: [
          { username: { contains: search, mode: 'insensitive' as any } },
          { name: { contains: search, mode: 'insensitive' as any } },
          { email: { contains: search, mode: 'insensitive' as any } },
          { role: { contains: search, mode: 'insensitive' as any } },
          { jobType: { contains: search, mode: 'insensitive' as any } }
        ]
      })
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: users.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        jobType: user.jobType,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user
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

    const { username, password, name, email, role, jobType } = await request.json()

    if (!username || !password || !name) {
      return NextResponse.json(
        { success: false, message: 'Username, password, dan nama wajib diisi' },
        { status: 400 }
      )
    }

    const passwordValidation = PasswordUtils.validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, message: 'Password tidak memenuhi kriteria', errors: passwordValidation.errors },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await prisma.user.findFirst({
      where: { username, isActive: true }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Username sudah ada' },
        { status: 400 }
      )
    }

    const hashedPassword = await PasswordUtils.hashPassword(password)

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        email: email || null,
        role: role || 'user',
        jobType: jobType || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User berhasil ditambahkan',
      data: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        jobType: newUser.jobType,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
} 