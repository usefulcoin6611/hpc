import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user if not exists
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'admin123', // In production, this should be hashed
      name: 'Administrator',
      email: 'admin@example.com',
      role: 'admin',
      jobType: null // Admin tidak memiliki jobType spesifik
    }
  })

  console.log('✅ Admin user created/updated:', adminUser.username)

  // Create sample jenis barang
  const jenisBarang = await prisma.jenisBarang.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nama: 'Hunter Equipment',
      deskripsi: 'Peralatan Hunter untuk bengkel',
      createdById: adminUser.id
    }
  })

  console.log('✅ Jenis barang created/updated:', jenisBarang.nama)

  // Create sample barang data from the image
  const sampleBarang = [
    {
      id: 1,
      kode: '70010022003',
      nama: 'CORGHI ET1450 MOTOR',
      kategori: 'Motor',
      satuan: 'Unit',
      stok: 5,
      stokMinimum: 2,
      lokasi: 'Gudang A',
      deskripsi: 'Motor untuk Corghi ET1450',
      jenisId: jenisBarang.id,
      createdById: adminUser.id
    },
    {
      id: 2,
      kode: '70790030035',
      nama: 'HUNTER Tire Changer TCX 45 Red - 1 Ph',
      kategori: 'Tire Changer',
      satuan: 'Unit',
      stok: 3,
      stokMinimum: 1,
      lokasi: 'Gudang A',
      deskripsi: 'Hunter Tire Changer TCX 45 warna merah single phase',
      jenisId: jenisBarang.id,
      createdById: adminUser.id
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
      jenisId: jenisBarang.id,
      createdById: adminUser.id
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
      jenisId: jenisBarang.id,
      createdById: adminUser.id
    }
  ]

  for (const barang of sampleBarang) {
    await prisma.barang.upsert({
      where: { kode: barang.kode },
      update: {},
      create: barang
    })
  }

  console.log('✅ Sample barang data created/updated')

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 