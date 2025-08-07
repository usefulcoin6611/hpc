import { PrismaClient, UserRole, UserJobType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting user seed...')

  // Password plain text untuk semua user
  const password = 'password123'

  // Data user yang akan di-seed sesuai format database
  const users = [
    {
      username: 'inspeksi_mesin',
      password: password,
      name: 'Ahmad Inspeksi',
      email: 'inspeksi@company.com',
      role: UserRole.inspeksi_mesin,
      jobType: UserJobType.staff,
      isActive: true
    },
    {
      username: 'assembly_staff',
      password: password,
      name: 'Budi Assembly',
      email: 'assembly@company.com',
      role: UserRole.assembly_staff,
      jobType: UserJobType.staff,
      isActive: true
    },
    {
      username: 'qc_staff',
      password: password,
      name: 'Citra QC',
      email: 'qc@company.com',
      role: UserRole.qc_staff,
      jobType: UserJobType.staff,
      isActive: true
    },
    {
      username: 'pdi_staff',
      password: password,
      name: 'Dewi PDI',
      email: 'pdi@company.com',
      role: UserRole.pdi_staff,
      jobType: UserJobType.staff,
      isActive: true
    },
    {
      username: 'painting_staff',
      password: password,
      name: 'Eko Painting',
      email: 'painting@company.com',
      role: UserRole.painting_staff,
      jobType: UserJobType.staff,
      isActive: true
    },
    {
      username: 'pindah_lokasi',
      password: password,
      name: 'Fajar Logistics',
      email: 'logistics@company.com',
      role: UserRole.pindah_lokasi,
      jobType: UserJobType.staff,
      isActive: true
    },
    {
      username: 'admin',
      password: password,
      name: 'Administrator',
      email: 'admin@company.com',
      role: UserRole.admin,
      jobType: UserJobType.admin,
      isActive: true
    },
    {
      username: 'supervisor',
      password: password,
      name: 'Supervisor',
      email: 'supervisor@company.com',
      role: UserRole.supervisor,
      jobType: UserJobType.supervisor,
      isActive: true
    }
  ]

  // Hapus data user yang ada (opsional)
  console.log('🗑️  Cleaning existing users...')
  await prisma.user.deleteMany({})

  // Insert user baru
  console.log('👥 Creating users...')
  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData
    })
    console.log(`✅ Created user: ${user.name} (${user.username}) - Role: ${user.role}`)
  }

  console.log('🎉 User seed completed successfully!')
  console.log('\n📋 User credentials:')
  console.log('Username: admin, Password: password123')
  console.log('Username: supervisor, Password: password123')
  console.log('Username: inspeksi_mesin, Password: password123')
  console.log('Username: assembly_staff, Password: password123')
  console.log('Username: qc_staff, Password: password123')
  console.log('Username: pdi_staff, Password: password123')
  console.log('Username: painting_staff, Password: password123')
  console.log('Username: pindah_lokasi, Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Error during user seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
