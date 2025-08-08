import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'
import { authenticateToken, extractToken } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const token = extractToken(request.headers.get('authorization') || undefined)
    if (!token) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      )
    }

    try {
      authenticateToken(token)
    } catch (error) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const noSeri = formData.get('noSeri') as string
    const keterangan = formData.get('keterangan') as string

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      )
    }

    if (!noSeri) {
      return NextResponse.json(
        { error: 'No Seri tidak ditemukan' },
        { status: 400 }
      )
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File harus berupa gambar' },
        { status: 400 }
      )
    }

    // Validasi ukuran file (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 5MB' },
        { status: 400 }
      )
    }

    // Cek apakah noSeri ada di database
    const detailBarangMasukNoSeri = await (prisma as any).detailBarangMasukNoSeri.findFirst({
      where: { noSeri }
    })

    if (!detailBarangMasukNoSeri) {
      return NextResponse.json(
        { error: 'No Seri tidak ditemukan di database' },
        { status: 404 }
      )
    }

    // Buat direktori upload jika belum ada
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'inspeksi', noSeri)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate nama file unik
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `inspeksi_${noSeri}_${timestamp}.${fileExtension}`
    const filePath = join(uploadDir, fileName)

    // Convert file to buffer dan simpan
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Generate URL untuk akses file
    const fileUrl = `/uploads/inspeksi/${noSeri}/${fileName}`

    // Simpan data foto ke database
    const fotoInspeksi = await (prisma as any).fotoInspeksi.create({
      data: {
        fileName,
        fileUrl,
        fileSize: file.size,
        fileType: file.type,
        keterangan: keterangan || null,
        detailBarangMasukNoSeriId: detailBarangMasukNoSeri.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Foto berhasil diupload',
      data: {
        id: fotoInspeksi.id,
        fileName: fotoInspeksi.fileName,
        fileUrl: fotoInspeksi.fileUrl,
        fileSize: fotoInspeksi.fileSize,
        fileType: fotoInspeksi.fileType,
        keterangan: fotoInspeksi.keterangan,
        noSeri,
        uploadDate: fotoInspeksi.createdAt
      }
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat upload file' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const noSeri = searchParams.get('noSeri')

    if (!noSeri) {
      return NextResponse.json(
        { error: 'No Seri tidak ditemukan' },
        { status: 400 }
      )
    }

    // Ambil data foto dari database
    const fotoList = await (prisma as any).fotoInspeksi.findMany({
      where: {
        detailBarangMasukNoSeri: {
          noSeri
        },
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedFotoList = fotoList.map((foto: any) => ({
      id: foto.id,
      fileName: foto.fileName,
      fileUrl: foto.fileUrl,
      fileSize: foto.fileSize,
      fileType: foto.fileType,
      keterangan: foto.keterangan,
      uploadDate: foto.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: formattedFotoList
    })

  } catch (error) {
    console.error('Error getting foto list:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil daftar foto' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authentication
    const token = extractToken(request.headers.get('authorization') || undefined)
    if (!token) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      )
    }

    try {
      authenticateToken(token)
    } catch (error) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { fotoId } = body

    if (!fotoId) {
      return NextResponse.json(
        { error: 'Foto ID diperlukan' },
        { status: 400 }
      )
    }

    // Ambil data foto dari database
    const foto = await (prisma as any).fotoInspeksi.findFirst({
      where: { id: parseInt(fotoId), isActive: true },
      include: {
        detailBarangMasukNoSeri: true
      }
    })

    if (!foto) {
      return NextResponse.json(
        { error: 'Foto tidak ditemukan' },
        { status: 404 }
      )
    }

    const filePath = join(process.cwd(), 'public', foto.fileUrl)

    // Hapus file dari filesystem
    if (existsSync(filePath)) {
      await unlink(filePath)
    }

    // Soft delete dari database
    await (prisma as any).fotoInspeksi.update({
      where: { id: parseInt(fotoId) },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Foto berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus file' },
      { status: 500 }
    )
  }
} 