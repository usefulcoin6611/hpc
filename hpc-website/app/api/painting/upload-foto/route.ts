import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const noSeri = formData.get('noSeri') as string
    const keterangan = formData.get('keterangan') as string

    if (!file || !noSeri) {
      return NextResponse.json(
        { error: 'File dan noSeri harus disediakan' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipe file tidak didukung. Gunakan JPEG, PNG, atau GIF' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 5MB' },
        { status: 400 }
      )
    }

    // Get DetailBarangMasukNoSeri
    const detailNoSeri = await (prisma as any).detailBarangMasukNoSeri.findFirst({
      where: { noSeri }
    })

    if (!detailNoSeri) {
      return NextResponse.json(
        { error: 'Detail barang masuk no seri tidak ditemukan' },
        { status: 404 }
      )
    }

    // Create upload directory if not exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'painting')
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const fileName = `painting_${noSeri}_${timestamp}${fileExtension}`
    const filePath = path.join(uploadDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save to database
    const fotoPainting = await (prisma as any).fotoPainting.create({
      data: {
        fileName: fileName,
        fileUrl: `/uploads/painting/${fileName}`,
        fileSize: file.size,
        fileType: file.type,
        keterangan: keterangan || null,
        detailBarangMasukNoSeriId: detailNoSeri.id
      }
    })

    return NextResponse.json({
      success: true,
      data: fotoPainting,
      message: 'Foto berhasil diupload'
    })

  } catch (error) {
    console.error('Error uploading foto:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat upload foto' },
      { status: 500 }
    )
  }
}

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
    const noSeri = searchParams.get('noSeri')

    if (!noSeri) {
      return NextResponse.json(
        { error: 'NoSeri harus disediakan' },
        { status: 400 }
      )
    }

    // Get DetailBarangMasukNoSeri
    const detailNoSeri = await (prisma as any).detailBarangMasukNoSeri.findFirst({
      where: { noSeri }
    })

    if (!detailNoSeri) {
      return NextResponse.json(
        { error: 'Detail barang masuk no seri tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get foto list
    const fotoList = await (prisma as any).fotoPainting.findMany({
      where: {
        detailBarangMasukNoSeriId: detailNoSeri.id,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: fotoList,
      message: 'Daftar foto berhasil diambil'
    })

  } catch (error) {
    console.error('Error fetching foto list:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil daftar foto' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const body = await request.json()
    const { fotoId } = body

    if (!fotoId) {
      return NextResponse.json(
        { error: 'FotoId harus disediakan' },
        { status: 400 }
      )
    }

    // Get foto data
    const foto = await (prisma as any).fotoPainting.findUnique({
      where: { id: fotoId }
    })

    if (!foto) {
      return NextResponse.json(
        { error: 'Foto tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), 'public', foto.fileUrl)
    try {
      await unlink(filePath)
    } catch (error) {
      console.error('Error deleting file from filesystem:', error)
    }

    // Soft delete from database
    await (prisma as any).fotoPainting.update({
      where: { id: fotoId },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Foto berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting foto:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus foto' },
      { status: 500 }
    )
  }
}
