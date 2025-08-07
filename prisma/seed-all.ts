import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting complete database seed...')
  console.log('=====================================')

  try {
    // Import dan jalankan seed users
    console.log('\n👥 Seeding users...')
    const { main: seedUsers } = await import('./seed-users')
    await seedUsers()

    // Import dan jalankan seed master barang
    console.log('\n📦 Seeding master barang...')
    const { main: seedMasterBarang } = await import('./seed-master-barang')
    await seedMasterBarang()

    console.log('\n🎉 All seeds completed successfully!')
    console.log('=====================================')
    console.log('✅ Users seeded')
    console.log('✅ Master barang seeded')
    console.log('\n📋 Quick login info:')
    console.log('Username: admin, Password: password123')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
