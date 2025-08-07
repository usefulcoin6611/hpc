import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📥 Pulling data from database...')
  console.log('================================')

  try {
    // Pull users data
    console.log('\n👥 Pulling users data...')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        jobType: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        id: 'asc'
      }
    })

    console.log(`Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Name: ${user.name}, Role: ${user.role}, JobType: ${user.jobType}`)
    })

    // Pull jenis barang data
    console.log('\n📦 Pulling jenis barang data...')
    const jenisBarang = await prisma.jenisBarang.findMany({
      select: {
        id: true,
        nama: true,
        deskripsi: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        id: 'asc'
      }
    })

    console.log(`Found ${jenisBarang.length} jenis barang:`)
    jenisBarang.forEach(jenis => {
      console.log(`- ID: ${jenis.id}, Nama: ${jenis.nama}, Deskripsi: ${jenis.deskripsi}`)
    })

    // Pull master barang data
    console.log('\n📋 Pulling master barang data...')
    const masterBarang = await prisma.barang.findMany({
      select: {
        id: true,
        kode: true,
        nama: true,
        kategori: true,
        satuan: true,
        stok: true,
        stokMinimum: true,
        lokasi: true,
        deskripsi: true,
        isActive: true,
        jenisId: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        id: 'asc'
      }
    })

    console.log(`Found ${masterBarang.length} master barang:`)
    masterBarang.forEach(barang => {
      console.log(`- ID: ${barang.id}, Kode: ${barang.kode}, Nama: ${barang.nama}, Kategori: ${barang.kategori}, Stok: ${barang.stok}`)
    })

    // Generate seed data format
    console.log('\n📝 Generating seed data format...')
    console.log('\n=== USERS SEED DATA ===')
    console.log('const users = [')
    users.forEach(user => {
      console.log(`  {
    username: '${user.username}',
    password: 'password123',
    name: '${user.name}',
    email: '${user.email || ''}',
    role: UserRole.${user.role},
    jobType: UserJobType.${user.jobType || 'staff'},
    isActive: ${user.isActive}
  },`)
    })
    console.log(']')

    console.log('\n=== JENIS BARANG SEED DATA ===')
    console.log('const jenisBarangData = [')
    jenisBarang.forEach(jenis => {
      console.log(`  {
    nama: '${jenis.nama}',
    deskripsi: '${jenis.deskripsi || ''}'
  },`)
    })
    console.log(']')

    console.log('\n=== MASTER BARANG SEED DATA ===')
    console.log('const masterBarangData = [')
    masterBarang.forEach(barang => {
      console.log(`  {
    id: ${barang.id},
    kode: '${barang.kode}',
    nama: '${barang.nama}',
    kategori: '${barang.kategori || ''}',
    satuan: '${barang.satuan || ''}',
    stok: ${barang.stok},
    stokMinimum: ${barang.stokMinimum},
    lokasi: '${barang.lokasi || ''}',
    deskripsi: '${barang.deskripsi || ''}',
    jenisId: ${barang.jenisId || 'null'}
  },`)
    })
    console.log(']')

    console.log('\n🎉 Data pull completed successfully!')

  } catch (error) {
    console.error('❌ Error pulling data:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Data pull failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
