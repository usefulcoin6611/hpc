import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { extractToken, authenticateToken } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ noSeri: string }> }
) {
  try {
    const { noSeri } = await params
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
    const keterangan = formData.get('keterangan') as string

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
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

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'pdi')
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `pdi_${noSeri}_${timestamp}.${fileExtension}`
    const filePath = join(uploadDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save to database
    const fotoPDI = await (prisma as any).fotoPDI.create({
      data: {
        fileName: fileName,
        fileUrl: `/uploads/pdi/${fileName}`,
        fileSize: file.size,
        fileType: file.type,
        keterangan: keterangan || null,
        detailBarangMasukNoSeriId: detailNoSeri.id
      }
    })

    // Return success response
    return NextResponse.json({
      success: true,
      data: fotoPDI,
      message: 'Foto berhasil diupload'
    })

  } catch (error) {
    console.error('Error uploading PDI foto:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat upload foto' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ noSeri: string }> }
) {
  try {
    const { noSeri } = await params
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
    const fotoList = await (prisma as any).fotoPDI.findMany({
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
    console.error('Error fetching PDI foto list:', error)
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

    // Get foto from database
    const foto = await (prisma as any).fotoPDI.findUnique({
      where: { id: fotoId }
    })

    if (!foto) {
      return NextResponse.json(
        { error: 'Foto tidak ditemukan' },
        { status: 404 }
      )
    }

    // Soft delete - update isActive to false
    await (prisma as any).fotoPDI.update({
      where: { id: fotoId },
      data: { isActive: false }
    })

    // Optionally delete physical file
    try {
      const filePath = join(process.cwd(), 'public', foto.fileUrl)
      await unlink(filePath)
    } catch (fileError) {
      console.warn('File tidak dapat dihapus:', fileError)
    }

    return NextResponse.json({
      success: true,
      message: 'Foto berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting PDI foto:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus foto' },
      { status: 500 }
    )
  }
} 