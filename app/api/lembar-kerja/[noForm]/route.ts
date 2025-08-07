import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { extractToken, authenticateToken } from "@/lib/auth-utils"

// GET - Get specific lembar kerja data by noForm
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ noForm: string }> }
) {
  try {
    const { noForm } = await params
    
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

    // Decode noForm parameter (handle URL encoding)
    const decodedNoForm = decodeURIComponent(noForm)
    
    // Find transaksi by exact noForm
    const transaksi = await (prisma as any).transaksi.findFirst({
      where: {
        noForm: decodedNoForm,
        isActive: true
      },
      include: {
        detailBarangMasukNoSeri: {
          include: {
            detailBarangMasuk: {
              include: {
                barang: true
              }
            }
          }
        }
      }
    })

    if (!transaksi) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get job-specific data based on jenisPekerjaan
    let jobData = null
    const jenisPekerjaan = transaksi.jenisPekerjaan

    if (jenisPekerjaan === "PDI" || jenisPekerjaan === "pdi_staff") {
      jobData = await (prisma as any).pDIData.findMany({
        where: { transaksiId: transaksi.id }
      })
    } else if (jenisPekerjaan === "Inspeksi Mesin" || jenisPekerjaan === "inspeksi_mesin") {
      jobData = await (prisma as any).inspeksiData.findMany({
        where: { transaksiId: transaksi.id }
      })
    } else if (jenisPekerjaan === "Assembly" || jenisPekerjaan === "assembly_staff") {
      jobData = await (prisma as any).assemblyData.findMany({
        where: { transaksiId: transaksi.id }
      })
    } else if (jenisPekerjaan === "Painting" || jenisPekerjaan === "painting_staff") {
      jobData = await (prisma as any).paintingData.findMany({
        where: { transaksiId: transaksi.id }
      })
    } else if (jenisPekerjaan === "QC" || jenisPekerjaan === "qc_staff") {
      jobData = await (prisma as any).qCData.findMany({
        where: { transaksiId: transaksi.id }
      })
    }

    return NextResponse.json({
      transaksi: {
        id: transaksi.id,
        noForm: transaksi.noForm,
        jenisPekerjaan: transaksi.jenisPekerjaan,
        tanggal: transaksi.tanggal,
        ket: transaksi.ket,
        noSeri: transaksi.detailBarangMasukNoSeri?.noSeri,
        namaBarang: transaksi.detailBarangMasukNoSeri?.detailBarangMasuk?.barang?.namaBarang
      },
      items: jobData || []
    })

  } catch (error) {
    console.error('Error fetching lembar kerja by noForm:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PUT - Update specific lembar kerja data by noForm
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ noForm: string }> }
) {
  try {
    const { noForm } = await params
    const body = await request.json()
    const { items, keterangan } = body

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

    // Validate required fields
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items harus berupa array' },
        { status: 400 }
      )
    }

    // Decode noForm parameter
    const decodedNoForm = decodeURIComponent(noForm)
    
    // Find transaksi by exact noForm
    const transaksi = await (prisma as any).transaksi.findFirst({
      where: {
        noForm: decodedNoForm,
        isActive: true
      }
    })

    if (!transaksi) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Use transaction to ensure data consistency
    await (prisma as any).$transaction(async (tx: any) => {
      // Update transaksi with new keterangan and updated timestamp
      await tx.transaksi.update({
        where: { id: transaksi.id },
        data: {
          ket: keterangan || transaksi.ket,
          tanggal: new Date(),
          updatedAt: new Date()
        }
      })

      const jenisPekerjaan = transaksi.jenisPekerjaan

      // Delete existing job-specific data
      if (jenisPekerjaan === "PDI" || jenisPekerjaan === "pdi_staff") {
        await tx.pDIData.deleteMany({
          where: { transaksiId: transaksi.id }
        })
        
        // Create new PDI data
        for (const item of items) {
          await tx.pDIData.create({
            data: {
              transaksiId: transaksi.id,
              parameter: item.parameter,
              spesifikasi: item.spesifikasi,
              tools: item.tools,
              hasil: item.hasil,
              keterangan: item.keterangan || ""
            }
          })
        }
      } else if (jenisPekerjaan === "Inspeksi Mesin" || jenisPekerjaan === "inspeksi_mesin") {
        await tx.inspeksiData.deleteMany({
          where: { transaksiId: transaksi.id }
        })
        
        for (const item of items) {
          await tx.inspeksiData.create({
            data: {
              transaksiId: transaksi.id,
              parameter: item.parameter,
              spesifikasi: item.spesifikasi,
              tools: item.tools,
              hasil: item.hasil,
              keterangan: item.keterangan || ""
            }
          })
        }
      } else if (jenisPekerjaan === "Assembly" || jenisPekerjaan === "assembly_staff") {
        await tx.assemblyData.deleteMany({
          where: { transaksiId: transaksi.id }
        })
        
        for (const item of items) {
          await tx.assemblyData.create({
            data: {
              transaksiId: transaksi.id,
              parameter: item.parameter,
              spesifikasi: item.spesifikasi,
              tools: item.tools,
              hasil: item.hasil,
              keterangan: item.keterangan || ""
            }
          })
        }
      } else if (jenisPekerjaan === "Painting" || jenisPekerjaan === "painting_staff") {
        await tx.paintingData.deleteMany({
          where: { transaksiId: transaksi.id }
        })
        
        for (const item of items) {
          await tx.paintingData.create({
            data: {
              transaksiId: transaksi.id,
              parameter: item.parameter,
              spesifikasi: item.spesifikasi,
              tools: item.tools,
              hasil: item.hasil,
              keterangan: item.keterangan || ""
            }
          })
        }
      } else if (jenisPekerjaan === "QC" || jenisPekerjaan === "qc_staff") {
        await tx.qCData.deleteMany({
          where: { transaksiId: transaksi.id }
        })
        
        for (const item of items) {
          await tx.qCData.create({
            data: {
              transaksiId: transaksi.id,
              parameter: item.parameter,
              aktual: item.aktual || "",
              standar: item.standar || ""
            }
          })
        }
      }
    })

    return NextResponse.json({ 
      message: 'Data berhasil diupdate',
      noForm: decodedNoForm
    })

  } catch (error) {
    console.error('Error updating lembar kerja by noForm:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}