import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    })
    
    if (adminUser) {
      console.log('✅ Admin user found:', {
        id: adminUser.id,
        username: adminUser.username,
        password: adminUser.password,
        isActive: adminUser.isActive
      })
      
      return NextResponse.json({
        success: true,
        message: 'Database test successful',
        adminUser: {
          id: adminUser.id,
          username: adminUser.username,
          password: adminUser.password,
          isActive: adminUser.isActive
        }
      })
    } else {
      console.log('❌ Admin user not found')
      
      return NextResponse.json({
        success: false,
        message: 'Admin user not found in database'
      })
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 