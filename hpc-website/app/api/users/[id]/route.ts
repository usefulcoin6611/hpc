import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'ID user tidak valid' },
        { status: 400 }
      )
    }

    const { role, isActive, jobType } = await request.json()

    // Validate required fields
    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role wajib diisi' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role,
        isActive,
        jobType: jobType || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User berhasil diupdate',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        jobType: updatedUser.jobType,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Delete user (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'ID user tidak valid' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Prevent deleting admin users
    if (existingUser.role === 'admin') {
      return NextResponse.json(
        { success: false, message: 'Tidak dapat menghapus user admin' },
        { status: 400 }
      )
    }

    // Soft delete user (set isActive to false)
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
