const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Password utilities (sementara tanpa encryption untuk konsistensi)
class PasswordUtils {
  static async hashPassword(password) {
    // Sementara return password as-is untuk konsistensi dengan auth-utils
    return password
  }
}

async function seedUsers() {
  try {
    console.log('🌱 Starting user seeding with corrected job types and roles...')

    // Array of users with corrected job types and roles
    const users = [
      {
        username: 'admin',
        password: 'admin123',
        name: 'Administrator',
        email: 'admin@company.com',
        role: 'admin',
        jobType: 'admin'
      },
      {
        username: 'supervisor',
        password: 'supervisor123',
        name: 'Supervisor',
        email: 'supervisor@company.com',
        role: 'supervisor',
        jobType: 'supervisor'
      },
      {
        username: 'inspeksi_mesin',
        password: 'inspeksi123',
        name: 'Ahmad Inspeksi',
        email: 'inspeksi@company.com',
        role: 'inspeksi_mesin',
        jobType: 'staff'
      },
      {
        username: 'assembly_staff',
        password: 'assembly123',
        name: 'Budi Assembly',
        email: 'assembly@company.com',
        role: 'assembly_staff',
        jobType: 'staff'
      },
      {
        username: 'qc_staff',
        password: 'qc123',
        name: 'Citra QC',
        email: 'qc@company.com',
        role: 'qc_staff',
        jobType: 'staff'
      },
      {
        username: 'pdi_staff',
        password: 'pdi123',
        name: 'Dewi PDI',
        email: 'pdi@company.com',
        role: 'pdi_staff',
        jobType: 'staff'
      },
      {
        username: 'painting_staff',
        password: 'painting123',
        name: 'Eko Painting',
        email: 'painting@company.com',
        role: 'painting_staff',
        jobType: 'staff'
      },
      {
        username: 'pindah_lokasi',
        password: 'pindah123',
        name: 'Fajar Logistics',
        email: 'logistics@company.com',
        role: 'pindah_lokasi',
        jobType: 'staff'
      }
    ]

    // Create or update each user
    for (const userData of users) {
      const hashedPassword = await PasswordUtils.hashPassword(userData.password)
      
      const user = await prisma.user.upsert({
        where: { username: userData.username },
        update: {
          name: userData.name,
          email: userData.email,
          role: userData.role,
          jobType: userData.jobType,
          password: hashedPassword
        },
        create: {
          username: userData.username,
          password: hashedPassword,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          jobType: userData.jobType
        }
      })
      
      const jobInfo = userData.jobType ? `[${userData.jobType}]` : ''
      console.log(`✅ User created/updated: ${user.name} (${user.role}) ${jobInfo}`)
    }

    console.log('🎉 User seeding completed successfully!')
    console.log('\n📊 Users Summary:')
    users.forEach(user => {
      const jobInfo = user.jobType ? `[${user.jobType}]` : ''
      console.log(`- ${user.name} (${user.role}) ${jobInfo}`)
    })

  } catch (error) {
    console.error('❌ Error during user seeding:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedUsers() 