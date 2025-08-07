import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting master barang seed...')

  // Data jenis barang yang akan di-seed sesuai database
  const jenisBarangData = [
    {
      nama: 'Hunter Equipment',
      deskripsi: 'Peralatan Hunter untuk bengkel'
    }
  ]

  // Data master barang yang akan di-seed sesuai database
  const masterBarangData = [
    {
      id: 1,
      kode: '70010022002',
      nama: 'CORGHI ET1450 MOTOR',
      kategori: 'Motor',
      satuan: 'Unit',
      stok: 9,
      stokMinimum: 0,
      lokasi: 'Gudang A',
      deskripsi: 'Motor untuk Corghi ET1450',
      jenisId: null
    },
    {
      id: 2,
      kode: '70790030035',
      nama: 'HUNTER Tire Changer TCX 45 Red - 1 Ph',
      kategori: 'Tire Changer',
      satuan: 'Unit',
      stok: 8,
      stokMinimum: 1,
      lokasi: 'Gudang A',
      deskripsi: 'Hunter Tire Changer TCX 45 warna merah single phase',
      jenisId: null
    },
    {
      id: 3,
      kode: '70790020019',
      nama: 'HUNTER Smart Weight Pro',
      kategori: 'Balancing',
      satuan: 'Unit',
      stok: 10,
      stokMinimum: 2,
      lokasi: 'Gudang B',
      deskripsi: 'Hunter Smart Weight Pro balancing equipment',
      jenisId: null
    },
    {
      id: 4,
      kode: '70790030012',
      nama: 'HUNTER Hawkeye Elite',
      kategori: 'Alignment',
      satuan: 'Unit',
      stok: 8,
      stokMinimum: 1,
      lokasi: 'Gudang A',
      deskripsi: 'Hunter Hawkeye Elite wheel alignment system',
      jenisId: null
    }
  ]

  try {
    // Hapus data yang ada (opsional)
    console.log('🗑️  Cleaning existing data...')
    await prisma.barang.deleteMany({})
    await prisma.jenisBarang.deleteMany({})

    // Insert jenis barang
    console.log('📦 Creating jenis barang...')
    const jenisBarang = []
    for (const jenisData of jenisBarangData) {
      const jenis = await prisma.jenisBarang.create({
        data: jenisData
      })
      jenisBarang.push(jenis)
      console.log(`✅ Created jenis barang: ${jenis.nama}`)
    }

    // Insert master barang
    console.log('📋 Creating master barang...')
    for (const barangData of masterBarangData) {
      const barang = await prisma.barang.create({
        data: barangData
      })
      console.log(`✅ Created barang: ${barang.nama} (${barang.kode}) - Stok: ${barang.stok}`)
    }

    console.log('🎉 Master barang seed completed successfully!')
    console.log(`\n📊 Summary:`)
    console.log(`- Jenis Barang: ${jenisBarang.length} items`)
    console.log(`- Master Barang: ${masterBarangData.length} items`)
    console.log(`- Total stok: ${masterBarangData.reduce((sum, item) => sum + item.stok, 0)} units`)

  } catch (error) {
    console.error('❌ Error during master barang seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during master barang seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })