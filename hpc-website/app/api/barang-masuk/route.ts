import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Function to get next serial number with transaction safety
async function getNextSerialNumber(tx: any): Promise<string> {
  const lastNoSeri = await tx.detailBarangMasukNoSeri.findFirst({
    orderBy: {
      noSeri: 'desc'
    },
    select: {
      noSeri: true
    }
  })

  if (!lastNoSeri) {
    return '0000001'
  }

  // Extract number from last serial number
  const lastNumber = parseInt(lastNoSeri.noSeri)
  const nextNumber = lastNumber + 1
  
  // Format to 7 digits with leading zeros
  return nextNumber.toString().padStart(7, '0')
}

// Counter for generating unique serial numbers within a transaction
let serialNumberCounter = 0

// Function to get next serial number with local counter
function getNextSerialNumberWithCounter(baseNumber: number): string {
  serialNumberCounter++
  const nextNumber = baseNumber + serialNumberCounter
  return nextNumber.toString().padStart(7, '0')
}

// GET /api/barang-masuk - Get all barang masuk with pagination and search
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      isActive: true
    }

    if (search) {
      whereClause.OR = [
        { kodeKedatangan: { contains: search, mode: 'insensitive' } },
        { namaSupplier: { contains: search, mode: 'insensitive' } },
        { noForm: { contains: search, mode: 'insensitive' } },
        { status: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (startDate && endDate) {
      whereClause.tanggal = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get barang masuk with details
    const barangMasuk = await prisma.barangMasuk.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        detailBarangMasuk: {
          include: {
            barang: {
              select: {
                id: true,
                kode: true,
                nama: true,
                satuan: true,

              }
            },
            noSeriList: {
              orderBy: {
                createdAt: 'asc'
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Get total count
    const total = await prisma.barangMasuk.count({
      where: whereClause
    })

    return NextResponse.json({
      data: barangMasuk,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching barang masuk:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    const body = await request.json()
    const {
      tanggal,
      kodeKedatangan,
      namaSupplier,
      noForm,
      status
    } = body
    let { details } = body // Array of { namaBarang, jumlah, lokasi, keterangan }

    // Validate required fields
    if (!tanggal || !kodeKedatangan || !namaSupplier || !noForm || !status) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    // Ensure details is an array and has at least one valid item
    if (!details || !Array.isArray(details)) {
      details = []
    }
    
    // Validate that there's at least one valid detail
    const validDetails = details.filter((detail: any) => 
      detail.namaBarang && detail.namaBarang.trim() !== '' && detail.jumlah > 0
    )
    
    if (validDetails.length === 0) {
      return NextResponse.json(
        { error: 'Minimal satu detail barang dengan jumlah minimal 1 harus ditambahkan', title: 'Data Tidak Lengkap' },
        { status: 400 }
      )
    }

    // Check if kodeKedatangan already exists
    const existingKodeKedatangan = await prisma.barangMasuk.findFirst({
      where: { kodeKedatangan: kodeKedatangan } as any
    })

    if (existingKodeKedatangan) {
      return NextResponse.json(
        { error: 'Kode Kedatangan sudah ada', title: 'Duplikasi Data' },
        { status: 400 }
      )
    }

    // Check if noForm already exists
    const existingNoForm = await prisma.barangMasuk.findFirst({
      where: { noForm: noForm } as any
    })

    if (existingNoForm) {
      return NextResponse.json(
        { error: 'No Form sudah ada', title: 'Duplikasi Data' },
        { status: 400 }
      )
    }

    // Create barang masuk with details in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Reset counter for this transaction
      serialNumberCounter = 0
      
      // Get base serial number for this transaction
      const baseSerialNumber = await getNextSerialNumber(tx)
      const baseNumber = parseInt(baseSerialNumber)
      
      // Create barang masuk
      const barangMasuk = await tx.barangMasuk.create({
        data: {
          tanggal: new Date(tanggal),
          kodeKedatangan,
          namaSupplier,
          noForm,
          status,
          createdById: 1 // TODO: Get from token
        } as any
      })

             // Create detail barang masuk only if details exist
             if (details && details.length > 0) {
               const detailPromises = details.map(async (detail: any) => {
                 const { namaBarang, jumlah, units } = detail
                 
                 // Skip if namaBarang is empty
                 if (!namaBarang || namaBarang.trim() === '') {
                   return null
                 }
                 
                 // Find existing barang by nama
                 const barang = await tx.barang.findFirst({
                   where: { nama: namaBarang, isActive: true }
                 })

                 if (!barang) {
                   throw new Error(`Barang dengan nama "${namaBarang}" tidak ditemukan. Silakan tambahkan barang terlebih dahulu di Master Barang.`)
                 }

                 // Create detail
                 const detailBarangMasuk = await tx.detailBarangMasuk.create({
                   data: {
                     barangMasukId: barangMasuk.id,
                     barangId: barang.id,
                     jumlah
                   } as any
                 })

                 // Create no seri entries for each unit
                 if (units && units.length > 0) {
                   const unitPromises = units.map(async (unit: any) => {
                     const { noSeri, lokasi, keterangan } = unit
                     const autoNoSeri = getNextSerialNumberWithCounter(baseNumber)
                     return tx.detailBarangMasukNoSeri.create({
                       data: {
                         noSeri: noSeri || autoNoSeri,
                         lokasi: lokasi || null,
                         keterangan: keterangan || null,
                         detailBarangMasukId: detailBarangMasuk.id
                       } as any
                     })
                   })
                   await Promise.all(unitPromises)
                 }

                 // Update stok barang
                 await tx.barang.update({
                   where: { id: barang.id },
                   data: {
                     stok: {
                       increment: jumlah
                     }
                   }
                 })

                 return detailBarangMasuk
               })

               const detailResults = await Promise.all(detailPromises)
               // Filter out null results (skipped details)
               const validDetails = detailResults.filter(result => result !== null)
             }

      return barangMasuk
    })

    return NextResponse.json({
      message: 'Barang masuk berhasil ditambahkan',
      data: result
    })

  } catch (error) {
    console.error('Error creating barang masuk:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/barang-masuk/[id] - Update barang masuk
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      tanggal,
      kodeKedatangan,
      namaSupplier,
      noForm,
      status
    } = body
    let { details } = body // Array of { namaBarang, jumlah, lokasi, keterangan }

    // Validate required fields
    if (!id || !tanggal || !kodeKedatangan || !namaSupplier || !noForm || !status) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    // Ensure details is an array and has at least one valid item
    if (!details || !Array.isArray(details)) {
      details = []
    }
    
    // Validate that there's at least one valid detail
    const validDetails = details.filter((detail: any) => 
      detail.namaBarang && detail.namaBarang.trim() !== '' && detail.jumlah > 0
    )
    
    if (validDetails.length === 0) {
      return NextResponse.json(
        { error: 'Minimal satu detail barang dengan jumlah minimal 1 harus ditambahkan', title: 'Data Tidak Lengkap' },
        { status: 400 }
      )
    }

    // Check if kodeKedatangan already exists for other records
    const existingKodeKedatangan = await prisma.barangMasuk.findFirst({
      where: { 
        kodeKedatangan,
        id: { not: parseInt(id) }
      } as any
    })

    if (existingKodeKedatangan) {
      return NextResponse.json(
        { error: 'Kode Kedatangan sudah ada', title: 'Duplikasi Data' },
        { status: 400 }
      )
    }

    // Check if noForm already exists for other records
    const existingNoForm = await prisma.barangMasuk.findFirst({
      where: { 
        noForm,
        id: { not: parseInt(id) }
      } as any
    })

    if (existingNoForm) {
      return NextResponse.json(
        { error: 'No Form sudah ada', title: 'Duplikasi Data' },
        { status: 400 }
      )
    }

    // Update barang masuk with details in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Reset counter for this transaction
      serialNumberCounter = 0
      
      // Get base serial number for this transaction
      const baseSerialNumber = await getNextSerialNumber(tx)
      const baseNumber = parseInt(baseSerialNumber)
      
      // Get existing barang masuk
      const existingBarangMasuk = await tx.barangMasuk.findUnique({
        where: { id: parseInt(id) },
        include: {
          detailBarangMasuk: {
            include: {
              barang: true
            }
          }
        }
      })

      if (!existingBarangMasuk) {
        throw new Error(`Barang masuk dengan ID ${id} tidak ditemukan`)
      }

      // Revert old stock changes
      for (const detail of existingBarangMasuk.detailBarangMasuk) {
        await tx.barang.update({
          where: { id: detail.barangId },
          data: {
            stok: {
              decrement: detail.jumlah
            }
          }
        })
      }

      // Update barang masuk
      const barangMasuk = await tx.barangMasuk.update({
        where: { id: parseInt(id) },
        data: {
          tanggal: new Date(tanggal),
          kodeKedatangan,
          namaSupplier,
          noForm,
          status
        } as any
      })

      // Delete old details
      await tx.detailBarangMasuk.deleteMany({
        where: { barangMasukId: parseInt(id) }
      })

       // Create new details and update stok only if details exist
       if (details && details.length > 0) {
         const detailPromises = details.map(async (detail: any) => {
           const { namaBarang, jumlah, units } = detail
           
           // Skip if namaBarang is empty
           if (!namaBarang || namaBarang.trim() === '') {
             return null
           }
           
           // Find existing barang by nama
           const barang = await tx.barang.findFirst({
             where: { nama: namaBarang, isActive: true }
           })

           if (!barang) {
             throw new Error(`Barang dengan nama "${namaBarang}" tidak ditemukan. Silakan tambahkan barang terlebih dahulu di Master Barang.`)
           }

           // Create detail
           const detailBarangMasuk = await tx.detailBarangMasuk.create({
             data: {
               barangMasukId: parseInt(id),
               barangId: barang.id,
               jumlah
             } as any
           })

           // Create no seri entries for each unit
           if (units && units.length > 0) {
             const unitPromises = units.map(async (unit: any) => {
               const { noSeri, lokasi, keterangan } = unit
               const autoNoSeri = getNextSerialNumberWithCounter(baseNumber)
               return tx.detailBarangMasukNoSeri.create({
                 data: {
                   noSeri: noSeri || autoNoSeri,
                   lokasi: lokasi || null,
                   keterangan: keterangan || null,
                   detailBarangMasukId: detailBarangMasuk.id
                 } as any
               })
             })
             await Promise.all(unitPromises)
           }

           // Update stok barang
           await tx.barang.update({
             where: { id: barang.id },
             data: {
               stok: {
                 increment: jumlah
               }
             }
           })

           return detailBarangMasuk
         })

         const detailResults = await Promise.all(detailPromises)
         // Filter out null results (skipped details)
         const validDetails = detailResults.filter(result => result !== null)
       }

      return barangMasuk
    })

    return NextResponse.json({
      message: 'Barang masuk berhasil diperbarui',
      data: result
    })

  } catch (error) {
    console.error('Error updating barang masuk:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID barang masuk wajib diisi' },
        { status: 400 }
      )
    }

    // Delete barang masuk with details in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get existing barang masuk
      const existingBarangMasuk = await tx.barangMasuk.findUnique({
        where: { id: parseInt(id) },
        include: {
          detailBarangMasuk: {
            include: {
              barang: true
            }
          }
        }
      })

      if (!existingBarangMasuk) {
        throw new Error(`Barang masuk dengan ID ${id} tidak ditemukan`)
      }

      // Revert stock changes
      for (const detail of existingBarangMasuk.detailBarangMasuk) {
        await tx.barang.update({
          where: { id: detail.barangId },
          data: {
            stok: {
              decrement: detail.jumlah
            }
          }
        })
      }

      // Delete detail barang masuk no seri first (child table)
      await tx.detailBarangMasukNoSeri.deleteMany({
        where: {
          detailBarangMasuk: {
            barangMasukId: parseInt(id)
          }
        }
      })

      // Delete detail barang masuk (parent table)
      await tx.detailBarangMasuk.deleteMany({
        where: { barangMasukId: parseInt(id) }
      })

      // Finally delete barang masuk
      const barangMasuk = await tx.barangMasuk.delete({
        where: { id: parseInt(id) }
      })

      return barangMasuk
    })

    return NextResponse.json({
      message: 'Barang masuk berhasil dihapus',
      data: result
    })

  } catch (error) {
    console.error('Error deleting barang masuk:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 