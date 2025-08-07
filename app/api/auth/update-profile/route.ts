import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken, PasswordUtils } from '@/lib/auth-utils'

// PUT /api/auth/update-profile - Update user profile
export async function PUT(request: NextRequest) {
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
    const userId = parseInt((payload as any).userId)

    const { name, username, currentPassword, newPassword } = await request.json()

    // Validate required fields
    if (!name || !username) {
      return NextResponse.json(
        { success: false, message: 'Nama dan username wajib diisi' },
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

    // Check if username is already taken by another user
    if (username !== existingUser.username) {
      const usernameExists = await prisma.user.findFirst({
        where: { 
          username,
          id: { not: userId }
        }
      })

      if (usernameExists) {
        return NextResponse.json(
          { success: false, message: 'Username sudah digunakan' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      username
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: 'Password saat ini wajib diisi untuk mengubah password' },
          { status: 400 }
        )
      }

      // Verify current password
      const isCurrentPasswordValid = await PasswordUtils.verifyPassword(currentPassword, existingUser.password)
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Password saat ini tidak benar' },
          { status: 400 }
        )
      }

      // Validate new password
      const passwordValidation = PasswordUtils.validatePassword(newPassword)
      if (!passwordValidation.isValid) {
        return NextResponse.json(
          { success: false, message: 'Password baru tidak memenuhi kriteria', errors: passwordValidation.errors },
          { status: 400 }
        )
      }

      // Hash new password
      const hashedNewPassword = await PasswordUtils.hashPassword(newPassword)
      updateData.password = hashedNewPassword
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diupdate',
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
    console.error('Update profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
