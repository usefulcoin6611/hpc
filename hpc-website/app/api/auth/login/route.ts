import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PasswordUtils, JWTUtils } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    console.log('Login attempt:', { username, password: password ? '[HIDDEN]' : 'undefined' })

    // Validate input
    if (!username || !password) {
      console.log('Login failed: Missing username or password')
      return NextResponse.json(
        { success: false, message: 'Username dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Find user in database using Prisma
    console.log('Looking for user:', username)
    const user = await prisma.user.findUnique({
      where: { username }
    })

    console.log('User found:', user ? { id: user.id, username: user.username, isActive: user.isActive } : 'null')

    if (!user) {
      console.log('Login failed: User not found')
      return NextResponse.json(
        { success: false, message: 'Username atau password salah' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('Login failed: User inactive')
      return NextResponse.json(
        { success: false, message: 'Akun tidak aktif' },
        { status: 401 }
      )
    }

    // Verify password
    console.log('Verifying password...')
    const isValidPassword = await PasswordUtils.comparePassword(password, user.password)
    console.log('Password valid:', isValidPassword)
    
    if (!isValidPassword) {
      console.log('Login failed: Invalid password')
      return NextResponse.json(
        { success: false, message: 'Username atau password salah' },
        { status: 401 }
      )
    }

    // Generate JWT token
    console.log('Generating JWT token...')
    const token = JWTUtils.generateToken({
      userId: user.id.toString(),
      username: user.username,
      role: user.role
    })

    console.log('Login successful for user:', user.username)

    // Return success response with LoginResponse structure
    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user.id.toString(),
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        jobType: user.jobType,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
} 