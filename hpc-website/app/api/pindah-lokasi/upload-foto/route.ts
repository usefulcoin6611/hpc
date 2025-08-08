import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'

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
        { error: 'File dan noSeri wajib diisi' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File harus berupa gambar' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 5MB' },
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
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'pindah-lokasi')
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `pindah_lokasi_${noSeri}_${timestamp}.${fileExtension}`
    const filePath = join(uploadDir, fileName)
    const fileUrl = `/uploads/pindah-lokasi/${fileName}`

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save to database
    const fotoPindahLokasi = await (prisma as any).fotoPindahLokasi.create({
      data: {
        fileName: fileName,
        fileUrl: fileUrl,
        fileSize: file.size,
        fileType: file.type,
        keterangan: keterangan || null,
        detailBarangMasukNoSeriId: detailNoSeri.id
      }
    })

    return NextResponse.json({
      success: true,
      data: fotoPindahLokasi,
      message: 'Foto pindah lokasi berhasil diupload'
    })

  } catch (error) {
    console.error('Error uploading foto pindah lokasi:', error)
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
        { error: 'No Seri wajib diisi' },
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
    const fotoList = await (prisma as any).fotoPindahLokasi.findMany({
      where: {
        detailBarangMasukNoSeriId: detailNoSeri.id,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: fotoList,
      message: 'Daftar foto pindah lokasi berhasil diambil'
    })

  } catch (error) {
    console.error('Error fetching foto pindah lokasi list:', error)
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
        { error: 'Foto ID wajib diisi' },
        { status: 400 }
      )
    }

    // Get foto data
    const foto = await (prisma as any).fotoPindahLokasi.findUnique({
      where: { id: fotoId }
    })

    if (!foto) {
      return NextResponse.json(
        { error: 'Foto tidak ditemukan' },
        { status: 404 }
      )
    }

    // Soft delete foto
    await (prisma as any).fotoPindahLokasi.update({
      where: { id: fotoId },
      data: { isActive: false }
    })

    // Delete file from filesystem
    const filePath = join(process.cwd(), 'public', foto.fileUrl)
    try {
      await unlink(filePath)
    } catch (fileError) {
      console.warn('File not found for deletion:', filePath)
    }

    return NextResponse.json({
      success: true,
      message: 'Foto pindah lokasi berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting foto pindah lokasi:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus foto' },
      { status: 500 }
    )
  }
} 