import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, authenticateToken } from '@/lib/auth-utils'
import fs from 'fs'
import path from 'path'

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

    // Get DetailBarangMasukNoSeri by noSeri first
    const detailNoSeri = await prisma.detailBarangMasukNoSeri.findFirst({
      where: { noSeri }
    })

    if (!detailNoSeri) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No Seri tidak ditemukan'
      })
    }

    // Get QC foto data from database using detailNoSeriId
    const qcFotos = await prisma.fotoQC.findMany({
      where: { 
        detailBarangMasukNoSeriId: detailNoSeri.id,
        isActive: true 
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform data to match frontend interface
    const fotoList = qcFotos.map(foto => ({
      id: foto.id,
      fileName: foto.fileName,
      fileUrl: `/uploads/qc/${noSeri}/${foto.fileName}`,
      fileSize: foto.fileSize,
      fileType: foto.fileType,
      uploadDate: foto.createdAt?.toISOString(),
      keterangan: foto.keterangan
    }))

    return NextResponse.json({
      success: true,
      data: fotoList,
      message: 'Daftar foto QC berhasil diambil'
    })

  } catch (error) {
    console.error('Error fetching QC foto list:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil daftar foto QC' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ noSeri: string }> }
) {
  try {
    const { noSeri } = await params
    const { searchParams } = new URL(request.url)
    const fotoId = searchParams.get('id')

    if (!fotoId) {
      return NextResponse.json(
        { error: 'ID foto wajib diisi' },
        { status: 400 }
      )
    }

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

    // Get DetailBarangMasukNoSeri by noSeri first
    const detailNoSeri = await prisma.detailBarangMasukNoSeri.findFirst({
      where: { noSeri }
    })

    if (!detailNoSeri) {
      return NextResponse.json(
        { error: 'No Seri tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get foto data
    const foto = await prisma.fotoQC.findFirst({
      where: { 
        id: parseInt(fotoId),
        detailBarangMasukNoSeriId: detailNoSeri.id,
        isActive: true 
      }
    })

    if (!foto) {
      return NextResponse.json(
        { error: 'Foto tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete file from filesystem
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'qc', noSeri)
    const filePath = path.join(uploadDir, foto.fileName)
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Soft delete from database
    await prisma.fotoQC.update({
      where: { id: parseInt(fotoId) },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Foto berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting QC foto:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus foto' },
      { status: 500 }
    )
  }
}
